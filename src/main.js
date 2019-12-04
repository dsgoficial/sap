"use strict";

const {
  cluster: { isMaster, setupWorkerProcesses }
} = require("./server");

if (isMaster) {
  setupWorkerProcesses();
} else {
  const { errorHandler } = require("./utils");
  const { startServer, createDocumentation } = require("./server");
  const { db, databaseVersion } = require("./database");
  const { verifyAuthServer } = require("./authentication");

  db.createSapConn()
    .then(databaseVersion.load)
    .then(verifyAuthServer)
    .then(createDocumentation)
    .then(startServer)
    .catch(errorHandler);
}
