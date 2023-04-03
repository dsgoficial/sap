'use strict'

const db = require('./db')

const {
  revokeAllPermissionsUser,
  grantPermissionsUser
} = require('./manage_permissions')

const crypto = require('crypto')

const temporaryLogin = {}

const getDbInfo = async atividadeId => {
  return db.sapConn.oneOrNone(
    `SELECT dp.configuracao_producao FROM macrocontrole.atividade AS a
    INNER JOIN macrocontrole.unidade_trabalho AS ut
    ON ut.id = a.unidade_trabalho_id 
    INNER JOIN macrocontrole.dado_producao AS dp
    ON dp.id = ut.dado_producao_id
    WHERE a.id = $<atividadeId> AND dp.tipo_dado_producao_id = 2`,
    { atividadeId }
  )
}

const getUserName = async usuarioId => {
  const usuario = await db.sapConn.one(
    `SELECT translate(replace(lower(nome_guerra),' ', '_'),  
    'àáâãäéèëêíìïîóòõöôúùüûçÇ/-|/\\,.;:<>?!\`{}[]()~\`@#$%^&*+=''',  
    'aaaaaeeeeiiiiooooouuuucc________________________________') As nome from dgeo.usuario
    WHERE id = $<usuarioId>`,
    { usuarioId }
  )
  return usuario.nome
}

const checkUserIfExists = async (login, connection) => {
  const user = await connection.oneOrNone(
    'SELECT usename FROM pg_catalog.pg_user WHERE usename = $<login>',
    { login }
  )
  if (user) {
    return true
  }
  return false
}

const createDbUser = async (login, senha, connection) => {
  const validity = await connection.one(
    "SELECT now() + interval '5' day AS data"
  )

  await connection.none(
    'CREATE USER $<login:name> WITH LOGIN PASSWORD $<senha> VALID UNTIL $<validity>',
    {
      login,
      senha,
      validity: validity.data
    }
  )
}

const updatePassword = async (login, senha, connection) => {
  return connection.none('ALTER USER $<login:name> WITH PASSWORD $<senha>', {
    login,
    senha
  })
}

const updateTempLogin = async (usuarioId, configuracao, login, senha) => {
  await db.sapConn.tx(async t => {
    await t.none(
      `DELETE FROM dgeo.login_temporario
       WHERE usuario_id = $<usuarioId> AND configuracao = $<configuracao>`,
      {
        usuarioId,
        configuracao
      }
    )

    await t.none(
      `INSERT INTO dgeo.login_temporario(usuario_id, configuracao, login, senha)
    VALUES($<usuarioId>, $<configuracao>, $<login>, $<senha>)`,
      {
        usuarioId,
        configuracao,
        login,
        senha
      }
    )
  })
}

const updateValidity = async (login, connection) => {
  const validity = await connection.one(
    "SELECT now() + interval '5' day AS data"
  )

  await connection.none('ALTER USER $<login:name> VALID UNTIL $<validity>', {
    login,
    validity: validity.data
  })
}

const processTempUser = async (
  atividadeId,
  usuarioId,
  { resetPassword, extendValidity, grantPermission }
) => {
  const dbInfo = await getDbInfo(atividadeId)
  if (!dbInfo) {
    return null
  }
  const { configuracao_producao} = dbInfo
  const servidor = configuracao_producao.split(':')[0]
  const porta = configuracao_producao.split(':')[1].split('/')[0]
  const nomeDb = configuracao_producao.split(':')[1].split('/')[1]
  const servidorPorta = `${servidor}:${porta}`

  const conn = await db.createAdminConn(servidor, porta, nomeDb, false)

  const loginInfo = await db.sapConn.oneOrNone(
    `SELECT login, senha FROM dgeo.login_temporario 
    WHERE usuario_id = $<usuarioId> AND configuracao = $<servidorPorta>`,
    { usuarioId, servidorPorta }
  )

  let login
  let senha
  const novaSenha = crypto.randomBytes(20).toString('hex')
  let updated = false

  if (!loginInfo) {
    const usuarioNome = await getUserName(usuarioId)
    login = `sap_${usuarioNome}`
    senha = novaSenha
  } else {
    login = loginInfo.login
    senha = loginInfo.senha
  }
  const userExists = await checkUserIfExists(login, conn)
  if (!userExists) {
    senha = novaSenha
    updated = true
    await createDbUser(login, senha, conn)
  }
  const userConnected = await db.testConn(
    login,
    senha,
    servidor,
    porta,
    nomeDb
  )

  if (!userConnected || resetPassword) {
    senha = novaSenha
    updated = true
    await updatePassword(login, senha, conn)
  }
  if (extendValidity) {
    await updateValidity(login, conn)
  }
  if (updated) {
    await updateTempLogin(usuarioId, servidorPorta, login, senha)
    await revokeAllPermissionsUser(login, conn)
    if (grantPermission) {
      await grantPermissionsUser(atividadeId, login, conn)
    }
  }
  return { login, senha }
}

