'use strict'

const Joi = require('joi')

const models = {}

models.loteSubfaseParams = Joi.object().keys({
  lote: Joi.number().integer()
    .required(),
  subfase: Joi.number().integer()
    .required()
})

models.loteParams = Joi.object().keys({
  lote: Joi.number().integer()
    .required()
})

models.anoParam = Joi.object().keys({
  anoParam: Joi.string()
    .regex(/^20[0-3][0-9]$/)
    .required()
})

models.nomeParams = Joi.object().keys({
  nome: Joi.string().required()
})

/*


models.mesParam = Joi.object().keys({
  mes: Joi.string()
    .regex(/^(1|2|3|4|5|6|7|8|9|10|11|12)$/)
    .required()
})


models.finalizadoQuery = Joi.object().keys({
  finalizado: Joi.string().valid('true', 'false')
})

models.mvtParams = Joi.object().keys({
  nome: Joi.string().required(),
  x: Joi.number()
    .integer()
    .required(),
  y: Joi.number()
    .integer()
    .required(),
  z: Joi.number()
    .integer()
    .required()
})

models.diasQuery = Joi.object().keys({
  dias: Joi.number().integer()
})

models.perdaRecursoHumano = Joi.object().keys({
  perda_recurso_humano: Joi.array().items(
    Joi.object().keys({
      usuario_id: Joi.number()
        .integer()
        .strict()
        .required(),
      tipo_perda_recurso_humano_id: Joi.number()
        .integer()
        .strict()
        .required(),
      horas: Joi.number()
        .strict()
        .required(),
      data: Joi.date().required(),
      observacao: Joi.string().required()
    })
  )
    .required()
    .min(1)
})
*/
module.exports = models
