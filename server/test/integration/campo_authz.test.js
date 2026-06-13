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
  conn.one.mockResolvedValue({ mvt: '' })
})

// H4 — rotas de campo expõem fotos, tracks de deslocamento e dados de militares.
describe('Authz — rotas de campo (H4)', () => {
  it('GET /api/campo/campos SEM token deve exigir auth', async () => {
    const res = await request(app).get('/api/campo/campos')
    expect([401, 403]).toContain(res.status)
  })

  it('GET /api/campo/campos-geojson SEM token deve exigir auth', async () => {
    const res = await request(app).get('/api/campo/campos-geojson')
    expect([401, 403]).toContain(res.status)
  })

  it('GET de campos COM token via header é permitido (não 401/403)', async () => {
    const res = await request(app)
      .get('/api/campo/campos')
      .set('authorization', makeToken())
    expect([401, 403]).not.toContain(res.status)
  })

  // Tile MVT: o MapLibre busca sem header → o token vai na query string.
  it('tile MVT SEM token é negado, mas COM ?token= é aceito', async () => {
    const semToken = await request(app).get(
      '/api/campo/tracks/abc/10/300/400.mvt',
    )
    expect([401, 403]).toContain(semToken.status)

    const comToken = await request(app).get(
      `/api/campo/tracks/abc/10/300/400.mvt?token=${makeToken()}`,
    )
    expect([401, 403]).not.toContain(comToken.status)
  })
})

// Shadowing de rotas Express: /campos/estatisticas e /fotos/campos/:uuid eram
// inalcançáveis (capturadas por /campos/:uuid e /fotos/:uuid). Agora respondem.
describe('Roteamento de campo — rotas antes inalcançáveis', () => {
  it('GET /campos/estatisticas resolve (não cai na validação de uuid → 400)', async () => {
    const res = await request(app)
      .get('/api/campo/campos/estatisticas')
      .set('authorization', makeToken())
    expect(res.status).not.toBe(400)
    expect([401, 403]).not.toContain(res.status)
  })

  it('DELETE /fotos/campos/:uuid é alcançável (path distinto de /fotos/:uuid)', async () => {
    const res = await request(app)
      .delete('/api/campo/fotos/campos/3fa85f64-5717-4562-b3fc-2c963f66afa6')
      .set('authorization', makeToken())
    expect(res.status).not.toBe(404)
    expect([401, 403]).not.toContain(res.status)
  })
})
