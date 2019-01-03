"use strict";

const jwt = require("jsonwebtoken");

const { db, testdb } = require("../database");

const controller = {};

const gravaLogin = async usuario_id => {
  try {
    await db.any(
      `
      INSERT INTO dgeo.login(usuario_id, data_login) VALUES($1, now())
      `,
      [usuario_id]
    );
    return { error: null };
  } catch (error) {
    const err = new Error("Erro gravando registro de login");
    err.status = 500;
    err.context = "login_ctrl";
    err.information = { usuario_id, trace: error };
    return { error: err };
  }
}

controller.login = async (usuario, senha) => {
  let verifycon = await testdb(usuario, senha);
  if (!verifycon) {
    const err = new Error("Falha durante autenticação");
    err.status = 401;
    err.context = "login_ctrl";
    err.information = {};
    err.information.usuario = usuario;
    return { loginError: err, token: null };
  }

  try {
    const { id } = await db.one("SELECT id FROM dgeo.usuario WHERE login = $1", [
      usuario
    ]);
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: "10h"
    });
    let {error} = await gravaLogin(id);
    if (error) {
      return { loginError: error, token: null };
    }
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
