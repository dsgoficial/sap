// Path: comandos\lote.js
'use strict'

// Verbos de intencao do lote:
//
//   sap lote fechar   --id 9 --confirmar 9
//   sap lote pipeline --plano plano.json            (dry-run por padrao)
//   sap lote pipeline --plano plano.json --executar --confirmar <nome do lote>
//
// `fechar` existe porque o PUT do lote exige o objeto INTEIRO: para trocar so o
// status_id o agente teria que ler o lote, reescrever sete campos e reenviar, e
// esquecer um campo pelo caminho e como se perde dado com HTTP 200.
//
// `pipeline` existe porque a configuracao de um lote novo sao SETE chamadas em
// ordem obrigatoria, das quais uma (unidade de trabalho) nao e idempotente e
// duplica em silencio se repetida. Essa ordem estava escrita em prosa, num
// script fora do repositorio do SAP. Prosa nao valida corpo; aqui os sete corpos
// passam pelo Joi vivo ANTES de a primeira chamada sair da maquina.

const fs = require('fs')

const { obter } = require('../lib/recursos')
const esquema = require('../lib/schema')
const saida = require('../lib/saida')
const http = require('../lib/http')
const argsLib = require('../lib/args')

const AJUDA = `sap lote - verbos de intencao do lote

  sap lote fechar --id 9 --confirmar 9
      Le o lote, troca so o status para Finalizado e reenvia o objeto inteiro
      (o PUT do SAP exige todos os campos). Nao mexe nos blocos.

  sap lote pipeline --plano plano.json
      Valida os SETE corpos contra o Joi do server/ e imprime o plano. Offline:
      nao precisa de servidor nem de credencial.

  sap lote pipeline --plano plano.json --executar --confirmar "<nome do lote>"
      Roda de verdade, na ordem. --desde N retoma a partir do passo N.

Formato do plano.json (uma chave por passo; lote_id e bloco_id ficam null e o
pipeline os preenche com o que descobrir apos criar):

  {
    "lote":              { "lotes": [ { ... } ] },
    "bloco":             { "blocos": [ { "lote_id": null, ... } ] },
    "produto":           { "produtos": [ ... ], "lote_id": null },
    "unidade_trabalho":  { "unidades_trabalho": [ { "bloco_id": null, ... } ],
                           "subfase_ids": [ ... ], "lote_id": null },
    "etapas":            [ { "padrao_cq": 1, "fase_id": 1, "lote_id": null } ],
    "atividades":        { "lote_id": null, ... },
    "copiar":            { "lote_id_origem": 9, "lote_id_destino": null, ... }
  }

Contrato de cada corpo: sap schema lote | bloco | produto | unidade_trabalho.`

// Ordem obrigatoria. `recurso` aponta a entrada da registry de onde sai o schema
// Joi; `caminho` e a rota real; `repetivel` diz se o passo pode ser reexecutado
// sem estragar nada (o que decide se a retomada por --desde e segura).
const PASSOS = [
  { n: 1, chave: 'lote', recurso: 'lote', body: 'lotes', caminho: '/projeto/lote', repetivel: false, nota: 'lote.nome e UNIQUE: repetir volta erro, nao duplica' },
  { n: 2, chave: 'bloco', recurso: 'bloco', body: 'blocos', caminho: '/projeto/bloco', repetivel: false, nota: 'UNIQUE (nome, lote_id)' },
  { n: 3, chave: 'produto', recurso: 'produto', body: 'produtos', caminho: '/projeto/produto', repetivel: false, nota: 'uuid e UNIQUE; escala tem que bater com a do lote (trigger chk_scale)' },
  { n: 4, chave: 'unidade_trabalho', recurso: 'unidade_trabalho', body: 'unidadesTrabalho', caminho: '/projeto/unidade_trabalho', repetivel: false, nota: 'NAO IDEMPOTENTE e sem UNIQUE: repetir DUPLICA em silencio' },
  { n: 5, chave: 'etapas', recurso: 'lote', body: 'padrao_etapa', caminho: '/projeto/etapas/padrao', repetivel: true, lista: true, nota: 'uma chamada por fase; recusa se ja existirem etapas' },
  { n: 6, chave: 'atividades', recurso: 'lote', body: 'todasAtividades', caminho: '/projeto/atividades/todas', repetivel: true, nota: 'idempotente (so cria o que falta)' },
  { n: 7, chave: 'copiar', recurso: 'lote', body: 'configuracaoLoteCopiar', caminho: '/projeto/configuracao/lote/copiar', repetivel: false, nota: 'copia os perfis de um lote-modelo' }
]

