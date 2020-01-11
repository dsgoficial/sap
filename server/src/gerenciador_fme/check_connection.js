'use strict'

const axios = require('axios')

const { AppError } = require('../utils')

const checkFMEConnection = async (servidor, porta) => {
  try {
    const serverurl = `${servidor}:${porta}/api`
    const response = await axios.get(serverurl)

    if (!response ||
      response.status !== 200 ||
      !('data' in response) ||
      response.data.message !== 'Serviço do Gerenciador do FME operacional') {
      throw new Error()
    }
  } catch (e) {
    throw new AppError(
      'Erro ao se comunicar com o servidor do gerenciador do FME',
      null,
      e
    )
  }
}

module.exports = checkFMEConnection
