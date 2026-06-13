'use strict'

const logger = require('./logger')
const { VERSION } = require('../config')

// Retorna uma CÓPIA saneada (mascara senha, trunca strings longas) sem mutar o
// objeto original (antes mutava req.body in-place e ainda retornava undefined).
const truncate = dados => {
  if (!dados || typeof dados !== 'object') {
    return dados
  }

  const copy = { ...dados }

  if ('senha' in copy) {
    copy.senha = '*'
  }

  const MAX_LENGTH = 500

  for (const key in copy) {
    if (
      Object.prototype.toString.call(copy[key]) === '[object String]' &&
      copy[key].length > MAX_LENGTH
    ) {
      copy[key] = copy[key].substring(0, MAX_LENGTH)
    }
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
