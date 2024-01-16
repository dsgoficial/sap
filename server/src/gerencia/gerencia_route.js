'use strict'

const express = require('express')

const { schemaValidation, asyncHandler, httpCode, asyncHandlerWithQueue } = require('../utils')

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
  asyncHandlerWithQueue(async (req, res, next) => {
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
  asyncHandlerWithQueue(async (req, res, next) => {
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

router.post(
  '/unidade_trabalho/disponivel',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.unidadeTrabalhoDisponivel }),
  asyncHandlerWithQueue(async (req, res, next) => {
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
  asyncHandlerWithQueue(async (req, res, next) => {
    await gerenciaCtrl.pausaAtividade(req.body.unidade_trabalho_ids)

    const msg = 'Atividade pausada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.post(
  '/atividade/reiniciar',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.atividadeReiniciar }),
  asyncHandlerWithQueue(async (req, res, next) => {
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
  asyncHandlerWithQueue(async (req, res, next) => {
    await gerenciaCtrl.redefinirPermissoes()

    const msg = 'Permissões das atividades em execução redefinidas'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.put(
  '/refresh_views',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.refreshViews()

    const msg = 'Views atualizadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.post(
  '/banco_dados/revogar_permissoes',
  verifyAdmin,
  schemaValidation({
    body: gerenciaSchema.bancoDados
  }),
  asyncHandlerWithQueue(async (req, res, next) => {
    await gerenciaCtrl.revogarPermissoesDB(
      req.body.servidor,
      req.body.porta,
      req.body.banco
    )

    const msg = 'Permissões do banco revogadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.post(
  '/banco_dados/revogar_permissoes_usuario',
  verifyAdmin,
  schemaValidation({
    body: gerenciaSchema.bancoDadosUsuario
  }),
  asyncHandlerWithQueue(async (req, res, next) => {
    await gerenciaCtrl.revogarPermissoesDBUser(
      req.body.servidor,
      req.body.porta,
      req.body.banco,
      req.body_usuario_id
    )

    const msg = 'Permissões do usuário no banco revogadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)


router.get(
  '/versao_qgis',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getVersaoQGIS(
    )

    const msg = 'Versão QGIS retornada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.put(
  '/versao_qgis',
  verifyAdmin,
  schemaValidation({
    body: gerenciaSchema.versaoQGIS
  }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.atualizaVersaoQGIS(req.body.versao_minima)

    const msg = 'Versão QGIS atualizada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.get(
  '/plugins',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getPlugins()

    const msg = 'Plugins retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.post(
  '/plugins',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.plugins }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.gravaPlugins(req.body.plugins)

    const msg = 'Plugins gravados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/plugins',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.pluginsAtualizacao }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.atualizaPlugins(req.body.plugins)

    const msg = 'Plugins atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.delete(
  '/plugins',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.pluginsIds }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.deletaPlugins(req.body.plugins_ids)

    const msg = 'Plugins deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)


router.get(
  '/atalhos',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getAtalhos()

    const msg = 'Atalhos retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.post(
  '/atalhos',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.qgisShortcuts }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.gravaAtalhos(req.body.qgis_shortcuts, req.usuarioId)

    const msg = 'Atalhos gravados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/atalhos',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.qgisShortcutsAtualizacao }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.atualizaAtalhos(req.body.qgis_shortcuts, req.usuarioId)

    const msg = 'Atalhos atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.delete(
  '/atalhos',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.qgisShortcutsIds }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.deletaAtalhos(req.body.qgis_shortcuts_ids)

    const msg = 'Atalhos deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.get(
  '/problema_atividade',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getProblemaAtividade()

    const msg = 'Problema atividade retornada'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.put(
  '/problema_atividade',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.problemaAtividadeAtualizacao }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.atualizaProblemaAtividade(req.body.problema_atividade)

    const msg = 'Problema atividade atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/iniciar_modo_local',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.iniciaAtivModoLocal }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.iniciaAtividadeModoLocal(
      req.body.atividade_id,
      req.usuarioId
    )

    const msg = 'Atividade do modo local atualizadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.put(
  '/finalizar_modo_local',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.finalizaAtivModoLocal }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.finalizaAtividadeModoLocal(
      req.body.atividade_id,
      req.body.usuario_uuid,
      req.body.data_inicio,
      req.body.data_fim
    )

    const msg = 'Atividade do modo local atualizadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/relatorio_alteracao',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getRelatorioAlteracao()

    const msg = 'Relatório de alteração retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.post(
  '/relatorio_alteracao',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.relatorioAlteracao }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.gravaRelatorioAlteracao(req.body.relatorio_alteracao, req.usuarioId)

    const msg = 'Relatório de alteração gravados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/relatorio_alteracao',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.relatorioAlteracaoAtualizacao }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.atualizaRelatorioAlteracao(req.body.relatorio_alteracao, req.usuarioId)

    const msg = 'Relatório de alteração atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.delete(
  '/relatorio_alteracao',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.relatorioAlteracaoIds }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.deletaRelatorioAlteracao(req.body.relatorio_alteracao_ids)

    const msg = 'Relatório de alteração deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/unidade_trabalho/propriedades',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.propriedadesAtualizacao }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.atualizaPropriedadesUT(req.body.unidades_trabalho)

    const msg = 'Propriedades da UT atualizadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.get(
  '/plugin_path',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getPluginPath(
    )

    const msg = 'Plugin Path retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.put(
  '/plugin_path',
  verifyAdmin,
  schemaValidation({
    body: gerenciaSchema.pluginPath
  }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.atualizaPluginPath(req.body.plugin_path)

    const msg = 'Plugin Path atualizado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.get(
  '/pit',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getPit()

    const msg = 'PITs retornados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.delete(
  '/pit',
  verifyAdmin,
  schemaValidation({
    body: gerenciaSchema.pitIds
  }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.deletePit(req.body.pit_ids)

    const msg = 'PITs deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.post(
  '/pit',
  verifyAdmin,
  schemaValidation({
    body: gerenciaSchema.pit
  }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.criaPit(req.body.pit)

    const msg = 'PITs criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/pit',
  verifyAdmin,
  schemaValidation({
    body: gerenciaSchema.pitAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.atualizaPit(req.body.pit)

    const msg = 'PITs atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.get(
  '/alteracao_fluxo',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getAlteracaoFluxo()

    const msg = 'Alterações de fluxo retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.put(
  '/alteracao_fluxo',
  verifyAdmin,
  schemaValidation({
    body: gerenciaSchema.alteracaoFluxoAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.atualizaAlteracaoFluxo(req.body.alteracao_fluxo)

    const msg = 'Alterações de fluxo atualizadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.get(
  '/fila_prioritaria',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getFilaPrioritaria()

    const msg = 'Fila prioritária retornada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.delete(
  '/fila_prioritaria',
  verifyAdmin,
  schemaValidation({
    body: gerenciaSchema.filaPrioritariaIds
  }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.deleteFilaPrioritaria(req.body.fila_prioritaria_ids)

    const msg = 'Entradas da fila prioritária deletadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.post(
  '/fila_prioritaria',
  verifyAdmin,
  schemaValidation({
    body: gerenciaSchema.filaPrioritaria
  }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.criaFilaPrioritaria(req.body.fila_prioritaria)

    const msg = 'Entradas da fila prioritária criadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/fila_prioritaria',
  verifyAdmin,
  schemaValidation({
    body: gerenciaSchema.filaPrioritariaAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.atualizaFilaPrioritaria(req.body.fila_prioritaria)

    const msg = 'Entradas da fila prioritária atualizadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.get(
  '/fila_prioritaria_grupo',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getFilaPrioritariaGrupo()

    const msg = 'Fila prioritária de grupo retornada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.delete(
  '/fila_prioritaria_grupo',
  verifyAdmin,
  schemaValidation({
    body: gerenciaSchema.filaPrioritariaGrupoIds
  }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.deleteFilaPrioritariaGrupo(req.body.fila_prioritaria_grupo_ids)

    const msg = 'Entradas da fila prioritária de grupo deletadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.post(
  '/fila_prioritaria_grupo',
  verifyAdmin,
  schemaValidation({
    body: gerenciaSchema.filaPrioritariaGrupo
  }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.criaFilaPrioritariaGrupo(req.body.fila_prioritaria_grupo)

    const msg = 'Entradas da fila prioritária de grupo criadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/fila_prioritaria_grupo',
  verifyAdmin,
  schemaValidation({
    body: gerenciaSchema.filaPrioritariaGrupoAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.atualizaFilaPrioritariaGrupo(req.body.fila_prioritaria_grupo)

    const msg = 'Entradas da fila prioritária de grupo atualizadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

module.exports = router
