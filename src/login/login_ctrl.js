"use strict";

const jwt = require("jsonwebtoken");

const { db, testdb } = require("../database");

const semver = require("semver");

const { JWT_SECRET } = require("../config");

const { AppError } = require("../utils");

const controller = {};

const verificaQGIS = async qgis => {
  const qgis_minimo = await db.oneOrNone(
    `SELECT versao_minima FROM dgeo.versao_qgis LIMIT 1`
  );
  if(!qgis_minimo){
    return null
  }
  let qgis_version_ok = qgis &&
  semver.gte(semver.coerce(qgis), semver.coerce(qgis_minimo.versao_minima));

  if (!qgis_version_ok) {
    throw new AppError("Versão incorreta do QGIS. A seguinte versão é necessária: " +
    qgis_minimo.versao_minima, 401);
  }
};

const verificaPlugins = async plugins => {
  const plugins_minimos = await db.any(
    `SELECT nome, versao_minima FROM dgeo.plugin`
  );
  if(!plugins_minimos){
    return null;
  }
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
      throw new AppError("Plugins desatualizados ou não instalados. Os seguintes plugins são necessários: " +
      listplugins.join(", "));
    }
  }
};

const gravaLogin = async usuario_id => {
  await db.any(
    `
      INSERT INTO acompanhamento.login(usuario_id, data_login) VALUES($<usuario_id>, now())
      `,
    {usuario_id}
  );
};

const signJWT = (data, secret) => {
  return new Promise((resolve, reject) => {
    jwt.sign(data, secret, {
      expiresIn: "10h"
    }, (err, token) => {
      if(err){
        reject(new AppError("Erro durante a assinatura do token", null, err))
      }
      resolve(token)
    });
  })
};

controller.login = async (usuario, senha, plugins, qgis) => {
  const verifycon = await testdb(usuario, senha);
  if (!verifycon) {
    throw new AppError("Usuário ou senha inválida", 401);
  }

  const usuarioDb = await db.oneOrNone(
    `SELECT id, administrador FROM dgeo.usuario WHERE login = $<usuario> and ativo IS TRUE`,
    {usuario}
  );
  if(!usuarioDb){
    throw new AppError("Usuário ou senha inválida", 401);
  }
  const {id, administrador} = usuarioDb;

  await verificaQGIS(qgis);

  await verificaPlugins(plugins);

  const token = await signJWT({ id, administrador }, JWT_SECRET);

  await gravaLogin(id);

  return { token, administrador };
};

module.exports = controller;
