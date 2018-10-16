"use strict";

const express = require("express");
const Joi = require("joi");

const { sendJsonAndLog } = require("../logger");

const producaoCtrl = require("./distribuicao_ctrl");
const producaoModel = require("./distribuicao_model");

const router = express.Router();

/**
 * @apiDefine Distribuicao Distribuição
 */

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
 * @api {post} /distribuicao/finaliza Finaliza atividade em execução
 * @apiVersion 1.0.0
 * @apiName FinalizaAtividade
 * @apiGroup Distribuicao
 * @apiPermission operador
 *
 * @apiDescription Finaliza uma atividade indicada por uma etapa e uma unidade_trabalho
 *
 * @apiParam (Request body) {Integer} etapa_id ID da Subfase-Etapa que deve ser finalizada
 * @apiParam (Request body) {Integer} unidade_trabalho_id ID da Unidade Trabalho que deve ser finalizada
 *
 * @apiParamExample {json} Input
 *     {
 *       "etapa_id": 5,
 *       "unidade_trabalho_id": 132
 *     }
 *
 * @apiSuccess {String} message  Mensagem de sucesso.
 *
 * @apiSuccessExample {json} Resposta em caso de Sucesso:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Atividade finalizada com sucesso.",
 *     }
 *
 * @apiError JsonValidationError O objeto json não segue o padrão estabelecido.
 *
 * @apiErrorExample JsonValidationError:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "message": "Finaliza Post validation error"
 *     }
 *
 * @apiUse InvalidTokenError
 * @apiUse MissingTokenError
 *
 */
router.post("/finaliza", async (req, res, next) => {
  let validationResult = Joi.validate(req.body, producaoModel.finaliza);
  if (validationResult.error) {
    const err = new Error("Finaliza Post validation error");
    err.status = 400;
    err.context = "distribuicao_route";
    err.information = {};
    err.information.body = req.body;
    err.information.trace = validationResult.error;
    return next(err);
  }

  let { finalizaError } = await producaoCtrl.finaliza(
    req.body.usuario_id,
    req.body.etapa_id,
    req.body.unidade_trabalho_id
  );
  if (finalizaError) {
    return next(finalizaError);
  }

  let information = {
    usuario_id: req.body.usuario_id,
    etapa_id: req.body.etapa_id,
    unidade_trabalho_id: req.body.unidade_trabalho_id
  };
  return sendJsonAndLog(
    true,
    "Atividade finalizada com sucesso.",
    "distribuicao_route",
    information,
    res,
    200,
    null
  );
});

/**
 * @api {get} /distribuicao/verifica Retorna atividade em execução
 * @apiGroup Distribuicao
 *
 * @apiSuccessExample Sem atividade em execução:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Sem atividade em execução."
 *     }
 *
 * @apiSuccessExample Com atividade em execução:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Atividade em execução retornada.",
 *       "dados": {...}
 *     }
 *
 *
 * @apiUse InvalidTokenError
 * @apiUse MissingTokenError
 *
 */
router.get("/verifica", async (req, res, next) => {
  let { verificaError, dados } = await producaoCtrl.verifica(
    req.body.usuario_id
  );
  if (verificaError) {
    return next(verificaError);
  }

  let information = {
    usuario_id: req.body.usuario_id
  };
  if (dados) {
    return sendJsonAndLog(
      true,
      "Atividade em execução retornada.",
      "distribuicao_route",
      information,
      res,
      200,
      dados
    );
  } else {
    return sendJsonAndLog(
      true,
      "Sem atividade em execução.",
      "distribuicao_route",
      information,
      res,
      200,
      null
    );
  }
});

/**
 * @api {post} /distribuicao/incia Inicia uma nova atividade
 * @apiGroup Distribuicao
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Sem atividades disponíveis para iniciar."
 *     }
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Atividade iniciada.",
 *       "dados": {...}
 *     }
 *
 *
 * @apiUse InvalidTokenError
 * @apiUse MissingTokenError
 *
 */
router.post("/inicia", async (req, res, next) => {
  let { iniciaError, dados } = await producaoCtrl.inicia(req.body.usuario_id);
  if (iniciaError) {
    return next(iniciaError);
  }

  let information = {
    usuario_id: req.body.usuario_id
  };

  if (dados) {
    return sendJsonAndLog(
      true,
      "Atividade iniciada.",
      "distribuicao_route",
      information,
      res,
      200,
      dados
    );
  } else {
    return sendJsonAndLog(
      true,
      "Sem atividades disponíveis para iniciar.",
      "distribuicao_route",
      information,
      res,
      200,
      null
    );
  }
});

router.post("/pausa", (req, res, next) => {
  //pass
});

module.exports = router;
