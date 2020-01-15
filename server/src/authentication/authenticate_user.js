'use strict'

const axios = require('axios')

const { AppError, httpCode } = require('../utils')

const { AUTH_SERVER } = require('../config')

const authorization = async (usuario, senha, aplicacao) => {
  const server = `${AUTH_SERVER}/api/login`
  try {
    const response = await axios.post(server, {
      usuario,
      senha,
      aplicacao
    })

    if (!response || response.status !== 201 || !('data' in response)) {
      throw new Error()
    }

    return response.data.success || false
  } catch (err) {
    if (
      'response' in err &&
      'data' in err.response &&
      'message' in err.response.data
    ) {
      throw new AppError(
        err.response.data.message,
        httpCode.BadRequest
      )
    } else {
      throw new AppError(
        'Erro ao se comunicar com o servidor de autenticação'
      )
    }
  }
}

module.exports = authorization
