import { describe, it, expect } from 'vitest'
import projetoSchema from '../../src/projeto/projeto_schema.js'
import gerenciaSchema from '../../src/gerencia/gerencia_schema.js'

// Guarda os apertos de schema feitos para impedir input que o controller não
// consegue tratar (geom '' → ST_GeomFromEWKT('') estoura; plugins [] → insert vazio).
describe('projeto.insumos — geom não pode ser vazio', () => {
  const base = { tipo_insumo: 1, grupo_insumo: 1 }

  it('rejeita geom vazio', () => {
    const { error } = projetoSchema.insumos.validate({
      ...base,
      insumos: [{ nome: 'x', caminho: '/p', epsg: '4326', geom: '' }],
    })
    expect(error).toBeTruthy()
  })

  it('aceita geom preenchido', () => {
    const { error } = projetoSchema.insumos.validate({
      ...base,
      insumos: [
        { nome: 'x', caminho: '/p', epsg: '4326', geom: 'SRID=4326;POLYGON((0 0,0 1,1 1,1 0,0 0))' },
      ],
    })
    expect(error).toBeFalsy()
  })
})

describe('gerencia.plugins — lista não pode ser vazia', () => {
  it('rejeita plugins: []', () => {
    const { error } = gerenciaSchema.plugins.validate({ plugins: [] })
    expect(error).toBeTruthy()
  })

  it('aceita ao menos um plugin', () => {
    const { error } = gerenciaSchema.plugins.validate({
      plugins: [{ nome: 'p', versao_minima: '1.0' }],
    })
    expect(error).toBeFalsy()
  })
})
