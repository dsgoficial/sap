const Joi = require("joi");

const login = Joi.object().keys({
  usuario: Joi.string().required(),
  senha: Joi.string().required()
});

module.exports.login = login;
