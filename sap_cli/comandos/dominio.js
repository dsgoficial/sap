// Path: comandos\dominio.js
'use strict'

// `sap dominio [tabela]` - os codigos que os campos *_id aceitam.
//
// Existe por um motivo especifico: hoje esses enums estao TRANSCRITOS nas skills
// do vault ("status_id 1 Em execucao, 2 Finalizado, 3 Abandonado", "tipo_etapa 1
// Execucao ... 5 Revisao final", "situacao_id do campo 1 Previsto..."). Cada
// transcricao dessas e uma copia do contrato que envelhece sozinha, e o Joi nao
// ajuda: para ele todo codigo de dominio e so `int`.
//
// A saida vem do servidor, entao um codigo novo aparece aqui sem ninguem editar
// nada.

const { DOMINIOS } = require('../lib/recursos')
const saida = require('../lib/saida')
const http = require('../lib/http')
const argsLib = require('../lib/args')

function indice () {
  const chaves = Object.keys(DOMINIOS)
  const largura = Math.max(...chaves.map(c => c.length))
  return [
    'Tabelas de dominio. Uma delas: sap dominio <tabela>',
    '',
    ...chaves.map(c => `  ${c.padEnd(largura)}  GET /api${DOMINIOS[c]}`),
    '',
    'Sao os codigos que os campos *_id aceitam. O Joi so sabe dizer "int": o',
    'significado de cada codigo so existe aqui.'
  ].join('\n')
}

async function executar (args, cfg) {
  const tabela = args._[1]
  if (!tabela) return { texto: indice() }

  const caminho = DOMINIOS[tabela]
  if (!caminho) {
    throw new Error(
      `Tabela de dominio desconhecida: "${tabela}".\n` +
      `Disponiveis: ${Object.keys(DOMINIOS).join(', ')}.`
    )
  }

  const r = await http.autenticada(cfg, 'GET', caminho)
  const opcoes = {
    formato: args.flags.json ? 'json' : (args.flags.formato || 'tabela'),
    campos: argsLib.lista(args.flags.campos)
  }
  const out = saida.lista(r.dados, opcoes)
  return { texto: out.texto, avisos: out.avisos }
}

module.exports = { executar, precisaServidor: true, indice }
