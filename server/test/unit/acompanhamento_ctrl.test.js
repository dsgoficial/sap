import { describe, it, expect, beforeEach } from 'vitest'
import { subWeeks, subMonths } from 'date-fns'
import database from '../../src/database/index.js'
import { patchDb } from '../helpers/databaseMock.js'
import acompanhamentoCtrl from '../../src/acompanhamento/acompanhamento_ctrl.js'

const PASSADO = new Date('2020-01-01T00:00:00Z')

// getDadosSiteAcompanhamento faz DUAS queries (db.sapConn.any) e transforma o
// resultado no contrato exato que o site estático de acompanhamento consome:
//   - dados.json: { <projeto_id>: { title, description, lotes: [...] } }
//   - <lote_id>.geojson: a FeatureCollection do lote
// É lógica de moldagem pura e propensa a regressão (colunas, agregação de
// legend, ordem dos arquivos). Estes testes a fixam sem tocar no banco.
let conn
beforeEach(() => {
  conn = patchDb(database)
})

describe('acompanhamentoCtrl.getDadosSiteAcompanhamento', () => {
  it('monta dados.json + um .geojson por lote com a estrutura esperada', async () => {
    conn.any
      // 1ª query: uma linha por (projeto, lote, fase)
      .mockResolvedValueOnce([
        {
          projeto_id: 1,
          projeto: 'Projeto A',
          descricao_projeto: 'descA',
          lote_id: 10,
          lote: 'Lote 10',
          descricao_lote: 'descL10',
          fase_id: 2,
          bounds: [[0, 0], [1, 1]],
        },
        {
          projeto_id: 1,
          projeto: 'Projeto A',
          descricao_projeto: 'descA',
          lote_id: 10,
          lote: 'Lote 10',
          descricao_lote: 'descL10',
          fase_id: 3,
          bounds: [[0, 0], [1, 1]],
        },
      ])
      // 2ª query: geojson agregado por lote
      .mockResolvedValueOnce([
        { lote_id: 10, json: { type: 'FeatureCollection', features: [] } },
      ])

    const result = await acompanhamentoCtrl.getDadosSiteAcompanhamento()

    // O primeiro arquivo é SEMPRE dados.json
    expect(result[0].nome).toBe('dados.json')
    const dados = result[0].dados
    expect(dados[1].title).toBe('Projeto A')
    expect(dados[1].description).toBe('descA')
    expect(dados[1].lotes).toHaveLength(1)

    const lote = dados[1].lotes[0]
    expect(lote.name).toBe(10)
    expect(lote.subtitle).toBe('Lote 10')
    expect(lote.description).toBe('descL10')
    // legend acumula [0] + cada fase_id das linhas daquele lote
    expect(lote.legend).toEqual([0, 2, 3])
    expect(lote.zoom).toEqual([[0, 0], [1, 1]])

    // Depois, um arquivo <lote_id>.geojson por lote retornado pela 2ª query
    const geojsonFile = result.find(r => r.nome === '10.geojson')
    expect(geojsonFile).toBeTruthy()
    expect(geojsonFile.dados).toEqual({ type: 'FeatureCollection', features: [] })
  })

  it('agrupa múltiplos lotes sob o mesmo projeto', async () => {
    conn.any
      .mockResolvedValueOnce([
        { projeto_id: 1, projeto: 'P', descricao_projeto: 'd', lote_id: 10, lote: 'L10', descricao_lote: 'dl', fase_id: 1, bounds: [[0, 0], [1, 1]] },
        { projeto_id: 1, projeto: 'P', descricao_projeto: 'd', lote_id: 20, lote: 'L20', descricao_lote: 'dl', fase_id: 1, bounds: [[2, 2], [3, 3]] },
      ])
      .mockResolvedValueOnce([
        { lote_id: 10, json: { type: 'FeatureCollection', features: [] } },
        { lote_id: 20, json: { type: 'FeatureCollection', features: [] } },
      ])

    const result = await acompanhamentoCtrl.getDadosSiteAcompanhamento()

    expect(result[0].dados[1].lotes).toHaveLength(2)
    // um arquivo .geojson para cada lote
    expect(result.find(r => r.nome === '10.geojson')).toBeTruthy()
    expect(result.find(r => r.nome === '20.geojson')).toBeTruthy()
  })

  it('sem lotes/geojson retorna apenas dados.json (sem quebrar)', async () => {
    conn.any.mockResolvedValueOnce([]).mockResolvedValueOnce([])

    const result = await acompanhamentoCtrl.getDadosSiteAcompanhamento()

    expect(result).toHaveLength(1)
    expect(result[0].nome).toBe('dados.json')
    expect(result[0].dados).toEqual({})
  })
})

