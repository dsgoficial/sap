"use strict";

const Joi = require("joi");

const models = {};

models.idParams = Joi.object().keys({
  id: Joi.string()
    .regex(/^[0-9]+$/)
    .required()
});

models.proximaQuery = Joi.object().keys({
  proxima: Joi.string().valid("true", "false")
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

models.unidadeTrabalhoDisponivel = Joi.object().keys({
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

models.unidadeTrabalhoLote = Joi.object().keys({
  unidade_trabalho_ids: Joi.array()
    .items(
      Joi.number()
        .integer()
        .strict()
    )
    .required()
    .min(1),
  lote: Joi.number()
    .integer()
    .strict()
    .required()
});

models.atividadePausar = Joi.object().keys({
  unidade_trabalho_ids: Joi.array()
    .items(
      Joi.number()
        .integer()
        .strict()
    )
    .required()
    .min(1)
});

models.atividadeReiniciar = Joi.object().keys({
  unidade_trabalho_ids: Joi.array()
    .items(
      Joi.number()
        .integer()
        .strict()
    )
    .required()
    .min(1)
});

models.filaPrioritaria = Joi.object().keys({
  atividade_ids: Joi.array()
    .items(
      Joi.number()
        .integer()
        .strict()
    )
    .required()
    .min(1),
  usuario_prioridade_id: Joi.number()
    .integer()
    .strict()
    .required(),
  prioridade: Joi.number()
    .integer()
    .strict()
    .required()
});

models.filaPrioritariaGrupo = Joi.object().keys({
  atividade_ids: Joi.array()
    .items(
      Joi.number()
        .integer()
        .strict()
    )
    .required()
    .min(1),
  perfil_producao_id: Joi.number()
    .integer()
    .strict()
    .required(),
  prioridade: Joi.number()
    .integer()
    .strict()
    .required()
});

models.observacao = Joi.object().keys({
  atividade_ids: Joi.array()
    .items(
      Joi.number()
        .integer()
        .strict()
    )
    .required()
    .min(1),
  observacao_atividade: Joi.string()
    .allow("", null)
    .required(),
  observacao_etapa: Joi.string()
    .allow("", null)
    .required(),
  observacao_subfase: Joi.string()
    .allow("", null)
    .required(),
  observacao_unidade_trabalho: Joi.string()
    .allow("", null)
    .required(),
  observacao_lote: Joi.string()
    .allow("", null)
    .required()
});

models.atividadeVoltar = Joi.object().keys({
  atividade_ids: Joi.array()
    .items(
      Joi.number()
        .integer()
        .strict()
    )
    .required()
    .min(1),
  manter_usuarios: Joi.boolean()
    .strict()
    .required()
});

models.atividadeAvancar = Joi.object().keys({
  atividade_ids: Joi.array()
    .items(
      Joi.number()
        .integer()
        .strict()
    )
    .required()
    .min(1),
  concluida: Joi.boolean()
    .strict()
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

module.exports = models;
