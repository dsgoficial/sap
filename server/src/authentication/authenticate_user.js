'use strict'

const axios = require('axios')

const {
  AppError,
  httpCode,
  config: { AUTH_SERVER }
} = require('../utils')

const authorization = async (usuario, senha) => {
  const server = AUTH_SERVER.endsWith('/')
    ? `${AUTH_SERVER}login`
    : `${AUTH_SERVER}/login`
  try {
    const response = await axios.post(server, {
      usuario,
      senha
    })

    if (!response || response.status !== 201 || !('data' in response)) {
      throw new Error()
    }

    return response.data.success || false
  } catch (e) {
    if ('response' in e && 'data' in e.response) {
      throw new AppError(
        e.response.data.message,
        e.response.status
      )
    }
    throw new AppError(
      'Erro ao se comunicar com o servidor de autenticação',
      httpCode.InternalError
    )
  }
}

module.exports = authorization
