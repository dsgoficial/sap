"use strict";

const { logger } = require("../logger");

const promise = require("bluebird");

const initOptions = {
  // Use a custom promise library, instead of the default ES6 Promise:
  promiseLib: promise
};

const pgp = require("pg-promise")(initOptions);

const connectionStringMacro =
  "postgres://" +
  process.env.DB_USER +
  ":" +
  process.env.DB_PASSWORD +
  "@" +
  process.env.DB_SERVER +
  ":" +
  process.env.DB_PORT +
  "/" +
  process.env.DB_NAME;

const db = pgp(connectionStringMacro);

db
  .connect()
  .then(function(obj) {
    obj.done(); // success, release connection;
  })
  .catch(function(error) {
    logger.info("Failed database connection", {
      context: "login_db",
      information: {
        connectionString: connectionStringMacro
      }
    });
  });

module.exports = db;
