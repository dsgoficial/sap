"use strict";

const express = require("express");

const { schemaValidation, asyncHandler, httpCode } = require("../utils");

const loginCtrl = require("./login_ctrl");
const loginSchema = require("./login_schema");

const router = express.Router();

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Autenticação de um usuário
 *     description: Retorna um token de autenticação caso o usuário seja válido e as versões dos plugins e do QGIS estejam corretas
 *     produces:
 *       - application/json
 *     tags:
 *       - login
 *     requestBody:
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         properties:
 *          usuario:
 *           type: string
 *           description: Nome do usuário
 *          senha:
 *           type: string
 *           description: Senha do usuário
 *          qgis:
 *           type: string
 *           description: Versão do QGIS em uso
 *          plugins:
 *           type: array
 *           description: Lista de plugins em uso
 *           items:
 *            type: object
 *            properties:
 *             nome:
 *              type: string
 *              description: Nome do plugin
 *             versao:
 *              type: string
 *              description: Versão do plugin
 *     responses:
 *       201:
 *         message: Usuário autenticado com sucesso
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               description: Indica se a requisição ocorreu com sucesso
 *             message:
 *               type: string
 *               description: Descrição do resultado da requisição
 *             version:
 *               type: string
 *               description: Versão do SAP
 *             dados:
 *               type: object
 *               properties:
 *                administrador:
 *                 type: boolean
 *                 description: Indicar se o usuário possui privilégios de administrador
 *                token:
 *                 type: string
 *                 description: Token de login
 */
router.post(
  "/",
  schemaValidation({ body: loginSchema.login }),
  asyncHandler(async (req, res, next) => {
    const { token, administrador } = await loginCtrl.login(
      req.body.usuario,
      req.body.senha,
      req.body.plugins,
      req.body.qgis
    );

    return res.sendJsonAndLog(
      true,
      "Usuário autenticado com sucesso",
      httpCode.Created,
      { token, administrador }
    );
  })
);

module.exports = router;
