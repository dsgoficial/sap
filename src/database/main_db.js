"use strict";

const { errorHandler } = require("../utils");

const promise = require("bluebird");

const initOptions = {
  promiseLib: promise
};

const pgp = require("pg-promise")(initOptions);

const {
  DB_USER,
  DB_PASSWORD,
  DB_SERVER,
  DB_PORT,
  DB_NAME
} = require("../config");

const cn = {
  host: DB_SERVER,
  port: DB_PORT,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD
};

const db = pgp(cn);

db.connect()
  .then(function(obj) {
    obj.done(); // success, release connection;
  })
  .catch(errorHandler);

module.exports = db;
