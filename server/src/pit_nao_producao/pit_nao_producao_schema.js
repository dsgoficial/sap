'use strict'

const Joi = require('joi')

const models = {}

models.idParams = Joi.object().keys({
  id: Joi.number().integer().required()
})

models.anoParams = Joi.object().keys({
  ano: Joi.number().integer().required()
})

models.anoMesParams = Joi.object().keys({
  ano: Joi.number().integer().required(),
  mes: Joi.number().integer().min(1).max(12).required()
})

// Definicao de uma meta do PIT nao controlada pelo SAP (grava em macrocontrole.pit
// com lote_id nulo). O campo `meta` e a quantidade planejada anual; metas de marco
// (ex.: itens de TI) entram com meta=1 e prazo preenchido.
models.pit = Joi.object().keys({
  pit: Joi.object()
    .keys({
      ano: Joi.number().integer().required(),
      numero_meta: Joi.number().integer().min(1).max(7).required(),
      item: Joi.string().required(),
      descricao: Joi.string().required(),
      unidade: Joi.string().required().allow(null),
      meta: Joi.number().integer().min(0).required(),
      prazo: Joi.date().required().allow(null)
    })
    .required()
})

// Lancamento do realizado de uma meta num mes (macrocontrole.pit_execucao_manual).
models.execucao = Joi.object().keys({
  execucao: Joi.object()
    .keys({
      pit_id: Joi.number().integer().required(),
      mes: Joi.number().integer().min(1).max(12).required(),
      quantidade: Joi.number().integer().min(0).required(),
      data_conclusao: Joi.date().required().allow(null),
      observacao: Joi.string().required().allow(null)
    })
    .required()
})

module.exports = models
