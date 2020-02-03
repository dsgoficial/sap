'use strict'

const { errorHandler } = require('../utils')

const { DB_USER, DB_PASSWORD, DB_SERVER, DB_PORT, DB_NAME } = require('../config')

const promise = require('bluebird')

const testeDBs = {}

const db = {}

db.pgp = require('pg-promise')({
  promiseLib: promise
})

db.createConn = async (usuario, senha, server, port, dbname, handle = true) => {
  const connString = `postgres://${usuario}:${senha}@${server}:${port}/${dbname}`

  if (!(connString in testeDBs)) {
    testeDBs[connString] = db.pgp(connString)

    await testeDBs[connString]
      .connect()
      .then(obj => {
        obj.done() // success, release connection;
      })
      .catch(e => {
        if (!handle) {
          throw new Error()
        }
        errorHandler.critical(e)
      })
  }

  return testeDBs[connString]
}

db.testConn = async (usuario, senha, server, port, dbname) => {
  try {
    await db.createConn(usuario, senha, server, port, dbname, false)

    return true
  } catch (e) {
    return false
  }
}

db.createAdminConn = async (server, port, dbname) => {
  return db.createConn(DB_USER, DB_PASSWORD, server, port, dbname)
}

db.createSapConn = async () => {
  db.sapConn = await db.createAdminConn(DB_SERVER, DB_PORT, DB_NAME)
}

module.exports = db
