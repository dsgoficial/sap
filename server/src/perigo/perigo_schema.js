'use strict'

const Joi = require('joi')

const models = {}

models.idParams = Joi.object().keys({
  id: Joi.number().integer()
    .required()
})

/**
 * @swagger
 * components:
 *   schemas:
 *     PropriedadesCamada:
 *       type: object
 *       properties:
 *         propriedades_camada:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               camada_id:
 *                 type: integer
 *               camada_incomum:
 *                 type: boolean
 *               atributo_filtro_subfase:
 *                 type: string
 *               camada_apontamento:
 *                 type: boolean
 *               atributo_situacao_correcao:
 *                 type: string
 *               atributo_justificativa_apontamento:
 *                 type: string
 *               subfase_id:
 *                 type: integer
 *       required:
 *         - propriedades_camada
 *
 *     PropriedadesCamadaAtualizacao:
 *       type: object
 *       properties:
 *         propriedades_camada:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               camada_id:
 *                 type: integer
 *               camada_incomum:
 *                 type: boolean
 *               atributo_filtro_subfase:
 *                 type: string
 *               camada_apontamento:
 *                 type: boolean
 *               atributo_situacao_correcao:
 *                 type: string
 *               atributo_justificativa_apontamento:
 *                 type: string
 *               subfase_id:
 *                 type: integer
 *       required:
 *         - propriedades_camada
 *
 *     PropriedadesCamadaIds:
 *       type: object
 *       properties:
 *         propriedades_camada_ids:
 *           type: array
 *           items:
 *             type: integer
 *       required:
 *         - propriedades_camada_ids
 *
 *     Insumo:
 *       type: object
 *       properties:
 *         insumo:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               caminho:
 *                 type: string
 *               epsg:
 *                 type: string
 *               tipo_insumo_id:
 *                 type: integer
 *               grupo_insumo_id:
 *                 type: integer
 *               geom:
 *                 type: string
 *       required:
 *         - insumo
 *
 *     InsumoAtualizacao:
 *       type: object
 *       properties:
 *         insumo:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               nome:
 *                 type: string
 *               caminho:
 *                 type: string
 *               epsg:
 *                 type: string
 *               tipo_insumo_id:
 *                 type: integer
 *               grupo_insumo_id:
 *                 type: integer
 *               geom:
 *                 type: string
 *       required:
 *         - insumo
 *
 *     InsumoIds:
 *       type: object
 *       properties:
 *         insumo_ids:
 *           type: array
 *           items:
 *             type: integer
 *       required:
 *         - insumo_ids
 */
models.propriedadesCamada = Joi.object().keys({
  propriedades_camada: Joi.array()
    .items(
      Joi.object().keys({
        camada_id: Joi.number().integer().strict().required(),
        camada_incomum: Joi.boolean().required(),
        atributo_filtro_subfase: Joi.string().allow(null, ''),
        camada_apontamento: Joi.boolean().required(),
        atributo_situacao_correcao: Joi.string().allow(null, ''),
        atributo_justificativa_apontamento: Joi.string().allow(null, ''),
        subfase_id: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})

models.propriedadesCamadaAtualizacao = Joi.object().keys({
  propriedades_camada: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        camada_id: Joi.number().integer().strict().required(),
        camada_incomum: Joi.boolean().required(),
        atributo_filtro_subfase: Joi.string().allow(null, ''),
        camada_apontamento: Joi.boolean().required(),
        atributo_situacao_correcao: Joi.string().allow(null, ''),
        atributo_justificativa_apontamento: Joi.string().allow(null, ''),
        subfase_id: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})

models.propriedadesCamadaIds = Joi.object().keys({
  propriedades_camada_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

models.insumo = Joi.object().keys({
  insumo: Joi.array()
    .items(
      Joi.object().keys({
        nome: Joi.string().required(),
        caminho: Joi.string().required(),
        epsg: Joi.string().allow(null, ''),
        tipo_insumo_id: Joi.number().integer().strict().required(),
        grupo_insumo_id: Joi.number().integer().strict().required(),
        geom: Joi.string().allow(null, '') // Representação da geometria em string (WKT ou GeoJSON)
      })
    )
    .required()
    .min(1)
})

models.insumoAtualizacao = Joi.object().keys({
  insumo: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        nome: Joi.string().required(),
        caminho: Joi.string().required(),
        epsg: Joi.string().allow(null, ''),
        tipo_insumo_id: Joi.number().integer().strict().required(),
        grupo_insumo_id: Joi.number().integer().strict().required(),
        geom: Joi.string().allow(null, '') // Representação da geometria em string (WKT ou GeoJSON)
      })
    )
    .required()
    .min(1)
})

models.insumoIds = Joi.object().keys({
  insumo_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

module.exports = models
