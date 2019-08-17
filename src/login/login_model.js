"use strict";

const Joi = require("joi");

const login = Joi.object().keys({
  usuario: Joi.string().required(),
  senha: Joi.string().required(),
  plugins: Joi.array().items(
    Joi.object({
      nome: Joi.string().required(),
      versao: Joi.string()
        .regex(/^\d+(\.\d+){0,2}$/)
        .required()
    })
  )
});

module.exports.login = login;
