// Path: comandos\crud.js
'use strict'

// Operacoes sobre a registry de recursos:
//   sap <recurso> listar    [--ano 2026] [--lote_id 5] [--campos a,b] [--formato tsv|tabela|json]
//   sap <recurso> obter     --uuid ...
//   sap <recurso> criar     --data '{...}' | --data-file corpo.json  [--dry-run]
//   sap <recurso> atualizar --id 42 --data '{...}'                   [--dry-run]
//   sap <recurso> deletar   --id 42 --confirmar 42                   [--dry-run]
//
// Tres decisoes que valem explicar:
//
// 1. O corpo e validado LOCALMENTE contra o Joi do server/ antes de sair da
//    maquina, com as MESMAS opcoes do middleware. Corpo torto falha em
//    milissegundos, com o contrato do campo errado impresso junto, em vez de
//    custar um round-trip e um 400 generico.
//
// 2. O servidor valida o corpo com stripUnknown: campo com nome errado e
//    DESCARTADO em silencio, nem 400 nem gravacao. Aqui isso vira aviso
//    explicito, e a busca e recursiva porque no SAP o campo errado quase sempre
//    esta dentro de {campo:{...}} ou de {lotes:[{...}]}.
//
// 3. deletar exige --confirmar. O guardrail de acao irreversivel mora na
//    INTERFACE, nao na skill que a chama: skill e de um cliente so, a interface
//    serve todos.

const fs = require('fs')

const { obter, operacao } = require('../lib/recursos')
const esquema = require('../lib/schema')
const saida = require('../lib/saida')
const http = require('../lib/http')
const argsLib = require('../lib/args')

// Flags de infraestrutura: nunca viram filtro de query nem parametro de rota.
const FLAGS_GLOBAIS = new Set([
  'campos', 'formato', 'json', 'server', 'user', 'senha', 'token', 'cliente',
  'insecure', 'sem-cache', 'dry-run', 'data', 'data-file', 'confirmar',
  'ajuda', 'help', 'executar'
])

function lerCorpo (flags) {
  if (flags.data && flags['data-file']) {
    throw new Error('Use --data OU --data-file, nunca os dois.')
  }
  if (flags['data-file'] && flags['data-file'] !== true) {
    const conteudo = fs.readFileSync(flags['data-file'], 'utf8')
    try {
      return JSON.parse(conteudo)
    } catch (e) {
      throw new Error(`${flags['data-file']} nao contem JSON valido: ${e.message}`)
    }
  }
  if (flags.data && flags.data !== true) {
    try {
      return JSON.parse(flags.data)
    } catch (e) {
      throw new Error(`--data nao e JSON valido: ${e.message}`)
    }
  }
  return null
}

/** Substitui :nome no sufixo pelo valor da flag homonima, validando os params. */
function montarCaminho (recurso, op, flags, modulo) {
  let sufixo = op.sufixo || ''
  const usados = {}

  const nomes = (sufixo.match(/:([A-Za-z_][A-Za-z0-9_]*)/g) || []).map(s => s.slice(1))
  for (const nome of nomes) {
    const valor = argsLib.exigir(flags, nome, `parametro de rota de ${op.acao}`)
    usados[nome] = valor
    sufixo = sufixo.replace(`:${nome}`, encodeURIComponent(valor))
  }

  // Params tambem sao validados pelo servidor, e SEM stripUnknown. Validar aqui
  // pega ano fora de faixa ou mes 13 antes de gastar a requisicao.
  if (op.params && modulo[op.params]) {
    const r = esquema.validarQuery(modulo[op.params], usados, esquema.OPCOES_PARAMS)
    if (!r.ok) {
      const erro = new Error(
        'Parametro de rota invalido (validado localmente, nada foi enviado):\n' +
        r.erros.map(e => '  ' + e.mensagem).join('\n')
      )
      erro.jaFormatado = true
      throw erro
    }
  }

  return recurso.caminho + sufixo
}

/** Monta a query a partir das flags, validando contra o schema de query da rota. */
function montarQuery (op, flags, modulo) {
  if (!op.query || !modulo[op.query]) return { texto: '', avisos: [] }

  const aceitos = esquema.camposDe(modulo[op.query]).map(c => c.nome)
  const params = {}
  for (const nome of aceitos) {
    if (flags[nome] !== undefined && flags[nome] !== true) params[nome] = flags[nome]
  }

  const ignorados = Object.keys(flags).filter(
    f => !aceitos.includes(f) && !FLAGS_GLOBAIS.has(f)
  )
  const avisos = ignorados.length
    ? [`Flags ignoradas (esta rota aceita ${aceitos.join(', ') || 'nenhuma'}): ${ignorados.join(', ')}`]
    : []

  const r = esquema.validarQuery(modulo[op.query], params)
  if (!r.ok) {
    const erro = new Error(
      'Filtro invalido (validado localmente, nada foi enviado):\n' +
      r.erros.map(e => '  ' + e.mensagem).join('\n') +
      '\n\nfiltros aceitos:\n' + esquema.alinhar(esquema.camposDe(modulo[op.query])).join('\n')
    )
    erro.jaFormatado = true
    throw erro
  }

  return { texto: http.query(params), avisos }
}

