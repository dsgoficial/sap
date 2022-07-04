'use strict'
/**
 * Módulo de erro customizado para utilização na aplicação
 * @module utils/appError
 */

const { serializeError } = require('serialize-error')

const httpCode = require('./http_code')

/**
 * Erro customizado que deve ser utilizado no serviço
 * @class AppError
 * @augments Error
 * @param {string} message - Mensagem de erro
 * @param {number} [status=500] - Código HTTP do erro
 * @param {Error|string} [errorTrace] - Objeto de erro ou descrição textual do erro
 * @returns {AppError} Objeto de erro customizado
 *
 * @example
 *
 * throw new AppError('Recurso não encontrado', httpCode.NotFound)
 */
class AppError extends Error {
  constructor (message, status = httpCode.InternalError, errorTrace = null) {
    super(message)
    this.statusCode = status
    this.errorTrace =
      errorTrace instanceof Error ? serializeError(errorTrace) : errorTrace
  }
}

module.exports = AppError
