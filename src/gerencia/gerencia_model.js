
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
  unidade_trabalho_ids: Joi.array()
    .items(
      Joi.number()
        .integer()
        .strict()
    )
    .required()
    .min(1)
});

const atividade_reiniciar = Joi.object().keys({
  unidade_trabalho_ids: Joi.array()
    .items(
      Joi.number()
        .integer()
        .strict()
    )
    .required()
    .min(1)
});

const fila_prioritaria = Joi.object().keys({
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

const fila_prioritaria_grupo = Joi.object().keys({
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

const observacao = Joi.object().keys({
  atividade_ids: Joi.array()
    .items(
      Joi.number()
        .integer()
        .strict()
    )
    .required()
    .min(1),
  observacao_atividade: Joi.string().allow("", null),
  observacao_etapa: Joi.string().allow("", null),
  observacao_subfase: Joi.string().allow("", null),
  observacao_unidade_trabalho: Joi.string().allow("", null)
});

const atividade_voltar = Joi.object().keys({
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

const atividade_avancar = Joi.object().keys({
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

const atividade_criar_revisao = Joi.object().keys({
  unidade_trabalho_ids: Joi.array()
    .items(
      Joi.number()
        .integer()
        .strict()
    )
    .required()
    .min(1)
});

const atividade_criar_revcorr = Joi.object().keys({
  unidade_trabalho_ids: Joi.array()
    .items(
      Joi.number()
        .integer()
        .strict()
    )
    .required()
    .min(1)
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
