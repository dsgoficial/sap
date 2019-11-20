"use strict";
const { VERSION, PORT } = require("./config");
const { databaseVersion } = require("./database");

const app = require("./app");
const { logger } = require("./utils");

const startServer = () => {
  return app.listen(PORT, () => {
    logger.info("Servidor do SAP iniciado", {
      success: true,
      information: {
        version: VERSION,
        database_version: databaseVersion.nome,
        port: PORT
      }
    });
  });
};

module.exports = startServer;
