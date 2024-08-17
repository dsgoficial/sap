'use strict'

const Joi = require('joi')

const models = {}

models.uuidParams = Joi.object().keys({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required()
})

/**
 * @swagger
 * components:
 *   schemas:
 *     ListaUsuario:
 *       type: object
 *       required:
 *         - usuarios
 *       properties:
 *         usuarios:
 *           type: array
 *           description: Lista de UUIDs dos usuários a serem criados
 *           items:
 *             type: string
 *             format: uuid
 *           uniqueItems: true
 *           minItems: 1
 */
models.listaUsuario = Joi.object().keys({
  usuarios: Joi.array()
    .items(Joi.string().guid({ version: 'uuidv4' }).required())
    .unique()
    .required()
    .min(1)
})

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateUsuario:
 *       type: object
 *       required:
 *         - administrador
 *         - ativo
 *       properties:
 *         administrador:
 *           type: boolean
 *           description: Indica se o usuário é administrador
 *         ativo:
 *           type: boolean
 *           description: Indica se o usuário está ativo
 */
models.updateUsuario = Joi.object().keys({
  administrador: Joi.boolean().strict().required(),
  ativo: Joi.boolean().strict().required()
})

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateUsuarioLista:
 *       type: object
 *       required:
 *         - usuarios
 *       properties:
 *         usuarios:
 *           type: array
 *           description: Lista de objetos contendo UUID e status dos usuários a serem atualizados
 *           items:
 *             type: object
 *             properties:
 *               uuid:
 *                 type: string
 *                 format: uuid
 *                 description: UUID do usuário
 *               administrador:
 *                 type: boolean
 *                 description: Indica se o usuário é administrador
 *               ativo:
 *                 type: boolean
 *                 description: Indica se o usuário está ativo
 *           uniqueItems: true
 *           minItems: 1
 */
models.updateUsuarioLista = Joi.object().keys({
  usuarios: Joi.array()
    .items(
      Joi.object().keys({
        uuid: Joi.string().guid({ version: 'uuidv4' }).required(),
        administrador: Joi.boolean().strict().required(),
        ativo: Joi.boolean().strict().required()
      })
    )
    .unique('uuid')
    .required()
    .min(1)
})

module.exports = models
