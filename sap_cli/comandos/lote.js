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

Contrato de cada corpo: sap schema lote | bloco | produto | unidade_trabalho.

  sap lote fase criar --lote 68 --subfases 148,149,150 --fases 45,47,48 \\
                      --molde 163 [--dry-run] --confirmar 68
      Completa fase(s) que faltaram num lote JA existente. Clona a unidade de
      trabalho da subfase-molde (epsg, dado de producao, bloco e geometria saem
      do proprio lote, nunca transcritos a mao), cria as etapas padrao e as
      atividades. ABORTA se as subfases ja tiverem etapa: o passo da unidade de
      trabalho nao e idempotente e duplicaria em silencio.

  sap lote fase finalizar --lote 68 --subfases 148,149,150 --usuario <uuid> \\
                          [--data <ISO 8601> | --molde-vf 163] --confirmar <N>
      Marca como concluidas as atividades ainda nao iniciadas dessas subfases.
      Sem --data, herda a data da Verificacao Final indicada por --molde-vf, e
      RECUSA se houver mais de uma data distinta: lancamento retroativo datado
      de hoje falsifica o mes do relatorio. --confirmar leva a QUANTIDADE.`

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

// --- fase: completar fase que faltou num lote JA configurado ---------------
//
// O `pipeline` acima e para lote NOVO. Este e o Modo B: o lote existe, roda ha
// meses, e descobre-se que uma ou mais subfases nunca foram cadastradas.
//
// A parte dificil nunca foi escrever, foi LER: para clonar a unidade de
// trabalho de uma subfase-molde era preciso saber epsg, dado de producao, bloco
// e geometria dela. Ate 2026-07-25 isso saia de um `psql` direto no banco de
// producao, disparado do vault, com credencial de banco fora do sistema. Hoje
// sai de GET /projeto/lote/<id>/subfases, com o mesmo verifyAdmin do resto.

/**
 * Monta as unidades de trabalho novas a partir das do molde. Copia epsg, dado
 * de producao, bloco e geometria; o resto e o padrao de uma unidade recem-criada.
 * A geometria vai como veio (EWKT, com SRID): remontar a partir de `epsg` seria
 * trocar o CRS de TRABALHO pelo CRS da GEOMETRIA, que sao coisas diferentes.
 */
function clonarUnidades (uts) {
  return uts.map((u, i) => ({
    nome: String(i + 1),
    epsg: u.epsg,
    observacao: '',
    geom: u.geom,
    dado_producao_id: u.dado_producao_id,
    bloco_id: u.bloco_id,
    disponivel: true,
    prioridade: i + 1,
    dificuldade: 0,
    tempo_estimado_minutos: 0
  }))
}

/**
 * Resolve a data do lancamento retroativo. Devolve a data ou LANCA, nunca
 * inventa: datar com hoje uma atividade que terminou em maio poe o numero no
 * mes errado de um relatorio assinado.
 */
function resolverData (dataExplicita, moldeVf, datasDoMolde) {
  if (dataExplicita) return dataExplicita
  if (!moldeVf) {
    throw new Error(
      'Informe --data <ISO 8601> ou --molde-vf <subfase_id> para herdar a data da ' +
      'Verificacao Final do lote. Sem um dos dois, a data seria a de hoje, e um ' +
      'lancamento retroativo datado de hoje falsifica o mes do relatorio.'
    )
  }
  const datas = datasDoMolde || []
  if (datas.length !== 1) {
    throw new Error(
      `A subfase ${moldeVf} tem ${datas.length} data(s) de conclusao distintas` +
      (datas.length ? ` (${datas.join(', ')})` : '') +
      '. Nao da para herdar uma so: passe --data explicitamente e diga qual vale.'
    )
  }
  return datas[0]
}

async function lerSubfases (cfg, loteId, ids, comGeom) {
  const q = [`subfase_ids=${ids.join(',')}`]
  if (comGeom) q.push('geom=true')
  const r = await http.autenticada(cfg, 'GET', `/projeto/lote/${loteId}/subfases?${q.join('&')}`)
  return Array.isArray(r.dados) ? r.dados : []
}

async function faseCriar (args, cfg) {
  const flags = args.flags
  const loteId = argsLib.numero(flags, 'lote', null)
  if (!loteId) throw new Error('Informe --lote <id>.')
  const subfases = (argsLib.lista(flags.subfases) || []).map(Number)
  const fases = (argsLib.lista(flags.fases) || []).map(Number)
  const molde = argsLib.numero(flags, 'molde', null)
  if (!subfases.length) throw new Error('Informe --subfases <ids> (as que faltam).')
  if (!fases.length) throw new Error('Informe --fases <ids> (as fases das subfases que faltam).')
  if (!molde) throw new Error('Informe --molde <subfase_id> (uma subfase JA cadastrada neste lote, de onde se clona a unidade de trabalho).')
  if (subfases.includes(molde)) {
    throw new Error(`--molde ${molde} nao pode estar em --subfases: o molde e o que ja existe, e as subfases sao o que falta.`)
  }

  const estado = await lerSubfases(cfg, loteId, [...subfases, molde], true)
  const por = new Map(estado.map(s => [s.subfase_id, s]))

  // Trava contra rodar duas vezes. O POST de unidade de trabalho NAO e
  // idempotente e nao tem UNIQUE: repetir duplica em silencio.
  const jaTem = subfases.filter(id => (por.get(id) || {}).etapas > 0)
  if (jaTem.length) {
    throw new Error(
      `O lote ${loteId} JA tem etapa nas subfases ${jaTem.join(', ')}. ` +
      'Rodar assim mesmo DUPLICARIA as unidades de trabalho, sem erro e sem aviso do servidor. ' +
      'Tire essas subfases do --subfases, ou confira se o cadastro ja foi feito.'
    )
  }
  const faltando = subfases.filter(id => !por.has(id))
  if (faltando.length) throw new Error(`Subfases inexistentes: ${faltando.join(', ')}.`)

  const moldeInfo = por.get(molde)
  if (!moldeInfo) throw new Error(`Subfase-molde ${molde} nao existe.`)
  const uts = moldeInfo.unidades_trabalho || []
  if (!uts.length) {
    throw new Error(
      `A subfase-molde ${molde} nao tem unidade de trabalho no lote ${loteId}, ` +
      'entao nao ha o que clonar. Escolha uma subfase que ja esteja cadastrada e povoada neste lote.'
    )
  }

  const unidades = clonarUnidades(uts)

  const corpoUt = { unidades_trabalho: unidades, subfase_ids: subfases, lote_id: loteId }

  const schemaUt = obter('unidade_trabalho').schema().unidadesTrabalho
  const val = esquema.validarCorpo(schemaUt, corpoUt)
  if (!val.ok) {
    return {
      texto: esquema.explicarErro(schemaUt, val.erros, 'sap schema unidade_trabalho'),
      codigo: 1
    }
  }

  const resumo = [
    `lote ${loteId}: clonando ${unidades.length} unidade(s) de trabalho da subfase-molde ${molde}`,
    `  para ${subfases.length} subfase(s): ${subfases.join(', ')}`,
    `  = ${unidades.length * subfases.length} unidades novas, e uma atividade para cada`,
    `  epsg=${uts[0].epsg}  dado_producao_id=${uts[0].dado_producao_id}  bloco_id=${uts[0].bloco_id}`,
    `  etapas padrao para as fases: ${fases.join(', ')}`
  ]

  if (flags['dry-run']) {
    return { texto: ['DRY-RUN (nada foi enviado)', '', ...resumo].join('\n') }
  }

  const alvo = String(flags.confirmar === undefined ? '' : flags.confirmar)
  if (alvo !== String(loteId)) {
    return {
      texto: [
        ...resumo,
        '',
        `Para executar: --confirmar ${loteId}`,
        'O passo da unidade de trabalho NAO e idempotente: se rodar duas vezes, duplica em silencio.'
      ].join('\n'),
      codigo: 1
    }
  }

  const feitos = []
  const r1 = await http.autenticada(cfg, 'POST', '/projeto/unidade_trabalho', { corpo: corpoUt })
  feitos.push(`1/3 unidade_trabalho: ${r1.mensagem || 'ok'}`)

  for (const faseId of fases) {
    const r = await http.autenticada(cfg, 'POST', '/projeto/etapas/padrao', {
      corpo: { padrao_cq: 1, fase_id: faseId, lote_id: loteId }
    })
    feitos.push(`2/3 etapas/padrao fase ${faseId}: ${r.mensagem || 'ok'}`)
  }

  const r3 = await http.autenticada(cfg, 'POST', '/projeto/atividades/todas', {
    corpo: {
      lote_id: loteId,
      atividades_revisao: false,
      atividades_revisao_correcao: false,
      atividades_revisao_final: false
    }
  })
  feitos.push(`3/3 atividades/todas: ${r3.mensagem || 'ok'}`)

  return { texto: [...resumo, '', ...feitos].join('\n') }
}

async function faseFinalizar (args, cfg) {
  const flags = args.flags
  const loteId = argsLib.numero(flags, 'lote', null)
  if (!loteId) throw new Error('Informe --lote <id>.')
  const subfases = (argsLib.lista(flags.subfases) || []).map(Number)
  if (!subfases.length) throw new Error('Informe --subfases <ids>.')
  const usuario = argsLib.exigir(flags, 'usuario', 'uuid do usuario a quem as atividades serao atribuidas')

  const moldeVf = argsLib.numero(flags, 'molde-vf', null)
  const alvos = moldeVf ? [...subfases, moldeVf] : subfases
  const estado = await lerSubfases(cfg, loteId, alvos, false)
  const por = new Map(estado.map(s => [s.subfase_id, s]))

  const vf = por.get(moldeVf)
  const data = resolverData(
    flags.data && flags.data !== true ? String(flags.data) : null,
    moldeVf,
    (vf && vf.atividades && vf.atividades.datas_fim_concluidas) || []
  )

  const ids = subfases.flatMap(id => ((por.get(id) || {}).atividades || {}).nao_iniciadas || [])
  if (!ids.length) {
    return { texto: `Nenhuma atividade "nao iniciada" nas subfases ${subfases.join(', ')} do lote ${loteId}. Nada a fazer.` }
  }

  const resumo = [
    `lote ${loteId}: finalizar ${ids.length} atividade(s) das subfases ${subfases.join(', ')}`,
    `  data de inicio e fim: ${data}`,
    `  atribuidas ao usuario ${usuario}`
  ]

  if (flags['dry-run']) return { texto: ['DRY-RUN (nada foi enviado)', '', ...resumo].join('\n') }

  const alvo = argsLib.numero(flags, 'confirmar', null)
  if (alvo !== ids.length) {
    return {
      texto: [...resumo, '', `Para executar: --confirmar ${ids.length} (a QUANTIDADE de atividades).`].join('\n'),
      codigo: 1
    }
  }

  let ok = 0
  const falhas = []
  for (const id of ids) {
    try {
      await http.autenticada(cfg, 'PUT', '/gerencia/finalizar_modo_local', {
        corpo: { atividade_id: id, usuario_uuid: usuario, data_inicio: data, data_fim: data }
      })
      ok++
    } catch (err) {
      falhas.push(`  atividade ${id}: ${err.message}`)
    }
  }

  // Sao N chamadas sem transacao: dizer quantas passaram E quantas nao e o
  // minimo para quem for retomar saber onde parou.
  const texto = [...resumo, '', `Finalizadas: ${ok} de ${ids.length}.`]
  if (falhas.length) texto.push(`Falharam ${falhas.length}:`, ...falhas)
  return { texto: texto.join('\n'), codigo: falhas.length ? 1 : 0 }
}

async function fase (args, cfg) {
  const acao = args._[2]
  if (acao === 'criar') return faseCriar(args, cfg)
  if (acao === 'finalizar') return faseFinalizar(args, cfg)
  throw new Error('Use: sap lote fase criar ... | sap lote fase finalizar ...')
}

async function executar (args, cfg) {
  const sub = args._[1]
  if (!sub || args.flags.ajuda || args.flags.help) return { texto: AJUDA }
  if (sub === 'fechar') return fechar(args, cfg)
  if (sub === 'pipeline') return pipeline(args, cfg)
  if (sub === 'fase') return fase(args, cfg)
  throw new Error(`Subcomando "${sub}" desconhecido. Use: fechar, pipeline, fase.`)
}

// O pipeline e OFFLINE por padrao: so vai a rede com --executar. Sao sete
// escritas sem transacao entre elas, e o passo 4 duplica em silencio se
// repetido, entao executar tem que ser um ato deliberado, nao o default.
const precisaServidor = args => {
  if (args._[1] === 'pipeline') return args.flags.executar === true
  // `fase` precisa de servidor ate no --dry-run: o molde a clonar so existe no
  // banco. O dry-run aqui garante que nada e ESCRITO, nao que nada e lido.
  if (args._[1] === 'fase') return true
  return args.flags['dry-run'] !== true
}

module.exports = {
  executar, precisaServidor, PASSOS, validarPlano, preencher,
  clonarUnidades, resolverData
}
