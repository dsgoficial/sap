// Path: lib\args.js
'use strict'

// Parser de argumentos proprio, sem dependencia externa. O CLI nao instala
// node_modules: ele so precisa do Node e do server/ (de onde vem o Joi, via os
// arquivos de schema). Manter dependencia zero e o que permite rodar o sap num
// clone recem-baixado sem npm install na pasta do CLI.
//
// Gramatica aceita:
//   sap <comando> [subcomando] [posicionais...] [--flag valor] [--booleana]
//   --flag=valor tambem e aceito
//   -- encerra as flags (tudo depois vira posicional)

// Flags que NAO consomem o proximo argumento (sao booleanas).
const BOOLEANAS = new Set([
  'dry-run',
  'json',
  'ajuda',
  'help',
  'insecure',
  'sem-cache',
  'executar',
  'nativo',
  'markdown',
  'mes-apenas',
  'versao'
])

/**
 * @param {string[]} argv normalmente process.argv.slice(2)
 * @returns {{_: string[], flags: Object<string, string|boolean>}}
 */
function parse (argv) {
  const posicionais = []
  const flags = {}
  let soPosicional = false

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]

    if (soPosicional) {
      posicionais.push(arg)
      continue
    }

    if (arg === '--') {
      soPosicional = true
      continue
    }

    if (arg.startsWith('--')) {
      const corpo = arg.slice(2)
      const igual = corpo.indexOf('=')

      if (igual !== -1) {
        // --flag=valor: o valor vem colado, nunca consome o proximo argumento.
        flags[corpo.slice(0, igual)] = corpo.slice(igual + 1)
        continue
      }

      if (BOOLEANAS.has(corpo)) {
        flags[corpo] = true
        continue
      }

      const proximo = argv[i + 1]
      if (proximo === undefined || proximo.startsWith('--')) {
        // Flag desconhecida sem valor: trata como booleana em vez de engolir a
        // proxima flag, que seria um erro silencioso e dificil de achar.
        flags[corpo] = true
        continue
      }

      flags[corpo] = proximo
      i++
      continue
    }

    posicionais.push(arg)
  }

  return { _: posicionais, flags }
}

/**
 * Le uma flag exigindo valor de texto. Erro claro quando falta, em vez de deixar
 * `true` (booleano) vazar para dentro de uma URL ou de um corpo JSON.
 */
function exigir (flags, nome, contexto) {
  const valor = flags[nome]
  if (valor === undefined || valor === true || valor === '') {
    throw new Error(`Falta --${nome}${contexto ? ` (${contexto})` : ''}.`)
  }
  return valor
}

/** Le uma flag numerica opcional; devolve `padrao` quando ausente. */
function numero (flags, nome, padrao) {
  const valor = flags[nome]
  if (valor === undefined || valor === true) return padrao
  const n = Number(valor)
  if (!Number.isFinite(n)) {
    throw new Error(`--${nome} precisa ser um numero (recebi "${valor}").`)
  }
  return n
}

/** Divide "a,b,c" em ['a','b','c'], ignorando espacos e itens vazios. */
function lista (valor) {
  if (valor === undefined || valor === true) return null
  return String(valor)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
}

module.exports = { parse, exigir, numero, lista, BOOLEANAS }
