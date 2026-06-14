'use strict'

const Joi = require('joi')

const models = {}

models.idParams = Joi.object().keys({
  id: Joi.number().integer().required()
})

models.getAtividadesPorPeriodoParams = Joi.object().keys({
  dataInicio: Joi.date().required(),
  dataFim: Joi.date().required()
});

models.getAtividadesPorUsuarioEPeriodoParams = Joi.object().keys({
  usuarioId: Joi.number().integer().required(),
  dataInicio: Joi.date().required(),
  dataFim: Joi.date().required()
});

// Aproveitamento do efetivo (Secao 5.1 do RPCMTec): retrato por (ano, mes).
models.anoMesParams = Joi.object().keys({
  ano: Joi.number().integer().required(),
  mes: Joi.number().integer().min(1).max(12).required()
})

models.copiarMes = Joi.object().keys({
  ano: Joi.number().integer().required(),
  mes: Joi.number().integer().min(1).max(12).required()
})

models.aproveitamento = Joi.object().keys({
  aproveitamento: Joi.object().keys({
    ano: Joi.number().integer().required(),
    mes: Joi.number().integer().min(1).max(12).required(),
    usuario_id: Joi.number().integer().required(),
    tipo_posto_grad_id: Joi.number().integer().allow(null),
    atividades: Joi.string().allow(null, '')
  }).required()
})

models.aproveitamentoUpdate = Joi.object().keys({
  aproveitamento: Joi.object().keys({
    tipo_posto_grad_id: Joi.number().integer().allow(null),
    atividades: Joi.string().allow(null, '')
  }).required()
})

module.exports = models