/** Troca todo `null` das chaves indicadas pelo valor resolvido. */
function preencher (valor, mapa) {
  if (Array.isArray(valor)) return valor.map(v => preencher(v, mapa))
  if (!valor || typeof valor !== 'object') return valor
  const out = {}
  for (const [k, v] of Object.entries(valor)) {
    out[k] = (v === null && k in mapa) ? mapa[k] : preencher(v, mapa)
  }
  return out
}

// ---------------------------------------------------------------------------
// fechar
// ---------------------------------------------------------------------------

// dominio.status: 1 Em execucao, 2 Finalizado, 3 Abandonado. O codigo nao esta
// no Joi (que so sabe "int"), entao ele e resolvido no servidor em tempo de
// execucao, por nome, em vez de ficar cravado aqui.
const NOME_FINALIZADO = /finalizad/i

async function fechar (args, cfg) {
  const flags = args.flags
  const id = Number(argsLib.exigir(flags, 'id', 'id do lote a fechar'))

  if (String(flags.confirmar) !== String(id)) {
    throw new Error(
      'Fechar um lote muda o estado da producao e nao foi confirmado.\n' +
      `Para fechar de fato, repita o id:\n  sap lote fechar --id ${id} --confirmar ${id}\n` +
      'Para so ver o que aconteceria: acrescente --dry-run.'
    )
  }

  const status = await http.autenticada(cfg, 'GET', '/projeto/status')
  const finalizado = (status.dados || []).find(s => NOME_FINALIZADO.test(s.nome || ''))
  if (!finalizado) {
    throw new Error(
      'Nao achei o codigo de status "Finalizado" em GET /api/projeto/status. ' +
      'Confira com: sap dominio status'
    )
  }

  const lotes = await http.autenticada(cfg, 'GET', '/projeto/lote')
  const lote = (lotes.dados || []).find(l => Number(l.id) === id)
  if (!lote) throw new Error(`Lote ${id} nao existe. Liste com: sap lote listar`)

  // O PUT exige o objeto inteiro. Montar a partir do que veio do GET, campo a
  // campo, e o que evita apagar descricao ou reapontar projeto sem querer.
  const corpo = {
    lotes: [{
      id: Number(lote.id),
      nome: lote.nome,
      nome_abrev: lote.nome_abrev,
      denominador_escala: Number(lote.denominador_escala),
      linha_producao_id: Number(lote.linha_producao_id),
      projeto_id: Number(lote.projeto_id),
      descricao: lote.descricao == null ? '' : String(lote.descricao),
      status_id: Number(finalizado.code)
    }]
  }

  const modulo = obter('lote').schema()
  const r = esquema.validarCorpo(modulo.loteUpdate, corpo)
  if (!r.ok) {
    // Acontece quando o GET nao devolve um campo que o PUT exige: e a doenca de
    // leitura, e copiar um para o outro apagaria dado com HTTP 200.
    const erro = new Error(
      'O lote lido do servidor nao completa o corpo que o PUT exige:\n' +
      esquema.explicarErro(modulo.loteUpdate, r.erros, 'sap schema lote') +
      '\n\nlote lido:\n' + saida.registro(lote)
    )
    erro.jaFormatado = true
    throw erro
  }

  if (flags['dry-run']) {
    return {
      texto: [
        '[dry-run] nada foi enviado. A requisicao seria:',
        '  PUT /api/projeto/lote',
        JSON.stringify(r.valor, null, 2)
      ].join('\n')
    }
  }

  const res = await http.autenticada(cfg, 'PUT', '/projeto/lote', { corpo: r.valor })
  return {
    texto: `${res.message || 'ok'}\nLote ${id} (${lote.nome}) agora esta em ` +
      `"${finalizado.nome}" (status_id ${finalizado.code}).`,
    avisos: ['Os BLOCOS do lote continuam como estavam. Feche-os com: sap bloco atualizar --data \'{...}\'']
  }
}

