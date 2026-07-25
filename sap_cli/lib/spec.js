// Path: lib\spec.js
'use strict'

// Le a PROSA dos blocos `@swagger` dos *_route.js do server/, e so a prosa:
// o `summary` e o `description` de cada operacao.
//
// Por que so a prosa. O SAP e o unico sistema nosso com spec OpenAPI de verdade
// (283 blocos @swagger), e a tentacao seria tirar dela o contrato inteiro. A
// sonda contra o proprio repo desaconselha:
//
//   1. Quem valida e o Joi, nao a spec. O middleware utils/schema_validation.js
//      chama `schema.validate()` sobre os models Joi; nenhuma linha do servidor
//      le a spec para decidir 200 ou 400. A spec pode mentir sem consequencia,
//      e mente: comparando os 90 models Joi que tem componente swagger homonimo,
//      saem 273 divergencias, entre elas
//        - `produtosIds` (usado no DELETE /projeto/produto): a spec anuncia a
//          propriedade `lote_ids` e exige `produto_ids`, que ela nem declara.
//          O Joi so aceita `produto_ids`.
//        - `statusQuery`: a spec chama de `proxima` o que o Joi chama `status`.
//        - `lotes` e `blocos`: a spec omite `status_id`, que e justamente o
//          campo com que se FECHA um lote (status_id 2).
//        - 165 campos obrigatorios no Joi aparecem como opcionais na spec.
//   2. A spec e incompleta. Ela documenta 275 operacoes; o servidor monta ~398.
//      Modulos inteiros ficaram de fora, e sao os do RPCMTec: campo, capacitacao,
//      extra_pit, pit_nao_producao, rh, relatorio e metadados tem ZERO blocos.
//
// O que a spec tem e o Joi nao: a frase que explica PARA QUE serve a rota,
// escrita pelo time, ao lado da rota. Isso e valioso e nao existe em lugar
// nenhum no describe(). Entao: FORMA vem do Joi, DESCRICAO vem da spec, e as
// duas sao lidas ao vivo do server/ na hora da execucao.
//
// A leitura e por regex sobre o comentario, nao por swagger-jsdoc: manter
// dependencia zero e o que permite rodar o sap num clone sem npm install na
// pasta do CLI.

const fs = require('fs')
const path = require('path')

const RAIZ_SERVER = path.join(__dirname, '..', '..', 'server', 'src')

const cache = new Map()

const METODOS = new Set(['get', 'post', 'put', 'delete', 'patch'])

/**
 * Extrai { 'GET /api/x': {summary, description} } de um arquivo de rotas.
 * Blocos `components:` (definicao de schema) sao ignorados de proposito.
 */
function extrair (texto) {
  const mapa = {}
  const blocos = texto.match(/\/\*\*[\s\S]*?\*\//g) || []

  for (const bloco of blocos) {
    if (!bloco.includes('@swagger')) continue

    const linhas = bloco
      .split('\n')
      .map(l => l.replace(/^\s*\/?\*+\/?/, ''))
      .filter(l => !/^\s*@swagger\s*$/.test(l))

    let caminho = null
    let metodo = null

    for (const linha of linhas) {
      if (!linha.trim()) continue
      const indent = linha.length - linha.trimStart().length
      const conteudo = linha.trim()

      // Nivel 0: a chave e o caminho da rota. `components:` cai fora aqui.
      if (indent <= 1) {
        const m = conteudo.match(/^(\/\S*):$/)
        caminho = m ? m[1] : null
        metodo = null
        continue
      }
      if (!caminho) continue

      if (indent <= 3) {
        const m = conteudo.match(/^([a-z]+):$/)
        metodo = m && METODOS.has(m[1]) ? m[1] : null
        continue
      }
      if (!metodo) continue

      // Dentro da operacao. So `summary` e `description` do primeiro nivel
      // interessam: description aninhada (de um campo, de uma resposta) tem
      // indentacao maior e e descartada pelo teto.
      if (indent > 6) continue
      const m = conteudo.match(/^(summary|description):\s*(.+)$/)
      if (!m) continue

      const chave = `${metodo.toUpperCase()} ${caminho}`
      mapa[chave] = mapa[chave] || {}
      if (!mapa[chave][m[1]]) mapa[chave][m[1]] = m[2].trim()
    }
  }

  return mapa
}

/** Le (e memoriza) a prosa das rotas de um modulo do server/. */
function doModulo (modulo) {
  if (cache.has(modulo)) return cache.get(modulo)

  const arquivo = path.join(RAIZ_SERVER, modulo, `${modulo}_route.js`)
  let mapa = {}
  try {
    mapa = extrair(fs.readFileSync(arquivo, 'utf8'))
  } catch (e) {
    // Modulo sem arquivo de rotas legivel: a prosa some, a forma (Joi) fica.
    // Degradar e correto aqui, ninguem deve perder o contrato por falta de doc.
    mapa = {}
  }
  cache.set(modulo, mapa)
  return mapa
}

/**
 * Prosa de uma operacao. `caminho` e o caminho completo com /api.
 *
 * O Express escreve parametro como `:anoParam` e a spec como `{anoParam}`.
 * Procuramos nas duas formas para nao perder a prosa por uma diferenca de
 * notacao que nada tem a ver com o contrato.
 *
 * @returns {{summary?: string, description?: string}|null}
 */
function prosa (modulo, metodo, caminho) {
  const mapa = doModulo(modulo)
  const verbo = metodo.toUpperCase()
  const chaves = [
    caminho,
    caminho.replace(/:([A-Za-z_][A-Za-z0-9_]*)/g, '{$1}'),
    caminho.replace(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g, ':$1')
  ]
  for (const c of chaves) {
    if (mapa[`${verbo} ${c}`]) return mapa[`${verbo} ${c}`]
  }
  return null
}

/** Quantas operacoes daquele modulo tem prosa. Serve ao aviso de cobertura. */
function cobertura (modulo) {
  return Object.keys(doModulo(modulo)).length
}

module.exports = { prosa, cobertura, extrair, doModulo, RAIZ_SERVER }
