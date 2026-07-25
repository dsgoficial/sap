// Path: lib\schema.js
'use strict'

// Le o contrato direto dos schemas Joi do server/ e o imprime em forma compacta,
// alem de validar o corpo LOCALMENTE antes de gastar uma requisicao.
//
// O ponto do arquivo: nao existe copia do contrato em lugar nenhum. O texto que
// o agente le e derivado, em tempo de execucao, do mesmo objeto Joi que o
// middleware utils/schema_validation.js usa para decidir 200 ou 400. Se o schema
// mudar, o texto muda no mesmo commit; nao ha artefato gerado para apodrecer.
//
// Limites conhecidos e tratados:
//   - o describe() nao enxerga os COMENTARIOS dos *_schema.js, e e neles que
//     mora parte da regra de negocio: por isso lib/regras.js;
//   - o describe() nao sabe PARA QUE serve a rota: essa frase vem dos blocos
//     @swagger, lidos ao vivo por lib/spec.js.
// FORMA vem do Joi; DESCRICAO da rota vem da spec; PORQUE vem da prosa curada.

const { REGRAS, CAMPOS_TIMESTAMPTZ } = require('./regras')

// Mesmas opcoes do middleware do servidor (server/src/utils/schema_validation.js).
// Divergir aqui produz o pior sintoma possivel: o --dry-run aprova e o envio
// real leva 400, ou o inverso. Quando aquele arquivo mudar, este muda no MESMO
// commit (ha um teste que compara os dois).
//
// Repare na assimetria, que e do servidor e nao nossa: o CORPO leva
// stripUnknown, entao chave com nome errado some CALADA (nem 400, nem gravacao);
// query e params NAO levam, entao chave desconhecida ali vira 400.
const OPCOES_CORPO = { stripUnknown: true, abortEarly: false }
const OPCOES_QUERY = { abortEarly: false }
const OPCOES_PARAMS = { abortEarly: false }

// ---------------------------------------------------------------------------
// Formatacao do contrato
// ---------------------------------------------------------------------------

function regraPor (desc, nome) {
  return (desc.rules || []).find(r => r.name === nome)
}

/** Renderiza o tipo de um campo em notacao curta: string(<=20), int, number>0. */
function tipoDe (desc) {
  if (!desc || !desc.type) return 'any'

  switch (desc.type) {
    case 'string': {
      const guid = regraPor(desc, 'guid')
      if (guid) {
        const v = guid.args && guid.args.options && guid.args.options.version
        return `uuid${v ? `(${Array.isArray(v) ? v.join('|') : v})` : ''}`
      }
      if (regraPor(desc, 'pattern')) return 'string(regex)'
      if (regraPor(desc, 'base64')) return 'base64'
      const max = regraPor(desc, 'max')
      const min = regraPor(desc, 'min')
      if (max && max.args) return `string(<=${max.args.limit})`
      if (min && min.args) return `string(>=${min.args.limit})`
      return 'string'
    }
    case 'number': {
      const base = regraPor(desc, 'integer') ? 'int' : 'number'
      const sinal = regraPor(desc, 'sign')
      if (sinal && sinal.args && sinal.args.sign === 'positive') return `${base}>0`
      if (sinal && sinal.args && sinal.args.sign === 'negative') return `${base}<0`
      const min = regraPor(desc, 'min')
      const max = regraPor(desc, 'max')
      if (min && max && min.args && max.args) return `${base} ${min.args.limit}..${max.args.limit}`
      if (min && min.args) return `${base}>=${min.args.limit}`
      if (max && max.args) return `${base}<=${max.args.limit}`
      return base
    }
    case 'boolean': return 'bool'
    case 'date': return 'date'
    case 'array': {
      const min = regraPor(desc, 'min')
      const item = desc.items && desc.items[0]
      const tipoItem = item ? tipoDe(item) : 'any'
      return `array${min && min.args ? `[>=${min.args.limit}]` : ''} de ${tipoItem}`
    }
    case 'object': return 'object'
    case 'binary': return 'binary'
    case 'alternatives': return 'condicional'
    case 'any': return 'any'
    default: return desc.type
  }
}

function formatarValor (v) {
  if (v === null) return 'null'
  if (v === '') return "''"
  return JSON.stringify(v)
}

// O Joi injeta o sentinela { override: true } no inicio de um allow que
// SUBSTITUI a lista anterior (e o que .valid() faz). Ele e detalhe interno do
// describe, nunca um valor aceito: se vazar para a saida, o agente le
// `tipo={"override":true}|Ministrada` e conclui que ha um valor a mais.
function semSentinela (allow) {
  return (allow || []).filter(
    v => !(v && typeof v === 'object' && 'override' in v)
  )
}

