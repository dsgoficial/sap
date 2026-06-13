import { describe, it, expect, vi } from 'vitest'
import Joi from 'joi'
import schemaValidation from '../../src/utils/schema_validation.js'

function runMiddleware(mw, req) {
  let error
  const next = vi.fn((err) => {
    error = err
  })
  mw(req, {}, next)
  return { next, error }
}

describe('schema_validation middleware', () => {
  it('rejeita body inválido com 400', () => {
    const mw = schemaValidation({
      body: Joi.object({ nome: Joi.string().required() }),
    })
    const { error } = runMiddleware(mw, { body: {}, query: {}, params: {} })
    expect(error).toBeTruthy()
    expect(error.statusCode).toBe(400)
  })

  it('valida params (cobre rotas com :id)', () => {
    const mw = schemaValidation({
      params: Joi.object({ id: Joi.number().integer().required() }),
    })
    const { error } = runMiddleware(mw, {
      body: {},
      query: {},
      params: { id: 'abc' },
    })
    expect(error).toBeTruthy()
  })

  it('passa adiante (next sem erro) quando o body é válido', () => {
    const mw = schemaValidation({
      body: Joi.object({ nome: Joi.string().required() }),
    })
    const { error, next } = runMiddleware(mw, {
      body: { nome: 'ok' },
      query: {},
      params: {},
    })
    expect(error).toBeFalsy()
    expect(next).toHaveBeenCalled()
  })
})
