import { describe, it, expect } from 'vitest'
import JSZip from 'jszip'
import {
  montarDocumento,
  mesCapitalizado,
  FORMATO
} from '../../src/relatorio/relatorio_docx.js'
import relatorioCtrl from '../../src/relatorio/relatorio_ctrl.js'

// A FORMATAÇÃO do RPCMTec, conferida no OOXML do arquivo gerado.
//
// O que este arquivo protege não é o número: é o fato de o documento poder ser
// COLADO no RPCMTec mestre sem ninguém reformatar tabela nenhuma. Trocar a
// fonte, a cor do cabeçalho ou a largura de coluna não quebra nada, não dá erro
// e não some da tela: chega ao chefe como uma tabela que destoa das outras.
//
// Os valores esperados estão ESCRITOS AQUI, medidos em
// "RPCM Técnico Julho_2026.docx" em 2026-08-02, e não lidos de um .docx de
// referência. Um teste que lê a mesma fonte que o código passaria a concordar
// com qualquer coisa que o código fizesse.

const documentoXml = async (secoes, { ano = 2026, mes = 7 } = {}) => {
  const buffer = await montarDocumento({ ano, mes, secoes })
  const zip = await JSZip.loadAsync(buffer)
  return zip.file('word/document.xml').async('string')
}

const SECAO_DE_PROVA = [{
  titulo: '2. EXECUÇÃO DO PIT',
  subsecoes: [{
    numero: '2.3',
    titulo: 'Execução por Lote de Produção',
    cabecalhos: ['Lote SAP', 'Número de Produtos', 'Número de operadores', 'Percentual concluído'],
    linhas: [['Bloco 1h Parque Nacional Iguaçu', '18', '8', '22.5%']]
  }]
}]

