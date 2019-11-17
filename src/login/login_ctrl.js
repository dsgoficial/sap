"use strict";

const jwt = require("jsonwebtoken");

const { db, testdb } = require("../database");
const { serializeError } = require("serialize-error");

const semver = require("semver");

const { JWT_SECRET } = require("../config");

const controller = {};

const verificaQGIS = async qgis => {
  const qgis_minimo = await db.oneOrNone(
    "SELECT versao_minima FROM dgeo.versao_qgis LIMIT 1"
  );
  if (qgis_minimo) {
    let qgis_wrong_version = true;
    if (
      qgis &&
      semver.gte(semver.coerce(qgis), semver.coerce(qgis_minimo.versao_minima))
    ) {
      qgis_wrong_version = false;
    }
    if (qgis_wrong_version) {
      const err = new Error(
        "Versão incorreta do QGIS. A seguinte versão é necessária: " +
          qgis_minimo.versao_minima
      );
      err.status = 401;
      err.context = "login_ctrl";
      err.information = { plugins };
      return { error: err };
    }
  }
  return { error: null };
};

const verificaPlugins = async plugins => {
  const plugins_minimos = await db.any(
    "SELECT nome, versao_minima FROM dgeo.plugin"
  );
  for (const i = 0; i < plugins_minimos.length; i++) {
    let notFound = true;
    if (plugins) {
      plugins.forEach(p => {
        if (
          p.nome === plugins_minimos[i].nome &&
          semver.gte(
            semver.coerce(p.versao),
            semver.coerce(plugins_minimos[i].versao_minima)
          )
        ) {
          notFound = false;
        }
      });
    }

    if (notFound) {
      const listplugins = [];
      plugins_minimos.forEach(pm => {
        listplugins.push(pm.nome + "-" + pm.versao_minima);
      });

      const err = new Error(
        "Plugins desatualizados ou não instalados. Os seguintes plugins são necessários: " +
          listplugins.join(", ")
      );
      err.status = 401;
      err.context = "login_ctrl";
      err.information = { plugins };
      return { error: err };
    }
  }

  return { error: null };
};

const gravaLogin = async usuario_id => {
  await db.any(
    `
      INSERT INTO acompanhamento.login(usuario_id, data_login) VALUES($1, now())
      `,
    [usuario_id]
  );
  return { error: null };
};

controller.login = async (usuario, senha, plugins, qgis) => {
  const verifycon = await testdb(usuario, senha);
  if (!verifycon) {
    //throw error
    const err = new Error("Usuário ou senha inválida.");
    err.status = 401;
    err.context = "login_ctrl";
    err.information = {};
    err.information.usuario = usuario;
    return { error: err, token: null, administrador: null };
  }

  const {
    id,
    administrador
  } = await db.oneOrNone(
    "SELECT id, administrador FROM dgeo.usuario WHERE login = $1 and ativo IS TRUE",
    [usuario]
  );
  //Check if user exists then throw error

  await verificaQGIS(plugins, qgis);

  await verificaPlugins(plugins, qgis);

  jwt.sign({ id, administrador }, JWT_SECRET, {
    expiresIn: "10h"
  }, (err, token) => {
    if(err){
      //throw error
    }

    await gravaLogin(id);

    return { token, administrador };
  });
};

module.exports = controller;
