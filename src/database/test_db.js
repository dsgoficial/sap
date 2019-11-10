"use strict";

const promise = require("bluebird");

const initOptions = {
  // Use a custom promise library, instead of the default ES6 Promise:
  promiseLib: promise
};

const pgp = require("pg-promise")(initOptions);

const { DB_SERVER, DB_PORT, DB_NAME } = require('./config');

const testeddbs = {};

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

  if (!(con in testeddbs)) {
    testeddbs[con] = pgp(con);
  }

  let result;

  await testeddbs[con]
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
