"use strict";

const jwt = require("jsonwebtoken");

const { db, testdb } = require("../database");

const controller = {};

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
    const { id } = await db.one("SELECT id FROM sdt.usuario WHERE login = $1", [
      usuario
    ]);
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
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
