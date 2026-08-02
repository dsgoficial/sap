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
//
// `prazo` e DIA DE CALENDARIO: `Joi.date().iso().raw()`, nunca `Joi.date()`. Sem
// o `.raw()` o Joi converte 'AAAA-MM-DD' em meia-noite UTC e a coluna DATE, lida
// em UTC-3, guarda o DIA ANTERIOR -- a meta com prazo 01/08 aparece como 31/07 na
// coluna "Previsao de termino" da 2.1 do RPCMTec, e ninguem confere um relatorio
// contra a data de cada meta. O `.iso()` anda junto: sem ele a string segue crua
// para o Postgres, e '01/08/2026' seria lido como 8 de JANEIRO (DateStyle MDY).
models.pit = Joi.object().keys({
  pit: Joi.object()
    .keys({
      ano: Joi.number().integer().required(),
      numero_meta: Joi.number().integer().min(1).max(7).required(),
      // Nome da meta do ano ("Programa Memoria"). Alimenta a coluna Meta da 2.1,
      // que o modelo escreve como "Meta 6 - Programa Memoria". Opcional: sem ele
      // o gerador escreve so "Meta 6".
      nome_meta: Joi.string().allow(null, ''),
      item: Joi.string().required(),
      descricao: Joi.string().required(),
      unidade: Joi.string().required().allow(null),
      meta: Joi.number().integer().min(0).required(),
      prazo: Joi.date().iso().raw().required().allow(null)
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
      // Dia de calendario, mesma regra do `prazo` acima.
      data_conclusao: Joi.date().iso().raw().required().allow(null),
      observacao: Joi.string().required().allow(null)
    })
    .required()
})

module.exports = models
