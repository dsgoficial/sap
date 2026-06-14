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

// As novas fontes do RPCMTec (capacitacao 2.5/5.2, extra_pit 2.6, aproveitamento
// do efetivo 5.1) expoem dados de pessoal e gestao -> exigem autenticacao, e as
// escritas exigem admin.
describe('Authz — rotas do RPCMTec (capacitacao, extra_pit, efetivo)', () => {
  it('GET /api/capacitacao/capacitacoes SEM token exige auth', async () => {
    const res = await request(app).get('/api/capacitacao/capacitacoes')
    expect([401, 403]).toContain(res.status)
  })

  it('GET /api/extra_pit/2026 SEM token exige auth', async () => {
    const res = await request(app).get('/api/extra_pit/2026')
    expect([401, 403]).toContain(res.status)
  })

  it('GET /api/rh/aproveitamento/:ano/:mes SEM token exige auth', async () => {
    const res = await request(app).get('/api/rh/aproveitamento/2026/1')
    expect([401, 403]).toContain(res.status)
  })

  it('POST /api/capacitacao/capacitacoes SEM token exige auth (escrita admin)', async () => {
    const res = await request(app).post('/api/capacitacao/capacitacoes').send({})
    expect([401, 403]).toContain(res.status)
  })

  it('POST /api/extra_pit SEM token exige auth (escrita admin)', async () => {
    const res = await request(app).post('/api/extra_pit').send({})
    expect([401, 403]).toContain(res.status)
  })

  it('GET /api/capacitacao/capacitacoes COM token admin resolve (nao 401/403)', async () => {
    const res = await request(app)
      .get('/api/capacitacao/capacitacoes')
      .set('authorization', makeToken())
    expect([401, 403]).not.toContain(res.status)
  })

  it('GET /api/extra_pit/2026 COM token admin resolve (nao 401/403)', async () => {
    const res = await request(app)
      .get('/api/extra_pit/2026')
      .set('authorization', makeToken())
    expect([401, 403]).not.toContain(res.status)
  })

  // /extra_pit/situacao precisa resolver antes de /:ano (senao "situacao" cai no :ano)
  it('GET /api/extra_pit/situacao nao colide com /:ano (nao 400 de validacao)', async () => {
    const res = await request(app)
      .get('/api/extra_pit/situacao')
      .set('authorization', makeToken())
    expect(res.status).not.toBe(400)
    expect([401, 403]).not.toContain(res.status)
  })
})

// Metas do PIT nao controladas pelo SAP (impressao, Programa Memoria, TI, EBGeo):
// leitura exige auth; cadastro e lancamento mensal exigem admin.
describe('Authz — rotas do PIT nao-producao', () => {
  it('GET /api/pit_nao_producao/2026 SEM token exige auth', async () => {
    const res = await request(app).get('/api/pit_nao_producao/2026')
    expect([401, 403]).toContain(res.status)
  })

  it('POST /api/pit_nao_producao SEM token exige auth (escrita admin)', async () => {
    const res = await request(app).post('/api/pit_nao_producao').send({})
    expect([401, 403]).toContain(res.status)
  })

  it('GET /api/pit_nao_producao/2026 COM token admin resolve (nao 401/403)', async () => {
    const res = await request(app)
      .get('/api/pit_nao_producao/2026')
      .set('authorization', makeToken())
    expect([401, 403]).not.toContain(res.status)
  })

  // /execucao/:ano/:mes precisa resolver antes de /:ano (senao "execucao" cai no :ano)
  it('GET /api/pit_nao_producao/execucao/2026/6 nao colide com /:ano', async () => {
    const res = await request(app)
      .get('/api/pit_nao_producao/execucao/2026/6')
      .set('authorization', makeToken())
    expect(res.status).not.toBe(400)
    expect([401, 403]).not.toContain(res.status)
  })

  it('POST /api/pit_nao_producao/execucao COM token admin resolve', async () => {
    const res = await request(app)
      .post('/api/pit_nao_producao/execucao')
      .set('authorization', makeToken())
      .send({ execucao: { pit_id: 1, mes: 6, quantidade: 10, data_conclusao: null, observacao: null } })
    expect(res.status).not.toBe(400)
    expect([401, 403]).not.toContain(res.status)
  })
})
