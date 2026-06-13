import { describe, it, expect, beforeEach, vi } from 'vitest'
import { makeToken, makeAdminToken } from '../helpers/makeToken.js'
import database from '../../src/database/index.js'
import { patchDb } from '../helpers/databaseMock.js'
import verifyLogin from '../../src/login/verify_login.js'
import verifyAdmin from '../../src/login/verify_admin.js'

let conn

beforeEach(() => {
  conn = patchDb(database)
})

// asyncHandler chama next(err) em erro; capturamos o erro passado ao next.
async function run(middleware, headers = {}, params = {}) {
  const req = { headers, params, body: {} }
  const res = {}
  let error
  const next = vi.fn((err) => {
    error = err
  })
  await middleware(req, res, next)
  return { req, next, error }
}

describe('verifyLogin', () => {
  it('rejeita sem token (401)', async () => {
    const { error } = await run(verifyLogin)
    expect(error).toBeTruthy()
    expect(error.message).toMatch(/token/i)
  })

  it('passa para usuário ativo com token válido (next sem erro)', async () => {
    conn.oneOrNone.mockResolvedValue({ ativo: true })
    const { req, next, error } = await run(verifyLogin, {
      authorization: makeToken({ id: 9, uuid: 'u9' }),
    })
    expect(error).toBeFalsy()
    expect(next).toHaveBeenCalled()
    expect(req.usuarioId).toBe(9)
  })

  // Bug latente (review): usuário removido/desativado com token ainda válido →
  // oneOrNone retorna null e `response.ativo` lança TypeError (500), em vez de
  // um 403 limpo. Documenta que NÃO deve estourar TypeError.
  it('usuário inexistente (token válido) não deve causar TypeError', async () => {
    conn.oneOrNone.mockResolvedValue(null)
    const { error } = await run(verifyLogin, {
      authorization: makeToken({ id: 9, uuid: 'u9' }),
    })
    expect(error).toBeTruthy()
    expect(error).not.toBeInstanceOf(TypeError)
  })

  // IDOR: usuário só pode acessar a própria informação quando há :usuario_uuid.
  it('bloqueia acesso ao uuid de outro usuário', async () => {
    conn.oneOrNone.mockResolvedValue({ ativo: true })
    const { error } = await run(
      verifyLogin,
      { authorization: makeToken({ id: 1, uuid: 'meu-uuid' }) },
      { usuario_uuid: 'uuid-de-outro' },
    )
    expect(error).toBeTruthy()
    expect(error.message).toMatch(/própria/i)
  })
})

describe('verifyAdmin', () => {
  it('rejeita sem token', async () => {
    const { error } = await run(verifyAdmin)
    expect(error).toBeTruthy()
  })

  it('passa para administrador', async () => {
    conn.oneOrNone.mockResolvedValue({ administrador: true })
    const { next, error } = await run(verifyAdmin, {
      authorization: makeAdminToken(),
    })
    expect(error).toBeFalsy()
    expect(next).toHaveBeenCalled()
  })

  it('rejeita usuário não-administrador (403)', async () => {
    conn.oneOrNone.mockResolvedValue({ administrador: false })
    const { error } = await run(verifyAdmin, {
      authorization: makeToken({ administrador: false }),
    })
    expect(error).toBeTruthy()
    expect(error.message).toMatch(/administrador/i)
  })

  it('usuário inexistente não deve causar TypeError', async () => {
    conn.oneOrNone.mockResolvedValue(null)
    const { error } = await run(verifyAdmin, { authorization: makeAdminToken() })
    expect(error).toBeTruthy()
    expect(error).not.toBeInstanceOf(TypeError)
  })
})
