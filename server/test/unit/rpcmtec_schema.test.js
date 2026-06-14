import { describe, it, expect } from 'vitest'
import capacitacaoSchema from '../../src/capacitacao/capacitacao_schema.js'
import extraPitSchema from '../../src/extra_pit/extra_pit_schema.js'
import rhSchema from '../../src/rh/rh_schema.js'

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
