import { describe, it, expect } from 'vitest'
import capacitacaoSchema from '../../src/capacitacao/capacitacao_schema.js'
import extraPitSchema from '../../src/extra_pit/extra_pit_schema.js'
import rhSchema from '../../src/rh/rh_schema.js'
import pitNaoProducaoSchema from '../../src/pit_nao_producao/pit_nao_producao_schema.js'
import gerenciaSchema from '../../src/gerencia/gerencia_schema.js'

// Trava as regras de validacao das entidades do RPCMTec (capacitacao, extra_pit,
// aproveitamento do efetivo) sem precisar de banco.

describe('capacitacao_schema.capacitacao', () => {
  const valida = {
    capacitacao: {
      nome: 'Capacitacao FAB',
      tipo: 'Ministrada',
      instituicoes: null,
      local: null,
      inicio: null,
      fim: null,
      efetivo_capacitado: null,
      militares: null,
      plano_codigo: null,
      ano: 2026,
      situacao_id: 1,
      documento: null
    }
  }

  it('aceita um payload valido', () => {
    expect(capacitacaoSchema.capacitacao.validate(valida).error).toBeUndefined()
  })

  it('rejeita tipo fora de Ministrada/Recebida', () => {
    const p = { capacitacao: { ...valida.capacitacao, tipo: 'Outro' } }
    expect(capacitacaoSchema.capacitacao.validate(p).error).toBeDefined()
  })

  it('exige nome e ano', () => {
    const semNome = { capacitacao: { ...valida.capacitacao, nome: undefined } }
    const semAno = { capacitacao: { ...valida.capacitacao, ano: undefined } }
    expect(capacitacaoSchema.capacitacao.validate(semNome).error).toBeDefined()
    expect(capacitacaoSchema.capacitacao.validate(semAno).error).toBeDefined()
  })
})

describe('extra_pit_schema.extraPit', () => {
  const valido = {
    extra_pit: {
      ano: 2026,
      demandante: 'DSG',
      tipo_produto: 'Super-resolução de imagem',
      quantidade: 12,
      situacao_id: 3,
      documento_autorizacao: 'DIEx 1455-E3/DSG',
      descricao: null,
      data_entrega: null,
      lote_id: null
    }
  }

  it('aceita um payload valido', () => {
    expect(extraPitSchema.extraPit.validate(valido).error).toBeUndefined()
  })

  it('rejeita quantidade < 1 (0 e negativo)', () => {
    const zero = { extra_pit: { ...valido.extra_pit, quantidade: 0 } }
    const neg = { extra_pit: { ...valido.extra_pit, quantidade: -5 } }
    expect(extraPitSchema.extraPit.validate(zero).error).toBeDefined()
    expect(extraPitSchema.extraPit.validate(neg).error).toBeDefined()
  })

  it('exige documento_autorizacao (nao aceita vazio)', () => {
    const semDoc = { extra_pit: { ...valido.extra_pit, documento_autorizacao: '' } }
    expect(extraPitSchema.extraPit.validate(semDoc).error).toBeDefined()
  })
})

describe('rh_schema.aproveitamento', () => {
  const valido = {
    aproveitamento: { ano: 2026, mes: 1, usuario_id: 1, tipo_posto_grad_id: null, atividades: null }
  }

  it('aceita um payload valido', () => {
    expect(rhSchema.aproveitamento.validate(valido).error).toBeUndefined()
  })

  it('rejeita mes fora de 1-12', () => {
    const m0 = { aproveitamento: { ...valido.aproveitamento, mes: 0 } }
    const m13 = { aproveitamento: { ...valido.aproveitamento, mes: 13 } }
    expect(rhSchema.aproveitamento.validate(m0).error).toBeDefined()
    expect(rhSchema.aproveitamento.validate(m13).error).toBeDefined()
  })

  it('exige usuario_id', () => {
    const semUser = { aproveitamento: { ano: 2026, mes: 1 } }
    expect(rhSchema.aproveitamento.validate(semUser).error).toBeDefined()
  })

  it('aceita atividades vazia/null no update', () => {
    expect(rhSchema.aproveitamentoUpdate.validate({ aproveitamento: { atividades: '' } }).error).toBeUndefined()
    expect(rhSchema.aproveitamentoUpdate.validate({ aproveitamento: { atividades: null } }).error).toBeUndefined()
  })
})

