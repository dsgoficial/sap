'use strict'

const Joi = require('joi')

const models = {}

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - usuario
 *         - senha
 *         - cliente
 *       properties:
 *         usuario:
 *           type: string
 *           description: Nome do usuário
 *         senha:
 *           type: string
 *           description: Senha do usuário
 *         cliente:
 *           type: string
 *           enum: [sap_fp, sap_fg, sap]
 *           description: Tipo de cliente que está fazendo a solicitação
 *         plugins:
 *           type: array
 *           description: Lista de plugins em uso (requerido para sap_fp ou sap_fg)
 *           items:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome do plugin
 *               versao:
 *                 type: string
 *                 description: Versão do plugin
 *         qgis:
 *           type: string
 *           description: Versão do QGIS em uso (requerido para sap_fp ou sap_fg)
 */
models.login = Joi.object().keys({
  usuario: Joi.string().required(),
  senha: Joi.string().required(),
  cliente: Joi.string().valid('sap_fp', 'sap_fg', 'sap').required(),
  plugins: Joi.when('cliente', {
    is: Joi.string().regex(/^(sap_fp|sap_fg)$/),
    then: Joi.array()
      .items(
        Joi.object({
          nome: Joi.string().required(),
          versao: Joi.string().required()
        })
      )
      .unique('nome')
      .required(),
    otherwise: Joi.forbidden()
  }),
  qgis: Joi.when('cliente', {
    is: Joi.string().regex(/^(sap_fp|sap_fg)$/),
    then: Joi.string().required(),
    otherwise: Joi.forbidden()
  })
})

module.exports = models
