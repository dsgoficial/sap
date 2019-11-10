"use strict";

const { logger } = require("../logger");

const promise = require("bluebird");

const initOptions = {
  // Use a custom promise library, instead of the default ES6 Promise:
  promiseLib: promise
};

const pgp = require("pg-promise")(initOptions);

const { DB_USER, DB_PASSWORD, DB_SERVER, DB_PORT, DB_NAME } = require('./config');

const connectionStringMacro =
  "postgres://" +
  DB_USER +
  ":" +
  DB_PASSWORD +
  "@" +
  DB_SERVER +
  ":" +
  DB_PORT +
  "/" +
  DB_NAME;

const db = pgp(connectionStringMacro);

db
  .connect()
  .then(function(obj) {
    obj.done(); // success, release connection;
  })
  .catch(function(error) {
    logger.info("Failed database connection", {
      context: "main_db",
      information: {
        connectionString: connectionStringMacro
      }
    });
  });

module.exports = db;