/** Sufixo de valores aceitos: " =a|b" para .valid(), " |null|''" para .allow(). */
function sufixoValores (desc) {
  if (!desc || !Array.isArray(desc.allow)) return ''
  const aceitos = semSentinela(desc.allow)
  if (!aceitos.length) return ''
  const valores = aceitos.map(formatarValor).join('|')
  // flags.only significa .valid(): a lista e exaustiva, nao aditiva.
  if (desc.flags && desc.flags.only) return ' =' + valores
  return ' |' + valores
}

/** Anotacoes extras: default, unicidade de array, regex, proibicao. */
function anotacoes (desc, nomeCampo) {
  const notas = []
  const flags = (desc && desc.flags) || {}

  if ('default' in flags) notas.push(`default ${formatarValor(flags.default)}`)
  if (flags.presence === 'forbidden') notas.push('PROIBIDO neste caso')

  if (desc && desc.type === 'array') {
    for (const r of desc.rules || []) {
      if (r.name !== 'unique') continue
      const chave = r.args && r.args.comparator
      notas.push(chave ? `unico por ${chave}` : 'sem repetidos')
    }
  }
  if (desc && desc.type === 'string') {
    const p = regraPor(desc, 'pattern')
    if (p && p.args && p.args.regex) notas.push(String(p.args.regex))
  }
  if (nomeCampo && /_id$/.test(nomeCampo)) notas.push('FK')

  return notas
}

/**
 * Renderiza o `Joi.when()` de campo, que e como o login expressa a regra "com
 * cliente sap_fp ou sap_fg voce PRECISA mandar plugins e qgis; com cliente sap
 * mandar qualquer um deles e erro". Sem tratamento proprio isso sairia como
 * "any" e o agente perderia justamente a regra que decide se o login passa.
 */
function renderWhens (desc) {
  const casos = []
  for (const w of desc.whens || []) {
    const refPath = w.ref && w.ref.path ? w.ref.path.join('.') : 'condicao'
    let alvo = '?'
    if (w.is) {
      const aceitos = Array.isArray(w.is.allow) ? semSentinela(w.is.allow) : []
      if (aceitos.length) alvo = aceitos.map(formatarValor).join('|')
      else {
        const p = regraPor(w.is, 'pattern')
        if (p && p.args && p.args.regex) alvo = String(p.args.regex)
      }
    }
    if (w.then) {
      const obrig = w.then.flags && w.then.flags.presence === 'required'
      casos.push(`${refPath}=${alvo}: ${tipoDe(w.then)}${obrig ? ' OBRIGATORIO' : ''}`)
    }
    if (w.otherwise) {
      const proibido = w.otherwise.flags && w.otherwise.flags.presence === 'forbidden'
      casos.push(`senao: ${proibido ? 'PROIBIDO (mandar da 400)' : tipoDe(w.otherwise)}`)
    }
  }
  return casos
}

/**
 * Um campo vira { nome, obrigatorio, tipo, notas[], filhos[] }.
 * `filhos` e o que o SCO nao precisava: quase todo corpo do SAP e um objeto
 * dentro de outro ({campo:{...}}) ou um array de objetos ({lotes:[{...}]}), e
 * imprimir so o nivel de cima diria "campo* object" e mais nada util.
 */
function descreverCampo (nome, desc) {
  const flags = desc.flags || {}
  const obrigatorio = flags.presence === 'required'

  if (desc.type === 'any' && Array.isArray(desc.whens) && desc.whens.length) {
    return { nome, obrigatorio, tipo: 'condicional', notas: renderWhens(desc), filhos: [] }
  }

  let filhos = []
  if (desc.type === 'object' && desc.keys) {
    filhos = Object.entries(desc.keys).map(([n, d]) => descreverCampo(n, d))
  } else if (desc.type === 'array' && desc.items && desc.items[0] && desc.items[0].keys) {
    filhos = Object.entries(desc.items[0].keys).map(([n, d]) => descreverCampo(n, d))
  }

  return {
    nome,
    obrigatorio,
    tipo: tipoDe(desc) + sufixoValores(desc),
    notas: anotacoes(desc, nome),
    filhos
  }
}

/** Lista de campos de um schema de objeto Joi, ja descritos (recursivo). */
function camposDe (schemaJoi) {
  if (!schemaJoi || typeof schemaJoi.describe !== 'function') return []
  const desc = schemaJoi.describe()
  if (!desc.keys) return []
  return Object.entries(desc.keys).map(([nome, d]) => descreverCampo(nome, d))
}

