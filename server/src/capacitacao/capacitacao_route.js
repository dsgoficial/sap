'use strict'
const express = require('express')
const { schemaValidation, asyncHandler, httpCode } = require('../utils')
const { verifyAdmin, verifyLogin } = require('../login')
const capacitacaoCtrl = require('./capacitacao_ctrl')
const capacitacaoSchema = require('./capacitacao_schema')
const router = express.Router()

router.use(verifyLogin)

router.get(
  '/situacao',
  asyncHandler(async (req, res, next) => {
    const dados = await capacitacaoCtrl.getSituacao()
    return res.sendJsonAndLog(true, 'Situações retornadas com sucesso', httpCode.OK, dados)
  })
)

router.get(
  '/tipos',
  asyncHandler(async (req, res, next) => {
    const dados = await capacitacaoCtrl.getTipos()
    return res.sendJsonAndLog(true, 'Tipos retornados com sucesso', httpCode.OK, dados)
  })
)

// Secoes 2.5 (ministrada) e 5.2 (recebida) do RPCMTec, ja separadas por tipo.
router.get(
  '/rpcmtec/:dataInicio/:dataFim',
  schemaValidation({ params: capacitacaoSchema.periodoParams }),
  asyncHandler(async (req, res, next) => {
    const { dataInicio, dataFim } = req.params
    const dados = await capacitacaoCtrl.getRPCMTec(dataInicio, dataFim)
    return res.sendJsonAndLog(true, 'Capacitações do RPCMTec retornadas com sucesso', httpCode.OK, dados)
  })
)

router.get(
  '/capacitacoes',
  asyncHandler(async (req, res, next) => {
    const dados = await capacitacaoCtrl.getCapacitacoes()
    return res.sendJsonAndLog(true, 'Capacitações retornadas com sucesso', httpCode.OK, dados)
  })
)

router.get(
  '/capacitacoes/:uuid',
  schemaValidation({ params: capacitacaoSchema.uuidParams }),
  asyncHandler(async (req, res, next) => {
    const dados = await capacitacaoCtrl.getCapacitacaoById(req.params.uuid)
    return res.sendJsonAndLog(true, 'Capacitação retornada com sucesso', httpCode.OK, dados)
  })
)

router.post(
  '/capacitacoes',
  verifyAdmin,
  schemaValidation({ body: capacitacaoSchema.capacitacao }),
  asyncHandler(async (req, res, next) => {
    await capacitacaoCtrl.criaCapacitacao(req.body.capacitacao)
    return res.sendJsonAndLog(true, 'Capacitação criada com sucesso', httpCode.Created)
  })
)

router.put(
  '/capacitacoes/:uuid',
  verifyAdmin,
  schemaValidation({ params: capacitacaoSchema.uuidParams, body: capacitacaoSchema.capacitacao }),
  asyncHandler(async (req, res, next) => {
    await capacitacaoCtrl.atualizaCapacitacao(req.params.uuid, req.body.capacitacao)
    return res.sendJsonAndLog(true, 'Capacitação atualizada com sucesso', httpCode.OK)
  })
)

router.delete(
  '/capacitacoes/:uuid',
  verifyAdmin,
  schemaValidation({ params: capacitacaoSchema.uuidParams }),
  asyncHandler(async (req, res, next) => {
    await capacitacaoCtrl.deletaCapacitacao(req.params.uuid)
    return res.sendJsonAndLog(true, 'Capacitação deletada com sucesso', httpCode.OK)
  })
)

module.exports = router
