import { describe, it, expect, beforeEach } from 'vitest'
import database from '../../src/database/index.js'
import { patchDb } from '../helpers/databaseMock.js'
import acompanhamentoCtrl from '../../src/acompanhamento/acompanhamento_ctrl.js'

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
