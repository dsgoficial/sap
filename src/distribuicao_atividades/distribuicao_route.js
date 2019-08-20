"use strict";

const express = require("express");
const Joi = require("joi");

const { sendJsonAndLog } = require("../logger");

const { verifyAdmin } = require("../login");

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
 * @apiParam (Request body) {Integer} subfase_etapa_id ID da Etapa que deve ser finalizada
 * @apiParam (Request body) {Integer} unidade_trabalho_id ID da Unidade Trabalho que deve ser finalizada
 *
 * @apiParamExample {json} Input
 *     {
 *       "subfase_etapa_id": 5,
 *       "unidade_trabalho_id": 132
 *     }
 *
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
    req.body.atividade_id,
    req.body.sem_correcao
  );
  if (finalizaError) {
    return next(finalizaError);
  }

  let information = {
    usuario_id: req.body.usuario_id,
    atividade_id: req.body.atividade_id,
    sem_correcao: req.body.sem_correcao
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
 * @apiVersion 1.0.0
 * @apiName VerificaAtividade
 * @apiPermission operador
 *
 *
 * @apiDescription Verifica a atividade em execução para um determinado usuário
 *
 *
 * @apiSuccess {String} dados Em caso de existir uma nova atividade retorna os dados desta atividade.
 *
 * @apiSuccessExample {json} Sem atividade em execução:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Sem atividade em execução."
 *     }
 *
 * @apiSuccessExample {json} Com atividade em execução:
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
 * @api {post} /distribuicao/inicia Inicia uma nova atividade
 * @apiGroup Distribuicao
 * @apiVersion 1.0.0
 * @apiName IniciaAtividade
 * @apiPermission operador
 *
 * @apiDescription Inicia uma nova atividade para um determinado usuário
 *
 *
 * @apiSuccess {String} dados Em caso de existir uma nova atividade retorna os dados desta atividade.
 *
 * @apiSuccessExample Sem atividades disponíveis:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Sem atividades disponíveis para iniciar."
 *     }
 *
 * @apiSuccessExample Atividade iniciada:
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

/**
 * @api {post} /distribuicao/resposta_questionario Envia a resposta de um questionario
 * @apiVersion 1.0.0
 * @apiName EnviaQuestionario
 * @apiGroup Distribuicao
 * @apiPermission operador
 *
 * @apiDescription Envia as respostas de um questionário referente a uma atividade
 *
 * @apiParam (Request body) {Integer} atividade_id ID da Atividade referente ao questionário
 * @apiParam (Request body) {Array} respostas Array de respostas contendo os Ids das perguntas e da opção escolhida
 * @apiParamExample {json} Input
 *     {
 *       "atividade_id": 5,
 *       "respostas": [
 *          {
 *            "pergunta_id": 1,
 *            "opcao_id": 3
 *          },
 *          {
 *            "pergunta_id": 2,
 *            "opcao_id": 2
 *          },
 *       ]
 *     }
 *
 *
 * @apiSuccessExample {json} Resposta em caso de Sucesso:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Questionário enviado com sucesso.",
 *     }
 *
 * @apiError JsonValidationError O objeto json não segue o padrão estabelecido.
 *
 * @apiErrorExample JsonValidationError:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "message": "Envia questionario validation error"
 *     }
 *
 * @apiUse InvalidTokenError
 * @apiUse MissingTokenError
 *
 */
router.post("/resposta_questionario", async (req, res, next) => {
  let validationResult = Joi.validate(
    req.body,
    producaoModel.resposta_questionario, {
      stripUnknown: true
    }
  );
  if (validationResult.error) {
    const err = new Error("Envia questionario validation error");
    err.status = 400;
    err.context = "distribuicao_route";
    err.information = {};
    err.information.body = req.body;
    err.information.trace = validationResult.error;
    return next(err);
  }

  let { error } = await producaoCtrl.respondeQuestionario(
    req.body.atividade_id,
    req.body.respostas
  );
  if (error) {
    return next(error);
  }

  let information = {
    atividade_id: req.body.atividade_id,
    respostas: req.body.respostas
  };
  return sendJsonAndLog(
    true,
    "Questionário enviado com sucesso.",
    "distribuicao_route",
    information,
    res,
    200,
    null
  );
});

