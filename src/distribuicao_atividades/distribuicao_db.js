const config = require("../config.json");
const logger = require("../logger/logger");

const pgp = require("pg-promise")();
const db = {};

const connectionStringMacro =
  "postgres://" +
  config.db_user +
  ":" +
  config.db_password +
  "@" +
  config.db_server +
  ":" +
  config.db_port +
  "/" +
  config.db_name;

db.macro = pgp(connectionStringMacro);

db.macro
  .connect()
  .then(function(obj) {
    obj.done(); // success, release connection;
  })
  .catch(function(error) {
    logger.info("Failed database connection", {
      context: "distribuicao_db",
      information: {
        connectionString: connectionStringMacro
      }
    });
  });

module.exports = db;
