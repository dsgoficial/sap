'use strict'

const express = require('express')

const { schemaValidation, asyncHandler, httpCode } = require('../utils')

const { verifyAdmin } = require('../login')

const gerenciaCtrl = require('./gerencia_ctrl')
const gerenciaSchema = require('./gerencia_schema')

const router = express.Router()

router.get(
  '/projeto_qgis',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getProject()

    const msg = 'Projeto do QGIS retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/atividade/:id',
  verifyAdmin,
  schemaValidation({ params: gerenciaSchema.idParams }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getAtividade(
      req.params.id,
      req.usuarioId // gerenteId
    )

    const msg = dados ? 'Atividade retornada' : 'Atividade não encontrada'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/atividade/usuario/:id',
  verifyAdmin,
  schemaValidation({
    params: gerenciaSchema.idParams,
    query: gerenciaSchema.proximaQuery
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getAtividadeUsuario(
      req.params.id,
      req.query.proxima === 'true',
      req.usuarioId // gerenteId
    )
    const msg = dados ? 'Atividade retornada' : 'Usuário não possui atividade'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/perfil_producao',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getPerfilProducao()

    const msg = 'Perfis de produção retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)
router.put(
  '/perfil_producao',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.perfilProducaoAtualizacao }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.atualizaPerfilProducao(req.body.perfil_producao)

    const msg = 'Perfis de produção atualizados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)
router.post(
  '/perfil_producao',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.perfilProducao }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.criaPerfilProducao(req.body.perfil_producao)

    const msg = 'Perfis de produção criados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)
router.delete(
  '/perfil_producao',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.perfilProducaoIds }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.deletaPerfilProducao(req.body.perfil_producao_ids)

    const msg = 'Perfis de produção deletados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/perfil_bloco_operador',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getPerfilBlocoOperador()

    const msg = 'Perfis bloco operador retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.put(
  '/perfil_bloco_operador',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.perfilBlocoOperadorAtualizacao }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.atualizaPerfilBlocoOperador(req.body.perfil_bloco_operador)

    const msg = 'Perfis bloco operador atualizados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.post(
  '/perfil_bloco_operador',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.perfilBlocoOperador }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.criaPerfilBlocoOperador(req.body.perfil_bloco_operador)

    const msg = 'Perfis bloco operador criados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.delete(
  '/perfil_bloco_operador',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.perfilBlocoOperadorIds }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.deletaPerfilBlocoOperador(req.body.perfil_bloco_operador_ids)

    const msg = 'Perfis bloco operador deletados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/perfil_producao_operador',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getPerfilProducaoOperador()

    const msg = 'Perfis produção operador retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.put(
  '/perfil_producao_operador',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.perfilProducaoOperadorAtualizacao }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.atualizaPerfilProducaoOperador(req.body.perfil_producao_operador)

    const msg = 'Perfis produção operador atualizados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.post(
  '/perfil_producao_operador',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.perfilProducaoOperador }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.criaPerfilProducaoOperador(req.body.perfil_producao_operador)

    const msg = 'Perfis produção operador criados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)
router.delete(
  '/perfil_producao_operador',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.perfilProducaoOperadorIds }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.deletaPerfilProducaoOperador(req.body.perfil_producao_operador_ids)

    const msg = 'Perfis produção operador deletados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/perfil_producao_etapa',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getPerfilProducaoEtapa()

    const msg = 'Perfis produção etapa retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.put(
  '/perfil_producao_etapa',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.perfilProducaoEtapaAtualizacao }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.atualizaPerfilProducaoEtapa(req.body.perfil_producao_etapa)

    const msg = 'Perfis produção etapa atualizados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.post(
  '/perfil_producao_etapa',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.perfilProducaoEtapa }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.criaPerfilProducaoEtapa(req.body.perfil_producao_etapa)

    const msg = 'Perfis produção etapa criados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)
