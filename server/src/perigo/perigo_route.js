'use strict'

const express = require('express')

const { schemaValidation, asyncHandler, httpCode } = require('../utils')

const { verifyAdmin } = require('../login')

const perigoCtrl = require('./perigo_ctrl')
const perigoSchema = require('./perigo_schema')

const router = express.Router()

router.delete(
  '/atividades/usuario/:id',
  verifyAdmin,
  schemaValidation({
    params: perigoSchema.idParams
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await perigoCtrl.limpaAtividades(req.params.id)

    const msg = 'Atividades relacionadas ao usuários limpas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.delete(
  '/log',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await perigoCtrl.limpaLog()

    const msg = 'Log anterior a 3 dias deletado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

module.exports = router
