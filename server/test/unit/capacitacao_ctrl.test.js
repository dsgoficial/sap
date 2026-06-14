import { describe, it, expect, beforeEach } from 'vitest'
import database from '../../src/database/index.js'
import { patchDb } from '../helpers/databaseMock.js'
import capacitacaoCtrl from '../../src/capacitacao/capacitacao_ctrl.js'

let conn
beforeEach(() => {
  conn = patchDb(database)
})

// A capacitacao alimenta DUAS secoes do RPCMTec: 2.5 (Ministrada) e 5.2 (Recebida).
describe('capacitacao.getRPCMTec', () => {
  it('separa as linhas em ministrada (2.5) e recebida (5.2)', async () => {
    conn.any.mockResolvedValue([
      { id: '1', tipo: 'Ministrada', nome: 'FAB' },
      { id: '2', tipo: 'Recebida', nome: 'Mestrado' },
      { id: '3', tipo: 'Ministrada', nome: 'Curitiba' },
    ])

    const r = await capacitacaoCtrl.getRPCMTec('2026-01-01', '2026-01-31')

    expect(r.ministrada).toHaveLength(2)
    expect(r.recebida).toHaveLength(1)
    expect(r.recebida[0].nome).toBe('Mestrado')
    expect(conn.any.mock.calls[0][1]).toEqual({
      dataInicio: '2026-01-01',
      dataFim: '2026-01-31',
    })
    // capacitacao SEM inicio nao deve vazar para todo mes: exige inicio,
    // mas mantem o escape de fim NULL (curso em andamento entra).
    const q = conn.any.mock.calls[0][0]
    expect(q).not.toContain('c.inicio IS NULL')
    expect(q).toContain('c.fim IS NULL')
  })
})

describe('capacitacao.deletaCapacitacao', () => {
  it('lanca quando o id nao existe (rowCount 0)', async () => {
    conn.result.mockResolvedValue({ rowCount: 0 })
    await expect(capacitacaoCtrl.deletaCapacitacao('uuid')).rejects.toThrow()
  })
})

describe('capacitacao.criaCapacitacao', () => {
  it('insere na controle_capacitacao.capacitacao', async () => {
    await capacitacaoCtrl.criaCapacitacao({
      nome: 'X',
      tipo: 'Ministrada',
      ano: 2026,
      situacao_id: 1,
    })

    expect(conn.none).toHaveBeenCalledTimes(1)
    expect(conn.none.mock.calls[0][0]).toContain('controle_capacitacao.capacitacao')
  })
})

describe('capacitacao.atualizaCapacitacao', () => {
  it('lanca quando o id nao existe (rowCount 0)', async () => {
    conn.result.mockResolvedValue({ rowCount: 0 })
    await expect(
      capacitacaoCtrl.atualizaCapacitacao('uuid', {}),
    ).rejects.toThrow()
  })

  it('resolve quando atualiza (rowCount 1)', async () => {
    conn.result.mockResolvedValue({ rowCount: 1 })
    await expect(
      capacitacaoCtrl.atualizaCapacitacao('uuid', {}),
    ).resolves.toBeUndefined()
  })
})
