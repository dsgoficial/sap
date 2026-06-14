'use strict'

const express = require('express')

const { schemaValidation, asyncHandler, httpCode } = require('../utils')

const { verifyLogin, verifyAdmin } = require('../login')

const microcontroleCtrl = require('./microcontrole_ctrl')
const microcontroleSchema = require('./microcontrole_schema')

const router = express.Router()

router.get(
  '/tipo_monitoramento',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await microcontroleCtrl.getTipoMonitoramento()

    const msg = 'Tipo de monitoramento retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/tipo_operacao',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await microcontroleCtrl.getTipoOperacao()

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
      req.usuarioId,
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
      req.usuarioId,
      req.body.dados
    )

    const msg = 'Informações de tela armazenadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/microcontrole/feicao/resumo:
 *   get:
 *     summary: Retorna o resumo de producao de feicao (microcontrole)
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Microcontrole
 *     parameters:
 *       - in: query
 *         name: lote_id
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID do lote (ausente = todos os lotes)
 *       - in: query
 *         name: data_inicio
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Inicio do periodo (default ultimos 30 dias)
 *       - in: query
 *         name: data_fim
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fim do periodo (default agora)
 *     responses:
 *       200:
 *         description: Resumo de feicao retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get(
  '/feicao/resumo',
  verifyAdmin,
  schemaValidation({ query: microcontroleSchema.resumoFeicaoQuery }),
  asyncHandler(async (req, res, next) => {
    const dados = await microcontroleCtrl.getResumoFeicao(
      req.query.lote_id,
      req.query.data_inicio,
      req.query.data_fim
    )

    const msg = 'Resumo de feicao retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/microcontrole/tela/cobertura:
 *   get:
 *     summary: Retorna a cobertura de tela como GeoJSON FeatureCollection
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Microcontrole
 *     parameters:
 *       - in: query
 *         name: lote_id
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID do lote (ausente = todos os lotes)
 *       - in: query
 *         name: usuario_id
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID do usuario (ausente = todos os usuarios)
 *       - in: query
 *         name: data_inicio
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Inicio do periodo (default ultimos 30 dias)
 *       - in: query
 *         name: data_fim
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fim do periodo (default agora)
 *     responses:
 *       200:
 *         description: Cobertura de tela retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get(
  '/tela/cobertura',
  verifyAdmin,
  schemaValidation({ query: microcontroleSchema.coberturaTelaQuery }),
  asyncHandler(async (req, res, next) => {
    const dados = await microcontroleCtrl.getCoberturaTela(
      req.query.lote_id,
      req.query.usuario_id,
      req.query.data_inicio,
      req.query.data_fim
    )

    const msg = 'Cobertura de tela retornada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/microcontrole/tela/aproveitamento:
 *   get:
 *     summary: Retorna o aproveitamento diario de tela de um usuario
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Microcontrole
 *     parameters:
 *       - in: query
 *         name: usuario_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuario
 *       - in: query
 *         name: data_inicio
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial (YYYY-MM-DD, default ultimos 30 dias)
 *       - in: query
 *         name: data_fim
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final (YYYY-MM-DD, inclusive)
 *     responses:
 *       200:
 *         description: Aproveitamento de tela retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
router.get(
  '/tela/aproveitamento',
  verifyAdmin,
  schemaValidation({ query: microcontroleSchema.aproveitamentoTelaQuery }),
  asyncHandler(async (req, res, next) => {
    const dados = await microcontroleCtrl.getAproveitamentoTela(
      req.query.usuario_id,
      req.query.data_inicio,
      req.query.data_fim
    )

    const msg = 'Aproveitamento de tela retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/configuracao/perfil_monitoramento',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await microcontroleCtrl.getPerfilMonitoramento()

    const msg = 'Perfil monitoramento retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.delete(
  '/configuracao/perfil_monitoramento',
  verifyAdmin,
  schemaValidation({
    body: microcontroleSchema.perfilMonitoramentoOperadorIds
  }),
  asyncHandler(async (req, res, next) => {
    await microcontroleCtrl.deletePerfilMonitoramento(req.body.perfis_monitoramento_ids)

    const msg = 'Perfil monitoramento deletado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.post(
  '/configuracao/perfil_monitoramento',
  verifyAdmin,
  schemaValidation({
    body: microcontroleSchema.perfilMonitoramento
  }),
  asyncHandler(async (req, res, next) => {
    await microcontroleCtrl.criaPerfilMonitoramento(req.body.perfis_monitoramento)

    const msg = 'Perfis monitoramento criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/configuracao/perfil_monitoramento',
  verifyAdmin,
  schemaValidation({
    body: microcontroleSchema.perfilMonitoramentoAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await microcontroleCtrl.atualizaPerfilMonitoramento(req.body.perfis_monitoramento)

    const msg = 'Perfis monitoramento atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

module.exports = router
