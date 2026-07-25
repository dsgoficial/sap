import { describe, it, expect, beforeEach } from 'vitest'
import database from '../../src/database/index.js'
import { patchDb } from '../helpers/databaseMock.js'
import projetoCtrl from '../../src/projeto/projeto_ctrl.js'

// Esta rota existe para tirar do vault do Chefe da DGEO quatro leituras que
// eram feitas por `psql` direto no banco de produção. Os testes cobrem o que
// aquele script fazia, para a migração não perder comportamento.

let conn
beforeEach(() => {
  conn = patchDb(database)
})

const umaSubfase = [{ subfase_id: 148, subfase: 'Extração', fase_id: 45, etapas: 0 }]

describe('projeto.getSubfasesLote', () => {
  it('conta as etapas do lote por subfase, que é a trava contra rodar duas vezes', async () => {
    conn.any.mockResolvedValueOnce([
      { subfase_id: 148, subfase: 'Extração', fase_id: 45, etapas: 0 },
      { subfase_id: 149, subfase: 'Validação', fase_id: 47, etapas: 3 }
    ])

    const r = await projetoCtrl.getSubfasesLote(68)

    const q = conn.any.mock.calls[0][0]
    expect(q).toContain('macrocontrole.etapa')
    expect(q).toContain('e.lote_id = $<loteId>')
    expect(r[0].etapas).toBe(0)
    expect(r[1].etapas).toBe(3)
  })

  it('filtra pelas subfases pedidas quando elas vêm', async () => {
    conn.any.mockResolvedValueOnce(umaSubfase)

    await projetoCtrl.getSubfasesLote(68, { subfaseIds: [148, 149] })

    expect(conn.any.mock.calls[0][0]).toContain('s.id IN ($<subfaseIds:csv>)')
    expect(conn.any.mock.calls[0][1]).toMatchObject({ loteId: 68, subfaseIds: [148, 149] })
  })

  it('sem subfases pedidas, não injeta o IN e devolve o lote inteiro', async () => {
    conn.any.mockResolvedValueOnce(umaSubfase)

    await projetoCtrl.getSubfasesLote(68)

    expect(conn.any.mock.calls[0][0]).not.toContain('s.id IN')
  })

  // A geometria é o que se clona no molde, e é cara. Opt-in.
  it('só traz a geometria quando pedida', async () => {
    conn.any.mockResolvedValueOnce(umaSubfase)
    await projetoCtrl.getSubfasesLote(68)
    expect(conn.any.mock.calls[1][0]).not.toContain('ST_As')

    conn = patchDb(database)
    conn.any.mockResolvedValueOnce(umaSubfase)
    await projetoCtrl.getSubfasesLote(68, { incluirGeom: true })
    expect(conn.any.mock.calls[1][0]).toContain('ST_AsEWKT(ut.geom)')
  })

  // `ut.epsg` é o CRS de TRABALHO da unidade (tipicamente UTM); o SRID da
  // coluna geom é 4326. Devolver EWKT impede que quem clona o molde rotule a
  // geometria com o epsg e grave uma unidade no CRS errado.
  it('devolve a geometria como EWKT, não WKT cru', async () => {
    conn.any.mockResolvedValueOnce(umaSubfase)
    await projetoCtrl.getSubfasesLote(68, { incluirGeom: true })
    const q = conn.any.mock.calls[1][0]
    expect(q).toContain('ST_AsEWKT')
    expect(q).not.toContain('ST_AsText')
  })

  it('agrupa a unidade de trabalho molde sob a subfase dela', async () => {
    conn.any
      .mockResolvedValueOnce(umaSubfase)
      .mockResolvedValueOnce([
        { id: 900, nome: 'UT-1', subfase_id: 148, epsg: '31982', dado_producao_id: 3, bloco_id: 7 },
        { id: 901, nome: 'UT-2', subfase_id: 148, epsg: '31982', dado_producao_id: 3, bloco_id: 7 },
        { id: 902, nome: 'outra', subfase_id: 999, epsg: '31982', dado_producao_id: 3, bloco_id: 7 }
      ])
      .mockResolvedValueOnce([])

    const r = await projetoCtrl.getSubfasesLote(68)

    expect(r[0].unidades_trabalho).toHaveLength(2)
    expect(r[0].unidades_trabalho.map(u => u.id)).toEqual([900, 901])
  })

  it('separa as atividades por situação e lista as não iniciadas', async () => {
    conn.any
      .mockResolvedValueOnce(umaSubfase)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { subfase_id: 148, tipo_situacao_id: 1, quantidade: 3, nao_iniciadas: [11, 12, 13], datas_fim: null },
        { subfase_id: 148, tipo_situacao_id: 4, quantidade: 2, nao_iniciadas: null, datas_fim: ['2026-05-28T12:00:00.000Z'] }
      ])

    const r = await projetoCtrl.getSubfasesLote(68)

    expect(r[0].atividades.por_situacao).toEqual({ 1: 3, 4: 2 })
    expect(r[0].atividades.nao_iniciadas).toEqual([11, 12, 13])
    expect(r[0].atividades.datas_fim_concluidas).toEqual(['2026-05-28T12:00:00.000Z'])
  })

  // O script antigo abortava quando a Verificação Final tinha mais de uma data,
  // e estava certo: datar um lançamento retroativo com a primeira delas seria
  // inventar. A rota devolve TODAS e deixa a escolha para quem chama.
  it('devolve TODAS as datas de conclusão distintas, sem escolher uma', async () => {
    conn.any
      .mockResolvedValueOnce(umaSubfase)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          subfase_id: 148,
          tipo_situacao_id: 4,
          quantidade: 4,
          nao_iniciadas: null,
          datas_fim: ['2026-05-28T12:00:00.000Z', '2026-06-02T12:00:00.000Z', '2026-05-28T12:00:00.000Z']
        }
      ])

    const r = await projetoCtrl.getSubfasesLote(68)

    expect(r[0].atividades.datas_fim_concluidas).toEqual([
      '2026-05-28T12:00:00.000Z',
      '2026-06-02T12:00:00.000Z'
    ])
  })

  it('não vai ao banco de novo quando nenhuma subfase casou', async () => {
    conn.any.mockResolvedValueOnce([])

    const r = await projetoCtrl.getSubfasesLote(68, { subfaseIds: [1] })

    expect(r).toEqual([])
    expect(conn.any).toHaveBeenCalledTimes(1)
  })
})
