'use strict'

const jwt = require('jsonwebtoken')

const {
  AppError,
  httpCode,
  config: { JWT_SECRET }
} = require('../utils')

const decodeJwt = (token, secret) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        reject(
          new AppError('Falha ao autenticar token', httpCode.BadRequest, err)
        )
      }
      resolve(decoded)
    })
  })
}

const validateToken = async token => {
  if (!token) {
    throw new AppError('Nenhum token fornecido', httpCode.Unauthorized)
  }
  if (token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length)
  }

  return decodeJwt(token, JWT_SECRET)
}

module.exports = validateToken
