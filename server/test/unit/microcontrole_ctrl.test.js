import { describe, it, expect, beforeEach } from 'vitest'
import database from '../../src/database/index.js'
import { patchDb } from '../helpers/databaseMock.js'
import microCtrl from '../../src/microcontrole/microcontrole_ctrl.js'

// armazenaTela estava triplamente quebrada: `dados.foreach` (TypeError → rota
// /tela 100% morta), geom sem `:raw` (texto literal → cast text→geometry falha)
// e sem `return` (insert não aguardado → resposta de sucesso falsa).
let conn
beforeEach(() => {
  conn = patchDb(database)
})

describe('microcontrole.armazenaTela', () => {
  it('não lança (forEach) e retorna a promise do insert (return presente)', async () => {
    conn.none.mockResolvedValue('inserido')
    const dados = [{ x_min: 0, y_min: 0, x_max: 1, y_max: 1, zoom: 5, data: new Date() }]

    const ret = await microCtrl.armazenaTela(1, 2, dados)

    expect(ret).toBe('inserido')
    expect(conn.none).toHaveBeenCalledTimes(1)
  })

  it('monta geom como expressão SQL ST_MakeEnvelope injetada :raw (não como texto)', async () => {
    conn.none.mockResolvedValue(null)
    const dados = [{ x_min: 0, y_min: 0, x_max: 10, y_max: 20, zoom: 5, data: new Date() }]

    await microCtrl.armazenaTela(1, 2, dados)

    expect(dados[0].geom).toBe('ST_MakeEnvelope(0, 0, 10, 20, 4326)')
    const query = conn.none.mock.calls[0][0]
    // :raw → a expressão entra crua no INSERT, NÃO entre aspas como literal.
    expect(query).toContain('ST_MakeEnvelope(0, 0, 10, 20, 4326)')
    expect(query).not.toContain("'ST_MakeEnvelope")
  })

  it('percorre o array inteiro (forEach) — uma envelope por tela', async () => {
    conn.none.mockResolvedValue(null)
    const dados = [
      { x_min: 0, y_min: 0, x_max: 1, y_max: 1, zoom: 5, data: new Date() },
      { x_min: 2, y_min: 2, x_max: 3, y_max: 3, zoom: 6, data: new Date() },
    ]

    await microCtrl.armazenaTela(1, 2, dados)

    expect(dados[0].geom).toBe('ST_MakeEnvelope(0, 0, 1, 1, 4326)')
    expect(dados[1].geom).toBe('ST_MakeEnvelope(2, 2, 3, 3, 4326)')
    const query = conn.none.mock.calls[0][0]
    expect(query).toContain('ST_MakeEnvelope(0, 0, 1, 1, 4326)')
    expect(query).toContain('ST_MakeEnvelope(2, 2, 3, 3, 4326)')
  })
})
