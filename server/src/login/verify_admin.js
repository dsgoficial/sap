'use strict'

const { AppError, asyncHandler, httpCode } = require('../utils')

const { db } = require('../database')

const validateToken = require('./validate_token')

// middleware para verificar se o usuário é administrador
const verifyAdmin = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization

  const decoded = await validateToken(token)

  if (!('id' in decoded && decoded.id && 'uuid' in decoded && decoded.uuid)) {
    throw new AppError('Falta informação de usuário')
  }

  // null-check: oneOrNone pode retornar null (usuário inexistente/inativo) —
  // destructuring direto estouraria TypeError (500) em vez de 403.
  const usuario = await db.sapConn.oneOrNone(
    'SELECT administrador FROM dgeo.usuario WHERE id = $<usuarioId> and ativo IS TRUE',
    { usuarioId: decoded.id }
  )
  if (!usuario || !usuario.administrador) {
    throw new AppError(
      'Usuário necessita ser um administrador',
      httpCode.Forbidden
    )
  }
  req.usuarioUuid = decoded.uuid
  req.usuarioId = decoded.id
  req.administrador = true

  next()
})

module.exports = verifyAdmin
