'use strict'
const express = require('express')
const { schemaValidation, asyncHandler, httpCode } = require('../utils')
const { verifyAdmin, verifyLogin } = require('../login')
const pitNaoProducaoCtrl = require('./pit_nao_producao_ctrl')
const pitNaoProducaoSchema = require('./pit_nao_producao_schema')
const router = express.Router()

router.use(verifyLogin)

// As rotas de /execucao vem ANTES de /:ano e /:id para nao serem capturadas.

// Grid de lancamento de um mes (leitura).
router.get(
  '/execucao/:ano/:mes',
  schemaValidation({ params: pitNaoProducaoSchema.anoMesParams }),
  asyncHandler(async (req, res, next) => {
    const dados = await pitNaoProducaoCtrl.getExecucao(req.params.ano, req.params.mes)
    return res.sendJsonAndLog(true, 'Execução mensal retornada com sucesso', httpCode.OK, dados)
  })
)

// Salva (cria ou atualiza) o realizado de uma meta num mes.
router.post(
  '/execucao',
  verifyAdmin,
  schemaValidation({ body: pitNaoProducaoSchema.execucao }),
  asyncHandler(async (req, res, next) => {
    await pitNaoProducaoCtrl.salvaExecucao(req.body.execucao)
    return res.sendJsonAndLog(true, 'Execução mensal salva com sucesso', httpCode.OK)
  })
)

router.delete(
  '/execucao/:id',
  verifyAdmin,
  schemaValidation({ params: pitNaoProducaoSchema.idParams }),
  asyncHandler(async (req, res, next) => {
    await pitNaoProducaoCtrl.deletaExecucao(req.params.id)
    return res.sendJsonAndLog(true, 'Execução mensal deletada com sucesso', httpCode.OK)
  })
)

// Definicao das metas do PIT nao controladas pelo SAP (do ano).
router.get(
  '/:ano',
  schemaValidation({ params: pitNaoProducaoSchema.anoParams }),
  asyncHandler(async (req, res, next) => {
    const dados = await pitNaoProducaoCtrl.getByAno(req.params.ano)
    return res.sendJsonAndLog(true, 'Metas do PIT (nao-producao) retornadas com sucesso', httpCode.OK, dados)
  })
)

router.post(
  '/',
  verifyAdmin,
  schemaValidation({ body: pitNaoProducaoSchema.pit }),
  asyncHandler(async (req, res, next) => {
    await pitNaoProducaoCtrl.criaMeta(req.body.pit)
    return res.sendJsonAndLog(true, 'Meta do PIT (nao-producao) criada com sucesso', httpCode.Created)
  })
)

router.put(
  '/:id',
  verifyAdmin,
  schemaValidation({ params: pitNaoProducaoSchema.idParams, body: pitNaoProducaoSchema.pit }),
  asyncHandler(async (req, res, next) => {
    await pitNaoProducaoCtrl.atualizaMeta(req.params.id, req.body.pit)
    return res.sendJsonAndLog(true, 'Meta do PIT (nao-producao) atualizada com sucesso', httpCode.OK)
  })
)

router.delete(
  '/:id',
  verifyAdmin,
  schemaValidation({ params: pitNaoProducaoSchema.idParams }),
  asyncHandler(async (req, res, next) => {
    await pitNaoProducaoCtrl.deletaMeta(req.params.id)
    return res.sendJsonAndLog(true, 'Meta do PIT (nao-producao) deletada com sucesso', httpCode.OK)
  })
)

module.exports = router
