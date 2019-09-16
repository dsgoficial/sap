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

const unidade_trabalho_disponivel = Joi.object().keys({
  unidade_trabalho_ids: Joi.array()
    .items(
      Joi.number()
        .integer()
        .strict()
    )
    .required()
    .min(1),
  disponivel: Joi.boolean().required()
});

const atividade_pausar = Joi.object().keys({
  atividade_id: Joi.number()
    .integer()
    .strict()
    .required()
});

const atividade_reiniciar = Joi.object().keys({
  atividade_id: Joi.number()
    .integer()
    .strict()
    .required()
});

const fila_prioritaria = Joi.object().keys({
  atividade_id: Joi.number()
    .integer()
    .strict()
    .required(),
  usuario_id: Joi.number()
    .integer()
    .strict()
    .required(),
  prioridade: Joi.number()
    .integer()
    .strict()
    .required()
});

const fila_prioritaria_grupo = Joi.object().keys({
  atividade_id: Joi.number()
    .integer()
    .strict()
    .required(),
  perfil_producao_id: Joi.number()
    .integer()
    .strict()
    .required(),
  prioridade: Joi.number()
    .integer()
    .strict()
    .required()
});

const observacao = Joi.object().keys({
  atividade_id: Joi.number()
    .integer()
    .strict()
    .required(),
  observacao_atividade: Joi.string(),
  observacao_etapa: Joi.string(),
  observacao_subfase: Joi.string(),
  observacao_unidade_trabalho: Joi.string()
});

module.exports.estilos = estilos;
module.exports.menus = menus;
module.exports.regras = regras;
module.exports.unidade_trabalho_disponivel = unidade_trabalho_disponivel;
module.exports.atividade_pausar = atividade_pausar;
module.exports.atividade_reiniciar = atividade_reiniciar;
module.exports.fila_prioritaria = fila_prioritaria;
module.exports.fila_prioritaria_grupo = fila_prioritaria_grupo;
module.exports.observacao = observacao;
