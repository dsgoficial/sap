"use strict";

const Joi = require("joi");

const estilos = Joi.object().keys({
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
  .min(1)
});

const menus = Joi.object().keys({
  menus: Joi.array()
  .items(
    Joi.object().keys({
      nome_menu: Joi.string().required(),
      definicao_menu: Joi.string().required(),
      ordem_menu: Joi.string().required()
    })
  )
  .required()
  .min(1)
});

const regras = Joi.object().keys({
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
  .min(1)
});

const qgis_models = Joi.object().keys({
  modelos: Joi.array()
  .items(
    Joi.object().keys({
      nome: Joi.string().required(),
      descricao: Joi.string().required(),
      model_xml: Joi.string().required()
    })
  )
  .required()
  .min(1)
});

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
  usuario_prioridade_id: Joi.number()
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

const atividade_voltar = Joi.object().keys({
  atividade_id: Joi.number()
    .integer()
    .strict()
    .required(),
  manter_usuarios: Joi.boolean().strict()
  .required()
});

const atividade_avancar = Joi.object().keys({
  atividade_id: Joi.number()
    .integer()
    .strict()
    .required(),
  concluida: Joi.boolean().strict()
  .required()
});

const atividade_criar_revisao = Joi.object().keys({
  atividade_id: Joi.number()
    .integer()
    .strict()
    .required()
});

const atividade_criar_revcorr = Joi.object().keys({
  atividade_id: Joi.number()
    .integer()
    .strict()
    .required()
});

module.exports.estilos = estilos;
module.exports.menus = menus;
module.exports.regras = regras;
module.exports.qgis_models = qgis_models;
module.exports.unidade_trabalho_disponivel = unidade_trabalho_disponivel;
module.exports.atividade_pausar = atividade_pausar;
module.exports.atividade_reiniciar = atividade_reiniciar;
module.exports.fila_prioritaria = fila_prioritaria;
module.exports.fila_prioritaria_grupo = fila_prioritaria_grupo;
module.exports.observacao = observacao;
module.exports.atividade_voltar = atividade_voltar;
module.exports.atividade_avancar = atividade_avancar;
module.exports.atividade_criar_revisao = atividade_criar_revisao;
module.exports.atividade_criar_revcorr = atividade_criar_revcorr;
