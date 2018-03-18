"use strict";

const promise = require("bluebird");

const initOptions = {
  // Use a custom promise library, instead of the default ES6 Promise:
  promiseLib: promise
};

const pgp = require("pg-promise")(initOptions);

const testeddbs = {};

const testdb = async (usuario, senha) => {
  const con =
    "postgres://" +
    usuario +
    ":" +
    senha +
    "@" +
    process.env.DB_SERVER +
    ":" +
    process.env.DB_PORT +
    "/" +
    process.env.DB_NAME;

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
      console.log(error);
      result = false;
    });

  return result;
};

module.exports = testdb;
