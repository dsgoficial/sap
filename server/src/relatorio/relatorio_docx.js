'use strict'

// A FORMATAÇÃO do RPCMTec, medida no documento que a Divisão usa hoje
// ("RPCM Técnico Julho_2026.docx", conferido em 2026-08-02). Cada constante
// abaixo é um valor LIDO do OOXML daquele arquivo, não uma escolha nossa: o
// que o SAP gera tem de poder ser colado na subseção de mesmo número do RPCMTec
// mestre sem ninguém reformatar tabela nenhuma. Antes de 2026-08-02 o export
// saía com a formatação default da biblioteca `docx`, e quem montava a edição
// reformatava tabela a tabela no Word.
//
// POR QUE ARQUIVO SEPARADO, e não dentro do `_ctrl`: isto é apresentação, e o
// ctrl é dado. Juntos dariam um arquivo em que a regra de negócio (o que conta
// como produto finalizado no mês) fica misturada com a cor do cabeçalho da
// tabela. É o mesmo desenho de `rpcmtec/rpcmtec_docx.js` no SCA, que gera as
// OUTRAS subseções do mesmo relatório -- e as duas medidas TÊM de ser iguais,
// senão a mesma edição sai com duas formatações de tabela.
//
// O QUE FOI MEDIDO (unidades do OOXML: twip para distância, meio-ponto para
// fonte, oitavo de ponto para borda):
//
//   página        12240 x 15840 twip (Letter), margens 990 topo / 1440 nos
//                 outros três lados, cabeçalho e rodapé a 720
//   fonte         Calibri em tudo o que se vê. O `docDefaults` do modelo diz
//                 Arial 11, mas NENHUMA execução visível o usa: todas a
//                 redefinem para Calibri. Aqui o default já nasce Calibri, e
//                 cada execução ainda a declara, para o arquivo não depender do
//                 que o Word resolver herdar.
//   título        seção "2. EXECUÇÃO DO PIT": 12pt NEGRITO, justificado
//                 subseção "2.2. Totais do Mês e do Ano": 12pt normal, idem
//   tabela        recuo -141 (ela avança sobre a margem esquerda de propósito),
//                 layout FIXO, largura = a soma da própria grade
//   cabeçalho     preenchimento DDD9C4, 12pt negrito, centrado, alinhamento
//   da tabela     vertical ao centro, altura mínima 431, repete em toda página
//   corpo         10pt, centrado, alinhamento vertical ao centro
//   bordas        linha simples preta de 1pt (sz 8) nos quatro lados
//
// O modelo tem uma grade de coluna PRÓPRIA por tabela, e elas não são
// proporcionais entre si: a coluna "Descrição" da 3.3 é larga porque o texto é
// longo, e a "Qtd" da mesma tabela é estreita porque cabe um número. Por isso a
// grade vai declarada em cada tabela (GRADES, abaixo), copiada do modelo, em vez
// de distribuída por igual.

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  VerticalAlign,
  VerticalMergeType,
  BorderStyle,
  ShadingType,
  TableLayoutType,
  HeightRule,
  LineRuleType,
  Header,
  PageNumber
} = require('docx')

const FONTE = 'Calibri'

// Meio-pontos, como o OOXML guarda (w:sz). 24 = 12pt, 20 = 10pt.
const TAMANHO_TITULO = 24
const TAMANHO_CORPO_TABELA = 20
const TAMANHO_CABECALHO_PAGINA = 20

const PREENCHIMENTO_CABECALHO = 'DDD9C4'

// Oitavos de ponto: 8 = 1pt, que é a espessura das bordas do modelo.
const BORDA = { style: BorderStyle.SINGLE, size: 8, color: '000000' }
const BORDAS_CELULA = { top: BORDA, bottom: BORDA, left: BORDA, right: BORDA }

// Largura de referência do corpo do texto (usada só na tabulação do cabeçalho de
// página). A largura de cada TABELA é a soma da grade dela, que varia: o modelo
// vai de 9765 (2.6) a 10155 (2.1).
const LARGURA_CORPO = 9840
const RECUO_TABELA = -141
const ALTURA_MINIMA_CABECALHO = 431

// Entrelinha simples (w:line="240" w:lineRule="auto"), que é o que o modelo usa
// dentro das células. Fora delas o documento herda 276 (1,15), e é por isso que
// os parágrafos de título não declaram espaçamento nenhum.
const ENTRELINHA_CELULA = { line: 240, lineRule: LineRuleType.AUTO }

