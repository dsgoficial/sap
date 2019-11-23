"use strict";

const Joi = require("joi");

const models = {};

models.idParams = Joi.object().keys({
    id: Joi.string().regex(/^[0-9]+$/).required()
  });
  
models.diasQuery = Joi.object().keys({
dias: Joi.string().regex(/^[0-9]+$/)
});

module.exports = models;