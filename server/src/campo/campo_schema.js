'use strict'

const Joi = require('joi')

const models = {}

models.idParams = Joi.object().keys({
  id: Joi.number().integer().required()
})

models.uuidParams = Joi.object().keys({
  uuid: Joi.string().uuid().required().min(1)
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

models.fotos = Joi.array().items(
  Joi.object().keys({
    campo_id: Joi.string().uuid().required(),
    nome: Joi.string().required()
  })
)

module.exports = models
