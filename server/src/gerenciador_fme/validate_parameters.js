'use strict'

const { AppError, httpCode, httpClient } = require('../utils')

const { db } = require('../database')

const verifyParameters = parameters => {
  const possibleParameters = [
    'dbname',
    'dbhost',
    'dbport',
    'dbarea',
    'dbuser',
    'dbpassword',
    'sapsubfase',
    'LOG_FILE'
  ]
  return parameters.every(p => possibleParameters.some(pp => p.includes(pp)))
}

const getRotinas = async servidorId => {
  const serverInfo = await db.sapConn.oneOrNone(
    `
      SELECT url FROM dgeo.gerenciador_fme WHERE id = $<servidorId>
    `,
    { servidorId }
  )
  if (!serverInfo) {
    throw new AppError(
      'Gerenciador do FME informado não está cadastrado no SAP.',
      httpCode.BadRequest
    )
  }
  try {
    const serverurl = `${serverInfo.servidor}:${serverInfo.porta}/api/rotinas`
    const response = await httpClient.get(serverurl)
    if (!response ||
      response.status !== 200 ||
      !('data' in response) ||
      !('dados' in response.data)) {
      throw new Error()
    }
    return response.data.dados
  } catch (e) {
    throw new AppError(
      'Erro ao se comunicar com o servidor do gerenciador do FME',
      null,
      e
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

  rotinas.forEach(r => {
    dadosServidores[r.servidor].forEach(v => {
      if (!verifyParameters(v.parametros)) {
        throw new AppError(
          `A rotina ${r.rotina} não é compatível com o SAP. Verifique seus parâmetros`,
          httpCode.BadRequest
        )
      }
    })
  })
  return true
}

module.exports = validadeParameters
