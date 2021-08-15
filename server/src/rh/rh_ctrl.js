'use strict'

const { db } = require('../database')

const { AppError, httpCode } = require('../utils')

const controller = {}

controller.getTipoPerdaHr = async () => {
  return db.sapConn
    .any('SELECT code, nome FROM dominio.tipo_perda_recurso_humano')
}

controller.getDiasLogadosUsuario = async usuarioId => {
  return db.sapConn.any(
    `SELECT DISTINCT l.data_login::date AS dias_logados
    FROM acompanhamento.login AS l
    WHERE l.usuario_id = $<usuarioId>
    `,
    {usuarioId}
  )
}

module.exports = controller
