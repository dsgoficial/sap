'use strict'

const { db } = require('../database')

const { AppError, httpCode } = require('../utils')

const { getUsuariosAuth } = require('../authentication')

const controller = {}

controller.getUsuarios = async () => {
  return db.sapConn.any(`
  SELECT u.id, u.uuid, u.login, u.nome, u.tipo_posto_grad_id, tpg.nome_abrev AS tipo_posto_grad, 
  u.tipo_turno_id, tt.nome AS tipo_turno, u.nome_guerra, u.administrador, u.ativo
  FROM dgeo.usuario AS u
  INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
  INNER JOIN dominio.tipo_turno AS tt ON tt.code = u.tipo_turno_id
  `)
}

controller.atualizaUsuario = async (uuid, administrador, ativo) => {
  const result = await db.sapConn.result(
    'UPDATE dgeo.usuario SET administrador = $<administrador>, ativo = $<ativo> WHERE uuid = $<uuid>',
    {
      uuid,
      administrador,
      ativo
    }
  )

  if (!result.rowCount || result.rowCount !== 1) {
    throw new AppError('Usuário não encontrado', httpCode.BadRequest)
  }
}

controller.atualizaUsuarioLista = async usuarios => {
  const cs = new db.pgp.helpers.ColumnSet(['?uuid', 'ativo', 'administrador'])

  const query =
    db.pgp.helpers.update(usuarios, cs, { table: 'usuario', schema: 'dgeo' }, {
      tableAlias: 'X',
      valueAlias: 'Y'
    }) + 'WHERE Y.uuid::uuid = X.uuid'

  return db.sapConn.none(query)
}

controller.getUsuariosAuthServer = async cadastrados => {
  const usuariosAuth = await getUsuariosAuth()

  const usuarios = await db.sapConn.any('SELECT u.uuid FROM dgeo.usuario AS u')

  return usuariosAuth.filter(u => {
    return usuarios.map(r => r.uuid).indexOf(u.uuid) === -1
  })
}

controller.atualizaListaUsuarios = async () => {
  const usuariosAuth = await getUsuariosAuth()

  const cs = new db.pgp.helpers.ColumnSet(['?uuid', 'login', 'nome', 'nome_guerra', 'tipo_posto_grad_id', 'tipo_turno_id'])

  const query =
    db.pgp.helpers.update(usuariosAuth, cs, { table: 'usuario', schema: 'dgeo' }, {
      tableAlias: 'X',
      valueAlias: 'Y'
    }) + 'WHERE Y.uuid::uuid = X.uuid'

  return db.sapConn.none(query)
}

controller.criaListaUsuarios = async usuarios => {
  const usuariosAuth = await getUsuariosAuth()

  const usuariosFiltrados = usuariosAuth.filter(f => {
    return usuarios.indexOf(f.uuid) !== -1
  })

  const cs = new db.pgp.helpers.ColumnSet(
    [
      'uuid',
      'login',
      'nome',
      'nome_guerra',
      'tipo_posto_grad_id',
      'tipo_turno_id',
      { name: 'ativo', init: () => true },
      { name: 'administrador', init: () => false }
    ]
  )

  const query = db.pgp.helpers.insert(usuariosFiltrados, cs, { table: 'usuario', schema: 'dgeo' })

  return db.sapConn.none(query)
}

module.exports = controller
