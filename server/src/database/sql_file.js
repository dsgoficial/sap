'use strict'

const { QueryFile, PreparedStatement: PS } = require('pg-promise')

const { AppError, errorHandler } = require('../utils')

/**
 * Lê arquivo SQL e retorna QueryFile para uso no pgPromise
 * @param {string} file - Full path to SQL file
 * @returns {QueryFile} Retorna objeto QueryFile do pgPromise
 */
const readSqlFile = file => {
  const qf = new QueryFile(file, { minify: true })

  if (qf.error) {
    throw new AppError('Erro carregando os arquivos SQL', null, qf.error)
  }
  return qf
}

/**
 * Cria um PreparedStatement para uso no pgPromise
 * @param {string} sql - Full path to SQL file
 * @returns {PreparedStatement} Retorna objeto PreparedStatement do pgPromise
 */
const createPS = sql => {
  try {
    const psName = sql.split(/.*[/|\\]/)[1].replace('.sql', '')

    return new PS({ name: psName, text: readSqlFile(sql) })
  } catch (e) {
    errorHandler.critical(e)
  }
}

module.exports = { readSqlFile, createPS }
