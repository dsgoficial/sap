import { describe, it, expect, beforeEach } from 'vitest'
import database from '../../src/database/index.js'
import { patchDb } from '../helpers/databaseMock.js'
import rhCtrl from '../../src/rh/rh_ctrl.js'

let conn
beforeEach(() => {
  conn = patchDb(database)
})

describe('rh.getAproveitamento (Secao 5.1, retrato por mes)', () => {
  it('le a recurso_humano.aproveitamento_mes por ano/mes e ordena por posto DESC', async () => {
    await rhCtrl.getAproveitamento(2026, 1)

    const q = conn.any.mock.calls[0][0]
    expect(q).toContain('recurso_humano.aproveitamento_mes')
    // tipo_posto_grad.code cresce com a antiguidade -> DESC poe o Maj primeiro
    expect(q).toContain('ORDER BY tpg.code DESC')
    expect(conn.any.mock.calls[0][1]).toEqual({ ano: 2026, mes: 1 })
  })
})

describe('rh.copiarMesAnterior', () => {
  it('em janeiro, copia de dezembro do ano anterior', async () => {
    conn.result.mockResolvedValue({ rowCount: 5 })
    const r = await rhCtrl.copiarMesAnterior(2026, 1)
    expect(r).toEqual({ copiados: 5 })
    expect(conn.result.mock.calls[0][1]).toMatchObject({
      ano: 2026,
      mes: 1,
      anoAnt: 2025,
      mesAnt: 12,
    })
  })

  it('nos demais meses, copia do mes anterior do mesmo ano', async () => {
    conn.result.mockResolvedValue({ rowCount: 3 })
    await rhCtrl.copiarMesAnterior(2026, 6)
    expect(conn.result.mock.calls[0][1]).toMatchObject({ anoAnt: 2026, mesAnt: 5 })
  })
})

describe('rh.criarLinha', () => {
  it('congela o posto atual do militar quando nao informado', async () => {
    conn.oneOrNone.mockResolvedValue({ tipo_posto_grad_id: 14 })
    await rhCtrl.criarLinha({ ano: 2026, mes: 1, usuario_id: 1, atividades: null })

    expect(conn.oneOrNone).toHaveBeenCalledTimes(1) // buscou o posto do usuario
    expect(conn.none.mock.calls[0][0]).toContain('recurso_humano.aproveitamento_mes')
    // idempotente: adicionar militar ja lancado no mes nao estoura o UNIQUE
    expect(conn.none.mock.calls[0][0]).toContain('ON CONFLICT')
    expect(conn.none.mock.calls[0][1].tipo_posto_grad_id).toBe(14)
  })

  it('usa o posto informado sem consultar o usuario', async () => {
    await rhCtrl.criarLinha({
      ano: 2026,
      mes: 1,
      usuario_id: 1,
      tipo_posto_grad_id: 9,
      atividades: 'Chefe da 5 Secao',
    })
    expect(conn.oneOrNone).not.toHaveBeenCalled()
    expect(conn.none.mock.calls[0][1].tipo_posto_grad_id).toBe(9)
  })

  it('lanca 404 quando o militar nao existe (oneOrNone retorna null)', async () => {
    conn.oneOrNone.mockResolvedValue(null)
    await expect(
      rhCtrl.criarLinha({ ano: 2026, mes: 1, usuario_id: 999, atividades: null })
    ).rejects.toThrow()
  })
})

describe('rh.iniciarDoEfetivo', () => {
  it('cria uma linha por usuario ativo (INSERT..SELECT WHERE ativo, ON CONFLICT)', async () => {
    conn.result.mockResolvedValue({ rowCount: 23 })
    const r = await rhCtrl.iniciarDoEfetivo(2026, 6)

    expect(r).toEqual({ criados: 23 })
    const q = conn.result.mock.calls[0][0]
    expect(q).toContain('recurso_humano.aproveitamento_mes')
    expect(q).toContain('FROM dgeo.usuario')
    expect(q).toContain('u.ativo')
    expect(q).toContain('ON CONFLICT')
    expect(conn.result.mock.calls[0][1]).toEqual({ ano: 2026, mes: 6 })
  })
})

describe('rh.atualizaLinha / deletaLinha', () => {
  it('lancam quando o id nao existe (rowCount 0)', async () => {
    conn.result.mockResolvedValue({ rowCount: 0 })
    await expect(rhCtrl.atualizaLinha(99, {})).rejects.toThrow()
    await expect(rhCtrl.deletaLinha(99)).rejects.toThrow()
  })
})

describe('rh — limpeza do conceito morto e producao preservada', () => {
  it('nao expoe mais getTipoPerdaHr nem o CRUD de encargo antigo', () => {
    expect(rhCtrl.getTipoPerdaHr).toBeUndefined()
    expect(rhCtrl.criaEncargo).toBeUndefined()
  })

  it('preserva as estatisticas de producao (alimentam a 2.1 / consultar-sap)', () => {
    expect(typeof rhCtrl.getAllBlocksStatsByDate).toBe('function')
    expect(typeof rhCtrl.getAtividadesPorPeriodo).toBe('function')
    expect(typeof rhCtrl.getAllLoteStatsByDate).toBe('function')
  })
})
