'use strict'

const { serializeError } = import('serialize-error')

const logger = require('./logger')
const httpCode = require('./http_code')

const errorHandler = {}

errorHandler.log = (err, res = null) => {
  const statusCode = err.statusCode || httpCode.InternalError
  const message = err.message || 'Erro no servidor'
  const errorTrace = err.errorTrace || serializeError(err) || null

  if (res && res.sendJsonAndLog) {
    return res.sendJsonAndLog(false, message, statusCode, null, errorTrace)
  }

  logger.error(message, {
    error: errorTrace,
    status: statusCode,
    success: false
  })
}

errorHandler.critical = (err, res = null) => {
  errorHandler.log(err, res)
  process.exit(1)
}

module.exports = errorHandler
