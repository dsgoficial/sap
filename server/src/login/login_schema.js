'use strict'

const Joi = require('joi')

const models = {}

models.login = Joi.object().keys({
  usuario: Joi.string().required(),
  senha: Joi.string().required(),
  cliente: Joi.string().valid('sap_fp', 'sap_fg', 'sap_web').required(),
  plugins: Joi.when('cliente', {
    is: Joi.string().regex(/^(sap_fp|sap_fg)$/),
    then: Joi.array().items(
      Joi.object({
        nome: Joi.string().required(),
        versao: Joi.string().required()
      })
    ).required(),
    otherwise: Joi.forbidden()
  }),
  qgis: Joi.when('cliente', {
    is: Joi.string().regex(/^(sap_fp|sap_fg)$/),
    then: Joi.string().required(),
    otherwise: Joi.forbidden()
  })
})

module.exports = models
