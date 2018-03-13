const jwt = require("jsonwebtoken");
const pgp = require("pg-promise")();

const config = require("../config.json");

const jwtSecret = config.secret;

const controller = {};

const testdb = {};
controller.login = async (usuario, senha) => {
  let con = `postgres://${usuario}:${senha}@${config.db_server}:${
    config.db_port
  }/${config.db_macro}`;

  if (!(con in testdb)) {
    testdb[con] = pgp(con);
  }
  try {
    const usuarioId = await testdb[con].macro.one(
      "SELECT id FROM sdt.usuario" + " WHERE login = $1",
      [usuario]
    );
    const token = jwt.sign(usuarioId, jwtSecret, {
      expiresIn: "10h"
    });
    return { loginError: null, token: token };
  } catch (error) {
    const err = new Error("Falha durante autenticação.");
    err.status = 401;
    err.context = "login_ctrl";
    err.information = {};
    err.information.usuario = usuario;
    err.information.trace = error;
    return { loginError: err, token: null };
  }
};

module.exports = controller;
