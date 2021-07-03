'use strict'

const Joi = require('joi')

const models = {}

models.uuidParams = Joi.object().keys({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required()
})

models.listaUsuario = Joi.object().keys({
  usuarios: Joi.array()
    .items(Joi.string().guid({ version: 'uuidv4' }).required())
    .unique()
    .required()
    .min(1)
})

models.updateUsuario = Joi.object().keys({
  administrador: Joi.boolean().strict().required(),
  ativo: Joi.boolean().strict().required()
})

models.updateUsuarioLista = Joi.object().keys({
  usuarios: Joi.array()
    .items(
      Joi.object().keys({
        uuid: Joi.string().guid({ version: 'uuidv4' }).required(),
        administrador: Joi.boolean().strict().required(),
        ativo: Joi.boolean().strict().required()
      })
    )
    .unique('uuid')
    .required()
    .min(1)
})

module.exports = models
