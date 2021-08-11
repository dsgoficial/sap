'use strict'

const Joi = require('joi')

const models = {}

models.finaliza = Joi.object().keys({
  atividade_id: Joi.number().integer().strict().required(),
  sem_correcao: Joi.boolean().strict(),
  alterar_fluxo: Joi.string().valid(
    'Necessita nova revisão',
    'Não é necessário uma nova revisão'
  ),
  info_edicao: Joi.array().items(
    Joi.object().keys({
      produto_id: Joi.number().integer().strict().required(),
      nome_produto: Joi.string().required(),
      palavras_chave: Joi.array()
        .items(
          Joi.object().keys({
            palavra_chave: Joi.string().required(),
            tipo_palavra_chave: Joi.number().integer().strict().required()
          })
        )
        .unique('palavra_chave')
        .required()
        .min(1)
    })
  )
  .unique('produto_id')
  .min(1),
  observacao_proxima_atividade: Joi.string()
})

models.problemaAtividade = Joi.object().keys({
  atividade_id: Joi.number().integer().strict().required(),
  tipo_problema_id: Joi.number().integer().strict().required(),
  descricao: Joi.string().required()
})

models.atividadeId = Joi.object().keys({
  atividade_id: Joi.number().integer().strict().required()
})

module.exports = models
