"use strict";

const db = require("./main_db");

const testDb = require("./test_db");

const { errorHandler } = require("../utils");

const crypto = require("crypto");

const {
  DB_USER,
  DB_PASSWORD,
} = require("../config");

const tempUserDbs = {};

const temporaryLogin = {};

const getDbInfo = async atividadeId => { 
  return await db.conn.oneOrNone(
    `SELECT bd.nome, bd.servidor, bd.porta FROM macrocontrole.atividade AS a
    INNER JOIN macrocontrole.unidade_trabalho AS ut
    ON ut.id = a.unidade_trabalho_id 
    INNER JOIN macrocontrole.banco_dados AS bd
    ON bd.id = ut.banco_dados_id
    WHERE a.id = $<atividadeId>`,
    { atividadeId }
  );
};

const getProdDbConnection = async (dbServer, dbPort, dbName) => {
  const connString = `postgres://${DB_USER}:${DB_PASSWORD}@${dbServer}:${dbPort}/${dbName}`;

  if (!(connString in tempUserDbs)) {
    tempUserDbs[connString] = db.pgp(connString);

    tempUserDbs[connString].connect()
      .then(function (obj) {
        obj.done(); // success, release connection;
      })
      .catch(errorHandler);
  }

  return tempUserDbs[connString]
}

const getUserName = async usuarioId => { 
  const usuario = await db.conn.one(
    `SELECT translate(replace(lower(nome_guerra),' ', '_'),  
    'àáâãäéèëêíìïîóòõöôúùüûçÇ/-|/\\,.;:<>?!\`{}[]()~\`@#$%^&*+=''',  
    'aaaaaeeeeiiiiooooouuuucc________________________________') As nome from dgeo.usuario
    WHERE id = $<usuarioId>`,
    { usuarioId }
  );
  return usuario.nome
};

const checkUserIfExists = async (login, connection) => {
  const user = await connection.oneOrNone(
    `SELECT usename FROM pg_catalog.pg_user WHERE usename = $<login>`,
    { login }
  );
  if(user){
    return true;
  }
  return false;
};

const createDbUser = async (login, senha, connection) => {
  const validity = await connection.one(`SELECT now() + interval '5' day AS data`);

  await connection.none(
    `CREATE USER $<login:name> WITH LOGIN PASSWORD $<senha> VALID UNTIL $<validity>`,
    {
      login,
      senha,
      validity: validity.data
    }
  );
};

const updatePassword = async (login, senha, connection) => {
  return await connection.none(
    `ALTER USER $<login:name> WITH PASSWORD $<senha>`,
    {
      login,
      senha
    }
  );
};

const updateTempLogin = async (usuarioId, dbServer, dbPort, login, senha) => {
  await db.conn.tx(async t => {
    await t.none(
      `DELETE FROM dgeo.login_temporario
       WHERE usuario_id = $<usuarioId> AND servidor = $<dbServer> AND porta = $<dbPort>`,
      {
        usuarioId,
        dbServer,
        dbPort
      }
    );

    await t.none(
      `INSERT INTO dgeo.login_temporario(usuario_id, servidor, porta, login, senha)
    VALUES($<usuarioId>, $<dbServer>, $<dbPort>, $<login>, $<senha>)`,
      {
        usuarioId,
        dbServer,
        dbPort,
        login,
        senha
      }
    );
  })
}

const updateValidity = async (login, connection) => {

  const validity = await connection.one(`SELECT now() + interval '5' day AS data`);

  await connection.none(
    `ALTER USER $<login:name> VALID UNTIL $<validity>`,
    {
      login,
      validity: validity.data
    }
  );
};

const processTempUser = async (atividadeId, usuarioId, resetPassword, extendValidity) => {
  const dbInfo = await getDbInfo(atividadeId);
  if(!dbInfo){
    return null
  }
  const {servidor, porta, nome: nomeDb} = dbInfo
  
  const conn = await getProdDbConnection(servidor, porta, nomeDb);

  const loginInfo = await db.conn.oneOrNone(
    `SELECT login, senha FROM dgeo.login_temporario 
    WHERE usuario_id = $<usuarioId> AND servidor = $<servidor> AND porta = $<porta>`,
    { usuarioId, servidor, porta }
  );
  
  let login;
  let senha;
  const novaSenha = crypto.randomBytes(20).toString("hex");
  let updated = false;

  if(!loginInfo){
    const usuarioNome = await getUserName(usuarioId);
    login = `sap_${usuarioNome}`;
    senha = novaSenha;
  } else {
    login = loginInfo.login
    senha = loginInfo.senha;
  }
  const userExists = await checkUserIfExists(login, conn)
  if(!userExists){
    senha = novaSenha;
    updated = true;
    await createDbUser(login, senha, conn)
  }

  const userConnected = await testDb(login, senha, servidor, porta, nomeDb)
  if(!userConnected || resetPassword){
    senha = novaSenha;
    updated = true;
    await updatePassword(login, senha, conn)
  }

  if(extendValidity){
    await updateValidity(login, conn)
  }

  if(updated){
    await updateTempLogin(usuarioId, servidor, porta, login, senha)
  }

  return {login, senha};
};

temporaryLogin.resetPassword = async (atividadeId, usuarioId) => {
  return processTempUser(atividadeId, usuarioId, true, false)
}

temporaryLogin.getLogin = async (atividadeId, usuarioId, resetPassword = false) => {
  return processTempUser(atividadeId, usuarioId, resetPassword, true)
}

module.exports = temporaryLogin;