// A grade de coluna de cada tabela, em twip, COPIADA do modelo. A chave é o
// número da subseção. Só estão aqui as subseções que o SAP gera; as demais são
// do SCA (ver o cabeçalho de relatorio_ctrl.js). Uma tabela sem entrada aqui cai
// na divisão por igual, que dá uma tabela que NÃO é a do modelo -- e o defeito é
// silencioso, por isso o teste cobra a lista.
const GRADES = {
  '2.1': [1665, 825, 2835, 1425, 1005, 1035, 1365],
  '2.2': [4965, 2370, 2520],
  '2.3': [3210, 2025, 2400, 2205],
  '2.4': [1740, 1050, 2535, 1560, 1440, 1485],
  '2.5': [2715, 2250, 2985, 1890],
  '2.6': [2160, 2385, 3015, 2205],
  // A 3.3 (Extra-PIT) é do SAP, e não do SCA: o RPCMTec chama de Extra-PIT a
  // exceção AUTORIZADA (daí a coluna "Documento autorização"), e quem guarda o
  // que a distingue é `macrocontrole.extra_pit`, com o documento obrigatório.
  '3.3': [1590, 1575, 630, 1215, 1455, 3360],
  '6.1': [2310, 7515],
  '6.2': [2310, 2415, 2325, 2835]
}

const MESES = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
]

// Nome do mês como o cabeçalho de página do modelo o escreve ("Julho/2026"):
// primeira letra maiúscula, o resto minúsculo.
const mesCapitalizado = mes => {
  const nome = MESES[mes - 1] || ''
  return nome.charAt(0) + nome.slice(1).toLowerCase()
}

// ---------------------------------------------------------------------------
// Blocos de texto
// ---------------------------------------------------------------------------

// `bold` só entra quando é verdadeiro. Com `bold: false` a biblioteca escreve
// <w:b w:val="false"/>, que o Word entende igual a não ter o elemento, mas que
// o modelo não tem: sem esta guarda, comparar o OOXML gerado com o do modelo
// acusa diferença em toda célula de corpo, e o teste que protege a formatação
// vira ruído.
const execucao = (texto, { negrito = false, tamanho = TAMANHO_TITULO } = {}) =>
  new TextRun({
    text: texto,
    ...(negrito ? { bold: true } : {}),
    font: FONTE,
    size: tamanho
  })

// "2. EXECUÇÃO DO PIT": 12pt negrito, justificado.
const tituloSecao = texto =>
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    children: [execucao(texto, { negrito: true })]
  })

// "2.2. Totais do Mês e do Ano": 12pt normal, justificado.
const tituloSubsecao = texto =>
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    children: [execucao(texto)]
  })

const linhaVazia = () => new Paragraph({ children: [execucao('')] })

// ---------------------------------------------------------------------------
// Tabela
// ---------------------------------------------------------------------------

// Uma célula é uma string ou `{ texto, span, merge }`:
//
//   span  - quantas colunas ela ocupa (w:gridSpan). O modelo usa isso nas três
//           linhas de total da 2.6 ("Total no ano" ocupa as três primeiras
//           colunas e o número fica na quarta).
//   merge - 'restart' ou 'continue' (w:vMerge). O modelo usa isso na coluna
//           "Meta" da 2.1: o nome da meta é escrito UMA vez e a célula desce
//           pelas linhas dos itens daquela meta. Escrever o nome em toda linha,
//           ou deixá-las em branco, dá uma tabela parecida e não a do modelo.
const normalizarCelula = c =>
  (c && typeof c === 'object' && !Array.isArray(c))
    ? { texto: c.texto, span: c.span || 1, merge: c.merge || null }
    : { texto: c, span: 1, merge: null }

// Célula vazia continua precisando de um parágrafo: `w:tc` sem `w:p` é OOXML
// inválido, e o Word recusa o arquivo inteiro.
const celula = ({ texto, span, merge }, { largura, cabecalho = false }) =>
  new TableCell({
    width: { size: largura, type: WidthType.DXA },
    ...(span > 1 ? { columnSpan: span } : {}),
    ...(merge
      ? {
          verticalMerge: merge === 'restart'
            ? VerticalMergeType.RESTART
            : VerticalMergeType.CONTINUE
        }
      : {}),
    borders: BORDAS_CELULA,
    verticalAlign: VerticalAlign.CENTER,
    shading: cabecalho
      ? { type: ShadingType.CLEAR, fill: PREENCHIMENTO_CABECALHO, color: 'auto' }
      : undefined,
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: ENTRELINHA_CELULA,
        children: [
          execucao(String(texto == null ? '' : texto), {
            negrito: cabecalho,
            tamanho: cabecalho ? TAMANHO_TITULO : TAMANHO_CORPO_TABELA
          })
        ]
      })
    ]
  })

