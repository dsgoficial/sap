"use strict";

const jwt = require("jsonwebtoken");
const semver = require("semver");

const { db, testdb } = require("../database");

const { JWT_SECRET } = require("../config");

const { AppError, httpCode } = require("../utils");

const controller = {};

const verificaQGIS = async qgis => {
  const qgisMinimo = await db.oneOrNone(
    `SELECT versao_minima FROM dgeo.versao_qgis LIMIT 1`
  );
  if (!qgisMinimo) {
    return;
  }
  let qgisVersionOk =
    qgis &&
    semver.gte(semver.coerce(qgis), semver.coerce(qgisMinimo.versao_minima));

  if (!qgisVersionOk) {
    throw new AppError(
      "Versão incorreta do QGIS. A seguinte versão é necessária: " +
        qgisMinimo.versao_minima,
      httpCode.BadRequest
    );
  }
};

const verificaPlugins = async plugins => {
  const pluginsMinimos = await db.any(
    `SELECT nome, versao_minima FROM dgeo.plugin`
  );
  if (!pluginsMinimos) {
    return;
  }
  for (const i = 0; i < pluginsMinimos.length; i++) {
    let notFound = true;
    if (plugins) {
      plugins.forEach(p => {
        if (
          p.nome === pluginsMinimos[i].nome &&
          semver.gte(
            semver.coerce(p.versao),
            semver.coerce(pluginsMinimos[i].versao_minima)
          )
        ) {
          notFound = false;
        }
      });
    }

    if (notFound) {
      const listplugins = [];
      pluginsMinimos.forEach(pm => {
        listplugins.push(pm.nome + "-" + pm.versao_minima);
      });
      throw new AppError(
        "Plugins desatualizados ou não instalados. Os seguintes plugins são necessários: " +
          listplugins.join(", "),
        httpCode.BadRequest
      );
    }
  }
};

const gravaLogin = async usuarioId => {
  await db.any(
    `
      INSERT INTO acompanhamento.login(usuario_id, data_login) VALUES($<usuario_id>, now())
      `,
    { usuarioId }
  );
};

const signJWT = (data, secret) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      data,
      secret,
      {
        expiresIn: "10h"
      },
      (err, token) => {
        if (err) {
          reject(new AppError("Erro durante a assinatura do token", null, err));
        }
        resolve(token);
      }
    );
  });
};

controller.login = async (usuario, senha, plugins, qgis) => {
  const verifycon = await testdb(usuario, senha);
  if (!verifycon) {
    throw new AppError("Usuário ou senha inválida", httpCode.Unauthorized);
  }

  const usuarioDb = await db.oneOrNone(
    `SELECT id, administrador FROM dgeo.usuario WHERE login = $<usuario> and ativo IS TRUE`,
    { usuario }
  );
  if (!usuarioDb) {
    throw new AppError("Usuário ou senha inválida", httpCode.Unauthorized);
  }
  const { id, administrador } = usuarioDb;

  await verificaQGIS(qgis);

  await verificaPlugins(plugins);

  const token = await signJWT({ id, administrador }, JWT_SECRET);

  await gravaLogin(id);

  return { token, administrador };
};

module.exports = controller;
