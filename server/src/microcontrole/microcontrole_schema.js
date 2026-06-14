'use strict'

const Joi = require('joi')

const models = {}

models.feicao = Joi.object().keys({
  atividade_id: Joi.number()
    .integer()
    .strict()
    .required(),
  dados: Joi.array()
    .items(
      Joi.object().keys({
        tipo_operacao_id: Joi.number()
          .integer()
          .strict()
          .required(),
        quantidade: Joi.number()
          .integer()
          .strict()
          .required(),
        comprimento: Joi.number()
          .strict()
          .when('tipo_operacao_id', { is: 1, then: Joi.required() }),
        vertices: Joi.number()
          .integer()
          .strict()
          .when('tipo_operacao_id', { is: 1, then: Joi.required() }),
        camada: Joi.string().required()
      })
    )
    .required()
    .min(1)
})

models.tela = Joi.object().keys({
  atividade_id: Joi.number()
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
          .required(),
        zoom: Joi.number()
          .strict()
          .required()
      })
    )
    .required()
    .min(1)
})

models.perfilMonitoramento = Joi.object().keys({
  perfis_monitoramento: Joi.array()
    .items(
      Joi.object().keys({
        subfase_id: Joi.number().integer().strict().required(),
        lote_id: Joi.number().integer().strict().required(),
        tipo_monitoramento_id: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})

models.perfilMonitoramentoAtualizacao = Joi.object().keys({
  perfis_monitoramento: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        subfase_id: Joi.number().integer().strict().required(),
        lote_id: Joi.number().integer().strict().required(),
        tipo_monitoramento_id: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})

// NOTA: sem .strict() nos campos numericos. req.query do Express chega como
// string; .strict() bloquearia a coercao do Joi e todo filtro numerico daria
// 400. As demais query schemas do repo seguem a mesma convencao (sem strict).
models.resumoFeicaoQuery = Joi.object().keys({
  lote_id: Joi.number().integer(),
  data_inicio: Joi.date(),
  data_fim: Joi.date()
})

models.coberturaTelaQuery = Joi.object().keys({
  lote_id: Joi.number().integer(),
  usuario_id: Joi.number().integer(),
  data_inicio: Joi.date(),
  data_fim: Joi.date()
})

models.aproveitamentoTelaQuery = Joi.object().keys({
  usuario_id: Joi.number().integer().required(),
  data_inicio: Joi.date(),
  data_fim: Joi.date()
})

models.perfilMonitoramentoOperadorIds = Joi.object().keys({
  perfis_monitoramento_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

module.exports = models
