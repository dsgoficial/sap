// Path: comandos\producao.js
'use strict'

// Os dois verbos de intencao mais usados:
//
//   sap producao --ano 2026 [--mes 7]   estado do PIT, producao e nao-producao
//   sap secao2   --ano 2026 --mes 7     Secao 2 do RPCMTec, do proprio servidor
//
// Por que existem. A pergunta "como esta a producao" hoje custa, pelo caminho
// antigo, dezenove requisicoes e um JSON grande, para caber numa tabela de sete
// linhas. `producao` faz DUAS chamadas e devolve a tabela.
//
// E por que `secao2` NAO recalcula nada: o servidor ja monta a secao inteira em
// GET /api/relatorio/rpcmtec/<ano>/<mes>, com as mesmas contas do DOCX oficial.
// Reimplementar a agregacao aqui criaria uma segunda definicao de "produzido" e
// duas respostas para a mesma pergunta. Verbo que precisa de regra de negocio
// nova pertence ao backend; aqui ele ja pertence.

const http = require('../lib/http')
const saida = require('../lib/saida')
const argsLib = require('../lib/args')

const AJUDA_PRODUCAO = `sap producao - estado do PIT do ano

  sap producao --ano 2026            acumulado ate o mes corrente
  sap producao --ano 2026 --mes 7    acumulado de janeiro ate julho
  sap producao --ano 2026 --json     tudo, para encadear

Duas fontes, somadas: as metas COM lote (as folhas que o SAP acompanha, de
/acompanhamento/pit) e as metas SEM lote (impressao, TI, Programa Memoria, de
/pit_nao_producao). As duas juntas sao o PIT.`

function anoDe (flags) {
  const ano = argsLib.numero(flags, 'ano', null)
  if (!ano) throw new Error('Informe --ano (ex.: --ano 2026).')
  if (!/^20[0-3][0-9]$/.test(String(ano))) {
    // Mesma faixa do regex do acompanhamento_schema.anoParam: recusar aqui
    // poupa um 400 que so diria "anoParam com formato invalido".
    throw new Error(`--ano ${ano} esta fora da faixa que o servidor aceita (2000 a 2039).`)
  }
  return ano
}

async function producao (args, cfg) {
  const flags = args.flags
  if (flags.ajuda || flags.help) return { texto: AJUDA_PRODUCAO }

  const ano = anoDe(flags)
  const mes = argsLib.numero(flags, 'mes', new Date().getMonth() + 1)
  if (mes < 1 || mes > 12) throw new Error(`--mes ${mes} fora de 1..12.`)

  const avisos = []

  // getInfoPIT devolve uma linha por (projeto, lote, mes). O acumulado ate o mes
  // pedido e a soma; o mes isolado e a linha daquele mes. A agregacao e soma,
  // nao regra de negocio: a definicao de "finalizada" fica toda no SQL do server.
  const pit = await http.autenticada(cfg, 'GET', `/acompanhamento/pit/${ano}`)
  const linhas = Array.isArray(pit.dados) ? pit.dados : []

  const porLote = new Map()
  for (const r of linhas) {
    const chave = `${r.projeto}\u0000${r.lote}`
    if (!porLote.has(chave)) {
      porLote.set(chave, {
        projeto: r.projeto, lote: r.lote, meta: Number(r.meta) || 0,
        no_ano: 0, no_mes: 0
      })
    }
    const alvo = porLote.get(chave)
    const m = Number(r.month)
    const fin = Number(r.finalizadas) || 0
    if (m <= mes) alvo.no_ano += fin
    if (m === mes) alvo.no_mes += fin
  }

  const producaoLotes = [...porLote.values()].map(l => ({
    ...l,
    pct: l.meta > 0 ? Math.round((l.no_ano / l.meta) * 1000) / 10 : null
  }))

  // As metas sem lote vivem noutra rota. Se o servidor for anterior ao modulo,
  // o 404 nao pode derrubar a resposta inteira: degrada com aviso.
  let naoProducao = []
  try {
    const np = await http.autenticada(cfg, 'GET', `/pit_nao_producao/${ano}`)
    naoProducao = Array.isArray(np.dados) ? np.dados : []
  } catch (err) {
    avisos.push(
      `Nao consegui ler as metas de PIT nao-producao (${err.message}). ` +
      'A tabela abaixo cobre so as metas COM lote.'
    )
  }

  if (flags.json) {
    return {
      texto: JSON.stringify({ ano, mes, producao: producaoLotes, nao_producao: naoProducao }, null, 2),
      avisos
    }
  }

  const opcoes = { formato: flags.formato || 'tabela' }
  const out = []
  out.push(`PIT ${ano}, acumulado de janeiro ate o mes ${mes}`)
  out.push('')
  out.push('metas COM lote (o SAP conta as folhas finalizadas)')
  out.push(saida.lista(producaoLotes, {
    ...opcoes, padrao: ['projeto', 'lote', 'meta', 'no_ano', 'no_mes', 'pct']
  }).texto)

  if (naoProducao.length) {
    out.push('')
    out.push('metas SEM lote (lancadas a mao; `percentual` ja vem em %)')
    out.push(saida.lista(naoProducao, {
      ...opcoes,
      padrao: ['numero_meta', 'item', 'descricao', 'unidade', 'meta', 'realizado', 'percentual', 'prazo']
    }).texto)
  }

  const totalMeta = producaoLotes.reduce((s, l) => s + l.meta, 0)
  const totalFeito = producaoLotes.reduce((s, l) => s + l.no_ano, 0)
  out.push('')
  out.push(`total das metas com lote: ${saida.numero(totalFeito)} de ${saida.numero(totalMeta)}` +
    (totalMeta > 0 ? ` (${Math.round((totalFeito / totalMeta) * 1000) / 10}%)` : ''))

  return { texto: out.join('\n'), avisos }
}

