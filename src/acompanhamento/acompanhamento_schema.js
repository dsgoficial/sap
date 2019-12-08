"use strict";

const Joi = require("joi");

const models = {};

models.idParams = Joi.object().keys({
  id: Joi.string()
    .regex(/^[0-9]+$/)
    .required()
});

models.mvtParams = Joi.object().keys({
  nome: Joi.string().required(),
  x: Joi.number()
    .integer()
    .required(),
  y: Joi.number()
    .integer()
    .required(),
  z: Joi.number()
    .integer()
    .required()
});

models.diasQuery = Joi.object().keys({
  dias: Joi.string().regex(/^[0-9]+$/)
});

module.exports = models;
