'use strict'

const express = require('express')
const { schemaValidation, asyncHandler, httpCode } = require('../utils')
const previsaoSchema = require('./previsao_schema')
const previsaoCtrl = require('./previsao_ctrl')

const router = express.Router()

/**
 * @swagger
 * /api/previsao/{atividadeId}:
 *   get:
 *     summary: Obtém previsão de prazo para uma atividade
 *     description: Retorna estimativa de conclusão baseada em histórico 2025
 *     tags:
 *       - previsao
 *     parameters:
 *       - in: path
 *         name: atividadeId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Previsão calculada com sucesso
 */
router.get(
  '/:atividadeId',
  schemaValidation({ params: previsaoSchema.atividadeIdParam }),
  asyncHandler(async (req, res, next) => {
    const dados = await previsaoCtrl.getPrevisao(req.params.atividadeId)
    return res.sendJsonAndLog(true, 'Previsão calculada com sucesso', httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/previsao/lote/{loteId}:
 *   get:
 *     summary: Obtém previsão de prazo para todas as subfases de um lote
 *     description: Retorna estimativa por subfase considerando pior caso (atividade mais lenta)
 *     tags:
 *       - previsao
 *     parameters:
 *       - in: path
 *         name: loteId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Previsão do lote calculada com sucesso
 */
router.get(
  '/lote/:loteId',
  schemaValidation({ params: previsaoSchema.loteIdParam }),
  asyncHandler(async (req, res, next) => {
    const dados = await previsaoCtrl.getPrevisaoLote(req.params.loteId)
    return res.sendJsonAndLog(true, 'Previsão do lote calculada com sucesso', httpCode.OK, dados)
  })
)

module.exports = router