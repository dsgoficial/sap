'use strict'

const axios = require('axios')

const { AppError, httpCode } = require('../utils')

const { db } = require('../database')

const verifyParameters = parameters => {
  const possibleParameters = [
    'dbname',
    'dbhost',
    'dbport',
    'dbarea',
    'dbsubfase',
    'LOG_FILE'
  ]
  return parameters.every(p => possibleParameters.includes(p))
}

const getRotinas = async servidorId => {
  const serverInfo = db.sapConn.oneOrNone(
    `
      SELECT servidor, porta FROM dgeo.gerenciador_fme WHERE id = $<servidorId>
    `,
    { servidorId }
  )
  if (!servidorId) {
    throw new AppError(
      'Gerenciador do FME informado não está cadastrado no SAP.',
      httpCode.BadRequest
    )
  }
  try {
    const serverurl = `${serverInfo.servidor}:${serverInfo.porta}/workspaces/version?last=true`
    const response = await axios.get(serverurl)
    const test =
      !response ||
      response.status !== 200 ||
      !('data' in response) ||
      !('dados' in response.data)
    if (test) {
      throw new Error()
    }
    return response.data.dados
  } catch (e) {
    throw new AppError(
      'Erro ao se comunicar com o servidor do gerenciador do FME'
    )
  }
}

const validadeParameters = async rotinas => {
  const servidores = rotinas
    .map(c => c.servidor)
    .filter((v, i, array) => array.indexOf(v) === i)

  const dadosServidores = {}
  for (const s of servidores) {
    dadosServidores[s] = await getRotinas(s)
  }

  rotinas.forEach(e => {
    if (!verifyParameters(dadosServidores[e.servidor].parameters)) {
      throw new AppError(
        `A rotina ${e.rotina} não é compatível com o SAP. Verifique seus parâmetros`,
        httpCode.BadRequest
      )
    }
  })
}

module.exports = validadeParameters
