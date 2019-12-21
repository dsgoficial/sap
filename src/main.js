"use strict";

const {
  cluster: { isMaster, setupWorkerProcesses }
} = require("./server");

if (isMaster) {
  setupWorkerProcesses();
} else {
  const { errorHandler } = require("./utils");
  const { startServer } = require("./server");
  const { db, databaseVersion } = require("./database");
  const { verifyAuthServer } = require("./authentication");

  db.createSapConn()
    .then(databaseVersion.load)
    .then(verifyAuthServer)
    .then(startServer)
    .catch(errorHandler);
}
