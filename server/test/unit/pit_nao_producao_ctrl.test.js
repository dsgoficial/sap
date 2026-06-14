import { describe, it, expect, beforeEach } from 'vitest'
import database from '../../src/database/index.js'
import { patchDb } from '../helpers/databaseMock.js'
import pitCtrl from '../../src/pit_nao_producao/pit_nao_producao_ctrl.js'

let conn
beforeEach(() => {
  conn = patchDb(database)
})

describe('pit_nao_producao.getByAno', () => {
  it('filtra por ano e so as metas sem lote (lote_id IS NULL)', async () => {
    await pitCtrl.getByAno(2026)

    const q = conn.any.mock.calls[0][0]
    expect(q).toContain('macrocontrole.pit')
    expect(q).toContain('p.lote_id IS NULL')
    expect(q).toContain('pit_execucao_manual')
    expect(conn.any.mock.calls[0][1]).toEqual({ ano: 2026 })
  })
})

describe('pit_nao_producao.criaMeta', () => {
  it('insere em macrocontrole.pit com lote_id nulo', async () => {
    await pitCtrl.criaMeta({
      ano: 2026,
      numero_meta: 4,
      item: '4.1',
      descricao: 'Impressão em sulfite',
      unidade: 'produtos',
      meta: 327,
      prazo: null,
    })

    expect(conn.none).toHaveBeenCalledTimes(1)
    const q = conn.none.mock.calls[0][0]
    expect(q).toContain('INSERT INTO macrocontrole.pit')
    expect(q).toContain('NULL')
  })
})

describe('pit_nao_producao.atualizaMeta', () => {
  it('so atualiza linha sem lote e lanca quando o id nao existe (rowCount 0)', async () => {
    conn.result.mockResolvedValue({ rowCount: 0 })
    await expect(pitCtrl.atualizaMeta(99, {})).rejects.toThrow()
    expect(conn.result.mock.calls[0][0]).toContain('lote_id IS NULL')
  })
})

describe('pit_nao_producao.salvaExecucao', () => {
  it('faz upsert em pit_execucao_manual (ON CONFLICT)', async () => {
    await pitCtrl.salvaExecucao({
      pit_id: 1, mes: 5, quantidade: 10, data_conclusao: null, observacao: null,
    })

    expect(conn.none).toHaveBeenCalledTimes(1)
    const q = conn.none.mock.calls[0][0]
    expect(q).toContain('macrocontrole.pit_execucao_manual')
    expect(q).toContain('ON CONFLICT (pit_id, mes) DO UPDATE')
  })
})

describe('pit_nao_producao.deletaMeta', () => {
  it('deleta so a linha sem lote e lanca se a meta nao existe (rowCount 0)', async () => {
    conn.result.mockResolvedValue({ rowCount: 0 })
    await expect(pitCtrl.deletaMeta(99)).rejects.toThrow()
    const q = conn.result.mock.calls[0][0]
    expect(q).toContain('DELETE FROM macrocontrole.pit')
    expect(q).toContain('lote_id IS NULL')
  })
})
