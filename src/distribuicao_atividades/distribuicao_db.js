const config = require("../config.json");

const pgp = require("pg-promise")();
const db = {};


const connectionStringMacro = `postgres://${config.db_user}:
          ${config.db_password}@${config.db_server}:${config.db_port}
          /${config.db_name}`;

db.macro = pgp(connectionStringMacro);

module.exports = db;
