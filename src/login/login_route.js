"use strict";

const express = require("express");
const Joi = require("joi");

const { sendJsonAndLog } = require("../logger");

const loginCtrl = require("./login_ctrl");
const loginModel = require("./login_model");

const router = express.Router();

/**
 * @api {post} /login Autenticação de um usuário
 * @apiGroup Login
 *
 * @apiParam (Request body) {String} usuario Usuário conforme acesso ao banco de dados de produção
 * @apiParam (Request body) {String} senha Senha conforme acesso ao banco de dados de produção
 *
 * @apiSuccess {String} token JWT Token for authentication.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Authentication success",
 *       "token": "eyJhbGciOiJIUzI1NiIsIn..."
 *     }
 *
 * @apiError JsonValidationError O objeto json não segue o padrão estabelecido.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "message": "Login Post validation error"
 *     }
 *
 * @apiError AuthenticationError Usuário ou senha inválidas.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "success": false,
 *       "message": "Falha durante autenticação"
 *     }
 */
router.post("/", async (req, res, next) => {
  let validationResult = Joi.validate(req.body, loginModel.login);
  if (validationResult.error) {
    const err = new Error("Login Post validation error");
    err.status = 400;
    err.context = "login_route";
    err.information = {};
    err.information.body = req.body;
    err.information.trace = validationResult.error;
    return next(err);
  }

  let { loginError, token } = await loginCtrl.login(
    req.body.usuario,
    req.body.senha
  );
  if (loginError) {
    return next(loginError);
  }

  return sendJsonAndLog(
    true,
    "Authentication success",
    "login_route",
    null,
    res,
    200,
    { token }
  );
});

module.exports = router;