/** Valida o corpo e devolve o normalizado, ou lanca com o contrato junto. */
function validar (modulo, op, corpo, chave) {
  const schemaJoi = modulo[op.body]
  if (!schemaJoi) return { corpo, avisos: [] }

  const r = esquema.validarCorpo(schemaJoi, corpo)
  const avisos = []

  if (r.descartados.length) {
    avisos.push(
      'Campos DESCARTADOS em silencio pelo servidor (stripUnknown), como se voce ' +
      `nunca os tivesse mandado: ${r.descartados.join(', ')}.\n` +
      '        Nao volta 400, nao grava. Quase sempre e nome errado ou campo no ' +
      `nivel errado do objeto.\n        Contrato: sap schema ${chave}`
    )
  }

  if (!r.ok) {
    const erro = new Error(esquema.explicarErro(schemaJoi, r.erros, `sap schema ${chave}`))
    erro.jaFormatado = true
    if (avisos.length) erro.avisos = avisos
    throw erro
  }

  avisos.push(...esquema.avisosDeFuso(r.valor))

  return { corpo: r.valor, avisos }
}

async function executar (args, cfg) {
  const chave = args._[0]
  const acao = args._[1] || 'listar'
  const recurso = obter(chave)
  const op = operacao(recurso, acao)
  const flags = args.flags
  const modulo = recurso.schema()

  const opcoesSaida = {
    formato: flags.json ? 'json' : (flags.formato || 'tsv'),
    campos: argsLib.lista(flags.campos),
    padrao: recurso.colunas
  }

  const caminho = montarCaminho(recurso, op, flags, modulo)

  // -------------------------------------------------------------------------
  // Leitura
  // -------------------------------------------------------------------------
  if (op.metodo === 'GET') {
    const q = montarQuery(op, flags, modulo)
    const r = await http.autenticada(cfg, 'GET', caminho + q.texto)
    const unico = op.acao === 'obter'
    const out = unico
      ? { texto: saida.registro(r.dados, opcoesSaida), avisos: [] }
      : saida.lista(r.dados, opcoesSaida)
    return { texto: out.texto, avisos: [...q.avisos, ...(out.avisos || [])] }
  }

  // -------------------------------------------------------------------------
  // Escrita
  // -------------------------------------------------------------------------
  let corpo = null
  let avisos = []

  if (op.body) {
    const bruto = lerCorpo(flags)
    if (!bruto || typeof bruto !== 'object') {
      throw new Error(
        `${acao} exige --data '{...}' ou --data-file corpo.json (um objeto JSON). ` +
        `Contrato: sap schema ${chave}`
      )
    }
    const v = validar(modulo, op, bruto, chave)
    corpo = v.corpo
    avisos = v.avisos
  }

  // O dry-run vem ANTES do guardrail de exclusao de proposito: ele nao envia
  // nada, entao exigir confirmacao ali seria atrito sem ganho de seguranca, e
  // ainda mandaria "acrescente --dry-run" para quem ja o passou.
  if (flags['dry-run']) {
    const linhas = [
      '[dry-run] nada foi enviado. A requisicao seria:',
      `  ${op.metodo} /api${caminho}`
    ]
    if (corpo) {
      linhas.push('  corpo (ja validado contra o Joi do server/):')
      linhas.push(JSON.stringify(corpo, null, 2))
    }
    if (op.metodo === 'DELETE') {
      const alvo = alvoDaExclusao(op, flags, corpo)
      linhas.push('')
      linhas.push('Para excluir de fato (irreversivel):')
      linhas.push(`  sap ${chave} ${acao} ${reproduzirAlvo(op, flags)} --confirmar ${alvo}`)
    }
    return { texto: linhas.join('\n'), avisos }
  }

  // Guardrail de acao irreversivel, na interface. Para a familia do modulo
  // projeto o alvo nao esta na URL e sim no corpo ({lote_ids:[...]}): a
  // confirmacao exige repetir os ids, para que apagar dez lotes por engano exija
  // digitar os dez.
  if (op.metodo === 'DELETE') {
    const alvo = alvoDaExclusao(op, flags, corpo)
    if (String(flags.confirmar) !== alvo) {
      throw new Error(
        'Exclusao e irreversivel e nao foi confirmada.\n' +
        'Para excluir de fato, repita o alvo em --confirmar:\n' +
        `  sap ${chave} ${acao} ${reproduzirAlvo(op, flags)} --confirmar ${alvo}\n` +
        'Para so ver o que aconteceria: acrescente --dry-run.'
      )
    }
  }

  const r = await http.autenticada(cfg, op.metodo, caminho, corpo ? { corpo } : {})

  // O SAP quase sempre responde dados:null nas escritas. Dizer isso, e dizer
  // como achar o id, poupa o agente de concluir que nao gravou.
  const linhas = [r.message || 'ok']
  if (r.dados && typeof r.dados === 'object' && Object.keys(r.dados).length) {
    linhas.push(saida.registro(r.dados, opcoesSaida))
  } else if (op.metodo === 'POST') {
    linhas.push(`(o SAP nao devolve o registro criado; para pegar o id: sap ${chave} listar)`)
  }
  return { texto: linhas.join('\n'), avisos }
}

/** O valor que --confirmar precisa repetir para liberar um DELETE. */
function alvoDaExclusao (op, flags, corpo) {
  if (op.chave) return String(flags[op.chave])
  // Familia do modulo projeto: os ids vem no corpo.
  const listas = Object.values(corpo || {}).filter(Array.isArray)
  if (listas.length === 1) return listas[0].join(',')
  return JSON.stringify(corpo)
}

function reproduzirAlvo (op, flags) {
  return op.chave ? `--${op.chave} ${flags[op.chave]}` : "--data '{...}'"
}

// Toda escrita e leitura fala com o servidor, MENOS com --dry-run, que so
// valida contra o Joi local.
const precisaServidor = args => args.flags['dry-run'] !== true

module.exports = { executar, precisaServidor, lerCorpo, validar, alvoDaExclusao }
