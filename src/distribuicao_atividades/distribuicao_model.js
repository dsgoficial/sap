"use strict";

const Joi = require("joi");

const finaliza = Joi.object().keys({
  atividade_id: Joi.number()
    .integer()
    .strict()
    .required(),
  sem_correcao: Joi.boolean()
    .strict()
    .required(),
  usuario_id: Joi.number()
    .integer()
    .strict()
    .required()
});

const resposta_questionario = Joi.object().keys({
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

const problema_atividade = Joi.object().keys({
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

module.exports.finaliza = finaliza;
module.exports.resposta_questionario = resposta_questionario;
module.exports.problema_atividade = problema_atividade;
