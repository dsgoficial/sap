"use strict";

const Joi = require("joi");

const estilos = Joi.array()
  .items(
    Joi.object().keys({
      f_table_schema: Joi.string().required(),
      f_table_name: Joi.string().required(),
      f_geometry_column: Joi.string().required(),
      stylename: Joi.string().required(),
      styleqml: Joi.string().required(),
      stylesld: Joi.string().required(),
      ui: Joi.string().required()
    })
  )
  .required()
  .min(1);

const menus = Joi.array()
  .items(
    Joi.object().keys({
      nome_menu: Joi.string().required(),
      definicao_menu: Joi.string().required(),
      ordem_menu: Joi.string().required()
    })
  )
  .required()
  .min(1);

const regras = Joi.array()
  .items(
    Joi.object().keys({
      tipo_regra: Joi.string().required(),
      camada: Joi.string().required(),
      atributo: Joi.string().required(),
      regra: Joi.string().required(),
      grupo_regra: Joi.string().required(),
      cor_rgb: Joi.string().required(),
      descricao: Joi.string().required(),
      ordem: Joi.number()
        .integer()
        .strict()
        .required()
    })
  )
  .required()
  .min(1);

module.exports.estilos = estilos;
module.exports.menus = menus;
module.exports.regras = regras;
