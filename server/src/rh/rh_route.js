'use strict'

const express = require('express')

const { schemaValidation, asyncHandler, httpCode } = require('../utils')

const { verifyAdmin } = require('../login')

const rhCtrl = require('./rh_ctrl')
const rhSchema = require('./rh_schema')

const router = express.Router()

router.get(
  '/tipo_perda_rh',
  asyncHandler(async (req, res, next) => {
    const dados = await rhCtrl.getTipoPerdaHr()

    const msg = 'Tipo perda de rh retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/dias_logados/usuario/:id',
  verifyAdmin,
  schemaValidation({
    params: rhSchema.idParams
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await rhCtrl.getDiasLogadosUsuario(req.params.id)

    const msg = 'Dias logados do usuario retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/atividades_por_periodo/:dataInicio/:dataFim',
  asyncHandler(async (req, res, next) => {
    const { dataInicio, dataFim} = req.params;
    const dados = await rhCtrl.getAtividadesPorPeriodo(dataInicio, dataFim);
    const msg = 'Atividades por período retornadas com sucesso';
    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.get(
  '/atividades_por_usuario_e_periodo/:usuarioId/:dataInicio/:dataFim',
  verifyAdmin,
  schemaValidation({
    params: rhSchema.getAtividadesPorUsuarioEPeriodoParams
  }),
  asyncHandler(async (req, res, next) => {
    const { usuarioId, dataInicio, dataFim } = req.params;
    const dados = await rhCtrl.getAtividadesPorUsuarioEPeriodo(usuarioId, dataInicio, dataFim);
    const msg = 'Atividades por usuário e período retornadas com sucesso';
    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

/**
 * @swagger
 * /api/rh/atividades_por_periodo:
 *   get:
 *     summary: Retorna atividades dentro de um período específico.
 *     description: |
 *       Retorna uma lista de atividades que ocorreram dentro de um período específico.
 *       Pode ser filtrada por nome do usuário e ordenada por diferentes campos.
 *     produces:
 *       - application/json
 *     tags:
 *       - RH
 *     parameters:
 *       - name: dataInicio
 *         in: query
 *       - name: dataFim
 *         in: query
 *     responses:
 *       200:
 *         description: Lista de atividades retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID da atividade.
 *                   etapa_id:
 *                     type: integer
 *                     description: ID da etapa associada.
 *                   unidade_trabalho_id:
 *                     type: integer
 *                     description: ID da unidade de trabalho.
 *                   usuario_id:
 *                     type: integer
 *                     description: ID do usuário.
 *                   tipo_situacao_id:
 *                     type: integer
 *                     description: ID do tipo de situação.
 *                   data_inicio:
 *                     type: string
 *                     format: date-time
 *                     description: Data de início da atividade.
 *                   data_fim:
 *                     type: string
 *                     format: date-time
 *                     description: Data de fim da atividade.
 *                   nome_usuario:
 *                     type: string
 *                     description: Nome do usuário associado à atividade.
 *                   bloco_id:
 *                     type: integer
 *                     description: ID do bloco associado à unidade de trabalho.
 *                   nome_bloco:
 *                     type: string
 *                     description: Nome do bloco associado à unidade de trabalho.
 *       400:
 *         description: Erro de validação nos parâmetros fornecidos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro.
 *       500:
 *         description: Erro interno no servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro.
 *
 */

module.exports = router
