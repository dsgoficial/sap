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
      inicio: Joi.string().required(), // time sem timezone
      fim: Joi.string().required(), // time sem timezone
      campo_id: Joi.string().uuid().required(),
      geom: Joi.object().required() // GeoJSON
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
      inicio: Joi.string(), // time sem timezone
      fim: Joi.string(), // time sem timezone
      geom: Joi.object() // GeoJSON
    })
    .required()
})

module.exports = models
