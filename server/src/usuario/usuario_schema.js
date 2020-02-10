'use strict'

const Joi = require('joi')

const models = {}

models.uuidParams = Joi.object().keys({
  uuid: Joi.string()
    .guid({ version: 'uuidv4' })
    .required()
})

models.listaUsuario = Joi.object().keys({
  usuarios: Joi.array().items(
    Joi.string().guid({ version: 'uuidv4' }).required()
  ).required().min(1)
})

models.updateUsuario = Joi.object().keys({
  administrador: Joi.boolean().strict(),
  ativo: Joi.boolean().strict()
})

module.exports = models
