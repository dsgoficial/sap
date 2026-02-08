'use strict'

const Joi = require('joi')

const models = {}

models.atividadeIdParam = Joi.object().keys({
  atividadeId: Joi.number().integer().required()
})

models.loteIdParam = Joi.object().keys({
  loteId: Joi.number().integer().required()
})

module.exports = models