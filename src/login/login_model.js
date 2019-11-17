"use strict";

const Joi = require("joi");

const login = Joi.object().keys({
  usuario: Joi.string().required(),
  senha: Joi.string().required(),
  plugins: Joi.array().items(
    Joi.object({
      nome: Joi.string().required(),
      versao: Joi.string().required()
    })
  ),
  qgis: Joi.string()
});

module.exports.login = login;
