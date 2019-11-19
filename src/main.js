"use strict";

const { errorHandler } = require("./utils");
const { databaseVersion } = require("./database");

const startServer = require("./server");

databaseVersion
  .validate()
  .then(startServer)
  .catch(errorHandler);
