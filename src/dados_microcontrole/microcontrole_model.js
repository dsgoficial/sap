"use strict";

const Joi = require("joi");

const feicao = Joi.object().keys({
  usuario_id: Joi.number()
    .integer()
    .strict()
    .required(),
  data: Joi.date().required(),
  etapa_id: Joi.number()
    .integer()
    .strict()
    .required(),
  unidade_trabalho_id: Joi.number()
    .integer()
    .strict()
    .required(),
  dados: Joi.array()
    .items(
      Joi.object().keys({
        operacao: Joi.string()
          .valid("INSERT", "DELETE", "UPDATE")
          .required(),
        quantidade: Joi.number()
          .integer()
          .strict()
          .required(),
        comprimento: Joi.number()
          .strict()
          .when("operacao", { is: "INSERT", then: Joi.required() }),
        vertices: Joi.number()
          .integer()
          .strict()
          .when("operacao", { is: "INSERT", then: Joi.required() }),
        camada: Joi.string().required()
      })
    )
    .required()
    .min(1)
});

const apontamento = Joi.object().keys({
  usuario_id: Joi.number()
    .integer()
    .strict()
    .required(),
  data: Joi.date().required(),
  etapa_id: Joi.number()
    .integer()
    .strict()
    .required(),
  unidade_trabalho_id: Joi.number()
    .integer()
    .strict()
    .required(),
  dados: Joi.array()
    .items(
      Joi.object().keys({
        categoria: Joi.string().required(),
        quantidade: Joi.number()
          .integer()
          .strict()
          .required()
      })
    )
    .required()
    .min(1)
});

const tela = Joi.object().keys({
  usuario_id: Joi.number()
    .integer()
    .strict()
    .required(),
  etapa_id: Joi.number()
    .integer()
    .strict()
    .required(),
  unidade_trabalho_id: Joi.number()
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
          .required()
      })
    )
    .required()
    .min(1)
});

module.exports.feicao = feicao;
module.exports.apontamento = apontamento;
module.exports.tela = tela;
