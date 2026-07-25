// Path: __tests__\divergencias.test.js
'use strict'

// Alarmes sobre os DEFEITOS que a fonte viva revelou em 2026-07-25.
//
// Cada um deles esta descrito em lib/regras.js, que e prosa e nao valida nada.
// Estes testes existem para o dia em que o defeito for CONSERTADO no server/:
// eles quebram, e a mensagem manda apagar a prosa correspondente. Sem isso, a
// prosa curada viraria exatamente o que o padrao combate, uma copia que
// envelhece sozinha e passa a mentir na direcao contraria.
//
// Um teste que falha porque o produto melhorou e um teste bom: o que nao pode
// acontecer e o CLI seguir avisando de um problema que nao existe mais.

const test = require('node:test')
const assert = require('node:assert')
const fs = require('fs')
const path = require('path')

const { RAIZ_SERVER } = require('../lib/recursos')
const { GERAL } = require('../lib/regras')

// ---------------------------------------------------------------------------
// 1. Quatro rotas de /acompanhamento sao 400 permanente.
//
// Elas declaram `params: anoParam` (que exige a chave `anoParam`) num caminho
// que nao tem esse parametro. O Joi roda no middleware, antes do controller, e
// recusa sempre. Uma delas, GET /api/acompanhamento/projetos, era chamada em
// TODA execucao da rotina de consulta do vault.
// ---------------------------------------------------------------------------

const QUEBRADAS = [
  { rota: '/projetos', params: {} },
  { rota: '/projeto/:id/informacao_anual/:ano', params: { id: '1', ano: '2026' } },
  { rota: '/projeto/:id/informacao_detalhada', params: { id: '1' } },
  { rota: '/projeto/:id/informacao_detalhada/:ano', params: { id: '1', ano: '2026' } }
]

test('as quatro rotas de /acompanhamento continuam quebradas (400 permanente)', () => {
  const schema = require(path.join(RAIZ_SERVER, 'acompanhamento', 'acompanhamento_schema'))
  const fonte = fs.readFileSync(
    path.join(RAIZ_SERVER, 'acompanhamento', 'acompanhamento_route.js'), 'utf8'
  )

  for (const { rota, params } of QUEBRADAS) {
    assert.ok(fonte.includes(`'${rota}'`), `a rota ${rota} sumiu do server/`)
    const { error } = schema.anoParam.validate(params, { abortEarly: false })
    assert.ok(
      error,
      `GET /api/acompanhamento${rota} PASSOU na validacao: o defeito foi consertado. ` +
      'Apague o bloco "DEFEITO VIVO" de lib/regras.js e ajuste o teste.'
    )
  }
})

test('o defeito esta anunciado no `sap schema` para quem for ler', () => {
  const texto = GERAL.join('\n')
  assert.match(texto, /DEFEITO VIVO/)
  for (const { rota } of QUEBRADAS) {
    const semParam = rota.replace(/:([a-z]+)/gi, ':$1')
    assert.ok(
      texto.includes(semParam),
      `a rota ${rota} esta quebrada mas nao aparece no aviso geral`
    )
  }
})

test('dois schemas de query citados por rotas de /acompanhamento nem existem', () => {
  const schema = require(path.join(RAIZ_SERVER, 'acompanhamento', 'acompanhamento_schema'))
  // finalizadoQuery e mvtParams ficaram dentro de um bloco comentado do
  // acompanhamento_schema.js. O middleware trata `undefined` como "sem schema" e
  // simplesmente NAO valida: a query passa sem conferencia nenhuma.
  assert.strictEqual(schema.finalizadoQuery, undefined)
  assert.strictEqual(schema.mvtParams, undefined)
})

// ---------------------------------------------------------------------------
// 2. A spec Swagger contradiz o Joi que o servidor de fato usa.
//
// Sao os tres casos em que seguir a spec produz um comando errado. O CLI le a
// FORMA do Joi justamente por isto; estes testes travam a decisao.
// ---------------------------------------------------------------------------