describe('rh_schema.anoMesParams / copiarMes', () => {
  it('rejeita mes 13 nos params da leitura e do copiar', () => {
    expect(rhSchema.anoMesParams.validate({ ano: 2026, mes: 13 }).error).toBeDefined()
    expect(rhSchema.copiarMes.validate({ ano: 2026, mes: 13 }).error).toBeDefined()
  })

  it('aceita ano/mes validos', () => {
    expect(rhSchema.anoMesParams.validate({ ano: 2026, mes: 6 }).error).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// As colunas que descrevem a linha da 2.1 do RPCMTec
// ---------------------------------------------------------------------------

describe('pit_nao_producao_schema.pit: nome_meta e prazo', () => {
  const valida = {
    pit: {
      ano: 2026,
      numero_meta: 6,
      item: '6.1',
      descricao: 'Catalogação do Acervo da Mapoteca',
      unidade: 'produtos',
      meta: 4200,
      prazo: null
    }
  }

  it('aceita a meta sem nome_meta (o campo nasceu em 2.3.5)', () => {
    expect(pitNaoProducaoSchema.pit.validate(valida).error).toBeUndefined()
  })

  it('aceita e PRESERVA nome_meta', () => {
    const p = { pit: { ...valida.pit, nome_meta: 'Programa Memória' } }
    const r = pitNaoProducaoSchema.pit.validate(p)
    expect(r.error).toBeUndefined()
    expect(r.value.pit.nome_meta).toBe('Programa Memória')
  })

  // O `.raw()` é o que impede o dia de calendário de voltar um dia. Sem ele o
  // Joi devolve um Date de meia-noite UTC, o Postgres o lê em UTC-3 e a coluna
  // DATE guarda o dia ANTERIOR: prazo de 01/08 vira 31/07 na coluna "Previsão
  // de término" da 2.1. `toBeDefined()` num teste de erro não pegaria isso --
  // o que se prova aqui é o VALOR que sai da validação.
  it('prazo sai da validação como STRING, e não como Date', () => {
    const p = { pit: { ...valida.pit, prazo: '2026-08-01' } }
    const r = pitNaoProducaoSchema.pit.validate(p)
    expect(r.error).toBeUndefined()
    expect(r.value.pit.prazo).toBe('2026-08-01')
    expect(r.value.pit.prazo).not.toBeInstanceOf(Date)
  })

  // Sem o `.iso()` a string seguiria crua para o Postgres, e o DateStyle padrão
  // (MDY) leria '01/08/2026' como 8 de JANEIRO.
  it('recusa data fora do ISO 8601', () => {
    const p = { pit: { ...valida.pit, prazo: '01/08/2026' } }
    const r = pitNaoProducaoSchema.pit.validate(p)
    expect(r.error).toBeDefined()
    expect(r.error.details[0].path).toEqual(['pit', 'prazo'])
  })

  it('data_conclusao do lançamento mensal segue a mesma regra', () => {
    const r = pitNaoProducaoSchema.execucao.validate({
      execucao: { pit_id: 1, mes: 8, quantidade: 10, data_conclusao: '2026-08-01', observacao: null }
    })
    expect(r.error).toBeUndefined()
    expect(r.value.execucao.data_conclusao).toBe('2026-08-01')
  })
})

describe('gerencia_schema.pit: a meta de PRODUÇÃO descreve a linha da 2.1', () => {
  const minima = { pit: [{ lote_id: 1, meta: 24, ano: 2026 }] }

  it('continua aceitando o corpo antigo, só com lote/meta/ano', () => {
    // As colunas descritivas entraram em 2.3.5; exigi-las invalidaria o cadastro
    // que já existe e o plugin que o chama.
    expect(gerenciaSchema.pit.validate(minima).error).toBeUndefined()
  })

  it('aceita as colunas da 2.1 e preserva o prazo como string', () => {
    const p = {
      pit: [{
        lote_id: 1, meta: 24, ano: 2026,
        numero_meta: 1, nome_meta: 'Produção de Geoinformação',
        item: '1.1', descricao: 'Carta Topográfica 1:25.000',
        unidade: 'folhas', prazo: '2026-08-31'
      }]
    }
    const r = gerenciaSchema.pit.validate(p)
    expect(r.error).toBeUndefined()
    expect(r.value.pit[0].prazo).toBe('2026-08-31')
    expect(r.value.pit[0].nome_meta).toBe('Produção de Geoinformação')
  })

  it('recusa numero_meta fora de 1 a 7', () => {
    const p = { pit: [{ lote_id: 1, meta: 24, ano: 2026, numero_meta: 8 }] }
    const r = gerenciaSchema.pit.validate(p)
    expect(r.error).toBeDefined()
    expect(r.error.details[0].path).toEqual(['pit', 0, 'numero_meta'])
  })

  it('a atualização aceita as mesmas colunas', () => {
    const p = {
      pit: [{ id: 3, lote_id: 1, meta: 24, ano: 2026, item: '1.1', prazo: '2026-08-31' }]
    }
    expect(gerenciaSchema.pitAtualizacao.validate(p).error).toBeUndefined()
  })
})
