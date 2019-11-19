const { VERSION, PORT } = require("./config");

const app = require("./app");
const { logger } = require("./utils");

const startServer = databaseVersion => {
  return app.listen(PORT, () => {
    logger.info("Server start", {
      success: true,
      information: {
        version: VERSION,
        database_version: databaseVersion,
        port: PORT
      }
    });
  });
};

module.exports = startServer;
