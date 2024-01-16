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
