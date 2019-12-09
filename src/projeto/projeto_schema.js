"use strict";

const Joi = require("joi");

const models = {};

models.usuarios = Joi.object().keys({
  usuarios: Joi.array()
    .items(
      Joi.object().keys({
        nome: Joi.string().required(),
        nome_guerra: Joi.string().required(),
        tipo_turno_id: Joi.number()
          .integer()
          .strict()
          .required(),
        tipo_posto_grad_id: Joi.number()
          .integer()
          .strict()
          .required(),
        uuid: Joi.string()
          .guid()
          .required()
      })
    )
    .required()
    .min(1)
});

models.estilos = Joi.object().keys({
  estilos: Joi.array()
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
});

models.menus = Joi.object().keys({
  menus: Joi.array()
    .items(
      Joi.object().keys({
        nome_menu: Joi.string().required(),
        definicao_menu: Joi.string().required(),
        ordem_menu: Joi.string().required()
      })
    )
    .required()
});

models.regras = Joi.object().keys({
  regras: Joi.array()
    .items(
      Joi.object().keys({
        grupo_regra: Joi.string().required(),
        tipo_regra: Joi.string().required(),
        schema: Joi.string().required(),
        camada: Joi.string().required(),
        atributo: Joi.string().required(),
        regra: Joi.string().required(),
        cor_rgb: Joi.string().required(),
        descricao: Joi.string().required(),
        ordem: Joi.number()
          .integer()
          .strict()
          .required()
      })
    )
    .required()
});

models.qgisModels = Joi.object().keys({
  modelos: Joi.array()
    .items(
      Joi.object().keys({
        nome: Joi.string().required(),
        descricao: Joi.string().required(),
        model_xml: Joi.string().required()
      })
    )
    .required()
});

models.atividadeCriarRevisao = Joi.object().keys({
  unidade_trabalho_ids: Joi.array()
    .items(
      Joi.number()
        .integer()
        .strict()
    )
    .required()
    .min(1)
});

models.atividadeCriarRevcorr = Joi.object().keys({
  unidade_trabalho_ids: Joi.array()
    .items(
      Joi.number()
        .integer()
        .strict()
    )
    .required()
    .min(1)
});

models.unidadeTrabalhoLote = Joi.object().keys({
  unidade_trabalho_ids: Joi.array()
    .items(
      Joi.number()
        .integer()
        .strict()
    )
    .required()
    .min(1),
  lote_id: Joi.number()
    .integer()
    .strict()
    .required()
});

models.listaAtividades = Joi.object().keys({
  atividades_ids: Joi.array()
    .items(
      Joi.number()
        .integer()
        .strict()
    )
    .required()
    .min(1)
});

models.unidadeTrabalhoEtapa = Joi.object().keys({
  unidade_trabalho_ids: Joi.array()
    .items(
      Joi.number()
        .integer()
        .strict()
    )
    .required()
    .min(1),
  etapa_id: Joi.number()
    .integer()
    .strict()
    .required()
});

models.gerenciadorFME = Joi.object().keys({
  servidor: Joi.string().required(),
  porta: Joi.number()
    .strict()
    .required()
});

module.exports = models;
