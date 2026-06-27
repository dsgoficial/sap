import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync, readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import database from '../../src/database/index.js'
import { patchDb } from '../helpers/databaseMock.js'
import perigoCtrl from '../../src/perigo/perigo_ctrl.js'

// deleteUTSemAtividade deletava a unidade_trabalho sem antes remover as linhas
// de insumo_unidade_trabalho, que a referenciam por FK sem ON DELETE CASCADE.
// Isso estourava 23503 (insumo_unidade_trabalho_unidade_trabalho_id_fkey) na
// Zona de Perigo. Estes testes fixam a ordem correta (insumo ANTES da UT) e o
// curto-circuito quando nao ha UT sem atividade, sem tocar no banco.
let conn
beforeEach(() => {
  conn = patchDb(database)
})

describe('perigoCtrl.deleteUTSemAtividade', () => {
  it('remove insumo_unidade_trabalho ANTES de deletar a unidade_trabalho', async () => {
    conn.any
      // 1a query: SELECT das UTs sem atividade
      .mockResolvedValueOnce([{ id: 10 }, { id: 11 }])
      // 2a query: DELETE ... RETURNING id
      .mockResolvedValueOnce([{ id: 10 }, { id: 11 }])

    const result = await perigoCtrl.deleteUTSemAtividade()

    expect(result).toEqual([{ id: 10 }, { id: 11 }])

    // o DELETE de insumo (conn.none) recebeu os ids certos
    expect(conn.none).toHaveBeenCalledTimes(1)
    const [insumoSql, insumoParams] = conn.none.mock.calls[0]
    expect(insumoSql).toMatch(/DELETE FROM macrocontrole\.insumo_unidade_trabalho/)
    expect(insumoParams).toEqual({ utIds: [10, 11] })

    // ordem: SELECT (any#1) < DELETE insumo (none) < DELETE ut (any#2)
    const selectOrder = conn.any.mock.invocationCallOrder[0]
    const deleteUtOrder = conn.any.mock.invocationCallOrder[1]
    const deleteInsumoOrder = conn.none.mock.invocationCallOrder[0]
    expect(deleteInsumoOrder).toBeGreaterThan(selectOrder)
    expect(deleteInsumoOrder).toBeLessThan(deleteUtOrder)
  })

  it('nao deleta nada quando nao ha UT sem atividade', async () => {
    conn.any.mockResolvedValueOnce([])

    const result = await perigoCtrl.deleteUTSemAtividade()

    expect(result).toEqual([])
    expect(conn.none).not.toHaveBeenCalled()
    // so a query de SELECT rodou
    expect(conn.any).toHaveBeenCalledTimes(1)
  })
})

// As 8 FKs para macrocontrole.produto (1 juncao de campo + 7 de metadado) nao tem
// ON DELETE CASCADE; deletar o produto direto estourava 23503. A correcao limpa
// cada dependente ANTES do produto. Estes testes fixam a cascata e a ordem.
const TABELAS_DEPENDENTES = [
  'controle_campo.relacionamento_campo_produto',
  'metadado.palavra_chave_produto',
  'metadado.responsavel_fase_produto',
  'metadado.informacoes_produto',
  'metadado.informacoes_edicao',
  'metadado.sensor_carta_ortoimagem',
  'metadado.imagens_carta_ortoimagem',
  'metadado.perfil_classes_complementares_orto',
]

describe('perigoCtrl.deleteProdutosSemUT', () => {
  it('cascateia os 8 dependentes ANTES de deletar o produto', async () => {
    conn.any
      // 1a query: SELECT dos produtos sem UT
      .mockResolvedValueOnce([{ id: 5 }])
      // ultima query: DELETE produto ... RETURNING id
      .mockResolvedValueOnce([{ id: 5 }])

    const result = await perigoCtrl.deleteProdutosSemUT()

    expect(result).toEqual([{ id: 5 }])

    // um DELETE (t.result) por dependente, todos com os ids certos
    expect(conn.result).toHaveBeenCalledTimes(TABELAS_DEPENDENTES.length)
    const sqls = conn.result.mock.calls.map(c => c[0])
    for (const tabela of TABELAS_DEPENDENTES) {
      const sql = sqls.find(s => s.includes(`DELETE FROM ${tabela} `))
      expect(sql, `faltou DELETE de ${tabela}`).toBeTruthy()
    }
    for (const call of conn.result.mock.calls) {
      expect(call[1]).toEqual({ produtoIds: [5] })
    }

    // ordem: SELECT (any#1) < todos os DELETE de dependente < DELETE produto (any#2)
    const selectOrder = conn.any.mock.invocationCallOrder[0]
    const deleteProdutoOrder = conn.any.mock.invocationCallOrder[1]
    for (const order of conn.result.mock.invocationCallOrder) {
      expect(order).toBeGreaterThan(selectOrder)
      expect(order).toBeLessThan(deleteProdutoOrder)
    }
  })

  it('nao deleta nada quando nao ha produto sem UT', async () => {
    conn.any.mockResolvedValueOnce([])

    const result = await perigoCtrl.deleteProdutosSemUT()

    expect(result).toEqual([])
    expect(conn.result).not.toHaveBeenCalled()
    expect(conn.any).toHaveBeenCalledTimes(1)
  })
})

// A lista de dependentes cascateados em deleteProdutosSemUT e hardcoded. Este
// teste cruza essa lista com o schema (er/*.sql): se uma migracao futura
// adicionar uma FK para macrocontrole.produto sem ON DELETE CASCADE e ninguem
// adicionar o DELETE correspondente, deleteProdutosSemUT voltaria a estourar
// 23503. Sem este guard, os testes mockados continuariam verdes (eles travam a
// mesma lista hardcoded, nao o schema).
const _dir = dirname(fileURLToPath(import.meta.url))
const ER_DIR = join(_dir, '..', '..', '..', 'er')
const CTRL = join(_dir, '..', '..', 'src', 'perigo', 'perigo_ctrl.js')

function tabelasComFkParaProduto() {
  const tabelas = new Set()
  for (const file of readdirSync(ER_DIR).filter(f => f.endsWith('.sql'))) {
    const sql = readFileSync(join(ER_DIR, file), 'utf8')
    let atual = null
    for (const linha of sql.split('\n')) {
      const m = linha.match(/CREATE TABLE\s+([a-z_]+\.[a-z_]+)/i)
      if (m) atual = m[1]
      if (atual && /REFERENCES\s+macrocontrole\.produto\b/i.test(linha)) {
        tabelas.add(atual)
      }
    }
  }
  return tabelas
}

describe('deleteProdutosSemUT cobre todas as FKs para macrocontrole.produto', () => {
  it('cada tabela do schema que referencia produto tem um DELETE no controller', () => {
    const src = readFileSync(CTRL, 'utf8')
    const tabelas = tabelasComFkParaProduto()
    expect(tabelas.size).toBeGreaterThan(0)
    const faltando = [...tabelas].filter(t => {
      const re = new RegExp('DELETE FROM ' + t.replace(/\./g, '\\.') + ' WHERE produto_id')
      return !re.test(src)
    })
    expect(
      faltando,
      'tabelas com FK para macrocontrole.produto sem DELETE em deleteProdutosSemUT: ' + faltando.join(', ')
    ).toEqual([])
  })
})
