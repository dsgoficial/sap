'use strict'

const Joi = require('joi')

const models = {}

models.idParams = Joi.object().keys({
  id: Joi.number().integer().required()
})

models.anoParams = Joi.object().keys({
  ano: Joi.number().integer().required()
})

models.extraPit = Joi.object().keys({
  extra_pit: Joi.object()
    .keys({
      ano: Joi.number().integer().required(),
      demandante: Joi.string().required(),
      tipo_produto: Joi.string().required(),
      quantidade: Joi.number().integer().min(1).required(),
      situacao_id: Joi.number().integer().required(),
      documento_autorizacao: Joi.string().required(),
      descricao: Joi.string().required().allow(null),
      data_entrega: Joi.date().required().allow(null),
      lote_id: Joi.number().integer().required().allow(null)
    })
    .required()
})

module.exports = models
