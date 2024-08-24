'use strict'

const Joi = require('joi')
const { pit } = require('../gerencia/gerencia_schema')

const models = {}

models.idParams = Joi.object().keys({
    id: Joi.number().integer().required()
  })

models.campo = Joi.object().keys({
    campo: Joi.object()
      .keys({
        nome: Joi.string().required(),
        descricao: Joi.string().required().allow(null),
        orgao: Joi.string().required(),
        pit: Joi.number().integer().required().strict(),
        militares: Joi.string().required().allow(null),
        placas_vtr: Joi.string().required().allow(null),
        inicio: Joi.date().required().allow(null),
        fim: Joi.date().required().allow(null),
        situacao_id: Joi.number().integer().required().strict(),
        produtos_id: Joi.array().items(Joi.number().integer().strict()).required().min(1).unique()
})
      .required()
  })

module.exports = models

