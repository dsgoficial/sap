"use strict";

const express = require("express");
const Joi = require("joi");

const { sendJsonAndLog } = require("../logger");

const microcontroleCtrl = require("./microcontrole_ctrl");
const microcontroleModel = require("./microcontrole_model");

const router = express.Router();

/**
 * @apiDefine InvalidTokenError
 *
 * @apiError InvalidTokenError Token fornecido não é valido.
 *
 * @apiErrorExample InvalidTokenError:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "success": false,
 *       "message": "Failed to authenticate token"
 *     }
 */

/**
 * @apiDefine MissingTokenError
 *
 * @apiError MissingTokenError Token não fornecido.
 *
 * @apiErrorExample MissingTokenError:
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "success": false,
 *       "message": "No token provided"
 *     }
 */

/**
 * @api {post} /microcontrole/feicao Armazena sumário de produção de feições
 * @apiVersion 1.0.0
 * @apiName ArmazenaFeicao
 * @apiGroup Microcontrole
 * @apiPermission operador
 *
 * @apiDescription Armazena sumário de produção de feições de uma determinada etapa e unidade_trabalho
 *
 * @apiParam (Request body) {Integer} usuario_id ID do Usuário que está sendo monitorado
 * @apiParam (Request body) {Timestamp} data Timestamp de execução da operação
 * @apiParam (Request body) {Integer} etapa_id ID da Etapa que está sendo monitorada
 * @apiParam (Request body) {Integer} unidade_trabalho_id ID da Unidade Trabalho que está sendo monitorada
 * @apiParam (Request body) {Array} dados Lista de objetos com as informações de produção das feição
 * @apiParam (Request body) {String} dados[].operacao Tipo de operação realizada com a feição (INSERT, UPDATE ou DELETE)
 * @apiParam (Request body) {Integer} dados[].quantidade Quantidade de feições onde foi realizada aquela operação
 * @apiParam (Request body) {Real} dados[].comprimento Comprimento total das feições adicionadas (Somente para INSERT)
 * @apiParam (Request body) {Integer} dados[].vertices Número total de vértices das feições adicionadas (Somente para INSERT)
 * @apiParam (Request body) {String} dados[].camada Camada que está sendo monitorada
 *
 * @apiParamExample {json} Input
 *     {
 *       "usuario_id": 2,
 *       "data": '2018-11-92 08:32:47',
 *       "etapa_id": 5,
 *       "unidade_trabalho_id": 132,
 *       "dados": [
 *            {
 *              "operacao": 'INSERT',
 *              "quantidade": 174,
 *              "comprimento": 9882.21,
 *              "vertices": 2322,
 *              "camada": 'infra_via_deslocalmento_l'
 *            },
 *           {
 *              "operacao": 'UPDATE',
 *              "quantidade": 12,
 *              "camada": 'infra_via_deslocalmento_l'
 *            },
 *           {
 *              "operacao": 'DELETE',
 *              "quantidade": 4,
 *              "camada": 'infra_via_deslocalmento_l'
 *            },
 *            ...
 *        ]
 *     }
 *
 *
 * @apiSuccessExample {json} Resposta em caso de Sucesso:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Informações de produção de feição armazenadas com sucesso.",
 *     }
 *
 * @apiError JsonValidationError O objeto json não segue o padrão estabelecido.
 *
 * @apiErrorExample JsonValidationError:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "message": "Microcontrole Feição Post validation error"
 *     }
 *
 * @apiUse InvalidTokenError
 * @apiUse MissingTokenError
 *
 */
router.post("/feicao", async (req, res, next) => {
  let validationResult = Joi.validate(req.body, microcontroleModel.feicao, {
    stripUnknown: true
  });
  if (validationResult.error) {
    const err = new Error("Microcontrole Feição Post validation error");
    err.status = 400;
    err.context = "microcontrole_route";
    err.information = {};
    err.information.body = req.body;
    err.information.trace = validationResult.error;
    return next(err);
  }

  let { error } = await microcontroleCtrl.armazenaFeicao(
    req.body.atividade_id,
    req.body.data,
    req.body.dados
  );
  if (error) {
    return next(error);
  }

  let information = {
    atividade_id: req.body.atividade_id
  };
  return sendJsonAndLog(
    true,
    "Informações de produção de feição armazenadas com sucesso.",
    "microcontrole_route",
    information,
    res,
    200,
    null
  );
});

/**
 * @api {post} /microcontrole/apontamento Armazena sumário de apontamentos
 * @apiVersion 1.0.0
 * @apiName ArmazenaApontamento
 * @apiGroup Microcontrole
 * @apiPermission operador
 *
 * @apiDescription Armazena sumário de apontamentos de uma revisão de uma determinada etapa e unidade_trabalho
 *
 * @apiParam (Request body) {Integer} usuario_id ID do Usuário que está sendo monitorado
 * @apiParam (Request body) {Timestamp} data Timestamp de execução da operação
 * @apiParam (Request body) {Integer} etapa_id ID da Etapa que está sendo monitorada
 * @apiParam (Request body) {Integer} unidade_trabalho_id ID da Unidade Trabalho que está sendo monitorada
 * @apiParam (Request body) {Array} dados Lista de objetos com as informações de produção dos apontamentos
 * @apiParam (Request body) {String} dados[].categoria Tipo de apontamento
 * @apiParam (Request body) {Integer} dados[].quantidade Quantidade de feições onde foi realizada aquela operação
 *
 * @apiParamExample {json} Input
 *     {
 *       "usuario_id": 2,
 *       "data": '2018-11-92 08:32:47',
 *       "etapa_id": 5,
 *       "unidade_trabalho_id": 132,
 *       "dados": [
 *            {
 *              "categoria": 'Traçado incorreto',
 *              "quantidade": 6
 *            },
 *           {
 *              "categoria": 'Omissão de rodovia',
 *              "quantidade": 3
 *            },
 *            ...
 *        ]
 *     }
 *
 *
 * @apiSuccessExample {json} Resposta em caso de Sucesso:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Informações de produção de apontamento armazenadas com sucesso.",
 *     }
 *
 * @apiError JsonValidationError O objeto json não segue o padrão estabelecido.
 *
 * @apiErrorExample JsonValidationError:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "message": "Microcontrole Apontamento Post validation error"
 *     }
 *
 * @apiUse InvalidTokenError
 * @apiUse MissingTokenError
 *
 */
