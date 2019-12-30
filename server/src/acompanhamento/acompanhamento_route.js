'use strict'

const express = require('express')

const { schemaValidation, asyncHandler, httpCode } = require('../utils')

const { verifyAdmin } = require('../login')

const acompanhamentoSchema = require('./acompanhamento_schema')
const acompanhamentoCtrl = require('./acompanhamento_ctrl')

const router = express.Router()

router.get(
  '/acao/usuario/:id',
  schemaValidation({
    params: acompanhamentoSchema.idParams,
    query: acompanhamentoSchema.diasQuery
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.getAcaoUsuario(
      req.params.id,
      req.query.dias
    )

    const msg = 'Ações por usuário retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/acao/em_execucao',
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.getAcaoEmExecucao()

    const msg = 'Ações de usuários com atividade em exeucução retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/linha_producao/:nome/:z/:x/:y.mvt',
  schemaValidation({
    params: acompanhamentoSchema.mvtParams
  }),
  asyncHandler(async (req, res, next) => {
    const tile = await acompanhamentoCtrl.getMvtLinhaProducao(
      req.params.nome,
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

router.get(
  '/perda_recurso_humano/:mes',
  schemaValidation({
    params: acompanhamentoSchema.mesParam
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.getPerdaRecursoHumano(
      req.params.mes
    )

    const msg = 'Informações de perda de recurso humano retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/tipo_perda_recurso_humano',
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.getTipoPerdaRecursoHumano()

    const msg = 'Tipos de perda de recurso humano retornados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.post(
  '/perda_recurso_humano',
  schemaValidation({
    body: acompanhamentoSchema.perdaRecursoHumano
  }),
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    await acompanhamentoCtrl.criaPerdaRecursoHumano(
      req.body.perda_recurso_humano
    )

    const msg = 'Informações de perda de recurso humano criadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.get(
  '/usuarios/dias_trabalhados/:mes',
  schemaValidation({
    params: acompanhamentoSchema.mesParam
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.getDiasTrabalhados(req.params.mes)

    const msg = 'Informações de dia trabalhos retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/projetos/:ano',
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

module.exports = router
