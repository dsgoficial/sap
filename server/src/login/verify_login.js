'use strict'

const { AppError, asyncHandler, httpCode } = require('../utils')

const { db } = require('../database')

const validateToken = require('./validate_token')

// middleware para verificar o JWT
const verifyLogin = asyncHandler(async (req, res, next) => {
  // Token via header authorization; fallback para query string `token` —
  // necessário para tiles MVT (MapLibre busca tiles sem header de auth).
  const token = req.headers.authorization || req.query.token

  const decoded = await validateToken(token)

  if (!('id' in decoded && decoded.id && 'uuid' in decoded && decoded.uuid)) {
    throw new AppError('Falta informação de usuário')
  }

  if (req.params.usuario_uuid && decoded.uuid !== req.params.usuario_uuid) {
    throw new AppError(
      'Usuário só pode acessar sua própria informação',
      httpCode.Unauthorized
    )
  }
  const response = await db.sapConn.oneOrNone(
    'SELECT ativo FROM dgeo.usuario WHERE uuid = $<usuarioUuid>',
    { usuarioUuid: decoded.uuid }
  )
  // null-check: usuário removido/inexistente com token ainda válido não deve
  // estourar TypeError (500) — negamos o acesso de forma limpa.
  if (!response || !response.ativo) {
    throw new AppError('Usuário não está ativo', httpCode.Forbidden)
  }

  req.usuarioUuid = decoded.uuid
  req.usuarioId = decoded.id

  next()
})

module.exports = verifyLogin
