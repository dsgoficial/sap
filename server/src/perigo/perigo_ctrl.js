'use strict'

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

module.exports = controller
