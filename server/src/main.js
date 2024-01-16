'use strict'

const { errorHandler } = require('./utils')
const { startServer } = require('./server')
const { db, databaseVersion, microcontroleDatabaseVersion } = require('./database')
const { verifyAuthServer } = require('./authentication')

db.createSapConn()
  .then(db.createMicroConn)
  .then(databaseVersion.load)
  .then(microcontroleDatabaseVersion.load)
  .then(verifyAuthServer)
  .then(startServer)
  .catch(errorHandler.critical)
