'use strict'

const { AppError, asyncHandler, httpCode } = require('../utils')

const validateToken = require('./validate_token')

// middleware para verificar o JWT
const verifyLogin = asyncHandler(async (req, res, next) => {
  // verifica o header authorization para pegar o token
  const token = req.headers.authorization

  const decoded = await validateToken(token)

  if (req.params.usuario_uuid && decoded.uuid !== req.params.usuario_uuid) {
    throw new AppError(
      'Usuário só pode acessar sua própria informação',
      httpCode.Unauthorized
    )
  }

  req.usuarioUuid = decoded.uuid
  next()
})

module.exports = verifyLogin
