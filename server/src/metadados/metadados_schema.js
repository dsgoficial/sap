'use strict'

const Joi = require('joi')

const models = {}

models.uuidParams = Joi.object().keys({
  uuid: Joi.string()
    .guid({ version: 'uuidv4' })
    .required()
})

models.nomeParams = Joi.object().keys({
  nome: Joi.string().required()
})

module.exports = models