/**
 * Dependencias declaradas no nivel do objeto: `.or`, `.xor`, `.and`, `.with`.
 * O SAP quase nao usa, mas quando usar o agente precisa ver: sem isso monta um
 * corpo com todos os campos "opcionais" corretos e ainda assim leva 400.
 */
function dependenciasDe (schemaJoi) {
  if (!schemaJoi || typeof schemaJoi.describe !== 'function') return []
  const desc = schemaJoi.describe()
  if (!Array.isArray(desc.dependencies)) return []

  const rotulo = {
    or: 'pelo menos um de',
    xor: 'exatamente um de',
    oxor: 'no maximo um de',
    and: 'todos ou nenhum de',
    nand: 'nunca juntos'
  }

  return desc.dependencies.map(dep => {
    const pares = (dep.peers || []).map(p =>
      typeof p === 'string' ? p : (p.path ? p.path.join('.') : String(p))
    )
    return `${rotulo[dep.rel] || dep.rel}: ${pares.join(', ')}`
  })
}

/** Achata a arvore de campos em linhas alinhadas, com recuo por nivel. */
function alinhar (campos, nivel = 0, acumulado = []) {
  const rotulo = c => '  '.repeat(nivel) + c.nome + (c.obrigatorio ? '*' : '')
  const larguraNome = Math.max(...campos.map(c => rotulo(c).length), 4)
  const larguraTipo = Math.max(...campos.map(c => c.tipo.length), 4)

  for (const c of campos) {
    const nome = rotulo(c).padEnd(larguraNome)
    const tem = c.notas.length > 0
    const tipo = tem ? c.tipo.padEnd(larguraTipo) : c.tipo
    const cauda = tem ? '  ' + c.notas.join('; ') : ''
    acumulado.push(`  ${nome}  ${tipo}${cauda}`)
    if (c.filhos && c.filhos.length) alinhar(c.filhos, nivel + 1, acumulado)
  }
  return acumulado
}

/** Todos os nomes de campo da arvore, para casar com o caminho de um erro Joi. */
function nomesDe (campos, prefixo = '', acc = new Set()) {
  for (const c of campos) {
    acc.add(prefixo ? `${prefixo}.${c.nome}` : c.nome)
    acc.add(c.nome)
    if (c.filhos) nomesDe(c.filhos, c.nome, acc)
  }
  return acc
}

/** Recorta da arvore so as subarvores cujo nome aparece em `alvos`. */
function filtrar (campos, alvos) {
  const out = []
  for (const c of campos) {
    if (alvos.has(c.nome)) {
      out.push(c)
      continue
    }
    if (c.filhos && c.filhos.length) {
      const dentro = filtrar(c.filhos, alvos)
      if (dentro.length) out.push({ ...c, filhos: dentro })
    }
  }
  return out
}

// ---------------------------------------------------------------------------
// Contrato de um recurso
// ---------------------------------------------------------------------------

const spec = require('./spec')

function quebrar (texto, largura, recuo) {
  const palavras = String(texto).split(/\s+/)
  const linhas = []
  let atual = ''
  for (const p of palavras) {
    if ((atual + ' ' + p).trim().length > largura) {
      if (atual) linhas.push(recuo + atual)
      atual = p
    } else {
      atual = (atual ? atual + ' ' : '') + p
    }
  }
  if (atual) linhas.push(recuo + atual)
  return linhas
}

/** Bloco de uma operacao: metodo, caminho, prosa da spec e schema exigido. */
function linhasDaOperacao (recurso, op) {
  const linhas = []
  const caminho = '/api' + recurso.caminho + (op.sufixo || '')
  const marca = op.admin === false ? '' : '  [admin]'
  linhas.push(`  ${op.metodo.padEnd(6)} ${caminho}${marca}`)

  const p = spec.prosa(recurso.modulo, op.metodo, caminho)
  if (p && (p.summary || p.description)) {
    const texto = p.description && p.description.length > (p.summary || '').length
      ? p.description
      : p.summary
    linhas.push(...quebrar(texto, 72, '           '))
  }
  return linhas
}

/**
 * Texto completo do contrato de um recurso: operacoes com a prosa da spec,
 * campos do corpo lidos do Joi vivo e o bloco de regras curado.
 */