// ---------------------------------------------------------------------------

const AJUDA_SECAO2 = `sap secao2 - as subsecoes do RPCMTec que saem do SAP

  sap secao2 --ano 2026 --mes 7               markdown pronto
  sap secao2 --ano 2026 --mes 7 --json        o JSON cru do servidor
  sap secao2 --ano 2026 --mes 7 --docx --saida rpcmtec.docx

Uma unica chamada: GET /api/relatorio/rpcmtec/<ano>/<mes>. O servidor ja aplica
o recorte cumulativo (janeiro ate o fim do mes) e devolve as celulas EM TEXTO,
com o separador de milhar e o '-' de "nao houve" no lugar; o CLI so as poe em
tabela. Formatar de novo aqui faria o markdown divergir do DOCX.

A numeracao e a do documento da Divisao (2.1 a 2.6, 3.3, 6.1 e 6.2). As demais
subsecoes vem do SCA (acervo, mapoteca e orcamento) ou sao escritas a mao.`

// [chave no JSON, titulo, colunas]. O titulo traz o NUMERO da subsecao no
// documento da Divisao, o mesmo que o DOCX escreve -- ate 2026-08-02 o servidor
// tinha numeracao propria (a execucao por lote era "2.1", o Extra-PIT "2.6") e
// quem montava a edicao tinha de descobrir a cada mes qual "2.1" era qual.
const SECOES = [
  ['estadoPit', '2.1 Estado Atual do PIT', ['meta_texto', 'item', 'produto_servico', 'quantidade', 'prontos_mes', 'prontos_ano', 'previsao_termino']],
  ['totais', '2.2 Totais do Mes e do Ano', ['tipo_produto', 'mes', 'ano']],
  ['execucaoLote', '2.3 Execucao por Lote de Producao', ['lote', 'num_produtos', 'num_operadores', 'percentual']],
  ['entregas', '2.4 Entregas detalhada de produtos finais no mes', ['tipo', 'escala', 'uuid', 'identificador', 'meta_pit', 'lote']],
  ['campo', '2.5 Atividades de campo', ['local', 'data', 'finalidade', 'efetivo']],
  ['capacitacaoMinistrada', '2.6 Capacitacoes externas', ['capacitacao', 'periodo', 'instituicoes', 'efetivo_capacitado']],
  ['capacitacaoMinistradaTotais', '2.6 Capacitacoes externas (totais do ano)', ['rotulo', 'valor']],
  ['extraPit', '3.3 Extra-PIT', ['demandante', 'tipo_produto', 'quantidade', 'situacao', 'documento_autorizacao', 'descricao']],
  ['aproveitamento', '6.1 Aproveitamento do efetivo', ['militar', 'atividades']],
  ['capacitacaoRecebida', '6.2 Capacitacao do efetivo', ['plano_codigo', 'capacitacao', 'instituicao', 'militar']]
]

/** Tabela markdown de uma lista de objetos, nas colunas pedidas. */
function markdown (linhas, colunas) {
  if (!Array.isArray(linhas) || !linhas.length) return '_(nenhum registro)_'
  const presentes = colunas.filter(c => linhas.some(l => c in l))
  const usar = presentes.length ? presentes : Object.keys(linhas[0])
  const celula = (l, c) => String(saida.celula(c, l[c])).replace(/\|/g, '\\|')
  return [
    '| ' + usar.join(' | ') + ' |',
    '| ' + usar.map(() => '---').join(' | ') + ' |',
    ...linhas.map(l => '| ' + usar.map(c => celula(l, c)).join(' | ') + ' |')
  ].join('\n')
}

async function secao2 (args, cfg) {
  const flags = args.flags
  if (flags.ajuda || flags.help) return { texto: AJUDA_SECAO2 }

  const ano = anoDe(flags)
  const mes = argsLib.numero(flags, 'mes', null)
  if (!mes) throw new Error('Informe --mes (o RPCMTec e mensal e cumulativo).')
  if (mes < 1 || mes > 12) throw new Error(`--mes ${mes} fora de 1..12.`)

  if (flags.docx) {
    const destino = argsLib.exigir(flags, 'saida', 'arquivo .docx a gravar')
    const r = await http.autenticada(
      cfg, 'GET', `/relatorio/rpcmtec/${ano}/${mes}/docx`, { binario: true }
    )
    require('fs').writeFileSync(destino, r.bytes)
    return { texto: `DOCX gravado em ${destino} (${r.bytes.length} bytes).` }
  }

  const r = await http.autenticada(cfg, 'GET', `/relatorio/rpcmtec/${ano}/${mes}`)
  const d = r.dados || {}

  if (flags.json) return { texto: JSON.stringify(d, null, 2) }

  const out = [`# RPCMTec ${String(mes).padStart(2, '0')}/${ano} - subsecoes do SAP`, '']
  for (const [chave, titulo, colunas] of SECOES) {
    out.push(`## ${titulo}`)
    out.push('')
    out.push(markdown(d[chave], colunas))
    out.push('')
  }
  out.push('_Gerado pelo proprio SAP (GET /api/relatorio/rpcmtec). Para o DOCX: --docx --saida arq.docx._')
  return { texto: out.join('\n') }
}

async function executar (args, cfg) {
  return args._[0] === 'secao2' ? secao2(args, cfg) : producao(args, cfg)
}

module.exports = { executar, precisaServidor: true, markdown, SECOES }
