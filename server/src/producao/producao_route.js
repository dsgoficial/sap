"use strict";

const express = require("express");

const {
  schemaValidation,
  asyncHandler,
  asyncHandlerWithQueue,
  httpCode,
} = require("../utils");

const { verifyLogin } = require("../login");

const producaoCtrl = require("./producao_ctrl");
const producaoSchema = require("./producao_schema");

const router = express.Router();

/**
 * @swagger
 * /api/distribuicao/plugin_path:
 *   get:
 *     summary: Retorna o caminho do plugin
 *     description: Retorna o caminho do plugin configurado no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - producao
 *     responses:
 *       200:
 *         description: Caminho do plugin retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 dados:
 *                   type: object
 *                   properties:
 *                     path:
 *                       type: string
 *                       description: Caminho do plugin
 */
router.get(
  "/plugin_path",
  asyncHandler(async (req, res, next) => {
    const dados = await producaoCtrl.getPluginPath();

    const msg = "Path plugin retornado com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  }),
);

/**
 * @swagger
 * /api/distribuicao/finaliza:
 *   post:
 *     summary: Finaliza uma atividade
 *     description: Finaliza uma atividade específica, com ou sem correção, e altera o fluxo se necessário.
 *     produces:
 *       - application/json
 *     tags:
 *       - producao
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FinalizaAtividade'
 *     responses:
 *       201:
 *         description: Atividade finalizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Erro ao finalizar atividade
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post(
  "/finaliza",
  verifyLogin,
  schemaValidation({ body: producaoSchema.finaliza }),
  asyncHandlerWithQueue(async (req, res, next) => {
    await producaoCtrl.finaliza(
      req.usuarioId,
      req.body.atividade_id,
      req.body.sem_correcao,
      req.body.alterar_fluxo,
      req.body.info_edicao,
      req.body.observacao_proxima_atividade,
      req.body.observacao_atividade,
    );

    const msg = "Atividade finalizada com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  }),
);

/**
 * @swagger
 * /api/distribuicao/verifica:
 *   get:
 *     summary: Verifica atividade em execução
 *     description: Verifica se há alguma atividade em execução para o usuário logado.
 *     produces:
 *       - application/json
 *     tags:
 *       - producao
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Atividade em execução retornada ou informação de que não há atividade em execução
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 dados:
 *                   type: object
 *                   description: Dados da atividade em execução (se houver)
 */
router.get(
  "/verifica",
  verifyLogin,
  asyncHandler(async (req, res, next) => {
    const dados = await producaoCtrl.verifica(req.usuarioId);
    const msg = dados
      ? "Atividade em execução retornada"
      : "Sem atividade em execução";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  }),
);

/**
 * @swagger
 * /api/distribuicao/inicia:
 *   post:
 *     summary: Inicia uma nova atividade
 *     description: Inicia uma nova atividade disponível para o usuário logado.
 *     produces:
 *       - application/json
 *     tags:
 *       - producao
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Atividade iniciada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 dados:
 *                   type: object
 *                   description: Dados da atividade iniciada
 *       400:
 *         description: Sem atividades disponíveis para iniciar
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post(
  "/inicia",
  verifyLogin,
  asyncHandlerWithQueue(async (req, res, next) => {
    const dados = await producaoCtrl.inicia(req.usuarioId);

    const msg = dados
      ? "Atividade iniciada"
      : "Sem atividades disponíveis para iniciar";

    const code = dados ? httpCode.Created : httpCode.BadRequest;

    return res.sendJsonAndLog(true, msg, code, dados);
  }),
);

/**
 * @swagger
 * /api/distribuicao/problema_atividade:
 *   post:
 *     summary: Reporta um problema em uma atividade
 *     description: Reporta um problema encontrado em uma atividade em execução e bloqueia a atividade.
 *     produces:
 *       - application/json
 *     tags:
 *       - producao
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProblemaAtividade'
 *     responses:
 *       201:
 *         description: Problema de atividade reportado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post(
  "/problema_atividade",
  verifyLogin,
  schemaValidation({ body: producaoSchema.problemaAtividade }),
  asyncHandlerWithQueue(async (req, res, next) => {
    await producaoCtrl.problemaAtividade(
      req.body.atividade_id,
      req.body.tipo_problema_id,
      req.body.descricao,
      req.body.polygon_ewkt,
      req.usuarioId,
    );
    const msg = "Problema de atividade reportado com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  }),
);

/**
 * @swagger
 * /api/distribuicao/finalizacao_incorreta:
 *   post:
 *     summary: Reporta finalização incorreta
 *     description: Reporta uma finalização incorreta de uma atividade, permitindo correção.
 *     produces:
 *       - application/json
 *     tags:
 *       - producao
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FinalizacaoIncorreta'
 *     responses:
 *       201:
 *         description: Finalização incorreta reportada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post(
  "/finalizacao_incorreta",
  verifyLogin,
  schemaValidation({ body: producaoSchema.finalizacaoIncorreta }),
  asyncHandler(async (req, res, next) => {
    await producaoCtrl.finalizacaoIncorreta(req.body.descricao, req.usuarioId);
    const msg = "Problema de finalização incorreta reportado com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  }),
);

/**
 * @swagger
 * /api/distribuicao/tipo_problema:
 *   get:
 *     summary: Retorna tipos de problema
 *     description: Retorna a lista de tipos de problema disponíveis para reportar em atividades.
 *     produces:
 *       - application/json
 *     tags:
 *       - producao
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Tipos de problema retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   tipo_problema_id:
 *                     type: integer
 *                     description: ID do tipo de problema
 *                   tipo_problema:
 *                     type: string
 *                     description: Descrição do tipo de problema
 */
router.get(
  "/tipo_problema",
  verifyLogin,
  asyncHandler(async (req, res, next) => {
    const dados = await producaoCtrl.getTipoProblema();

    const msg = "Tipos de problema retornado";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  }),
);

module.exports = router;
