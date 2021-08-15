'use strict'

const express = require('express')

const { schemaValidation, asyncHandler, httpCode } = require('../utils')

const { verifyLogin } = require('../login')

const microcontroleCtrl = require('./microcontrole_ctrl')
const microcontroleSchema = require('./microcontrole_schema')

const router = express.Router()

router.get(
  '/tipo_monitoramento',
  asyncHandler(async (req, res, next) => {
    const dados = await rhCtrl.getTipoMonitoramento()

    const msg = 'Tipo de monitoramento retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/tipo_operacao',
  asyncHandler(async (req, res, next) => {
    const dados = await rhCtrl.getTipoOperacao()

    const msg = 'Tipo de operação retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.post(
  '/feicao',
  verifyLogin,
  schemaValidation({ body: microcontroleSchema.feicao }),
  asyncHandler(async (req, res, next) => {
    await microcontroleCtrl.armazenaFeicao(
      req.body.atividade_id,
      req.body.usuario_id,
      req.body.data,
      req.body.dados
    )

    const msg = 'Informações de produção de feição armazenadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.post(
  '/tela',
  verifyLogin,
  schemaValidation({ body: microcontroleSchema.tela }),
  asyncHandler(async (req, res, next) => {
    await microcontroleCtrl.armazenaTela(
      req.body.atividade_id,
      req.body.usuario_id,
      req.body.dados
    )

    const msg = 'Informações de tela armazenadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.post(
  '/comportamento',
  verifyLogin,
  schemaValidation({ body: microcontroleSchema.comportamento }),
  asyncHandler(async (req, res, next) => {
    await microcontroleCtrl.armazenaComportamento(
      req.body.atividade_id,
      req.body.usuario_id,
      req.body.dados
    )

    const msg = 'Informações de ação armazenadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

module.exports = router
