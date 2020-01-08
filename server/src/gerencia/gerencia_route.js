'use strict'

const express = require('express')

const { schemaValidation, asyncHandler, httpCode } = require('../utils')

const { verifyAdmin } = require('../login')

const gerenciaCtrl = require('./gerencia_ctrl')
const gerenciaSchema = require('./gerencia_schema')

const router = express.Router()

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
      req.query.proxima,
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

router.post(
  '/observacao',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.observacao }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.criaObservacao(
      req.body.atividade_ids,
      req.body.observacao_atividade,
      req.body.observacao_etapa,
      req.body.observacao_subfase,
      req.body.observacao_unidade_trabalho,
      req.body.lote
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
      req.query.em_andamento
    )

    const msg = 'Views de acompanhamento retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.put(
  '/atividades_bloqueadas',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.atualizaAtividadesBloqueadas()

    const msg = 'View Atividades Bloqueadas atualizada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.put(
  '/atividade/permissoes',
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
