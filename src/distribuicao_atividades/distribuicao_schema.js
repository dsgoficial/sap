"use strict";

const Joi = require("joi");

const models = {};

models.finaliza = Joi.object().keys({
  atividade_id: Joi.number()
    .integer()
    .strict()
    .required(),
  sem_correcao: Joi.boolean()
    .strict()
    .required()
});

models.respostaQuestionario = Joi.object().keys({
  atividade_id: Joi.number()
    .integer()
    .strict()
    .required(),
  respostas: Joi.array()
    .items(
      Joi.object().keys({
        pergunta_id: Joi.number()
          .integer()
          .strict()
          .required(),
        opcao_id: Joi.number()
          .integer()
          .strict()
          .required()
      })
    )
    .required()
    .min(1)
});

models.problemaAtividade = Joi.object().keys({
  atividade_id: Joi.number()
    .integer()
    .strict()
    .required(),
  tipo_problema_id: Joi.number()
    .integer()
    .strict()
    .required(),
  descricao: Joi.string().required()
});

module.exports = models;
