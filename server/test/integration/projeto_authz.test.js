import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import database from '../../src/database/index.js'
import { patchDb } from '../helpers/databaseMock.js'
import { makeToken } from '../helpers/makeToken.js'
import app from '../../src/server/app.js'

let conn
beforeEach(() => {
  conn = patchDb(database)
  conn.oneOrNone.mockResolvedValue({ ativo: true, administrador: true })
  conn.any.mockResolvedValue([])
})

// As rotas de domínio /status e /tipo_* eram públicas; agora todo /projeto/*
// exige autenticação (router.use(verifyLogin)).
describe('Authz — rotas de projeto', () => {
  it('GET /api/projeto/status SEM token deve exigir auth', async () => {
    const res = await request(app).get('/api/projeto/status')
    expect([401, 403]).toContain(res.status)
  })

  it('GET /api/projeto/tipo_rotina SEM token deve exigir auth', async () => {
    const res = await request(app).get('/api/projeto/tipo_rotina')
    expect([401, 403]).toContain(res.status)
  })

  it('GET /api/projeto/status COM token é permitido', async () => {
    const res = await request(app)
      .get('/api/projeto/status')
      .set('authorization', makeToken())
    expect([401, 403]).not.toContain(res.status)
  })
})
