'use strict'

const Joi = require('joi')

const models = {}

models.uuidParams = Joi.object().keys({
  uuid: Joi.string().uuid().required()
})

models.periodoParams = Joi.object().keys({
  dataInicio: Joi.date().required(),
  dataFim: Joi.date().required()
})

models.capacitacao = Joi.object().keys({
  capacitacao: Joi.object()
    .keys({
      nome: Joi.string().required(),
      tipo: Joi.string().valid('Ministrada', 'Recebida').required(),
      instituicoes: Joi.string().required().allow(null),
      local: Joi.string().required().allow(null),
      inicio: Joi.date().required().allow(null),
      fim: Joi.date().required().allow(null),
      efetivo_capacitado: Joi.number().integer().required().allow(null),
      militares: Joi.string().required().allow(null),
      plano_codigo: Joi.string().required().allow(null),
      ano: Joi.number().integer().required(),
      situacao_id: Joi.number().integer().required(),
      documento: Joi.string().required().allow(null)
    })
    .required()
})

module.exports = models
