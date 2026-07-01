'use strict'

const Joi = require('joi')

const models = {}

// Ano e mês de corte do RPCMTec (seção produção/pessoal do SAP).
models.anoMesParams = Joi.object().keys({
  ano: Joi.number().integer().required(),
  mes: Joi.number().integer().min(1).max(12).required()
})

module.exports = models