// ---------------------------------------------------------------------------
// pipeline
// ---------------------------------------------------------------------------

/** Valida os sete corpos contra o Joi vivo. Devolve o plano ja normalizado. */
function validarPlano (plano, mapa) {
  const passos = []
  const avisos = []

  for (const passo of PASSOS) {
    if (!(passo.chave in plano)) {
      avisos.push(`Passo ${passo.n} (${passo.chave}) ausente do plano: sera pulado.`)
      continue
    }
    const modulo = obter(passo.recurso).schema()
    const schemaJoi = modulo[passo.body]
    const brutos = passo.lista ? plano[passo.chave] : [plano[passo.chave]]

    const corpos = []
    for (const bruto of brutos) {
      const preenchido = preencher(bruto, mapa)
      const r = esquema.validarCorpo(schemaJoi, preenchido)
      if (r.descartados.length) {
        avisos.push(
          `Passo ${passo.n} (${passo.chave}): campos DESCARTADOS em silencio pelo ` +
          `servidor: ${r.descartados.join(', ')}. Contrato: sap schema ${passo.recurso}`
        )
      }
      if (!r.ok) {
        const erro = new Error(
          `Passo ${passo.n} (${passo.chave}) invalido:\n` +
          esquema.explicarErro(schemaJoi, r.erros, `sap schema ${passo.recurso}`)
        )
        erro.jaFormatado = true
        erro.avisos = avisos
        throw erro
      }
      corpos.push(preenchido)
    }
    passos.push({ ...passo, corpos })
  }

  return { passos, avisos }
}

