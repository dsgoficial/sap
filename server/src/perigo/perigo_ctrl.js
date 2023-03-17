'use strict'
const fs = require('fs');
const util = require('util');
const path = require('path');

const readFile = util.promisify(fs.readFile);

const { db } = require('../database')

const { AppError, httpCode } = require('../utils')

const controller = {}

controller.limpaAtividades = async usuarioId => {
  const result = db.sapConn.result(
    `UPDATE macrocontrole.atividade
    SET usuario_id = NULL, data_inicio = NULL, data_fim = NULL, tipo_situacao_id = 1
    WHERE usuario_id = $<usuarioId>`,
    { usuarioId }
  )

  if (!result.rowCount || result.rowCount == 0) {
    throw new AppError(
      'Usuário não encontrado ou o usuário não possue atividades relacionadas',
      httpCode.BadRequest
    )
  }
}

controller.limpaLog = async() => {
  const logDir = path.join(__dirname, '..', '..', 'logs/combined.log')
  const daysToShow = 3
  const cutofftimestamp = new Date(Date.now() - daysToShow * 24 * 60 * 60 * 1000);

  let fileData = await readFile(logDir, 'utf8')

  let logData = fileData.split('\n').filter(entry => {
    const logDate = new Date(entry.split('|')[0])
    return logDate > cutofftimestamp
  }).join('\n')
  
  fs.writeFileSync(logDir, logData);

}

module.exports = controller
