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

router.get(
  '/lote_stats/:dataInicio/:dataFim',
  asyncHandler(async (req, res, next) => {
    const { dataInicio, dataFim } = req.params;
    const dados = await rhCtrl.getAllLoteStatsByDate(dataInicio, dataFim);
    const msg = 'Estatísticas de lote retornadas com sucesso';
    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.get(
  '/bloco_stats/:dataInicio/:dataFim',
  asyncHandler(async (req, res, next) => {
    const { dataInicio, dataFim } = req.params;
    const dados = await rhCtrl.getAllBlocksStatsByDate(dataInicio, dataFim);
    const msg = 'Estatísticas de bloco retornadas com sucesso';
    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
)

module.exports = router
