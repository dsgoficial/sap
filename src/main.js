"use strict";

const { errorHandler } = require("./utils");
const { databaseVersion } = require("./database");
const { isMaster, setupWorkerProcesses } = require("./cluster");

const startServer = require("./server");

if (isMaster) {
  setupWorkerProcesses();
} else {
  //Valida versão do banco de dados e inicia o servidor
  databaseVersion
    .validate()
    .then(startServer)
    .catch(errorHandler);
}
