"use strict";
const { VERSION, PORT } = require("./config");
const { databaseVersion } = require("./database");

const app = require("./app");
const { logger } = require("./utils");

const https = require("https");

const startServer = () => {
  const httpsServer = https.createServer(
    {
      key: fs.readFileSync("sslcert/server.key", "utf8"),
      cert: fs.readFileSync("sslcert/server.crt", "utf8")
    },
    app
  );
  //redirect http calls to https

  return httpsServer.listen(PORT, () => {
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
