'use strict'

const { asyncHandler } = require('../utils')

const validateToken = require('./validate_token')

// middleware para verificar o JWT
const verifyLogin = asyncHandler(async (req, res, next) => {
  // verifica o header authorization para pegar o token
  const token = req.headers.authorization

  const decoded = await validateToken(token)

  req.usuarioId = decoded.id
  next()
})

module.exports = verifyLogin
