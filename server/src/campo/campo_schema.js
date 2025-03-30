'use strict'

const Joi = require('joi')

const models = {}

models.idParams = Joi.object().keys({
  id: Joi.number().integer().required()
})

models.uuidParams = Joi.object().keys({
  uuid: Joi.string().uuid().required().min(1)
})

models.campo = Joi.object().keys({
  campo: Joi.object()
    .keys({
      nome: Joi.string().required(),
      descricao: Joi.string().required().allow(null),
      orgao: Joi.string().required(),
      pit: Joi.number().integer().required().strict(),
      militares: Joi.string().required().allow(null),
      placas_vtr: Joi.string().required().allow(null),
      inicio: Joi.date().required().allow(null),
      fim: Joi.date().required().allow(null),
      situacao_id: Joi.number().integer().required().strict(),
      geom: Joi.string().required()
    })
    .required()
})

models.fotos = Joi.object().keys({
  fotos: Joi.array().items(
    Joi.object().keys({
      campo_id: Joi.string().uuid().required(),
      descricao: Joi.string().required(),
      data_imagem: Joi.date().required(),
      imagem_base64: Joi.string().base64().max(10485760).required() // Base64 com no máximo 10MB
    })
  ).required()
})

models.fotoUpdate = Joi.object().keys({
  foto: Joi.object()
    .keys({
      descricao: Joi.string().allow(null),
      data_imagem: Joi.date().allow(null)
    })
    .required()
})

// Esquema para criação/atualização de track
models.track = Joi.object().keys({
  track: Joi.object()
    .keys({
      chefe_vtr: Joi.string().required(),
      motorista: Joi.string().required(),
      placa_vtr: Joi.string().required(),
      dia: Joi.date().required(),
      campo_id: Joi.string().uuid().required()
    })
    .required()
})

// Esquema para atualização de track
models.trackUpdate = Joi.object().keys({
  track: Joi.object()
    .keys({
      chefe_vtr: Joi.string(),
      motorista: Joi.string(),
      placa_vtr: Joi.string(),
      dia: Joi.date(),
      geom: Joi.object() // GeoJSON
    })
    .required()
})

models.loteidParams = Joi.object().keys({
  lote_id: Joi.number().integer().strict().required()
})

module.exports = models
