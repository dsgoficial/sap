'use strict'

const semver = require('semver')

const db = require('./db')

const { AppError } = require('../utils')

const { MIN_DATABASE_VERSION } = require('../config')

const dbVersion = {}

const validate = dbv => {
  if (semver.lt(semver.coerce(dbv), semver.coerce(MIN_DATABASE_VERSION))) {
    throw new AppError(
      `Versão do banco de dados (${dbv}) não compatível com a versão do SAP. A versão deve ser superior a ${MIN_DATABASE_VERSION}.`
    )
  }
}

/**
 * Carrega assincronamente o nome da versão do banco de dados
 */
dbVersion.load = async () => {
  if (!('nome' in dbVersion)) {
    const dbv = await db.sapConn.oneOrNone('SELECT nome FROM public.versao')

    if (!dbv) {
      throw new AppError(
        'O banco de dados não não é compatível com a versão do SAP.'
      )
    }
    validate(dbv.nome)
    dbVersion.nome = dbv.nome
  }
}

module.exports = dbVersion
