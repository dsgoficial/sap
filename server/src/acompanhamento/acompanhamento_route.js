'use strict'

const express = require('express')

const { schemaValidation, asyncHandler, httpCode } = require('../utils')

const { verifyAdmin } = require('../login')

const acompanhamentoSchema = require('./acompanhamento_schema')
const acompanhamentoCtrl = require('./acompanhamento_ctrl')

const router = express.Router()

router.get(
  '/projetos',
  schemaValidation({
    params: acompanhamentoSchema.anoParam,
    query: acompanhamentoSchema.finalizadoQuery
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.getInfoProjetos(
      req.params.anoParam,
      req.query.finalizado
    )

    const msg = 'Informações dos projetos retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/projeto/:id/informacao_anual/:ano',
  schemaValidation({
    params: acompanhamentoSchema.anoParam,
    query: acompanhamentoSchema.finalizadoQuery
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.getInfoProjetos(
      req.params.anoParam,
      req.query.finalizado
    )

    const msg = 'Informações dos projetos retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/projeto/:id/informacao_detalhada',
  schemaValidation({
    params: acompanhamentoSchema.anoParam,
    query: acompanhamentoSchema.finalizadoQuery
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.getInfoProjetos(
      req.params.anoParam,
      req.query.finalizado
    )

    const msg = 'Informações dos projetos retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/projeto/:id/informacao_detalhada/:ano',
  schemaValidation({
    params: acompanhamentoSchema.anoParam,
    query: acompanhamentoSchema.finalizadoQuery
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.getInfoProjetos(
      req.params.anoParam,
      req.query.finalizado
    )

    const msg = 'Informações dos projetos retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/linha_producao/:id/:z/:x/:y.pbf',
  schemaValidation({
    params: acompanhamentoSchema.mvtParams
  }),
  asyncHandler(async (req, res, next) => {
    const tile = await acompanhamentoCtrl.getMvtLinhaProducao(
      req.params.id,
      req.params.x,
      req.params.y,
      req.params.z
    )

    res.setHeader('Content-Type', 'application/x-protobuf')
    if (tile.length === 0) {
      res.status(204)
    }
    res.send(tile)
  })
)

module.exports = router
