'use strict'

const express = require('express')

const { schemaValidation, asyncHandler, asyncHandlerWithQueue, httpCode } = require('../utils')

const { verifyLogin } = require('../login')

const producaoCtrl = require('./producao_ctrl')
const producaoSchema = require('./producao_schema')

const router = express.Router()

router.post(
  '/finaliza',
  verifyLogin,
  schemaValidation({ body: producaoSchema.finaliza }),
  asyncHandlerWithQueue(async (req, res, next) => {
    await producaoCtrl.finaliza(
      req.usuarioId,
      req.body.atividade_id,
      req.body.sem_correcao,
      req.body.alterar_fluxo,
      req.body.info_edicao,
      req.body.observacao_proxima_atividade
    )

    const msg = 'Atividade finalizada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.get(
  '/verifica',
  verifyLogin,
  asyncHandler(async (req, res, next) => {
    const dados = await producaoCtrl.verifica(req.usuarioId)
    const msg = dados
      ? 'Atividade em execução retornada'
      : 'Sem atividade em execução'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.post(
  '/inicia',
  verifyLogin,
  asyncHandlerWithQueue(async (req, res, next) => {
    const dados = await producaoCtrl.inicia(req.usuarioId)

    const msg = dados
      ? 'Atividade iniciada'
      : 'Sem atividades disponíveis para iniciar'

    const code = dados ? httpCode.Created : httpCode.BadRequest

    return res.sendJsonAndLog(true, msg, code, dados)
  })
)

router.post(
  '/problema_atividade',
  verifyLogin,
  schemaValidation({ body: producaoSchema.problemaAtividade }),
  asyncHandlerWithQueue(async (req, res, next) => {
    await producaoCtrl.problemaAtividade(
      req.body.atividade_id,
      req.body.tipo_problema_id,
      req.body.descricao,
      req.usuarioId
    )
    const msg = 'Problema de atividade reportado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.get(
  '/tipo_problema',
  verifyLogin,
  asyncHandler(async (req, res, next) => {
    const dados = await producaoCtrl.getTipoProblema()

    const msg = 'Tipos de problema retornado'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

module.exports = router