// getInfoSubfaseLote/getInfoLote tinham bugs de data REAIS:
//  - format(data_fim) era chamado mesmo com data_fim null (situações 1/2/3 e
//    lotes em andamento) → RangeError "Invalid time value" → endpoint quebrado.
//  - "semana/mês anterior" comparava string (format) com Date (subWeeks/subMonths)
//    → sempre falso → contadores _anterior sempre 0.
//  - getInfoLote tinha typo 'atividades_finalizada_semana' → NaN no campo errado.
describe('acompanhamentoCtrl.getInfoSubfaseLote', () => {
  it('não lança quando há atividades sem data_fim (situação != 4)', async () => {
    conn.any.mockResolvedValueOnce([
      { etapa_id: 1, etapa_nome: 'X', tipo_situacao_id: 1, data_inicio: null, data_fim: null },
      { etapa_id: 1, etapa_nome: 'X', tipo_situacao_id: 2, data_inicio: new Date(), data_fim: null },
    ])
    await expect(acompanhamentoCtrl.getInfoSubfaseLote(10, 20)).resolves.toBeTruthy()
  })

  it('classifica por situação e conta finalizadas hoje/semana/semana anterior', async () => {
    const now = new Date()
    conn.any.mockResolvedValueOnce([
      { etapa_id: 1, etapa_nome: 'Edição', tipo_situacao_id: 1, data_inicio: null, data_fim: null },
      { etapa_id: 1, etapa_nome: 'Edição', tipo_situacao_id: 2, data_inicio: now, data_fim: null },
      { etapa_id: 1, etapa_nome: 'Edição', tipo_situacao_id: 3, data_inicio: now, data_fim: null },
      { etapa_id: 1, etapa_nome: 'Edição', tipo_situacao_id: 4, data_inicio: PASSADO, data_fim: now },
      { etapa_id: 1, etapa_nome: 'Edição', tipo_situacao_id: 4, data_inicio: PASSADO, data_fim: subWeeks(now, 1) },
    ])

    const est = await acompanhamentoCtrl.getInfoSubfaseLote(10, 20)
    const e = est[1]

    expect(e.atividades_restantes).toBe(1)
    expect(e.atividades_em_execucao).toBe(1)
    expect(e.atividades_pausadas).toBe(1)
    expect(e.atividades_finalizadas).toBe(2)
    expect(e.atividades_finalizadas_hoje).toBe(1)
    expect(e.atividades_finalizadas_semana).toBe(1)
    expect(e.atividades_finalizadas_semana_anterior).toBe(1)

    // nenhum contador pode ser NaN
    for (const v of Object.values(e)) {
      if (typeof v === 'number') expect(Number.isNaN(v)).toBe(false)
    }
  })
})

describe('acompanhamentoCtrl.getInfoLote', () => {
  it('não lança quando há fase em andamento (data_fim null)', async () => {
    conn.any.mockResolvedValueOnce([
      { id: 1, fase_id: 1, fase_nome: 'A', data_inicio: new Date(), data_fim: null },
      { id: 2, fase_id: 1, fase_nome: 'A', data_inicio: null, data_fim: null },
    ])
    await expect(acompanhamentoCtrl.getInfoLote(20)).resolves.toBeTruthy()
  })

  it('conta finalizadas/execução/restantes e corrige typo + comparação anterior', async () => {
    const now = new Date()
    conn.any.mockResolvedValueOnce([
      { id: 1, fase_id: 1, fase_nome: 'Fase A', data_inicio: PASSADO, data_fim: now },
      { id: 2, fase_id: 1, fase_nome: 'Fase A', data_inicio: now, data_fim: null },
      { id: 3, fase_id: 1, fase_nome: 'Fase A', data_inicio: null, data_fim: null },
      { id: 4, fase_id: 1, fase_nome: 'Fase A', data_inicio: PASSADO, data_fim: subWeeks(now, 1) },
      { id: 5, fase_id: 1, fase_nome: 'Fase A', data_inicio: PASSADO, data_fim: subMonths(now, 1) },
    ])

    const est = await acompanhamentoCtrl.getInfoLote(20)
    const f = est[1]

    expect(f.atividades_finalizadas).toBe(3)
    expect(f.atividades_em_execucao).toBe(1)
    expect(f.atividades_restantes).toBe(1)

    // Typo corrigido: o contador semanal vai para o campo certo (não NaN num
    // campo fantasma). O campo errado não pode existir.
    expect(f.atividades_finalizadas_semana).toBe(1)
    expect(f).not.toHaveProperty('atividades_finalizada_semana')

    // Date→string corrigido: as comparações "anterior" agora contam (antes 0).
    expect(f.atividades_finalizadas_semana_anterior).toBe(1)
    expect(f.atividades_finalizadas_mes_anterior).toBeGreaterThanOrEqual(1)
    expect(f.atividades_finalizadas_mes).toBeGreaterThanOrEqual(1)

    for (const v of Object.values(f)) {
      if (typeof v === 'number') expect(Number.isNaN(v)).toBe(false)
    }
  })
})
