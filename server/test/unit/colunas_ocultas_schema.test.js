import { describe, it, expect } from 'vitest'
import projetoSchema from '../../src/projeto/projeto_schema.js'

// Trava o formato da definicao de colunas ocultas ({"tabela": ["coluna"]}) e
// o contrato dos perfis, sem precisar de banco.

const corpo = definicao => ({
  colunas_ocultas: [{ nome: 'operador', definicao_colunas: definicao }]
})

describe('projeto_schema.colunasOcultas', () => {
  it('aceita tabela com lista de colunas e a chave "*"', () => {
    const definicao = JSON.stringify({
      elemnat_trecho_drenagem_l: ['visivel', 'data_criacao'],
      '*': ['operador_criacao']
    })
    const { error } = projetoSchema.colunasOcultas.validate(corpo(definicao))
    expect(error).toBeUndefined()
  })

  it.each([
    ['texto que nao e JSON', 'nao e json'],
    ['array no lugar de objeto', '[1]'],
    ['objeto vazio', '{}'],
    ['valor que nao e lista', '{"a":"b"}'],
    ['coluna vazia', '{"a":[""]}'],
    ['coluna que nao e texto', '{"a":[1]}'],
    ['chave vazia', '{"":["a"]}']
  ])('recusa %s', (_descricao, definicao) => {
    const { error } = projetoSchema.colunasOcultas.validate(corpo(definicao))
    expect(error).toBeDefined()
  })

  it('recusa nomes repetidos no mesmo envio', () => {
    const definicao = '{"a":["b"]}'
    const { error } = projetoSchema.colunasOcultas.validate({
      colunas_ocultas: [
        { nome: 'x', definicao_colunas: definicao },
        { nome: 'x', definicao_colunas: definicao }
      ]
    })
    expect(error).toBeDefined()
  })

  it('exige id inteiro na atualizacao', () => {
    const base = { nome: 'x', definicao_colunas: '{"a":["b"]}' }
    expect(
      projetoSchema.colunasOcultasAtualizacao.validate({
        colunas_ocultas: [{ ...base, id: 1 }]
      }).error
    ).toBeUndefined()
    expect(
      projetoSchema.colunasOcultasAtualizacao.validate({
        colunas_ocultas: [base]
      }).error
    ).toBeDefined()
  })
})

describe('projeto_schema.perfilColunasOcultas', () => {
  it('aceita o vinculo catalogo x subfase x lote', () => {
    const { error } = projetoSchema.perfilColunasOcultas.validate({
      perfis_colunas_ocultas: [
        { colunas_ocultas_id: 1, subfase_id: 2, lote_id: 3 }
      ]
    })
    expect(error).toBeUndefined()
  })

  it('recusa vinculo sem lote', () => {
    const { error } = projetoSchema.perfilColunasOcultas.validate({
      perfis_colunas_ocultas: [{ colunas_ocultas_id: 1, subfase_id: 2 }]
    })
    expect(error).toBeDefined()
  })
})

describe('projeto_schema.configuracaoLoteCopiar', () => {
  const base = {
    lote_id_origem: 1,
    lote_id_destino: 2,
    copiar_estilo: true,
    copiar_menu: true,
    copiar_regra: true,
    copiar_modelo: true,
    copiar_workflow: true,
    copiar_alias: true,
    copiar_linhagem: true,
    copiar_finalizacao: true,
    copiar_tema: true,
    copiar_fme: true,
    copiar_configuracao_qgis: true,
    copiar_monitoramento: true
  }

  it('copiar_colunas_ocultas e opcional e assume false', () => {
    const { error, value } = projetoSchema.configuracaoLoteCopiar.validate(base)
    expect(error).toBeUndefined()
    expect(value.copiar_colunas_ocultas).toBe(false)
  })

  it('aceita copiar_colunas_ocultas booleano', () => {
    const { error, value } = projetoSchema.configuracaoLoteCopiar.validate({
      ...base,
      copiar_colunas_ocultas: true
    })
    expect(error).toBeUndefined()
    expect(value.copiar_colunas_ocultas).toBe(true)
  })
})
