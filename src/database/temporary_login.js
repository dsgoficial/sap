"use strict";

const uuid = require("uuid");

const db = require("./main_db");

const testDb = require("./test_db");

const temporaryLogin = {};

const getServerInfo = async atividadeId => {};

temporaryLogin.get = async (atividadeId, usuarioId) => {
  let loginInfo = await db.oneOrNone(
    `SELECT login, senha FROM dgeo.login_temporario 
    WHERE usuario_id = $<usuarioId> AND atividade_id = $<atividadeId>`,
    { usuarioId, atividadeId }
  );
  const validLogin =
    loginInfo && (await testDb(loginInfo.login, loginInfo.senha));

  if (!validLogin) {
    loginInfo = await temporaryLogin.create(usuarioId, atividadeId);
  }
  return loginInfo;
};

temporaryLogin.create = async (usuarioId, atividadeId) => {
  await temporaryLogin.destroy(usuarioId);

  const login = `${usuarioId}_${uuid.v4()}`;
  const senha = uuid.v4();

  await db.tx(async t => {
    const v = await t.one(`SELECT now() + interval '5' day AS validity`);

    await t.none(
      `CREATE USER $<login>:name WITH LOGIN PASSWORD $<senha> VALID UNTIL $<validity>`,
      {
        login,
        senha,
        validity: v.validity
      }
    );

    await t.none(
      `INSERT INTO dgeo.login_temporario(usuario_id, atividade_id, login, senha)
    VALUES($<usuarioId>, $<atividadeId>, $<login>, $<senha>)`,
      {
        usuarioId,
        atividadeId,
        login,
        senha
      }
    );
  });

  return { login, senha };
};

/**
 * Deleta usuários do banco postgres e do controle de logins temporários
 * @param {[number]|number} usuariosId - Array de ids de usuários ou somente um id de usuário
 * @param {object} [conn] - Conexão com o banco utilizada para deletar usuários
 */
temporaryLogin.destroy = async (usuariosId, conn = db) => {
  if (!Array.isArray(usuariosId)) usuariosId = [usuariosId];

  await conn.tx(async t => {
    //revoke all permissions

    const logins = await t.any(
      `SELECT login FROM dgeo.login_temporario 
      WHERE usuario_id IN ($<usuarioId>:csv)`,
      { usuariosId }
    );
    const dropLogin = [];

    logins.forEach(async l => {
      dropLogin.push(
        t.none(`DROP USER IF EXISTS $<login>:name`, { login: l.login })
      );
    });

    await t.batch(dropLogin);

    await t.any(
      `DELETE FROM dgeo.login_temporario WHERE usuario_id IN ($<usuariosId>)`,
      { usuariosId }
    );
  });
};

module.exports = temporaryLogin;
