'use strict'

const express = require('express')

const { schemaValidation, asyncHandler, httpCode } = require('../utils')

const { verifyAdmin } = require('../login')

const rhCtrl = require('./rh_ctrl')
const rhSchema = require('./rh_schema')

const router = express.Router()

// --- Estatisticas de producao (acompanhamento / Secao 2.1 do RPCMTec) ---

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
  verifyAdmin,
  schemaValidation({
    params: rhSchema.getAtividadesPorPeriodoParams
  }),
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
  verifyAdmin,
  schemaValidation({
    params: rhSchema.getAtividadesPorPeriodoParams
  }),
  asyncHandler(async (req, res, next) => {
    const { dataInicio, dataFim } = req.params;
    const dados = await rhCtrl.getAllLoteStatsByDate(dataInicio, dataFim);
    const msg = 'Estatísticas de lote retornadas com sucesso';
    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.get(
  '/bloco_stats/:dataInicio/:dataFim',
  verifyAdmin,
  schemaValidation({
    params: rhSchema.getAtividadesPorPeriodoParams
  }),
  asyncHandler(async (req, res, next) => {
    const { dataInicio, dataFim } = req.params;
    const dados = await rhCtrl.getAllBlocksStatsByDate(dataInicio, dataFim);
    const msg = 'Estatísticas de bloco retornadas com sucesso';
    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
)

// --- Aproveitamento do efetivo (Secao 5.1 do RPCMTec): retrato mensal ---

// 5.1 de um mes (leitura e base de edicao).
router.get(
  '/aproveitamento/:ano/:mes',
  verifyAdmin,
  schemaValidation({ params: rhSchema.anoMesParams }),
  asyncHandler(async (req, res, next) => {
    const dados = await rhCtrl.getAproveitamento(req.params.ano, req.params.mes)
    return res.sendJsonAndLog(
      true, 'Aproveitamento do efetivo retornado com sucesso', httpCode.OK, dados)
  })
)

// Copia o mes anterior para o mes informado (preenchimento rapido).
router.post(
  '/aproveitamento/copiar',
  verifyAdmin,
  schemaValidation({ body: rhSchema.copiarMes }),
  asyncHandler(async (req, res, next) => {
    const dados = await rhCtrl.copiarMesAnterior(req.body.ano, req.body.mes)
    return res.sendJsonAndLog(true, 'Mês anterior copiado com sucesso', httpCode.OK, dados)
  })
)

// Inicia o mes a partir do efetivo ativo atual.
router.post(
  '/aproveitamento/iniciar',
  verifyAdmin,
  schemaValidation({ body: rhSchema.copiarMes }),
  asyncHandler(async (req, res, next) => {
    const dados = await rhCtrl.iniciarDoEfetivo(req.body.ano, req.body.mes)
    return res.sendJsonAndLog(true, 'Mês iniciado a partir do efetivo', httpCode.OK, dados)
  })
)

router.post(
  '/aproveitamento',
  verifyAdmin,
  schemaValidation({ body: rhSchema.aproveitamento }),
  asyncHandler(async (req, res, next) => {
    await rhCtrl.criarLinha(req.body.aproveitamento)
    return res.sendJsonAndLog(true, 'Linha de aproveitamento criada com sucesso', httpCode.Created)
  })
)

router.put(
  '/aproveitamento/:id',
  verifyAdmin,
  schemaValidation({ params: rhSchema.idParams, body: rhSchema.aproveitamentoUpdate }),
  asyncHandler(async (req, res, next) => {
    await rhCtrl.atualizaLinha(req.params.id, req.body.aproveitamento)
    return res.sendJsonAndLog(true, 'Linha de aproveitamento atualizada com sucesso', httpCode.OK)
  })
)

router.delete(
  '/aproveitamento/:id',
  verifyAdmin,
  schemaValidation({ params: rhSchema.idParams }),
  asyncHandler(async (req, res, next) => {
    await rhCtrl.deletaLinha(req.params.id)
    return res.sendJsonAndLog(true, 'Linha de aproveitamento deletada com sucesso', httpCode.OK)
  })
)

module.exports = router