// Extrai um componente `components/schemas/<nome>` dos blocos @swagger. A
// varredura e por LINHA: o recuo do YAML dentro do comentario e o unico
// delimitador, e um indexOf ingenuo casaria com a primeira linha interna.
function componente (arquivo, nome) {
  const linhas = fs.readFileSync(arquivo, 'utf8').split(/\r?\n/)
  const inicio = linhas.findIndex(l => l === ` *     ${nome}:`)
  if (inicio === -1) return null
  const out = [linhas[inicio]]
  for (let i = inicio + 1; i < linhas.length; i++) {
    if (/^ \*     \S/.test(linhas[i])) break
    out.push(linhas[i])
  }
  return out.join('\n')
}

const PROJETO_SCHEMA = path.join(RAIZ_SERVER, 'projeto', 'projeto_schema.js')

test('spec x Joi: produtosIds anuncia lote_ids e o Joi exige produto_ids', () => {
  const joi = require(PROJETO_SCHEMA).produtosIds.describe()
  assert.deepStrictEqual(Object.keys(joi.keys), ['produto_ids'])

  const doc = componente(PROJETO_SCHEMA, 'produtosIds')
  assert.ok(doc, 'o componente produtosIds sumiu da spec')
  assert.match(doc, /lote_ids/,
    'a spec foi corrigida: reveja o comentario de lib/spec.js que cita este caso')
  // A spec e ate internamente inconsistente: exige um campo que nao declara.
  assert.match(doc, /required:\s*\n \*\s+- produto_ids/)
})

test('spec x Joi: statusQuery chama de proxima o que o Joi chama de status', () => {
  const joi = require(PROJETO_SCHEMA).statusQuery.describe()
  assert.deepStrictEqual(Object.keys(joi.keys), ['status'])
  assert.match(componente(PROJETO_SCHEMA, 'statusQuery'), /proxima:/)
})

test('spec x Joi: a spec omite status_id de lotes e blocos', () => {
  for (const nome of ['lotes', 'blocos']) {
    const joi = require(PROJETO_SCHEMA)[nome].describe()
    const item = joi.keys[nome].items[0].keys
    assert.ok('status_id' in item, `o Joi de ${nome} perdeu status_id`)
    assert.ok(
      !/status_id/.test(componente(PROJETO_SCHEMA, nome)),
      `a spec de ${nome} ganhou status_id: reveja o comentario de lib/spec.js`
    )
  }
})

// ---------------------------------------------------------------------------
// 3. Cobertura da spec: ela nao alcanca os modulos do RPCMTec.
//
// Isto sozinho ja decidiria a questao. Os modulos que o chefe mais usa para
// fechar o mes nao tem NENHUM bloco @swagger; um CLI que lesse o contrato da
// spec simplesmente nao teria contrato para eles.
// ---------------------------------------------------------------------------

test('os modulos do RPCMTec tem zero blocos @swagger, e mesmo assim tem contrato', () => {
  const spec = require('../lib/spec')
  const esquema = require('../lib/schema')
  const { obter } = require('../lib/recursos')

  for (const modulo of ['campo', 'capacitacao', 'extra_pit', 'pit_nao_producao', 'rh', 'relatorio', 'metadados']) {
    assert.strictEqual(
      spec.cobertura(modulo), 0,
      `${modulo} ganhou documentacao @swagger: bom sinal, e o comentario de lib/spec.js precisa atualizar o numero`
    )
  }

  for (const chave of ['campo', 'capacitacao', 'extra_pit', 'pit', 'aproveitamento']) {
    const texto = esquema.contrato(chave, obter(chave))
    assert.match(texto, /corpo de POST/, `${chave}: sem contrato de corpo`)
  }
})

// ---------------------------------------------------------------------------
// 4. Campo obrigatorio que o servidor ignora.
// ---------------------------------------------------------------------------

test('iniciar_modo_local exige usuario_id no corpo e usa o do token', () => {
  const schema = require(path.join(RAIZ_SERVER, 'gerencia', 'gerencia_schema'))
  const desc = schema.iniciaAtivModoLocal.describe()
  assert.strictEqual(desc.keys.usuario_id.flags.presence, 'required')

  const rota = fs.readFileSync(path.join(RAIZ_SERVER, 'gerencia', 'gerencia_route.js'), 'utf8')
  const trecho = rota.slice(rota.indexOf("'/iniciar_modo_local'"))
  assert.match(
    trecho.slice(0, 600), /iniciaAtividadeModoLocal\(\s*req\.body\.atividade_id,\s*req\.usuarioId/,
    'o controller passou a usar req.body.usuario_id: o campo deixou de ser inerte'
  )
})
