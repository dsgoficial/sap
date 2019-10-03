"use strict";

const jwt = require("jsonwebtoken");

const { db, testdb } = require("../database");
const {serializeError} = require('serialize-error');

const semver = require("semver");

const controller = {};

const verificaPlugins = async (plugins, qgis) => {
  try {
    const qgis_minimo = await db.oneOrNone(
      "SELECT versao_minima FROM dgeo.versao_qgis LIMIT 1"
    );
    if(qgis_minimo){
      let qgis_wrong_version = true;
      if(qgis && semver.gte(semver.coerce(qgis), semver.coerce(qgis_minimo.versao_minima))){
        qgis_wrong_version = false;
      }
      if (qgis_wrong_version) {
        const err = new Error(
          "Versão incorreta do QGIS. A seguinte versão é necessária: " + qgis_minimo.versao_minima
        );
        err.status = 401;
        err.context = "login_ctrl";
        err.information = { plugins };
        return { error_plugin: err };
      } 
    }
    const plugins_minimos = await db.any(
      "SELECT nome, versao_minima FROM dgeo.plugin"
    );
    for (let i = 0; i < plugins_minimos.length; i++) {
      let notFound = true;
      if(plugins){
        plugins.forEach(p => {
          if (p.nome === plugins_minimos[i].nome && semver.gte(semver.coerce(p.versao), semver.coerce(plugins_minimos[i].versao_minima))) {
            notFound = false;
          }
        });
      }

      if (notFound) {
        let listplugins = []
        plugins_minimos.forEach(pm => {
          listplugins.push(pm.nome + '-' + pm.versao_minima )
        })
        
        const err = new Error(
          "Plugins desatualizados ou não instalados. Os seguintes plugins são necessários: " + listplugins.join(', ')
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

controller.login = async (usuario, senha, plugins, qgis) => {
  let verifycon = await testdb(usuario, senha);
  if (!verifycon) {
    const err = new Error("Usuário ou senha inválida.");
    err.status = 401;
    err.context = "login_ctrl";
    err.information = {};
    err.information.usuario = usuario;
    return { loginError: err, token: null, administrador: null };
  }

  try {
    const { id, administrador } = await db.one(
      "SELECT id, administrador FROM dgeo.usuario WHERE login = $1 and ativo IS TRUE",
      [usuario]
    );
    const token = jwt.sign({ id, administrador }, process.env.JWT_SECRET, {
      expiresIn: "10h"
    });

    let { error_plugin } = await verificaPlugins(plugins, qgis);
    if (error_plugin) {
      return { loginError: error_plugin, token: null, administrador: null };
    }

    let { error } = await gravaLogin(id);
    if (error) {
      return { loginError: error, token: null, administrador: null };
    }
    return { loginError: null, token, administrador };
  } catch (error) {
    const err = new Error("Usuário não cadastrado no SAP ou inativo.");
    err.status = 401;
    err.context = "login_ctrl";
    err.information = {};
    err.information.usuario = usuario;
    err.information.trace = serializeError(error)
    return { loginError: err, token: null, administrador: null };
  }
};

module.exports = controller;
