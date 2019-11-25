"use strict";

const { VERSION, PORT } = require("./config");
const { databaseVersion } = require("./database");

const app = require("./app");
const { logger, AppError } = require("./utils");

const startServer = () => {
  const argv = require('minimist')(process.argv.slice(2));
  if("https" in argv && argv["https"]){
    
    const fs = require('fs');
    const https = require("https");
    const path = require("path");

    const key = path.join(__dirname, "sslcert/key.pem")
    const cert = path.join(__dirname, "sslcert/cert.pem")

    if(!fs.existsSync(key) || !fs.existsSync(cert)){
      throw new AppError('Para executar o SAP no modo HTTPS é necessário criar a chave e certificado com OpenSSL. Verifique a Wiki do SAP no Github para mais informações')
    }
    
    const httpsServer = https.createServer(
      {
        key: fs.readFileSync(key, "utf8"),
        cert: fs.readFileSync(cert, "utf8")
      },
      app
    );

    return httpsServer.listen(PORT, () => {
      logger.info("Servidor HTTPS do SAP iniciado", {
        success: true,
        information: {
          version: VERSION,
          database_version: databaseVersion.nome,
          port: PORT
        }
      });
    });


  } else {
    return app.listen(PORT, () => {
      logger.info("Servidor HTTP do SAP iniciado", {
        success: true,
        information: {
          version: VERSION,
          database_version: databaseVersion.nome,
          port: PORT
        }
      });
    });
  }
};

module.exports = startServer;
