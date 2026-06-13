import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import database from '../../src/database/index.js'
import { patchDb } from '../helpers/databaseMock.js'
import app from '../../src/server/app.js'

let conn

beforeEach(() => {
  conn = patchDb(database)
  // Por padrão: usuário ativo e admin (passa verifyLogin e verifyAdmin).
  conn.oneOrNone.mockResolvedValue({ ativo: true, administrador: true })
})

// =====================================================================
// Asseveram o comportamento SEGURO desejado. Vários nascem VERMELHOS
// (documentam os bugs do BACKEND_REVIEW) e ficam verdes após o fix.
// =====================================================================

describe('Authz — módulo acompanhamento sem autenticação (B2)', () => {
  it('GET /api/acompanhamento/atividades_em_execucao SEM token deve exigir auth', async () => {
    const res = await request(app).get(
      '/api/acompanhamento/atividades_em_execucao',
    )
    // BUG ATUAL (B2): módulo inteiro sem verifyLogin → não retorna 401/403.
    expect([401, 403]).toContain(res.status)
  })

  it('GET /api/acompanhamento/ultimas_atividades_finalizadas SEM token deve exigir auth', async () => {
    const res = await request(app).get(
      '/api/acompanhamento/ultimas_atividades_finalizadas',
    )
    expect([401, 403]).toContain(res.status)
  })
})

describe('Endpoint /logs público (H2)', () => {
  it('GET /logs SEM token NÃO deve servir os logs do servidor', async () => {
    const res = await request(app).get('/logs')
    // BUG ATUAL (H2): /logs é público → 200 com o conteúdo do combined.log.
    expect(res.status).not.toBe(200)
  })
})

describe('Sanidade do gate de autenticação', () => {
  it('GET /api/usuarios SEM token retorna 401/403 (verifyAdmin funciona)', async () => {
    const res = await request(app).get('/api/usuarios')
    expect([401, 403]).toContain(res.status)
  })
})

describe('Catch-all engole 404 da API (maintainability)', () => {
  it('GET /api/rota-inexistente deveria ser 404, não 200 (index.html)', async () => {
    const res = await request(app).get('/api/rota-totalmente-inexistente')
    // BUG ATUAL: app.get('/*') devolve index.html (200) para /api/* inexistente.
    expect(res.status).toBe(404)
  })
})
