"use strict";

const {
  errorHandler,
  config: { DB_USER, DB_PASSWORD, DB_SERVER, DB_PORT, DB_NAME }
} = require("../utils");

const promise = require("bluebird");

const pgp = require("pg-promise")({
  promiseLib: promise
});

const testeDBs = {};

const createConn = async (usuario, senha, server, port, dbname) => {
  const connString = `postgres://${usuario}:${senha}@${server}:${port}/${dbname}`;
  if (!(connString in testeDBs)) {
    testeDBs[connString] = pgp(connString);
    
    await testeDBs[connString]
      .connect()
      .then(function(obj) {
        obj.done(); // success, release connection;
      })
      .catch(errorHandler);
    }
    
    return testeDBs[connString];
}

const testConn = async (usuario, senha, server, port, dbname) => {
  try{
    await createDb(usuario, senha, server, port, dbname)

    return true
  } catch(e){
    return false
  }
}

const createAdminConn = async (server, port, dbname) => {
  return createDb(DB_USER, DB_PASSWORD, server, port, dbname)
}

const sapConn = createConn(DB_USER, DB_PASSWORD, DB_SERVER, DB_PORT, DB_NAME);

module.exports = {pgp, sapConn, testConn, createConn, createAdminConn};
