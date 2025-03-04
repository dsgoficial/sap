'use strict'

const Joi = require('joi')

const models = {}

models.idParams = Joi.object().keys({
  id: Joi.number().integer().required()
})

models.getAtividadesPorPeriodoParams = Joi.object().keys({
  dataInicio: Joi.date().required(),
  dataFim: Joi.date().required()
});

models.getAtividadesPorUsuarioEPeriodoParams = Joi.object().keys({
  usuarioId: Joi.number().integer().required(),
  dataInicio: Joi.date().required(),
  dataFim: Joi.date().required()
});

module.exports = models