/**
 * @api {post} /distribuicao/problema_atividade Envia um problema na atividade
 * @apiVersion 1.0.0
 * @apiName EnviaProblemaAtividade
 * @apiGroup Distribuicao
 * @apiPermission operador
 *
 * @apiDescription Envia um problema na atividade, bloqueando a atividade e enviando uma nova ao operador
 *
 * @apiParam (Request body) {Integer} usuario_id ID do Usuário que está enviando o problema
 * @apiParam (Request body) {Integer} unidade_trabalho_id ID da Unidade de Trabalho referente ao problema
 * @apiParam (Request body) {Integer} etapa_id ID da Etapa referente ao problema
 * @apiParam (Request body) {Integer} tipo_problema_id ID do tipo do problema da atividade
 * @apiParam (Request body) {String} descricao Descrição textual do problema ocorrido na atividade

 * @apiParamExample {json} Input
 *     {
 *       "usuario_id": 5,
 *       "unidade_trabalho_id": 342,
 *       "etapa_id": 12,
 *       "tipo_problema_id": 2,
 *       "descricao": "Foi deletado incorretamente todos os vetores de vegetação"
 *     }
 *
 *
 * @apiSuccessExample {json} Resposta em caso de Sucesso:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Problema atividade com sucesso.",
 *     }
 *
 * @apiError JsonValidationError O objeto json não segue o padrão estabelecido.
 *
 * @apiErrorExample JsonValidationError:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "message": "Problema atividade validation error"
 *     }
 *
 * @apiUse InvalidTokenError
 * @apiUse MissingTokenError
 *
 */
router.post("/problema_atividade", async (req, res, next) => {
  let validationResult = Joi.validate(
    req.body,
    producaoModel.problema_atividade, {
      stripUnknown: true
    }
  );
  if (validationResult.error) {
    const err = new Error("Problema atividade validation error");
    err.status = 400;
    err.context = "distribuicao_route";
    err.information = {};
    err.information.body = req.body;
    err.information.trace = validationResult.error;
    return next(err);
  }

  let { error } = await producaoCtrl.problemaAtividade(
    req.body.atividade_id,
    req.body.tipo_problema_id,
    req.body.descricao
  );
  if (error) {
    return next(error);
  }

  let information = {
    atividade_id: req.body.atividade_id,
    tipo_problema_id: req.body.tipo_problema_id,
    descricao: req.body.descricao
  };
  return sendJsonAndLog(
    true,
    "Problema atividade com sucesso.",
    "distribuicao_route",
    information,
    res,
    200,
    null
  );
});


router.get("/tipo_problema", async (req, res, next) => {
  let { error, dados } = await producaoCtrl.get_tipo_problema();
  if (error) {
    return next(error);
  }

  let information = {
    usuario_id: req.body.usuario_id
  };
  return sendJsonAndLog(
    true,
    "Tipo problema retornado.",
    "distribuicao_route",
    information,
    res,
    200,
    dados
  );
});

/**
 * @api {get} /distribuicao/atividade/id Retorna atividade em execução
 * @apiGroup Distribuicao
 * @apiVersion 2.0.0
 * @apiName AtividadePorId
 * @apiPermission operador
 *
 *
 * @apiDescription Retorna a atividade de um determinado ID
 *
 *
 * @apiSuccess {String} dados Em caso de existir uma atividade com o determinado ID retorna os dados desta atividade.
 *
 * @apiSuccessExample {json} Atividade retornada:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Atividade retornada.",
 *       "dados": {...}
 *     }
 *
 *
 *
 */
router.get("/atividade/:id", verifyAdmin, async (req, res, next) => {
  let { verificaError, dados } = await producaoCtrl.atividade(
    req.params.id
  );
  if (verificaError) {
    return next(verificaError);
  }

  let information = {
    atividade_id: req.params.id
  };
  if (dados) {
    return sendJsonAndLog(
      true,
      "Atividade retornada.",
      "distribuicao_route",
      information,
      res,
      200,
      dados
    );
  } else {
    return sendJsonAndLog(
      true,
      "Atividade não encontrada.",
      "distribuicao_route",
      information,
      res,
      200,
      null
    );
  }
});

module.exports = router;