const processTempUserFinaliza = async (
  atividadeId,
  usuarioId
) => {
  const dbInfo = await getDbInfo(atividadeId)
  if (!dbInfo) {
    return null
  }
  const { configuracao_producao} = dbInfo
  const servidor = configuracao_producao.split(':')[0]
  const porta = configuracao_producao.split(':')[1].split('/')[0]
  const nomeDb = configuracao_producao.split(':')[1].split('/')[1]
  const servidorPorta = `${servidor}:${porta}`

  const conn = await db.createAdminConn(servidor, porta, nomeDb, false)

  const loginInfo = await db.sapConn.oneOrNone(
    `SELECT login, senha FROM dgeo.login_temporario 
    WHERE usuario_id = $<usuarioId> AND configuracao = $<servidorPorta>`,
    { usuarioId, servidorPorta }
  )

  let login
  let senha =  crypto.randomBytes(20).toString('hex');

  if (!loginInfo) {
    const usuarioNome = await getUserName(usuarioId)
    login = `sap_${usuarioNome}`
  } else {
    login = loginInfo.login
  }

  const userExists = await checkUserIfExists(login, conn)

  if (!userExists) {
    await createDbUser(login, senha, conn)
  } else {
    await updatePassword(login, senha, conn)
  }
  await revokeAllPermissionsUser(login, conn)
}

const processTempUserAdmin = async (
  atividadeId,
  usuarioId
) => {
  const dbInfo = await getDbInfo(atividadeId)
  if (!dbInfo) {
    return null
  }
  const { configuracao_producao} = dbInfo
  const servidor = configuracao_producao.split(':')[0]
  const porta = configuracao_producao.split(':')[1].split('/')[0]
  const nomeDb = configuracao_producao.split(':')[1].split('/')[1]
  const servidorPorta = `${servidor}:${porta}`

  const conn = await db.createAdminConn(servidor, porta, nomeDb, false)

  const loginInfo = await db.sapConn.oneOrNone(
    `SELECT login, senha FROM dgeo.login_temporario 
    WHERE usuario_id = $<usuarioId> AND configuracao = $<servidorPorta>`,
    { usuarioId, servidorPorta }
  )

  let login
  let senha
  const novaSenha = crypto.randomBytes(20).toString('hex')

  if (!loginInfo) {
    const usuarioNome = await getUserName(usuarioId)
    login = `sap_${usuarioNome}`
    senha = novaSenha
  } else {
    login = loginInfo.login
    senha = loginInfo.senha
  }
  const userExists = await checkUserIfExists(login, conn)
  if (!userExists) {
    senha = novaSenha
    await createDbUser(login, senha, conn)
  }

  const userConnected = await db.testConn(
    login,
    senha,
    servidor,
    porta,
    nomeDb
  )

  if (!userConnected) {
    senha = novaSenha
    await updatePassword(login, senha, conn)
  }

  await updateValidity(login, conn)

  await grantPermissionsUser(atividadeId, login, conn)
  
  return { login, senha }
}


temporaryLogin.resetPassword = async (atividadeId, usuarioId) => {
  return processTempUserFinaliza(atividadeId, usuarioId);
}

temporaryLogin.getLoginAdmin = async (
  atividadeId,
  usuarioId
) => {
  return processTempUserAdmin(atividadeId, usuarioId)
}

temporaryLogin.getLogin = async (
  atividadeId,
  usuarioId,
  resetPassword = false
) => {
  return processTempUser(atividadeId, usuarioId, {
    resetPassword,
    extendValidity: true,
    grantPermission: true
  })
}

module.exports = temporaryLogin