function contrato (chave, recurso) {
  const modulo = recurso.schema()
  const linhas = []

  linhas.push(`${chave}  -  ${recurso.nome}`)
  linhas.push('')

  linhas.push('operacoes  (a descricao vem dos blocos @swagger do server/)')
  for (const op of recurso.operacoes || []) {
    linhas.push(...linhasDaOperacao(recurso, op))
  }
  linhas.push('')

  // Filtros de listagem, lidos do proprio schema de query da rota de leitura.
  const opListar = (recurso.operacoes || []).find(o => o.query)
  if (opListar) {
    const q = modulo[opListar.query]
    const campos = camposDe(q)
    if (campos.length) {
      linhas.push('filtros da listagem  (query; chave fora desta lista da 400)')
      linhas.push(...alinhar(campos))
      linhas.push('')
    }
  }

  // Corpo. Uma linha por schema distinto: o SAP costuma ter um schema para
  // criar e outro para atualizar (que acrescenta o id), e a diferenca importa.
  const vistos = new Set()
  for (const op of recurso.operacoes || []) {
    if (!op.body || vistos.has(op.body)) continue
    vistos.add(op.body)

    const schemaJoi = modulo[op.body]
    const campos = camposDe(schemaJoi)
    if (!campos.length) continue

    const quem = (recurso.operacoes || [])
      .filter(o => o.body === op.body)
      .map(o => `${o.metodo} ${o.sufixo || ''}`.trim())
      .join(', ')
    linhas.push(`corpo de ${quem}  (* = obrigatorio)`)
    linhas.push(...alinhar(campos))

    const deps = dependenciasDe(schemaJoi)
    if (deps.length) {
      linhas.push('  regras entre campos')
      linhas.push(...deps.map(d => '    ' + d))
    }
    linhas.push('')
  }

  if (vistos.size) {
    // Assimetria real do servidor, e a armadilha mais cara do SAP.
    linhas.push('  ATENCAO: o servidor valida o CORPO com stripUnknown, entao chave')
    linhas.push('  com nome errado e DESCARTADA em silencio (nem 400, nem gravacao).')
    linhas.push('  O sap avisa antes de enviar. Em query e params nao ha stripUnknown:')
    linhas.push('  ali chave desconhecida vira 400.')
    linhas.push('')
  }

  const regras = REGRAS[chave]
  if (regras && regras.length) {
    linhas.push('regras de negocio  (o que nem o Joi nem a spec dizem)')
    linhas.push(...regras.map(r => '  ' + r))
    linhas.push('')
  }

  return linhas.join('\n')
}

/** Indice curto de todos os recursos, para o `sap schema` sem argumento. */
function indice (RECURSOS) {
  const chaves = Object.keys(RECURSOS)
  const largura = Math.max(...chaves.map(c => c.length))
  return chaves
    .map(c => `  ${c.padEnd(largura)}  ${RECURSOS[c].nome}`)
    .join('\n')
}

// ---------------------------------------------------------------------------
// Validacao local
// ---------------------------------------------------------------------------

/** Chaves presentes no objeto original e ausentes no validado, recursivamente. */
function diferenca (enviado, mantido, prefixo = '') {
  const perdidas = []
  if (!enviado || typeof enviado !== 'object') return perdidas

  if (Array.isArray(enviado)) {
    enviado.forEach((item, i) => {
      const par = Array.isArray(mantido) ? mantido[i] : undefined
      if (par !== undefined) perdidas.push(...diferenca(item, par, `${prefixo}[${i}]`))
    })
    return perdidas
  }

  const mantidoObj = mantido && typeof mantido === 'object' ? mantido : {}
  for (const chave of Object.keys(enviado)) {
    const caminho = prefixo ? `${prefixo}.${chave}` : chave
    if (!(chave in mantidoObj)) {
      perdidas.push(caminho)
      continue
    }
    perdidas.push(...diferenca(enviado[chave], mantidoObj[chave], caminho))
  }
  return perdidas
}

/**
 * Valida o corpo contra o schema Joi ANTES de enviar. Devolve
 * { ok, valor, erros[], descartados[] }.
 *
 * `descartados` sao as chaves que o stripUnknown do servidor removeria. No SCO
 * isso virou 400 em 2026-07-25; no SAP continua sendo descarte silencioso, e por
 * isso o aviso aqui e a diferenca entre "gravei" e "achei que gravei". A busca e
 * recursiva de proposito: no SAP o campo errado costuma estar dentro de
 * {campo:{...}} ou de {lotes:[{...}]}, nunca no primeiro nivel.
 */
function validarCorpo (schemaJoi, corpo) {
  if (!schemaJoi || typeof schemaJoi.validate !== 'function') {
    return { ok: true, valor: corpo, erros: [], descartados: [] }
  }

  const { error, value } = schemaJoi.validate(corpo, OPCOES_CORPO)
  const descartados = diferenca(corpo, value)

  if (!error) return { ok: true, valor: value, erros: [], descartados }

  const erros = error.details.map(d => ({
    campo: d.path.join('.') || '(corpo)',
    folha: d.path.length ? String(d.path[d.path.length - 1]) : '(corpo)',
    mensagem: d.message
  }))
  return { ok: false, valor: value, erros, descartados }
}

