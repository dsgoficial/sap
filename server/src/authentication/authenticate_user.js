'use strict'

const { AppError, httpCode, httpClient } = require('../utils')

const { AUTH_SERVER } = require('../config')

const authorization = async (usuario, senha, aplicacao) => {
  const server = `${AUTH_SERVER}/api/login`
  try {
    const response = await httpClient.post(server, {
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
      err.response &&
      err.response.data &&
      err.response.data.message
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
