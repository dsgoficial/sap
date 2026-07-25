// Path: __tests__\schema.test.js
'use strict'

// Testes do contrato, rodando contra os schemas REAIS do server/, nunca mocks.
// O valor do CLI e nao ter copia do contrato; testar com schema falso testaria
// justamente a copia. Em troca, estes testes QUEBRAM quando o contrato do SAP
// muda, que e exatamente o alarme que se quer ter.

const test = require('node:test')
const assert = require('node:assert')
const fs = require('fs')
const path = require('path')

const esquema = require('../lib/schema')
const { RECURSOS, DOMINIOS, RAIZ_SERVER, obter, operacao } = require('../lib/recursos')

// ---------------------------------------------------------------------------
// O espelho da validacao: se o servidor mudar as opcoes, o dry-run passa a
// mentir. Este teste le o arquivo do servidor e compara com o nosso objeto.
// ---------------------------------------------------------------------------

test('OPCOES_CORPO espelha o middleware do servidor', () => {
  const fonte = fs.readFileSync(
    path.join(RAIZ_SERVER, 'utils', 'schema_validation.js'), 'utf8'
  )

  const corpo = fonte.slice(fonte.indexOf('if (bodySchema)'))
  assert.match(corpo, /stripUnknown:\s*true/,
    'o servidor deixou de usar stripUnknown no corpo: ajuste OPCOES_CORPO e os avisos de campo descartado')
  assert.strictEqual(esquema.OPCOES_CORPO.stripUnknown, true)
  assert.strictEqual(esquema.OPCOES_CORPO.abortEarly, false)

  const query = fonte.slice(fonte.indexOf('if (querySchema)'), fonte.indexOf('if (paramsSchema)'))
  assert.ok(!/stripUnknown/.test(query),
    'o servidor passou a usar stripUnknown na query: ajuste OPCOES_QUERY')
  assert.strictEqual(esquema.OPCOES_QUERY.stripUnknown, undefined)
  assert.strictEqual(esquema.OPCOES_PARAMS.stripUnknown, undefined)
})

// ---------------------------------------------------------------------------
// Alarme de renomeacao: cada nome de model Joi e cada rota da registry tem que
// existir de verdade no server/. Renomear um model la sem ajustar aqui produz
// um CLI que valida contra `undefined`, ou seja, contra nada.
// ---------------------------------------------------------------------------

test('todo model Joi apontado pela registry existe no server/', () => {
  for (const [chave, recurso] of Object.entries(RECURSOS)) {
    const modulo = recurso.schema()
    for (const op of recurso.operacoes) {
      for (const campo of ['body', 'query', 'params']) {
        if (!op[campo]) continue
        assert.ok(
          modulo[op[campo]] && typeof modulo[op[campo]].validate === 'function',
          `${chave}.${op.acao}: ${campo}=${op[campo]} nao existe (ou nao e Joi) no schema do modulo ${recurso.modulo}`
        )
      }
    }
  }
})

test('toda rota da registry aparece no *_route.js correspondente', () => {
  const cache = {}
  const fonteDe = modulo => {
    if (!cache[modulo]) {
      cache[modulo] = fs.readFileSync(
        path.join(RAIZ_SERVER, modulo, `${modulo}_route.js`), 'utf8'
      )
    }
    return cache[modulo]
  }

  for (const [chave, recurso] of Object.entries(RECURSOS)) {
    const fonte = fonteDe(recurso.modulo)
    // O caminho da registry inclui o prefixo do mount (/campo/campos); no
    // arquivo de rotas ele aparece sem o prefixo ('/campos').
    const prefixo = '/' + recurso.caminho.split('/')[1]
    for (const op of recurso.operacoes) {
      const semPrefixo = (recurso.caminho + (op.sufixo || '')).slice(prefixo.length) || '/'
      const literal = `'${semPrefixo}'`
      assert.ok(
        fonte.includes(literal),
        `${chave}.${op.acao}: nao achei a rota ${literal} em ${recurso.modulo}_route.js ` +
        '(rota renomeada no server/ sem ajustar a registry?)'
      )
    }
  }
})

test('toda tabela de dominio aponta uma rota que existe', () => {
  for (const [nome, caminho] of Object.entries(DOMINIOS)) {
    const [, modulo, ...resto] = caminho.split('/')
    const fonte = fs.readFileSync(
      path.join(RAIZ_SERVER, modulo, `${modulo}_route.js`), 'utf8'
    )
    assert.ok(
      fonte.includes(`'/${resto.join('/')}'`),
      `dominio ${nome}: rota /${resto.join('/')} nao existe em ${modulo}_route.js`
    )
  }
})

