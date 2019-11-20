"use strict";

const { isMaster, setupWorkerProcesses } = require("./cluster");

if (isMaster) {
  setupWorkerProcesses();
} else {
  const { errorHandler } = require("./utils");
  const startServer = require("./server");
  const { databaseVersion } = require("./database");
  
  databaseVersion.load().then(startServer).catch(errorHandler)
}
