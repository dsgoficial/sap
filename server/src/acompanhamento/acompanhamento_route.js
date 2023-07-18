'use strict'

const express = require('express')

const { schemaValidation, asyncHandler, httpCode } = require('../utils')

const { verifyAdmin } = require('../login')

const acompanhamentoSchema = require('./acompanhamento_schema')
const acompanhamentoCtrl = require('./acompanhamento_ctrl')

const router = express.Router()

router.get(
  '/informacoes/:lote/:subfase',
  schemaValidation({
    params: acompanhamentoSchema.loteSubfaseParams
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.getInfoSubfaseLote(
      req.params.lote,
      req.params.subfase
    )

    const msg = 'Informações da subfase retornada'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/informacoes/:lote',
  schemaValidation({
    params: acompanhamentoSchema.loteParams
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.getInfoLote(
      req.params.lote
    )

    const msg = 'Informações da subfase retornada'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/usuarios_sem_atividade',
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.usuariosSemAtividade(
    )

    const msg = 'Usuários sem atividade retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/ultimos_login',
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.ultimosLogin(
    )

    const msg = 'Últimos logins retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/usuarios_logados_hoje',
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.usuariosLogadosHoje(
    )

    const msg = 'Usuários logados hoje retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/usuarios_nao_logados_hoje',
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.usuariosNaoLogadosHoje(
    )

    const msg = 'Usuários não logados hoje retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/quantitativo_fila_distribuicao',
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.quantitativoFilaDistribuicao(
    )

    const msg = 'Quantitativo da fila de distribuição retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/quantitativo_atividades',
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.quantitativoAtividades(
    )

    const msg = 'Quantitativo de atividades retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/atividades_em_execucao',
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.atividadesEmExecucao(
    )

    const msg = 'Atividades em execução retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/ultimas_atividades_finalizadas',
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.ultimasAtividadesFinalizadas(
    )

    const msg = 'Ultimas atividade finalizadas retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/usuarios_sem_perfil',
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.usuariosSemPerfil(
    )

    const msg = 'Usuários sem perfil associado retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/grade_acompanhamento',
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.acompanhamentoGrade()

    const msg = 'Grades de acompanhamento retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/atividade_subfase',
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.atividadeSubfase()

    const msg = 'Dados de atividade por subfase retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/atividade_usuario',
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.atividadeUsuario()

    const msg = 'Dados de atividade por usuario retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/situacao_subfase',
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.situacaoSubfase()

    const msg = 'Dados de situação das subfases retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/pit/subfase/:anoParam',
  schemaValidation({
    params: acompanhamentoSchema.anoParam
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.getInfoSubfasePIT(
      req.params.anoParam
    )

    const msg = 'Informações do PIT retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/dados_site_acompanhamento',
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.getDadosSiteAcompanhamento()

    const archive = archiver('zip');
    archive.on('error', (err) => { throw err; });
    res.attachment('dados_acompanhamento.zip');
    archive.pipe(res);

    dados.forEach(d => {
      archive.append(JSON.stringify(d.dados), { name: d.nome });
    })

    archive.finalize();

  })
)

/*
router.get(
  '/projetos',
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

router.get(
  '/projeto/:id/informacao_anual/:ano',
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

router.get(
  '/projeto/:id/informacao_detalhada',
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

router.get(
  '/projeto/:id/informacao_detalhada/:ano',
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

router.get(
  '/linha_producao/:id/:z/:x/:y.pbf',
  schemaValidation({
    params: acompanhamentoSchema.mvtParams
  }),
  asyncHandler(async (req, res, next) => {
    const tile = await acompanhamentoCtrl.getMvtLinhaProducao(
      req.params.id,
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
*/
module.exports = router
