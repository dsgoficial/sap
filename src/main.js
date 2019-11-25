"use strict";

const { isMaster, setupWorkerProcesses } = require("./cluster");

if (isMaster) {
  setupWorkerProcesses();
} else {
  const { errorHandler } = require("./utils");
  const startServer = require("./server");
  const { databaseVersion } = require("./database");
  const { verifyAuthServer } = require("./authentication")

  databaseVersion.load().then(verifyAuthServer).then(startServer).catch(errorHandler)
}