// ---------------------------------------------------------------------------
// A DECISAO Joi x Swagger, virada em teste.
//
// A spec OpenAPI do SAP (283 blocos @swagger) contradiz o Joi em varios pontos.
// O CLI le a FORMA do Joi e so a PROSA da spec. Estes testes travam essa escolha
// nos dois casos em que seguir a spec produziria um comando errado.
// ---------------------------------------------------------------------------

test('o contrato de produto nomeia produto_ids (Joi), nao lote_ids (spec)', () => {
  const texto = esquema.contrato('produto', obter('produto'))
  assert.match(texto, /produto_ids/,
    'o DELETE /projeto/produto exige produto_ids no Joi')
  assert.ok(!/lote_ids/.test(texto),
    'lote_ids e o nome que a spec inventou para esse corpo; seguir a spec daria 400')
})

test('o filtro de lote se chama status (Joi), nao proxima (spec)', () => {
  const modulo = obter('lote').schema()
  const campos = esquema.camposDe(modulo.statusQuery).map(c => c.nome)
  assert.deepStrictEqual(campos, ['status'])
})

test('status_id existe no corpo de lote e de bloco (a spec o omite)', () => {
  for (const chave of ['lote', 'bloco']) {
    const texto = esquema.contrato(chave, obter(chave))
    assert.match(texto, /status_id\*/,
      `${chave}: status_id e obrigatorio no Joi e e por ele que se fecha um lote`)
  }
})

// ---------------------------------------------------------------------------
// Formatacao do contrato
// ---------------------------------------------------------------------------

test('todo recurso registrado renderiza contrato sem estourar', () => {
  for (const chave of Object.keys(RECURSOS)) {
    const texto = esquema.contrato(chave, obter(chave))
    assert.ok(texto.length > 50, `${chave}: contrato vazio`)
    assert.ok(!/undefined/.test(texto), `${chave}: vazou "undefined" no contrato`)
    assert.ok(!/\[object Object\]/.test(texto), `${chave}: vazou "[object Object]"`)
    // Detalhe interno do describe() do Joi nao pode chegar ao agente.
    assert.ok(!/override/.test(texto), `${chave}: vazou o sentinela {override:true} do Joi`)
  }
})

test('renderiza objeto aninhado e array de objeto ate as folhas', () => {
  const campos = esquema.camposDe(obter('campo').schema().campo)
  assert.strictEqual(campos.length, 1)
  assert.strictEqual(campos[0].nome, 'campo')
  const filhos = campos[0].filhos.map(f => f.nome)
  assert.ok(filhos.includes('situacao_id'), 'perdeu o campo aninhado situacao_id')
  assert.ok(filhos.includes('categorias'))

  const uts = esquema.camposDe(obter('unidade_trabalho').schema().unidadesTrabalho)
  const arr = uts.find(c => c.nome === 'unidades_trabalho')
  assert.match(arr.tipo, /^array\[>=1\] de object/)
  assert.ok(arr.filhos.map(f => f.nome).includes('tempo_estimado_minutos'))
})

test('renderiza o Joi.when() do login em vez de engolir como "any"', () => {
  const modulo = require(path.join(RAIZ_SERVER, 'login', 'login_schema'))
  const campos = esquema.camposDe(modulo.login)
  const plugins = campos.find(c => c.nome === 'plugins')
  assert.strictEqual(plugins.tipo, 'condicional')
  assert.ok(plugins.notas.some(n => /OBRIGATORIO/.test(n)))
  assert.ok(plugins.notas.some(n => /PROIBIDO/.test(n)),
    'com cliente "sap" o campo e Joi.forbidden(); nao dizer isso custa um 400')
})

test('marca os valores de .valid() como lista exaustiva', () => {
  const modulo = obter('capacitacao').schema()
  const cap = esquema.camposDe(modulo.capacitacao)[0]
  const tipo = cap.filhos.find(f => f.nome === 'tipo')
  assert.strictEqual(tipo.tipo, 'string ="Ministrada"|"Recebida"')
})

// ---------------------------------------------------------------------------
// Validacao local
// ---------------------------------------------------------------------------

