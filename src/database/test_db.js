"use strict";

const promise = require("bluebird");

const initOptions = {
  promiseLib: promise
};

const pgp = require("pg-promise")(initOptions);

const { DB_SERVER, DB_PORT, DB_NAME } = require("../config");

const testeDBs = {};

const testdb = async (usuario, senha) => {
  const con =
    "postgres://" +
    usuario +
    ":" +
    senha +
    "@" +
    DB_SERVER +
    ":" +
    DB_PORT +
    "/" +
    DB_NAME;

  if (!(con in testeDBs)) {
    testeDBs[con] = pgp(con);
  }

  let result;

  await testeDBs[con]
    .connect()
    .then(function(obj) {
      obj.done(); // success, release connection;
      result = true;
    })
    .catch(function(error) {
      result = false;
    });

  return result;
};

module.exports = testdb;
