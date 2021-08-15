'use strict'

const Joi = require('joi')

const models = {}

models.feicao = Joi.object().keys({
  atividade_id: Joi.number()
    .integer()
    .strict()
    .required(),
  data: Joi.date().required(),
  dados: Joi.array()
    .items(
      Joi.object().keys({
        operacao: Joi.number()
          .integer()
          .strict()
          .required(),
        quantidade: Joi.number()
          .integer()
          .strict()
          .required(),
        comprimento: Joi.number()
          .strict()
          .when('operacao', { is: 1, then: Joi.required() }),
        vertices: Joi.number()
          .integer()
          .strict()
          .when('operacao', { is: 1, then: Joi.required() }),
        camada_id: Joi.number()
          .integer()
          .strict()
          .required()
      })
    )
    .required()
    .min(1)
})

models.tela = Joi.object().keys({
  atividade_id: Joi.number()
    .integer()
    .strict()
    .required(),
  dados: Joi.array()
    .items(
      Joi.object().keys({
        data: Joi.date().required(),
        x_min: Joi.number()
          .strict()
          .required(),
        x_max: Joi.number()
          .strict()
          .required(),
        y_min: Joi.number()
          .strict()
          .required(),
        y_max: Joi.number()
          .strict()
          .required(),
        zoom: Joi.number()
          .strict()
          .required()
      })
    )
    .required()
    .min(1)
})

models.comportamento = Joi.object().keys({
  atividade_id: Joi.number()
    .integer()
    .strict()
    .required(),
  dados: Joi.array()
    .items(
      Joi.object().keys({
        propriedade: Joi.string().required(),
        valor: Joi.string().required()
      })
    )
    .required()
    .min(1)
})

module.exports = models