router.delete(
  '/perfil_producao_etapa',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.perfilProducaoEtapaIds }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.deletaPerfilProducaoEtapa(req.body.perfil_producao_etapa_ids)

    const msg = 'Perfis produção etapa deletados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/perfil_dificuldade_operador',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getPerfilDificuldadeOperador()

    const msg = 'Perfis dificuldade operador retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.put(
  '/perfil_dificuldade_operador',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.perfilDificuldadeOperadorAtualizacao }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.atualizaPerfilDificuldadeOperador(req.body.perfil_dificuldade_operador)

    const msg = 'Perfis dificuldade operador atualizados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.post(
  '/perfil_dificuldade_operador',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.perfilDificuldadeOperador }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.criaPerfilDificuldadeOperador(req.body.perfil_dificuldade_operador)

    const msg = 'Perfis dificuldade operador criados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)
router.delete(
  '/perfil_dificuldade_operador',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.perfilDificuldadeOperadorIds }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.deletaPerfilDificuldadeOperador(req.body.perfil_dificuldade_operador_ids)

    const msg = 'Perfis dificuldade operador deletados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.post(
  '/unidade_trabalho/disponivel',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.unidadeTrabalhoDisponivel }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.unidadeTrabalhoDisponivel(
      req.body.unidade_trabalho_ids,
      req.body.disponivel
    )

    const msg =
      'Atributo disponível das unidades de trabalho atualizado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.post(
  '/atividade/pausar',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.atividadePausar }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.pausaAtividade(req.body.unidade_trabalho_ids)

    const msg = 'Atividade pausada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.post(
  '/atividade/reiniciar',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.atividadeReiniciar }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.reiniciaAtividade(req.body.unidade_trabalho_ids)

    const msg = 'Atividade reiniciada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.post(
  '/atividade/voltar',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.atividadeVoltar }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.voltaAtividade(
      req.body.atividade_ids,
      req.body.manter_usuarios
    )

    const msg = 'Atividade voltou para etapa anterior com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.post(
  '/atividade/avancar',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.atividadeAvancar }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.avancaAtividade(
      req.body.atividade_ids,
      req.body.concluida
    )

    const msg = 'Atividade avançou para próxima etapa com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.post(
  '/fila_prioritaria',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.filaPrioritaria }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.criaFilaPrioritaria(
      req.body.atividade_ids,
      req.body.usuario_prioridade_id,
      req.body.prioridade
    )

    const msg = 'Fila prioritaria criada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.post(
  '/fila_prioritaria_grupo',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.filaPrioritariaGrupo }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.criaFilaPrioritariaGrupo(
      req.body.atividade_ids,
      req.body.perfil_producao_id,
      req.body.prioridade
    )

    const msg = 'Fila prioritaria grupo criada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/observacao',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.observacao }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.criaObservacao(
      req.body.atividade_ids,
      req.body.observacao_atividade,
      req.body.observacao_unidade_trabalho
    )

    const msg = 'Observação criada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.get(
  '/atividade/:id/observacao',
  verifyAdmin,
  schemaValidation({ params: gerenciaSchema.idParams }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getObservacao(req.params.id)

    const msg = 'Observações retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/view_acompanhamento',
  verifyAdmin,
  schemaValidation({
    query: gerenciaSchema.emAndamentoQuery
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getViewsAcompanhamento(
      req.query.em_andamento === 'true'
    )

    const msg = 'Views de acompanhamento retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.put(
  '/atividades/permissoes',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.redefinirPermissoes()

    const msg = 'Permissões das atividades em execução redefinidas'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.post(
  '/banco_dados/revogar_permissoes',
  verifyAdmin,
  schemaValidation({
    body: gerenciaSchema.bancoDados
  }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.revogarPermissoesDB(
      req.body.servidor,
      req.body.porta,
      req.body.banco
    )

    const msg = 'Permissões do banco revogadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

module.exports = router
