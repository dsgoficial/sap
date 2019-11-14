
const { VERSION, PORT, DATABASE_VERSION } = require('./config');

const app = require("./app");
const { logger } = require("./utils");

//Starts server
app.listen(PORT, () => {
  logger.info("Server start", {
    context: "index",
    information: {
      version: VERSION,
      database_version: DATABASE_VERSION,
      port: PORT
    }
  });
});
