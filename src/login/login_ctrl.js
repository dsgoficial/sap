const jwt = require("jsonwebtoken");

const db = require("../login/login_db");

const config = require("../config.json");

const jwtSecret = config.secret;

const controller = {};

controller.login = async (usuario, senha) => {
  
  let con =
    "postgres://" +
    usuario +
    ":" +
    senha +
    "@" +
    config.db_server +
    ":" +
    config.db_port +
    "/" +
    config.db_name;

  let verifycon = await db.testdb(con)
  if (!verifycon) {
    const err = new Error("Falha durante autenticação");
    err.status = 401;
    err.context = "login_ctrl";
    err.information = {};
    err.information.usuario = usuario;
    return { loginError: err, token: null };    
  }

  try {
    const { id } = await db.macro.one(
      "SELECT id FROM sdt.usuario WHERE login = $1",
      [usuario]
    );
    const token = jwt.sign({ id }, jwtSecret, {
      expiresIn: "10h"
    });
    return { loginError: null, token: token };
  } catch (error) {
    const err = new Error("Usuário não cadastrado no SAP");
    err.status = 401;
    err.context = "login_ctrl";
    err.information = {};
    err.information.usuario = usuario;
    err.information.trace = error;
    return { loginError: err, token: null };
  }
};

module.exports = controller;
