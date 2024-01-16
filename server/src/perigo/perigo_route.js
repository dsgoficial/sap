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

router.get(
  '/propriedades_camada',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await perigoCtrl.getPropriedadesCamada()

    const msg = 'Propriedades da camada retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.delete(
  '/propriedades_camada',
  verifyAdmin,
  schemaValidation({
    body: perigoSchema.propriedadesCamadaIds
  }),
  asyncHandler(async (req, res, next) => {
    await perigoCtrl.deletePropriedadesCamada(req.body.propriedades_camada_ids)

    const msg = 'Propriedades da camada deletadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.post(
  '/propriedades_camada',
  verifyAdmin,
  schemaValidation({
    body: perigoSchema.propriedadesCamada
  }),
  asyncHandler(async (req, res, next) => {
    await perigoCtrl.criaPropriedadesCamada(req.body.propriedades_camada)

    const msg = 'Propriedades da camada criadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/propriedades_camada',
  verifyAdmin,
  schemaValidation({
    body: perigoSchema.propriedadesCamadaAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await perigoCtrl.atualizaPropriedadesCamada(req.body.propriedades_camada)

    const msg = 'Propriedades da camada atualizadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.get(
  '/insumo',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await perigoCtrl.getInsumo()

    const msg = 'Insumos retornados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.delete(
  '/insumo',
  verifyAdmin,
  schemaValidation({
    body: perigoSchema.insumoIds
  }),
  asyncHandler(async (req, res, next) => {
    await perigoCtrl.deleteInsumo(req.body.insumo_ids)

    const msg = 'Insumos deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.post(
  '/insumo',
  verifyAdmin,
  schemaValidation({
    body: perigoSchema.insumo
  }),
  asyncHandler(async (req, res, next) => {
    await perigoCtrl.criaInsumo(req.body.insumo)

    const msg = 'Insumos criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/insumo',
  verifyAdmin,
  schemaValidation({
    body: perigoSchema.insumoAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await perigoCtrl.atualizaInsumo(req.body.insumo)

    const msg = 'Insumos atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

module.exports = router
