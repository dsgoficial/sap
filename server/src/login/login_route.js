'use strict'

const express = require('express')

const { schemaValidation, asyncHandler, httpCode } = require('../utils')

const loginCtrl = require('./login_ctrl')
const loginSchema = require('./login_schema')

const router = express.Router()

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Autenticação de um usuário
 *     description: Retorna um token de autenticação caso o usuário seja válido e as versões dos plugins e do QGIS estejam corretas.
 *     produces:
 *       - application/json
 *     tags:
 *       - login
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       201:
 *         description: Usuário autenticado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indica se a requisição ocorreu com sucesso
 *                 message:
 *                   type: string
 *                   description: Descrição do resultado da requisição
 *                 dados:
 *                   type: object
 *                   properties:
 *                     administrador:
 *                       type: boolean
 *                       description: Indica se o usuário possui privilégios de administrador
 *                     token:
 *                       type: string
 *                       description: Token de login
 *       400:
 *         description: Erro de validação ou autenticação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   description: Descrição do erro ocorrido
 */
router.post(
  '/',
  schemaValidation({ body: loginSchema.login }),
  asyncHandler(async (req, res, next) => {
    const dados = await loginCtrl.login(
      req.body.usuario,
      req.body.senha,
      req.body.cliente,
      req.body.plugins,
      req.body.qgis
    )

    return res.sendJsonAndLog(
      true,
      'Usuário autenticado com sucesso',
      httpCode.Created,
      dados
    )
  })
)

module.exports = router
