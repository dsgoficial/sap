"use strict";

const Joi = require("joi");

const models = {};

models.uuidParams = Joi.object().keys({
  uuid: Joi.string()
    .guid()
    .required()
});

module.exports = models;