async function pipeline (args, cfg) {
  const flags = args.flags
  const arquivo = argsLib.exigir(flags, 'plano', 'arquivo JSON com os corpos dos sete passos')
  let plano
  try {
    plano = JSON.parse(fs.readFileSync(arquivo, 'utf8'))
  } catch (e) {
    throw new Error(`Nao consegui ler ${arquivo}: ${e.message}`)
  }

  const desde = argsLib.numero(flags, 'desde', 1)
  const executar = flags.executar === true

  const nomeLote = plano.lote && plano.lote.lotes && plano.lote.lotes[0]
    ? plano.lote.lotes[0].nome
    : null

  // A confirmacao vem ANTES da validacao de pre-voo. Se viesse depois, um plano
  // com um campo torto responderia "campo X invalido" a quem nem confirmou que
  // queria escrever, e o guardrail so apareceria no segundo try.
  if (executar) {
    if (!nomeLote) throw new Error('O plano nao tem lote.lotes[0].nome; nao sei o que confirmar.')
    if (String(flags.confirmar) !== String(nomeLote)) {
      throw new Error(
        [
          'O pipeline escreve na producao real, em sete chamadas SEM transacao entre',
          'elas, e o passo 4 (unidade de trabalho) DUPLICA em silencio se repetido.',
          '',
          `Para executar, repita o nome do lote:  --confirmar "${nomeLote}"`,
          'Para so validar os corpos, sem servidor: rode sem --executar.'
        ].join('\n')
      )
    }
  }

  // Pre-voo: os ids reais so existem depois do passo 1, entao um sentinela
  // positivo entra no lugar deles e o Joi confere TODO o resto do corpo. E o que
  // se pode provar offline, e vale tanto para o dry-run quanto para a execucao
  // (a revalidacao com os ids de verdade acontece passo a passo, mais abaixo).
  const SENTINELA = 999999
  const { passos, avisos } = validarPlano(
    plano, { lote_id: SENTINELA, bloco_id: SENTINELA, lote_id_destino: SENTINELA }
  )

  if (!executar) {
    const linhas = [
      '[dry-run] nada foi enviado. Os corpos passaram no Joi do server/.',
      `(lote_id, bloco_id e lote_id_destino foram preenchidos com ${SENTINELA} so`,
      ' para validar; na execucao vem do relist apos cada criacao.)',
      ''
    ]
    for (const p of passos) {
      linhas.push(`passo ${p.n}  ${p.corpos.length > 1 ? `${p.corpos.length}x ` : ''}POST /api${p.caminho}`)
      linhas.push(`        ${p.repetivel ? 'repetivel' : 'NAO repetivel'}: ${p.nota}`)
    }
    linhas.push('')
    linhas.push('Para executar: --executar --confirmar "<nome do lote>"')
    return { texto: linhas.join('\n'), avisos }
  }

  const resolvidos = {}
  const feitos = []

  for (const passo of PASSOS) {
    const preparado = passos.find(p => p.n === passo.n)
    if (!preparado) continue
    if (passo.n < desde) {
      feitos.push(`passo ${passo.n} (${passo.chave}): pulado por --desde ${desde}`)
      continue
    }

    // O corpo do pre-voo carrega o SENTINELA; aqui ele volta ao plano original
    // para receber os ids que o servidor de fato criou.
    const originais = passo.lista ? plano[passo.chave] : [plano[passo.chave]]
    for (const bruto of originais) {
      const corpo = preencher(bruto, resolvidos)
      const r = esquema.validarCorpo(obter(passo.recurso).schema()[passo.body], corpo)
      if (!r.ok) {
        const erro = new Error(
          `Passo ${passo.n} ficou invalido depois de preencher os ids resolvidos:\n` +
          esquema.explicarErro(obter(passo.recurso).schema()[passo.body], r.erros, `sap schema ${passo.recurso}`) +
          `\n\nJa foram executados: ${feitos.join('; ') || 'nenhum'}.` +
          `\nRetome com --desde ${passo.n} apos corrigir.`
        )
        erro.jaFormatado = true
        throw erro
      }
      await http.autenticada(cfg, 'POST', passo.caminho, { corpo: r.valor })
    }
    feitos.push(`passo ${passo.n} (${passo.chave}): ok`)

    // O POST devolve dados:null. Descobrir o id recem-criado exige relistar e
    // casar pelo nome, que e UNIQUE nas duas tabelas.
    if (passo.chave === 'lote') {
      const lista = await http.autenticada(cfg, 'GET', '/projeto/lote')
      const achado = (lista.dados || []).find(l => l.nome === nomeLote)
      if (!achado) {
        throw new Error(
          `Criei o lote mas nao o achei no relist por nome "${nomeLote}". ` +
          `Confira com: sap lote listar. Retome com --desde 2.`
        )
      }
      resolvidos.lote_id = Number(achado.id)
      resolvidos.lote_id_destino = Number(achado.id)
      feitos.push(`lote_id resolvido = ${resolvidos.lote_id}`)
    }
    if (passo.chave === 'bloco') {
      const nomeBloco = plano.bloco.blocos[0] && plano.bloco.blocos[0].nome
      const lista = await http.autenticada(cfg, 'GET', '/projeto/bloco')
      const achado = (lista.dados || []).find(
        b => b.nome === nomeBloco && Number(b.lote_id) === resolvidos.lote_id
      )
      if (achado) {
        resolvidos.bloco_id = Number(achado.id)
        feitos.push(`bloco_id resolvido = ${resolvidos.bloco_id}`)
      }
    }
  }

  return { texto: ['pipeline concluido.', '', ...feitos].join('\n'), avisos }
}

async function executar (args, cfg) {
  const sub = args._[1]
  if (!sub || args.flags.ajuda || args.flags.help) return { texto: AJUDA }
  if (sub === 'fechar') return fechar(args, cfg)
  if (sub === 'pipeline') return pipeline(args, cfg)
  throw new Error(`Subcomando "${sub}" desconhecido. Use: fechar, pipeline.`)
}

// O pipeline e OFFLINE por padrao: so vai a rede com --executar. Sao sete
// escritas sem transacao entre elas, e o passo 4 duplica em silencio se
// repetido, entao executar tem que ser um ato deliberado, nao o default.
const precisaServidor = args =>
  args._[1] === 'pipeline'
    ? args.flags.executar === true
    : args.flags['dry-run'] !== true

module.exports = { executar, precisaServidor, PASSOS, validarPlano, preencher }