test('acha campo descartado por stripUnknown dentro de objeto aninhado', () => {
  const modulo = obter('campo').schema()
  const r = esquema.validarCorpo(modulo.campo, {
    campo: {
      nome: 'x', descricao: null, orgao: 'y', pit: 2026, militares: null,
      placas_vtr: null, inicio: null, fim: null, situacao_id: 1,
      categorias: [], descricaoo: 'typo'
    }
  })
  assert.strictEqual(r.ok, true)
  assert.deepStrictEqual(r.descartados, ['campo.descricaoo'])
})

test('acha campo descartado dentro de array de objetos', () => {
  const modulo = obter('lote').schema()
  const r = esquema.validarCorpo(modulo.lotes, {
    lotes: [{
      nome: 'a', nome_abrev: 'b', denominador_escala: 25000,
      linha_producao_id: 1, projeto_id: 1, descricao: 'c', status_id: 1,
      escala: '1:25.000'
    }]
  })
  assert.strictEqual(r.ok, true)
  assert.deepStrictEqual(r.descartados, ['lotes[0].escala'])
})

test('reprova corpo invalido e a mensagem traz o contrato do campo errado', () => {
  const modulo = obter('pit').schema()
  const r = esquema.validarCorpo(modulo.pit, {
    pit: { ano: 2026, numero_meta: 99, item: 'x', descricao: 'y', unidade: null, meta: 1, prazo: null }
  })
  assert.strictEqual(r.ok, false)
  const texto = esquema.explicarErro(modulo.pit, r.erros, 'sap schema pit')
  assert.match(texto, /numero_meta/)
  assert.match(texto, /int 1\.\.7/, 'a faixa aceita tem que aparecer junto do erro')
  assert.match(texto, /nada foi enviado/)
})

test('numero em string e recusado onde o Joi usa .strict()', () => {
  const modulo = obter('lote').schema()
  const r = esquema.validarCorpo(modulo.lotes, {
    lotes: [{
      nome: 'a', nome_abrev: 'b', denominador_escala: '25000',
      linha_producao_id: 1, projeto_id: 1, descricao: 'c', status_id: 1
    }]
  })
  assert.strictEqual(r.ok, false, 'strict() recusa "25000"; sem isso o dry-run aprovaria e o envio levaria 400')
})

test('query sem stripUnknown: chave desconhecida e erro, nao descarte', () => {
  const modulo = obter('lote').schema()
  const r = esquema.validarQuery(modulo.statusQuery, { proxima: 'execucao' })
  assert.strictEqual(r.ok, false,
    'na query o servidor nao usa stripUnknown; "proxima" (o nome da spec) da 400')
})

// ---------------------------------------------------------------------------
// Fuso: a armadilha que so aparece na fechada do mes.
// ---------------------------------------------------------------------------

test('avisa quando a data cai no dia anterior em UTC-3', () => {
  const avisos = esquema.avisosDeFuso({ campo: { inicio: new Date('2026-07-01T00:00:00.000Z') } })
  assert.strictEqual(avisos.length, 1)
  assert.match(avisos[0], /2026-06-30/)
})

test('nao avisa para data ao meio-dia UTC nem para campo que nao e timestamptz', () => {
  assert.deepStrictEqual(
    esquema.avisosDeFuso({ campo: { inicio: new Date('2026-07-01T12:00:00.000Z') } }), []
  )
  assert.deepStrictEqual(
    esquema.avisosDeFuso({ pit: { prazo: new Date('2026-07-01T00:00:00.000Z') } }), [],
    'prazo e coluna DATE pura: avisar ali seria falso positivo'
  )
})

// ---------------------------------------------------------------------------
// A prosa vem da spec, e so a prosa.
// ---------------------------------------------------------------------------

test('a spec fornece descricao onde ela existe, e o contrato degrada onde nao', () => {
  const spec = require('../lib/spec')
  const p = spec.prosa('projeto', 'GET', '/api/projeto/unidade_trabalho')
  assert.ok(p && p.description && p.description.length > 20)

  // O modulo campo nao tem NENHUM bloco @swagger: o contrato tem que sair
  // completo mesmo assim, so sem as frases.
  assert.strictEqual(spec.cobertura('campo'), 0)
  const texto = esquema.contrato('campo', obter('campo'))
  assert.match(texto, /POST {3}\/api\/campo\/campos/)
  assert.match(texto, /situacao_id\*/)
})

test('a operacao existe na registry ou o erro lista as que existem', () => {
  assert.throws(
    () => operacao(obter('unidade_trabalho'), 'atualizar'),
    /Disponiveis: listar, criar, deletar/
  )
})