// A largura de uma célula que ocupa N colunas é a SOMA das N entradas da grade
// que ela cobre. Somar errado (ou usar só a primeira) desalinha a linha inteira
// num layout fixo.
const montarLinha = (celulas, grade) => {
  let coluna = 0
  return new TableRow({
    children: celulas.map(normalizarCelula).map(c => {
      const largura = grade
        .slice(coluna, coluna + c.span)
        .reduce((s, g) => s + (g || 0), 0)
      coluna += c.span
      return celula(c, { largura })
    })
  })
}

/**
 * Uma tabela no formato do RPCMTec.
 *
 * Tabela sem nenhuma linha sai com UMA linha de '-' em cada coluna, que é como
 * o modelo escreve "não houve" (ver 2.4, 2.6 e 6.2 na edição de julho/2026).
 * Deixar só o cabeçalho faria parecer que a tabela ficou por preencher.
 *
 * @param {string} numero - a subseção ('2.2'), para escolher a grade de coluna
 * @param {Array<string>} cabecalhos
 * @param {Array<Array<string|Object>>} linhas
 * @returns {Table}
 */
const tabela = (numero, cabecalhos, linhas) => {
  const grade = GRADES[numero] ||
    cabecalhos.map(() => Math.round(LARGURA_CORPO / cabecalhos.length))
  const corpo = linhas.length > 0 ? linhas : [cabecalhos.map(() => '-')]

  return new Table({
    columnWidths: grade,
    width: { size: grade.reduce((s, g) => s + g, 0), type: WidthType.DXA },
    indent: { size: RECUO_TABELA, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        tableHeader: true,
        height: { value: ALTURA_MINIMA_CABECALHO, rule: HeightRule.ATLEAST },
        children: cabecalhos.map((texto, i) =>
          celula(normalizarCelula(texto), { largura: grade[i], cabecalho: true }))
      }),
      ...corpo.map(celulas => montarLinha(celulas, grade))
    ]
  })
}

// ---------------------------------------------------------------------------
// Cabeçalho de página
// ---------------------------------------------------------------------------

// "RPCMTec 1º CGEO Julho/2026 ... Página X de Y", 10pt negrito. No modelo o
// espaçamento até "Página" é feito com tabulações mais espaços; aqui vai uma
// tabulação à direita, que produz o mesmo resultado sem depender da largura da
// fonte.
const cabecalhoPagina = (ano, mes) =>
  new Header({
    children: [
      new Paragraph({
        tabStops: [{ type: 'right', position: LARGURA_CORPO }],
        children: [
          execucao(`RPCMTec 1º CGEO ${mesCapitalizado(mes)}/${ano}`, {
            negrito: true, tamanho: TAMANHO_CABECALHO_PAGINA
          }),
          new TextRun({
            bold: true, font: FONTE, size: TAMANHO_CABECALHO_PAGINA,
            children: ['\t', 'Página ', PageNumber.CURRENT, ' de ', PageNumber.TOTAL_PAGES]
          })
        ]
      })
    ]
  })

// ---------------------------------------------------------------------------
// Documento
// ---------------------------------------------------------------------------

/**
 * Monta o DOCX a partir das seções já formatadas.
 *
 * @param {Object} params
 * @param {number} params.ano
 * @param {number} params.mes
 * @param {Array<Object>} params.secoes - [{ titulo, subsecoes: [{ numero,
 *   titulo, cabecalhos, linhas }] }]
 * @returns {Promise<Buffer>}
 */
const montarDocumento = ({ ano, mes, secoes }) => {
  const children = []

  for (const secao of secoes) {
    children.push(tituloSecao(secao.titulo))
    for (const sub of secao.subsecoes) {
      children.push(tituloSubsecao(`${sub.numero}. ${sub.titulo}`))
      children.push(tabela(sub.numero, sub.cabecalhos, sub.linhas))
      children.push(linhaVazia())
    }
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: FONTE, size: TAMANHO_TITULO }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: {
              top: 990, bottom: 1440, left: 1440, right: 1440,
              header: 720, footer: 720
            }
          }
        },
        headers: { default: cabecalhoPagina(ano, mes) },
        children
      }
    ]
  })

  return Packer.toBuffer(doc)
}

module.exports = {
  montarDocumento,
  mesCapitalizado,
  MESES,
  // Exportados para o teste conferir a formatação contra o modelo medido, sem
  // reabrir o .docx de referência a cada execução.
  FORMATO: {
    FONTE,
    TAMANHO_TITULO,
    TAMANHO_CORPO_TABELA,
    PREENCHIMENTO_CABECALHO,
    LARGURA_CORPO,
    RECUO_TABELA,
    GRADES
  }
}