router.post("/apontamento", async (req, res, next) => {
  let validationResult = Joi.validate(
    req.body,
    microcontroleModel.apontamento,
    { stripUnknown: true }
  );
  if (validationResult.error) {
    const err = new Error("Microcontrole Apontamento Post validation error");
    err.status = 400;
    err.context = "microcontrole_route";
    err.information = {};
    err.information.body = req.body;
    err.information.trace = validationResult.error;
    return next(err);
  }

  let { error } = await microcontroleCtrl.armazenaApontamento(
    req.body.atividade_id,
    req.body.data,
    req.body.dados
  );
  if (error) {
    return next(error);
  }

  let information = {
    atividade_id: req.body.atividade_id
  };
  return sendJsonAndLog(
    true,
    "Informações de produção de apontamento armazenadas com sucesso.",
    "microcontrole_route",
    information,
    res,
    200,
    null
  );
});

/**
 * @api {post} /microcontrole/apontamento Armazena telas visualizadas pelo operador
 * @apiVersion 1.0.0
 * @apiName ArmazenaTela
 * @apiGroup Microcontrole
 * @apiPermission operador
 *
 * @apiDescription Armazena os poligonos da tela do operador de uma determinada etapa e unidade_trabalho
 *
 * @apiParam (Request body) {Integer} usuario_id ID do Usuário que está sendo monitorado
 * @apiParam (Request body) {Integer} etapa_id ID da Etapa que está sendo monitorada
 * @apiParam (Request body) {Integer} unidade_trabalho_id ID da Unidade Trabalho que está sendo monitorada
 * @apiParam (Request body) {Array} dados Lista de objetos com as informações de tela
 * @apiParam (Request body) {Real} dados[].x_min Valor mínimo de x do enquadramento da tela em EPSG:4674
 * @apiParam (Request body) {Real} dados[].x_max Valor máximo de x do enquadramento da tela em EPSG:4674
 * @apiParam (Request body) {Real} dados[].y_min Valor mínimo de y do enquadramento da tela em EPSG:4674
 * @apiParam (Request body) {Real} dados[].y_max Valor máximo de y do enquadramento da tela em EPSG:4674
 * @apiParam (Request body) {Timestamp} dados[].data Timestamp de visualização da tela
 *
 * @apiParamExample {json} Input
 *     {
 *       "usuario_id": 2,
 *       "etapa_id": 5,
 *       "unidade_trabalho_id": 132,
 *       "dados": [
 *            {
 *              "data": '2018-11-92 08:32:47',
 *              "x_min": -51.2208201,
 *              "y_min": -30.0680848,
 *              "x_max": -51.2195958,
 *              "y_max": -30.0666763
 *            },
 *           ...
 *        ]
 *     }
 *
 *
 * @apiSuccessExample {json} Resposta em caso de Sucesso:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Informações de tela armazenadas com sucesso.",
 *     }
 *
 * @apiError JsonValidationError O objeto json não segue o padrão estabelecido.
 *
 * @apiErrorExample JsonValidationError:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "message": "Microcontrole Tela Post validation error"
 *     }
 *
 * @apiUse InvalidTokenError
 * @apiUse MissingTokenError
 *
 */
router.post("/tela", async (req, res, next) => {
  let validationResult = Joi.validate(req.body, microcontroleModel.tela, {
    stripUnknown: true
  });
  if (validationResult.error) {
    const err = new Error("Microcontrole Tela Post validation error");
    err.status = 400;
    err.context = "microcontrole_route";
    err.information = {};
    err.information.body = req.body;
    err.information.trace = validationResult.error;
    return next(err);
  }

  let { error } = await microcontroleCtrl.armazenaTela(
    req.body.atividade_id,
    req.body.dados
  );
  if (error) {
    return next(error);
  }

  let information = {
    atividade_id: req.body.atividade_id
  };
  return sendJsonAndLog(
    true,
    "Informações de tela armazenadas com sucesso.",
    "microcontrole_route",
    information,
    res,
    200,
    null
  );
});

router.post("/acao", async (req, res, next) => {
  let validationResult = Joi.validate(req.body, microcontroleModel.acao, {
    stripUnknown: true
  });
  if (validationResult.error) {
    const err = new Error("Microcontrole Ação Post validation error");
    err.status = 400;
    err.context = "microcontrole_route";
    err.information = {};
    err.information.body = req.body;
    err.information.trace = validationResult.error;
    return next(err);
  }

  let { error } = await microcontroleCtrl.armazenaAcao(
    req.body.atividade_id,
    req.body.data
  );
  if (error) {
    return next(error);
  }

  let information = {
    atividade_id: req.body.atividade_id,
    data: req.body.data
  };
  return sendJsonAndLog(
    true,
    "Informações de ação armazenadas com sucesso.",
    "microcontrole_route",
    information,
    res,
    200,
    null
  );
});

module.exports = router;
