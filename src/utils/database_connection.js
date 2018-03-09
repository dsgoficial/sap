const settings = require("../config.json");
const promise = require("bluebird");

const options = {
  promiseLib: promise
};
const pgp = require("pg-promise")(options);
const db = {};

const connectionString = `postgres://${settings.db_user}:
          ${settings.db_password}@${settings.db_server}:${settings.db_port}
          /${settings.db_macro}`;


db.macro = pgp(connectionString);

const testdb = {};

db.verifyConnection = async (user, password) => {
  let con = `postgres://${user}:${password}@${settings.db_server}:${
    settings.db_port
  }/${settings.db_macro}`;

  if (!(con in testdb)) {
    testdb[con] = pgp(con);
  }

  try {
    let usuario = await testdb[con].macro.one(
      "SELECT id FROM sdt.usuario" + " WHERE login = $1"[body.login]
    );
    return usuario.id;
  } catch (err) {
    //FIXME LOG ERROR
    return false;
  }
};

module.exports = db;
