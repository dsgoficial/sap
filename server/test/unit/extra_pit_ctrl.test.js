import { describe, it, expect, beforeEach } from 'vitest'
import database from '../../src/database/index.js'
import { patchDb } from '../helpers/databaseMock.js'
import extraPitCtrl from '../../src/extra_pit/extra_pit_ctrl.js'

let conn
beforeEach(() => {
  conn = patchDb(database)
})

describe('extra_pit.getByAno (Secao 2.6)', () => {
  it('filtra por ano e traz o lote_id (guard de dupla contagem da 2.1)', async () => {
    await extraPitCtrl.getByAno(2026)

    const q = conn.any.mock.calls[0][0]
    expect(q).toContain('macrocontrole.extra_pit')
    expect(q).toContain('e.lote_id')
    expect(conn.any.mock.calls[0][1]).toEqual({ ano: 2026 })
  })
})

describe('extra_pit.criaExtraPit', () => {
  it('insere na macrocontrole.extra_pit', async () => {
    await extraPitCtrl.criaExtraPit({
      ano: 2026,
      demandante: 'DSG',
      tipo_produto: 'Super-resolução de imagem',
      quantidade: 12,
      situacao_id: 3,
      documento_autorizacao: 'DIEx 1455-E3/DSG',
      descricao: null,
      lote_id: null,
    })

    expect(conn.none).toHaveBeenCalledTimes(1)
    expect(conn.none.mock.calls[0][0]).toContain('macrocontrole.extra_pit')
  })
})

describe('extra_pit.atualizaExtraPit / deletaExtraPit', () => {
  it('lanca quando o id nao existe (rowCount 0)', async () => {
    conn.result.mockResolvedValue({ rowCount: 0 })
    await expect(extraPitCtrl.atualizaExtraPit(99, {})).rejects.toThrow()
    await expect(extraPitCtrl.deletaExtraPit(99)).rejects.toThrow()
  })
})
