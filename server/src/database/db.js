'use strict'

const { errorHandler } = require('../utils')

const { DB_USER, DB_PASSWORD, DB_SERVER, DB_PORT, DB_NAME } = require('../config')

const promise = require('bluebird')

const testeDBs = {}

const db = {}

db.pgp = require('pg-promise')({
  promiseLib: promise
})

db.createConn = async (user, password, host, port, database, handle = true) => {
  const key = `${user}@${host}:${port}/${database}`

  if (key in testeDBs) {
    const a = testeDBs[key];
    a.cn.password = () => password; // update function->password
    return a.db;
  }
  const cn = { host, port, database, user, password }; 
  const new_db = db.pgp(cn)  
  testeDBs[key] = {db:new_db, cn}

  await new_db
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

  return new_db
}

db.testConn = async (usuario, senha, server, port, dbname) => {
  try {
    await db.createConn(usuario, senha, server, port, dbname, false)

    return true
  } catch (e) {
    return false
  }
}

db.createAdminConn = async (server, port, dbname, handle) => {
  return db.createConn(DB_USER, DB_PASSWORD, server, port, dbname, handle)
}

db.createSapConn = async () => {
  db.sapConn = await db.createAdminConn(DB_SERVER, DB_PORT, DB_NAME, true)
}

module.exports = db