/**
 * Percorre o corpo ja validado procurando data que vai cair no dia anterior.
 *
 * `Joi.date()` converte "2026-07-01" em meia-noite UTC. As colunas de data do
 * SAP que importam sao `timestamp with time zone`, e o Node renderiza em UTC-3:
 * a atividade de campo de 01/07 aparece como 30/06 e entra no RPCMTec do mes
 * anterior. Nem o Joi nem a spec dizem isso, e o erro so aparece na fechada do
 * mes, quando ja custou caro.
 *
 * Aqui so AVISAMOS, nunca reescrevemos: mudar em silencio um horario que o
 * usuario digitou seria pior que o problema. Quem normaliza e o verbo dedicado
 * (`sap finalizar`), onde a semantica "a data e o dia" faz parte do contrato.
 */
function avisosDeFuso (valor, prefixo = '', acc = []) {
  if (valor === null || valor === undefined) return acc

  if (Array.isArray(valor)) {
    valor.forEach((v, i) => avisosDeFuso(v, `${prefixo}[${i}]`, acc))
    return acc
  }

  if (valor instanceof Date || (typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(valor))) {
    const nome = prefixo.split('.').pop().replace(/\[\d+\]$/, '')
    if (!CAMPOS_TIMESTAMPTZ.has(nome)) return acc
    const d = valor instanceof Date ? valor : new Date(valor)
    if (Number.isNaN(d.getTime()) || d.getUTCHours() >= 3) return acc
    const local = new Date(d.getTime() - 3 * 3600 * 1000).toISOString().slice(0, 10)
    acc.push(
      `${prefixo} = ${d.toISOString()} esta antes das 03:00 UTC. A coluna e ` +
      `timestamp with time zone e o SAP exibe em UTC-3: isso vai aparecer como ` +
      `${local}, possivelmente no MES anterior do RPCMTec. ` +
      `Se voce quis dizer o dia, mande "${d.toISOString().slice(0, 10)}T12:00:00Z".`
    )
    return acc
  }

  if (typeof valor === 'object') {
    for (const [k, v] of Object.entries(valor)) {
      avisosDeFuso(v, prefixo ? `${prefixo}.${k}` : k, acc)
    }
  }
  return acc
}

/** Valida query ou params: sem stripUnknown, exatamente como o servidor. */
function validarQuery (schemaJoi, valores, opcoes = OPCOES_QUERY) {
  if (!schemaJoi || typeof schemaJoi.validate !== 'function') {
    return { ok: true, valor: valores, erros: [] }
  }
  const { error, value } = schemaJoi.validate(valores, opcoes)
  if (!error) return { ok: true, valor: value, erros: [] }
  return {
    ok: false,
    valor: value,
    erros: error.details.map(d => ({
      campo: d.path.join('.') || '(query)',
      folha: d.path.length ? String(d.path[d.path.length - 1]) : '(query)',
      mensagem: d.message
    }))
  }
}

/**
 * Mensagem de erro que ENSINA: alem do que falhou, imprime a linha de contrato
 * exatamente dos campos que falharam. Evita que o agente releia o contrato
 * inteiro (ou pior, um catalogo de rotas do vault) para consertar uma virgula.
 */
function explicarErro (schemaJoi, erros, dicaComando) {
  const linhas = ['Corpo invalido (validado localmente, nada foi enviado):', '']
  for (const e of erros) linhas.push(`  ${e.mensagem}`)

  const campos = camposDe(schemaJoi)
  const alvos = new Set(erros.map(e => e.folha))
  const relevantes = filtrar(campos, alvos)

  if (relevantes.length) {
    linhas.push('')
    linhas.push('contrato dos campos citados:')
    linhas.push(...alinhar(relevantes))
  }

  linhas.push('')
  linhas.push(`contrato completo: ${dicaComando || 'sap schema <recurso>'}`)
  return linhas.join('\n')
}

module.exports = {
  contrato,
  indice,
  camposDe,
  dependenciasDe,
  descreverCampo,
  tipoDe,
  sufixoValores,
  anotacoes,
  alinhar,
  filtrar,
  nomesDe,
  diferenca,
  avisosDeFuso,
  validarCorpo,
  validarQuery,
  explicarErro,
  OPCOES_CORPO,
  OPCOES_QUERY,
  OPCOES_PARAMS
}
