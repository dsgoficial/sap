"use strict";

const { errorHandler } = require("./utils");
const { databaseVersion } = require("./database");

const { VERSION, PORT } = require("./config");

const app = require("./app");
const { logger } = require("./utils");

databaseVersion
  .validate()
  .then(DATABASE_VERSION => {
    //Starts server
    app.listen(PORT, () => {
      logger.info("Server start", {
        success: true,
        information: {
          version: VERSION,
          database_version: DATABASE_VERSION,
          port: PORT
        }
      });
    });
  })
  .catch(errorHandler);
