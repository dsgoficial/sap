'use strict'

const Joi = require('joi')

const models = {}

models.idParams = Joi.object().keys({
  id: Joi.number().integer().required()
})

models.proximaQuery = Joi.object().keys({
  proxima: Joi.string().valid('true', 'false')
})

models.emAndamentoQuery = Joi.object().keys({
  em_andamento: Joi.string().valid('true', 'false')
})

models.unidadeTrabalhoDisponivel = Joi.object().keys({
  unidade_trabalho_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1),
  disponivel: Joi.boolean().required()
})

models.atividadePausar = Joi.object().keys({
  unidade_trabalho_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1)
})

models.atividadeReiniciar = Joi.object().keys({
  unidade_trabalho_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1)
})

models.filaPrioritaria = Joi.object().keys({
  atividade_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1),
  usuario_prioridade_id: Joi.number().integer().strict().required(),
  prioridade: Joi.number().integer().strict().required()
})

models.filaPrioritariaGrupo = Joi.object().keys({
  atividade_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1),
  perfil_producao_id: Joi.number().integer().strict().required(),
  prioridade: Joi.number().integer().strict().required()
})

models.observacao = Joi.object().keys({
  atividade_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1),
  observacao_atividade: Joi.string().allow('', null).required(),
  observacao_unidade_trabalho: Joi.string().allow('', null).required()
})

models.atividadeVoltar = Joi.object().keys({
  atividade_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1),
  manter_usuarios: Joi.boolean().strict().required()
})

models.atividadeAvancar = Joi.object().keys({
  atividade_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1),
  concluida: Joi.boolean().strict().required()
})

models.bancoDados = Joi.object().keys({
  servidor: Joi.string().required(),
  porta: Joi.number().integer().strict().required(),
  banco: Joi.string().required()
})

module.exports = models