describe('relatorio_docx: as medidas do modelo da Divisão', () => {
  it('as constantes são as MEDIDAS do documento de julho/2026', () => {
    expect(FORMATO.FONTE).toBe('Calibri')
    // Meio-pontos: 24 = 12pt no título e no cabeçalho da tabela, 20 = 10pt no
    // corpo. O modelo NÃO usa o mesmo tamanho nos dois.
    expect(FORMATO.TAMANHO_TITULO).toBe(24)
    expect(FORMATO.TAMANHO_CORPO_TABELA).toBe(20)
    expect(FORMATO.PREENCHIMENTO_CABECALHO).toBe('DDD9C4')
    // A tabela avança sobre a margem esquerda, de propósito.
    expect(FORMATO.RECUO_TABELA).toBe(-141)
  })

  it('as 9 subseções que o SAP gera têm grade de coluna declarada', () => {
    // Subseção sem grade cai na divisão por igual, que dá uma tabela que não é a
    // do modelo. É silencioso: por isso a lista fica explícita aqui. As demais
    // subseções do RPCMTec são do SCA (2.7, 3.1/3.2/3.4, 4.1 a 4.7, 7.2/7.3) ou
    // não têm dono em sistema nenhum.
    expect(Object.keys(FORMATO.GRADES).sort()).toEqual([
      '2.1', '2.2', '2.3', '2.4', '2.5', '2.6',
      '3.3',
      '6.1', '6.2'
    ])
  })

  it('a lista de subseções do controller é a MESMA das grades', () => {
    // Acrescentar subseção no controller sem grade no docx (ou o contrário) dá
    // uma tabela fora de medida sem erro nenhum.
    const doCtrl = relatorioCtrl.SUBSECOES.map(s => s.numero).sort()
    expect(doCtrl).toEqual(Object.keys(FORMATO.GRADES).sort())
  })

  it('cada grade é a do modelo, com uma largura por coluna', () => {
    // As grades NÃO são proporcionais entre si: a coluna "Descrição" da 3.3 é
    // larga porque é prosa, e a "Qtd" da mesma tabela é estreita porque cabe um
    // número. Distribuir por igual seria mais simples e daria outro documento.
    expect(FORMATO.GRADES['2.1']).toEqual([1665, 825, 2835, 1425, 1005, 1035, 1365])
    expect(FORMATO.GRADES['3.3']).toEqual([1590, 1575, 630, 1215, 1455, 3360])

    // Cada grade tem de ter uma entrada por CABEÇALHO da subseção. Grade curta
    // deixa a última coluna sem largura, e o Word a desenha com o que sobrar.
    for (const sub of relatorioCtrl.SUBSECOES) {
      expect(FORMATO.GRADES[sub.numero]).toHaveLength(sub.cabecalhos.length)
      const soma = FORMATO.GRADES[sub.numero].reduce((s, g) => s + g, 0)
      // As tabelas do modelo ficam entre 9765 e 10155 twip; fora dessa faixa a
      // tabela nasce de outro tamanho que as vizinhas do documento mestre.
      expect(soma).toBeGreaterThanOrEqual(9765)
      expect(soma).toBeLessThanOrEqual(10155)
    }
  })

  it('a página é Letter com a margem superior do modelo', async () => {
    const xml = await documentoXml(SECAO_DE_PROVA)
    expect(xml).toContain('<w:pgSz w:w="12240" w:h="15840"')
    expect(xml).toContain('w:top="990"')
  })

  it('o cabeçalho da tabela vem preenchido, em negrito e 12pt', async () => {
    const xml = await documentoXml(SECAO_DE_PROVA)
    expect(xml).toContain('<w:shd w:fill="DDD9C4"')
    // O corpo é 10pt: se o cabeçalho e o corpo saíssem do mesmo tamanho, a
    // tabela ficaria parecida com a do modelo e não igual.
    expect(xml).toContain('<w:sz w:val="24"/>')
    expect(xml).toContain('<w:sz w:val="20"/>')
  })

  it('a tabela é de layout fixo, com a grade e o recuo do modelo', async () => {
    const xml = await documentoXml(SECAO_DE_PROVA)
    expect(xml).toContain('<w:tblLayout w:type="fixed"/>')
    expect(xml).toContain('<w:tblInd w:type="dxa" w:w="-141"/>')
    expect(xml).toContain('<w:gridCol w:w="3210"/>')
  })

  it('subseção sem linha nenhuma sai com a linha de "-" do modelo', async () => {
    // O modelo escreve "não houve" com um traço em cada coluna (ver 2.4 e 6.2 na
    // edição de julho/2026). Só o cabeçalho pareceria tabela por preencher.
    const xml = await documentoXml([{
      titulo: '6. RECURSOS HUMANOS',
      subsecoes: [{
        numero: '6.2',
        titulo: 'Capacitação do efetivo',
        cabecalhos: ['Plano / Código', 'Capacitação', 'Instituição', 'Militar'],
        linhas: []
      }]
    }])
    const traços = (xml.match(/<w:t xml:space="preserve">-<\/w:t>/g) || []).length
    expect(traços).toBe(4)
  })

  it('a célula mesclada verticalmente vira w:vMerge, e não texto repetido', async () => {
    // A coluna "Meta" da 2.1 desce pelas linhas dos itens da mesma meta. Repetir
    // o nome em toda linha, ou deixá-las em branco, dá uma tabela parecida.
    const xml = await documentoXml([{
      titulo: '2. EXECUÇÃO DO PIT',
      subsecoes: [{
        numero: '2.1',
        titulo: 'Estado Atual do PIT',
        cabecalhos: ['Meta', 'Item', 'Produto ou serviço', 'Quantidade', 'Prontos no mês', 'Prontos', 'Previsão de término'],
        linhas: [
          [{ texto: 'Meta 1 - Produção de Geoinformação', merge: 'restart' }, '1.1', 'Carta Topográfica 1:25.000', '24', '0', '16', 'AGO 26'],
          [{ texto: '', merge: 'continue' }, '1.2', 'Carta Topográfica 1:50.000', '53', '0', '19', 'OUT 26']
        ]
      }]
    }])
    expect(xml).toContain('<w:vMerge w:val="restart"/>')
    expect(xml).toContain('<w:vMerge w:val="continue"/>')
    // O nome sai UMA vez.
    const ocorrencias = (xml.match(/Produção de Geoinformação/g) || []).length
    expect(ocorrencias).toBe(1)
  })

  it('a célula com span ocupa a SOMA das colunas que cobre', async () => {
    // As três linhas de total da 2.6 têm o rótulo nas três primeiras colunas.
    // Somar errado (ou usar só a largura da primeira) desalinha a linha inteira
    // num layout fixo.
    const xml = await documentoXml([{
      titulo: '2. EXECUÇÃO DO PIT',
      subsecoes: [{
        numero: '2.6',
        titulo: 'Capacitações externas',
        cabecalhos: ['Capacitação', 'Período', 'Instituições participantes', 'Efetivo capacitado'],
        linhas: [
          ['Curso', '01/07/2026', 'EsAO', '30'],
          [{ texto: 'Total no ano', span: 3 }, '30']
        ]
      }]
    }])
    expect(xml).toContain('<w:gridSpan w:val="3"/>')
    // 2160 + 2385 + 3015 = 7560
    expect(xml).toContain('<w:tcW w:type="dxa" w:w="7560"/>')
  })

  it('o cabeçalho de página traz mês, ano e a paginação', async () => {
    const buffer = await montarDocumento({ ano: 2026, mes: 7, secoes: SECAO_DE_PROVA })
    const zip = await JSZip.loadAsync(buffer)
    const header = await zip.file('word/header1.xml').async('string')
    expect(header).toContain('RPCMTec 1º CGEO Julho/2026')
    expect(header).toContain('PAGE')
    expect(header).toContain('NUMPAGES')
  })

  it('mesCapitalizado escreve o mês como o cabeçalho do modelo', () => {
    expect(mesCapitalizado(7)).toBe('Julho')
    expect(mesCapitalizado(3)).toBe('Março')
    expect(mesCapitalizado(12)).toBe('Dezembro')
  })
})
