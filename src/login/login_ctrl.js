"use strict";

const jwt = require("jsonwebtoken");

const { db, testdb } = require("../database");

const semver = require("semver");

const controller = {};

const verificaPlugins = async plugins => {
  try {
    const plugins_minimos = await db.any(
      "SELECT nome, versao_minima FROM dgeo.plugin"
    );
    for (let i = 0; i < plugins_minimos.length; i++) {
      let notFound = true;
      plugins.forEach(p => {
        if (p.nome === plugins_minimos[i].nome && semver.gt(p.versao, plugins_minimos[i].versao)) {
          notFound = false;
        }
      });

      if (notFound) {
        let listplugins = []
        plugins_minimos.forEach(pm => {
          listplugins.push(pm.nome + '-' + pm.versao_minima )
        })
        
        const err = new Error(
          "Plugins desatualizados ou não instalados. Os seguintes plugins são necessários: " + ', '.join(listplugins)
        );
        err.status = 401;
        err.context = "login_ctrl";
        err.information = { plugins };
        return { error_plugin: err };
      }
    }

    return { error_plugin: null };
  } catch (error) {
    const err = new Error("Erro verificando plugins. Procure o administrador.");
    err.status = 500;
    err.context = "login_ctrl";
    err.information = { plugins, trace: error };
    return { error_plugin: err };
  }
};

const gravaLogin = async usuario_id => {
  try {
    await db.any(
      `
      INSERT INTO acompanhamento.login(usuario_id, data_login) VALUES($1, now())
      `,
      [usuario_id]
    );
    return { error: null };
  } catch (error) {
    const err = new Error(
      "Erro gravando registro de login. Procure o administrador."
    );
    err.status = 500;
    err.context = "login_ctrl";
    err.information = { usuario_id, trace: error };
    return { error: err };
  }
};

controller.login = async (usuario, senha, plugins) => {
  let verifycon = await testdb(usuario, senha);
  if (!verifycon) {
    const err = new Error("Usuário ou senha inválida.");
    err.status = 401;
    err.context = "login_ctrl";
    err.information = {};
    err.information.usuario = usuario;
    return { loginError: err, token: null };
  }

  try {
    const { id } = await db.one(
      "SELECT id FROM dgeo.usuario WHERE login = $1 and ativo IS TRUE",
      [usuario]
    );
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: "10h"
    });

    let { error_plugin } = await verificaPlugins(plugins);
    if (error_plugin) {
      return { loginError: error_plugin, token: null };
    }

    let { error } = await gravaLogin(id);
    if (error) {
      return { loginError: error, token: null };
    }
    return { loginError: null, token: token };
  } catch (error) {
    const err = new Error("Usuário não cadastrado no SAP ou inativo.");
    err.status = 401;
    err.context = "login_ctrl";
    err.information = {};
    err.information.usuario = usuario;
    err.information.trace = error;
    return { loginError: err, token: null };
  }
};

module.exports = controller;
