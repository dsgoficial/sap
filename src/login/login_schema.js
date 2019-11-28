"use strict";

const Joi = require("joi");

const models = {};

models.login = Joi.object().keys({
  usuario: Joi.string().required(),
  senha: Joi.string().required(),
  cliente: Joi.string().valid('qgis','browser').required(),
  plugins: Joi.when('cliente', { 
    is: 'qgis', 
    then: Joi.array().items(
      Joi.object({
        nome: Joi.string().required(),
        versao: Joi.string().required()
      })
    ).required(),
    otherwise: Joi.forbidden()
  }),
  qgis: Joi.when('cliente', { 
    is: 'qgis', 
    then: Joi.string().required(),
    otherwise: Joi.forbidden() 
  })
});

module.exports = models;
