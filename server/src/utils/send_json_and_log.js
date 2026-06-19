'use strict'

const logger = require('./logger')
const { VERSION } = require('../config')

// Retorna uma CÓPIA saneada (mascara senha, trunca strings longas) sem mutar o
// objeto original (antes mutava req.body in-place e ainda retornava undefined).
// É recursivo e limitado: campos como imagem_base64 (vídeos de dezenas de MB)
// vêm aninhados em arrays/objetos; logá-los inteiros estourava a heap do Node.
const MAX_LENGTH = 500
const MAX_DEPTH = 5
const MAX_ARRAY = 20

const truncate = (dados, depth = 0) => {
  if (Object.prototype.toString.call(dados) === '[object String]') {
    return dados.length > MAX_LENGTH ? dados.substring(0, MAX_LENGTH) + '…' : dados
  }

  if (!dados || typeof dados !== 'object') {
    return dados
  }

  if (depth >= MAX_DEPTH) {
    return Array.isArray(dados) ? '[...]' : '{...}'
  }

  if (Array.isArray(dados)) {
    const items = dados.slice(0, MAX_ARRAY).map(item => truncate(item, depth + 1))
    if (dados.length > MAX_ARRAY) {
      items.push(`… (+${dados.length - MAX_ARRAY} itens)`)
    }
    return items
  }

  const copy = {}
  for (const key in dados) {
    copy[key] = key === 'senha' ? '*' : truncate(dados[key], depth + 1)
  }
  return copy
}
const sendJsonAndLogMiddleware = (req, res, next) => {
  res.sendJsonAndLog = (success, message, status, dados = null, error = null, metadata = {}) => {
    const url = req.protocol + '://' + req.get('host') + req.originalUrl

    logger.info(message, {
      url,
      information: truncate(req.body),
      status,
      success,
      error
    })

    const userMessage = status === 500 ? 'Erro no servidor' : message
    const jsonData = {
      version: VERSION,
      success: success,
      message: userMessage,
      dados,
      ...metadata
    }

    return res.status(status).json(jsonData)
  }

  next()
}

module.exports = sendJsonAndLogMiddleware
