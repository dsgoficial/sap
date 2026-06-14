'use strict'
const express = require('express')
const { schemaValidation, asyncHandler, httpCode } = require('../utils')
const { verifyAdmin, verifyLogin } = require('../login')
const extraPitCtrl = require('./extra_pit_ctrl')
const extraPitSchema = require('./extra_pit_schema')
const router = express.Router()

router.use(verifyLogin)

// /situacao precisa vir ANTES de /:ano para nao ser capturado como :ano.
router.get(
  '/situacao',
  asyncHandler(async (req, res, next) => {
    const dados = await extraPitCtrl.getSituacao()
    return res.sendJsonAndLog(true, 'Situações retornadas com sucesso', httpCode.OK, dados)
  })
)

// Secao 2.6 do RPCMTec (Extra-PIT do ano).
router.get(
  '/:ano',
  schemaValidation({ params: extraPitSchema.anoParams }),
  asyncHandler(async (req, res, next) => {
    const dados = await extraPitCtrl.getByAno(req.params.ano)
    return res.sendJsonAndLog(true, 'Demandas Extra-PIT retornadas com sucesso', httpCode.OK, dados)
  })
)

router.post(
  '/',
  verifyAdmin,
  schemaValidation({ body: extraPitSchema.extraPit }),
  asyncHandler(async (req, res, next) => {
    await extraPitCtrl.criaExtraPit(req.body.extra_pit)
    return res.sendJsonAndLog(true, 'Demanda Extra-PIT criada com sucesso', httpCode.Created)
  })
)

router.put(
  '/:id',
  verifyAdmin,
  schemaValidation({ params: extraPitSchema.idParams, body: extraPitSchema.extraPit }),
  asyncHandler(async (req, res, next) => {
    await extraPitCtrl.atualizaExtraPit(req.params.id, req.body.extra_pit)
    return res.sendJsonAndLog(true, 'Demanda Extra-PIT atualizada com sucesso', httpCode.OK)
  })
)

router.delete(
  '/:id',
  verifyAdmin,
  schemaValidation({ params: extraPitSchema.idParams }),
  asyncHandler(async (req, res, next) => {
    await extraPitCtrl.deletaExtraPit(req.params.id)
    return res.sendJsonAndLog(true, 'Demanda Extra-PIT deletada com sucesso', httpCode.OK)
  })
)

module.exports = router
