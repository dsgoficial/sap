import { describe, it, expect } from 'vitest'
import metadadosCtrl from '../../src/metadados/metadados_ctrl.js'

// Helpers puros expostos via _helpers (sem I/O) — lógica de negócio do XML/JSON
// de metadados: escape, formatação, regra de licença e o portão de QA.
const {
  escapeXml,
  fmtEscala,
  isoData,
  resolveLicenca,
  resolveTipoVersao,
  validarJsonEdicao,
} = metadadosCtrl._helpers

describe('metadados.escapeXml', () => {
  it('escapa & < > e trata null/undefined como vazio', () => {
    expect(escapeXml('a & b < c > d')).toBe('a &amp; b &lt; c &gt; d')
    expect(escapeXml(null)).toBe('')
    expect(escapeXml(undefined)).toBe('')
    expect(escapeXml(123)).toBe('123')
  })
  it('escapa & antes de < e > (ordem importa, não duplica entidade)', () => {
    expect(escapeXml('<&>')).toBe('&lt;&amp;&gt;')
  })
})

describe('metadados.fmtEscala', () => {
  it('insere separador de milhar', () => {
    expect(fmtEscala(25000)).toBe('25.000')
    expect(fmtEscala(100000)).toBe('100.000')
    expect(fmtEscala(1000000)).toBe('1.000.000')
    expect(fmtEscala(500)).toBe('500')
  })
})

describe('metadados.isoData', () => {
  it('formata Date com componentes LOCAIS (não UTC, não rola o dia)', () => {
    expect(isoData(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(isoData(new Date(2024, 11, 31))).toBe('2024-12-31')
  })
  it('converte DD/MM/AAAA para AAAA-MM-DD', () => {
    expect(isoData('15/03/2024')).toBe('2024-03-15')
  })
  it('null/vazio → string vazia', () => {
    expect(isoData(null)).toBe('')
    expect(isoData('')).toBe('')
  })
  it('string ISO → primeiros 10 caracteres', () => {
    expect(isoData('2024-03-15T10:00:00Z')).toBe('2024-03-15')
  })
})

describe('metadados.resolveLicenca', () => {
  it('FABDEM/FathomDEM força CC-BY-NC-SA 4.0 (regra de contaminação)', () => {
    expect(resolveLicenca({ origem_dados_altimetricos: 'usou FABDEM' })).toBe('CC-BY-NC-SA 4.0')
    expect(resolveLicenca({ origem_dados_altimetricos: 'fathomdem v1' })).toBe('CC-BY-NC-SA 4.0')
  })
  it('sem contaminação respeita o valor explícito', () => {
    expect(resolveLicenca({ licenca_produto: 'CC-BY-SA 4.0' })).toBe('CC-BY-SA 4.0')
  })
  it('sem contaminação e sem valor → default CC-BY-SA 4.0', () => {
    expect(resolveLicenca({})).toBe('CC-BY-SA 4.0')
  })
})

describe('metadados.resolveTipoVersao', () => {
  it('respeita tipo e versão explícitos', () => {
    const r = resolveTipoVersao(
      { tipo_produto: 'Carta Topográfica', versao_produto: '2.0' },
      { tipo_produto_id: 2 },
    )
    expect(r.tipo).toBe('Carta Topográfica')
    expect(r.versao).toBe('2.0')
  })
  it('produto OM (19) sem versão → default 1.0 e ehOM true', () => {
    const r = resolveTipoVersao({}, { tipo_produto_id: 19 })
    expect(r.ehOM).toBe(true)
    expect(r.versao).toBe('1.0')
  })
})

describe('metadados.validarJsonEdicao (portão de QA)', () => {
  const jsonValido = () => ({
    tipo_produto: 'Carta Topográfica',
    versao_produto: '2.0',
    nome: 'Folha X',
    inom: 'SF-22-Y-D',
    banco: { servidor: 's', porta: '5432', nome: 'db' },
    mde_diagrama_elevacao: { caminho_mde: '/dados/mde.tif', epsg: '4326' },
    fases: [{ nome: 'Edição' }],
    info_tecnica: {
      data_criacao: '2024-01-01',
      pec_planimetrico: 'A',
      pec_altimetrico: 'A',
      datum_vertical: 'Imbituba',
      origem_dados_altimetricos: 'IBGE',
      dados_terceiros: [],
    },
  })

  it('um JSON completo não acusa erros', () => {
    expect(validarJsonEdicao(jsonValido())).toEqual([])
  })
  it('acusa nome ausente', () => {
    const j = jsonValido()
    delete j.nome
    expect(validarJsonEdicao(j)).toContain('nome ausente')
  })
  it('acusa caminho_mde com espaço (a exportação falha)', () => {
    const j = jsonValido()
    j.mde_diagrama_elevacao.caminho_mde = '/dados com espaco/mde.tif'
    expect(validarJsonEdicao(j).some(e => /caminho_mde contem espaco/.test(e))).toBe(true)
  })
  it('acusa banco não resolvido quando falta servidor/porta/nome', () => {
    const j = jsonValido()
    j.banco = { servidor: 's' }
    expect(validarJsonEdicao(j).some(e => /banco de edicao/.test(e))).toBe(true)
  })
  it('acusa dados_terceiros quando não é array', () => {
    const j = jsonValido()
    j.info_tecnica.dados_terceiros = null
    expect(validarJsonEdicao(j).some(e => /dados_terceiros/.test(e))).toBe(true)
  })
})
