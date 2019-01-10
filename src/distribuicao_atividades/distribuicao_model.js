"use strict";

const Joi = require("joi");

const finaliza = Joi.object().keys({
  subfase_etapa_id: Joi.number()
    .integer()
    .strict()
    .required(),
  unidade_trabalho_id: Joi.number()
    .integer()
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

module.exports.finaliza = finaliza;
module.exports.resposta_questionario = resposta_questionario;
