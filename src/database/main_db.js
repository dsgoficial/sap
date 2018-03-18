"use strict";

const config = require("../config.json");
const { logger } = require("../logger");

const promise = require("bluebird");

const initOptions = {
  // Use a custom promise library, instead of the default ES6 Promise:
  promiseLib: promise
};

const pgp = require("pg-promise")(initOptions);

const connectionStringMacro =
  "postgres://" +
  config.db_user +
  ":" +
  config.db_password +
  "@" +
  config.db_server +
  ":" +
  config.db_port +
  "/" +
  config.db_name;

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
