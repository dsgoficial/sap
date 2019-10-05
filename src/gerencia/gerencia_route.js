"use strict";

const express = require("express");
const Joi = require("joi");

const { sendJsonAndLog } = require("../logger");

const gerenciaCtrl = require("./gerencia_ctrl");
const gerenciaModel = require("./gerencia_model");

const router = express.Router();

router.get("/estilos", async (req, res, next) => {
  let { error, dados } = await gerenciaCtrl.get_estilos();
  if (error) {
    return next(error);
  }

  let information = {
    usuario_id: req.body.usuario_id
  };
  return sendJsonAndLog(
    true,
    "Estilos retornados.",
    "gerencia_route",
    information,
    res,
    200,
    dados
  );
});

router.get("/regras", async (req, res, next) => {
  let { error, dados } = await gerenciaCtrl.get_regras();
  if (error) {
    return next(error);
  }

  let information = {
    usuario_id: req.body.usuario_id
  };
  return sendJsonAndLog(
    true,
    "Regras retornados.",
    "gerencia_route",
    information,
    res,
    200,
    dados
  );
});

router.get("/modelos", async (req, res, next) => {
  let { error, dados } = await gerenciaCtrl.get_modelos();
  if (error) {
    return next(error);
  }

  let information = {
    usuario_id: req.body.usuario_id
  };
  return sendJsonAndLog(
    true,
    "Modelos retornados.",
    "gerencia_route",
    information,
    res,
    200,
    dados
  );
});

router.get("/menus", async (req, res, next) => {
  let { error, dados } = await gerenciaCtrl.get_menus();
  if (error) {
    return next(error);
  }

  let information = {
    usuario_id: req.body.usuario_id
  };
  return sendJsonAndLog(
    true,
    "Menus retornados.",
    "gerencia_route",
    information,
    res,
    200,
    dados
  );
});

router.post("/estilos", async (req, res, next) => {
  let validationResult = Joi.validate(req.body, gerenciaModel.estilos, {
    stripUnknown: true
  });
  if (validationResult.error) {
    const err = new Error("Estilos Post validation error");
    err.status = 400;
    err.context = "gerencia_route";
    err.information = {};
    err.information.body = req.body;
    err.information.trace = validationResult.error;
    return next(err);
  }

  let { error } = await gerenciaCtrl.grava_estilos(
    req.body.estilos,
    req.body.usuario_id
  );
  if (error) {
    return next(error);
  }

  let information = {
    usuario_id: req.body.usuario_id,
    estilos: req.body.estilos
  };
  return sendJsonAndLog(
    true,
    "Estilos gravados com sucesso.",
    "gerencia_route",
    information,
    res,
    200,
    null
  );
});

router.post("/regras", async (req, res, next) => {
  let validationResult = Joi.validate(req.body, gerenciaModel.regras, {
    stripUnknown: true
  });
  if (validationResult.error) {
    const err = new Error("Regras Post validation error");
    err.status = 400;
    err.context = "gerencia_route";
    err.information = {};
    err.information.body = req.body;
    err.information.trace = validationResult.error;
    return next(err);
  }

  let { error } = await gerenciaCtrl.grava_regras(
    req.body.regras,
    req.body.usuario_id
  );
  if (error) {
    return next(error);
  }

  let information = {
    usuario_id: req.body.usuario_id,
    regras: req.body.regras
  };
  return sendJsonAndLog(
    true,
    "Regras gravadas com sucesso.",
    "gerencia_route",
    information,
    res,
    200,
    null
  );
});

router.post("/menus", async (req, res, next) => {
  let validationResult = Joi.validate(req.body, gerenciaModel.menus, {
    stripUnknown: true
  });
  if (validationResult.error) {
    const err = new Error("Menus Post validation error");
    err.status = 400;
    err.context = "gerencia_route";
    err.information = {};
    err.information.body = req.body;
    err.information.trace = validationResult.error;
    return next(err);
  }

  let { error } = await gerenciaCtrl.grava_menus(
    req.body.menus,
    req.body.usuario_id
  );
  if (error) {
    return next(error);
  }

  let information = {
    usuario_id: req.body.usuario_id,
    menus: req.body.menus
  };
  return sendJsonAndLog(
    true,
    "Menus gravados com sucesso.",
    "gerencia_route",
    information,
    res,
    200,
    null
  );
});

router.post("/modelos", async (req, res, next) => {
  let validationResult = Joi.validate(req.body, gerenciaModel.qgis_models, {
    stripUnknown: true
  });
  if (validationResult.error) {
    const err = new Error("Modelos Post validation error");
    err.status = 400;
    err.context = "gerencia_route";
    err.information = {};
    err.information.body = req.body;
    err.information.trace = validationResult.error;
    return next(err);
  }

  let { error } = await gerenciaCtrl.grava_modelos(
    req.body.modelos,
    req.body.usuario_id
  );
  if (error) {
    return next(error);
  }

  let information = {
    usuario_id: req.body.usuario_id,
    menus: req.body.modelos
  };
  return sendJsonAndLog(
    true,
    "Modelos gravados com sucesso.",
    "gerencia_route",
    information,
    res,
    200,
    null
  );
});

/**
 * @api {get} /gerencia/atividade/id Retorna atividade em execução
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
router.get("/atividade/:id", async (req, res, next) => {
  let { error, dados } = await gerenciaCtrl.get_atividade(req.params.id);
  if (error) {
    return next(error);
  }

  let information = {
    atividade_id: req.params.id
  };
  if (dados) {
    return sendJsonAndLog(
      true,
      "Atividade retornada.",
      "gerencia_route",
      information,
      res,
      200,
      dados
    );
  } else {
    return sendJsonAndLog(
      true,
      "Atividade não encontrada.",
      "gerencia_route",
      information,
      res,
      200,
      null
    );
  }
});

router.get("/atividade/usuario/:id", async (req, res, next) => {
  let { erro, dados } = await gerenciaCtrl.get_atividade_usuario(req.params.id);
  if (erro) {
    return next(erro);
  }

  let information = {
    atividade_id: req.params.id
  };
  if (dados) {
    return sendJsonAndLog(
      true,
      "Atividade retornada.",
      "gerencia_route",
      information,
      res,
      200,
      dados
    );
  } else {
    return sendJsonAndLog(
      true,
      "Atividade do usuário não encontrada.",
      "gerencia_route",
      information,
      res,
      200,
      null
    );
  }
});

router.get("/banco_dados", async (req, res, next) => {
  let { error, dados } = await gerenciaCtrl.get_banco_dados();
  if (error) {
    return next(error);
  }

  let information = {
    usuario_id: req.body.usuario_id
  };
  return sendJsonAndLog(
    true,
    "Banco de dados retornados.",
    "gerencia_route",
    information,
    res,
    200,
    dados
  );
});

router.get("/usuario", async (req, res, next) => {
  let { error, dados } = await gerenciaCtrl.get_usuario();
  if (error) {
    return next(error);
  }

  let information = {
    usuario_id: req.body.usuario_id
  };
  return sendJsonAndLog(
    true,
    "Usuários retornados.",
    "gerencia_route",
    information,
    res,
    200,
    dados
  );
});

router.get("/perfil_producao", async (req, res, next) => {
  let { error, dados } = await gerenciaCtrl.get_perfil_producao();
  if (error) {
    return next(error);
  }

  let information = {
    usuario_id: req.body.usuario_id
  };
  return sendJsonAndLog(
    true,
    "Perfis de produção retornados.",
    "gerencia_route",
    information,
    res,
    200,
    dados
  );
});

router.post("/unidade_trabalho/disponivel", async (req, res, next) => {
  let validationResult = Joi.validate(
    req.body,
    gerenciaModel.unidade_trabalho_disponivel,
    {
      stripUnknown: true
    }
  );
  if (validationResult.error) {
    const err = new Error("Unidade Trabalho Disponível Post validation error");
    err.status = 400;
    err.context = "gerencia_route";
    err.information = {};
    err.information.body = req.body;
    err.information.trace = validationResult.error;
    return next(err);
  }

  let { error } = await gerenciaCtrl.unidade_trabalho_disponivel(
    req.body.unidade_trabalho_ids,
    req.body.disponivel
  );
  if (error) {
    return next(error);
  }

  let information = {
    unidade_trabalho_ids: req.body.unidade_trabalho_ids,
    disponivel: req.body.disponivel
  };
  return sendJsonAndLog(
    true,
    "Atributo disponível das unidades de trabalho atualizado com sucesso.",
    "gerencia_route",
    information,
    res,
    200,
    null
  );
});

router.post("/atividade/pausar", async (req, res, next) => {
  let validationResult = Joi.validate(
    req.body,
    gerenciaModel.atividade_pausar,
    {
      stripUnknown: true
    }
  );
  if (validationResult.error) {
    const err = new Error("Pausar atividade Post validation error");
    err.status = 400;
    err.context = "gerencia_route";
    err.information = {};
    err.information.body = req.body;
    err.information.trace = validationResult.error;
    return next(err);
  }

  let { error } = await gerenciaCtrl.pausa_atividade(
    req.body.unidade_trabalho_ids
  );
  if (error) {
    return next(error);
  }

  let information = {
    unidade_trabalho_ids: req.body.unidade_trabalho_ids
  };
  return sendJsonAndLog(
    true,
    "Atividade pausada com sucesso.",
    "gerencia_route",
    information,
    res,
    200,
    null
  );
});

router.post("/atividade/reiniciar", async (req, res, next) => {
  let validationResult = Joi.validate(
    req.body,
    gerenciaModel.atividade_reiniciar,
    {
      stripUnknown: true
    }
  );
  if (validationResult.error) {
    const err = new Error("Reinicia atividade Post validation error");
    err.status = 400;
    err.context = "gerencia_route";
    err.information = {};
    err.information.body = req.body;
    err.information.trace = validationResult.error;
    return next(err);
  }

  let { error } = await gerenciaCtrl.reinicia_atividade(
    req.body.unidade_trabalho_ids
  );
  if (error) {
    return next(error);
  }

  let information = {
    unidade_trabalho_ids: req.body.unidade_trabalho_ids
  };
  return sendJsonAndLog(
    true,
    "Atividade reiniciada com sucesso.",
    "gerencia_route",
    information,
    res,
    200,
    null
  );
});

router.post("/atividade/voltar", async (req, res, next) => {
  let validationResult = Joi.validate(
    req.body,
    gerenciaModel.atividade_voltar,
    {
      stripUnknown: true
    }
  );
  if (validationResult.error) {
    const err = new Error("Volta atividade Post validation error");
    err.status = 400;
    err.context = "gerencia_route";
    err.information = {};
    err.information.body = req.body;
    err.information.trace = validationResult.error;
    return next(err);
  }

  let { error } = await gerenciaCtrl.volta_atividade(
    req.body.atividade_ids,
    req.body.manter_usuarios
  );
  if (error) {
    return next(error);
  }

  let information = {
    atividade_ids: req.body.atividade_ids,
    manter_usuarios: req.body.manter_usuarios
  };
  return sendJsonAndLog(
    true,
    "Atividade voltou para etapa anterior com sucesso.",
    "gerencia_route",
    information,
    res,
    200,
    null
  );
});

router.post("/atividade/avancar", async (req, res, next) => {
  let validationResult = Joi.validate(
    req.body,
    gerenciaModel.atividade_avancar,
    {
      stripUnknown: true
    }
  );
  if (validationResult.error) {
    const err = new Error("Avança atividade Post validation error");
    err.status = 400;
    err.context = "gerencia_route";
    err.information = {};
    err.information.body = req.body;
    err.information.trace = validationResult.error;
    return next(err);
  }

  let { error } = await gerenciaCtrl.avanca_atividade(
    req.body.atividade_ids,
    req.body.concluida
  );
  if (error) {
    return next(error);
  }

  let information = {
    atividade_ids: req.body.atividade_ids,
    concluida: req.body.concluida
  };
  return sendJsonAndLog(
    true,
    "Atividade avançou para próxima etapa com sucesso.",
    "gerencia_route",
    information,
    res,
    200,
    null
  );
});

router.post("/atividade/criar_revisao", async (req, res, next) => {
  let validationResult = Joi.validate(
    req.body,
    gerenciaModel.atividade_criar_revisao,
    {
      stripUnknown: true
    }
  );
  if (validationResult.error) {
    const err = new Error("Criar revisão Post validation error");
    err.status = 400;
    err.context = "gerencia_route";
    err.information = {};
    err.information.body = req.body;
    err.information.trace = validationResult.error;
    return next(err);
  }

  let { error } = await gerenciaCtrl.cria_revisao(
    req.body.unidade_trabalho_ids
  );
  if (error) {
    return next(error);
  }

  let information = {
    unidade_trabalho_ids: req.body.unidade_trabalho_ids
  };
  return sendJsonAndLog(
    true,
    "Revisão criada com sucesso.",
    "gerencia_route",
    information,
    res,
    200,
    null
  );
});

router.post("/atividade/criar_revcorr", async (req, res, next) => {
  let validationResult = Joi.validate(
    req.body,
    gerenciaModel.atividade_criar_revcorr,
    {
      stripUnknown: true
    }
  );
  if (validationResult.error) {
    const err = new Error("Criar revcorr Post validation error");
    err.status = 400;
    err.context = "gerencia_route";
    err.information = {};
    err.information.body = req.body;
    err.information.trace = validationResult.error;
    return next(err);
  }

  let { error } = await gerenciaCtrl.cria_revcorr(
    req.body.unidade_trabalho_ids
  );
  if (error) {
    return next(error);
  }

  let information = {
    unidade_trabalho_ids: req.body.unidade_trabalho_ids
  };
  return sendJsonAndLog(
    true,
    "Revisão/Correção criada com sucesso.",
    "gerencia_route",
    information,
    res,
    200,
    null
  );
});

router.post("/fila_prioritaria", async (req, res, next) => {
  let validationResult = Joi.validate(
    req.body,
    gerenciaModel.fila_prioritaria,
    {
      stripUnknown: true
    }
  );
  if (validationResult.error) {
    const err = new Error("Fila prioritaria Post validation error");
    err.status = 400;
    err.context = "gerencia_route";
    err.information = {};
    err.information.body = req.body;
    err.information.trace = validationResult.error;
    return next(err);
  }

  let { error } = await gerenciaCtrl.cria_fila_prioritaria(
    req.body.atividade_ids,
    req.body.usuario_prioridade_id,
    req.body.prioridade
  );
  if (error) {
    return next(error);
  }

  let information = {
    atividade_ids: req.body.atividade_ids,
    usuario_prioridade_id: req.body.usuario_prioridade_id,
    prioridade: req.body.prioridade
  };
  return sendJsonAndLog(
    true,
    "Fila prioritaria criada com sucesso.",
    "gerencia_route",
    information,
    res,
    200,
    null
  );
});

router.post("/fila_prioritaria_grupo", async (req, res, next) => {
  let validationResult = Joi.validate(
    req.body,
    gerenciaModel.fila_prioritaria_grupo,
    {
      stripUnknown: true
    }
  );
  if (validationResult.error) {
    const err = new Error("Fila prioritaria grupo Post validation error");
    err.status = 400;
    err.context = "gerencia_route";
    err.information = {};
    err.information.body = req.body;
    err.information.trace = validationResult.error;
    return next(err);
  }

  let { error } = await gerenciaCtrl.cria_fila_prioritaria_grupo(
    req.body.atividade_ids,
    req.body.perfil_producao_id,
    req.body.prioridade
  );
  if (error) {
    return next(error);
  }

  let information = {
    atividade_ids: req.body.atividade_ids,
    perfil_producao_id: req.body.perfil_producao_id,
    prioridade: req.body.prioridade
  };
  return sendJsonAndLog(
    true,
    "Fila prioritaria grupo criada com sucesso.",
    "gerencia_route",
    information,
    res,
    200,
    null
  );
});

router.post("/observacao", async (req, res, next) => {
  let validationResult = Joi.validate(req.body, gerenciaModel.observacao, {
    stripUnknown: true
  });
  if (validationResult.error) {
    const err = new Error("Observação Post validation error");
    err.status = 400;
    err.context = "gerencia_route";
    err.information = {};
    err.information.body = req.body;
    err.information.trace = validationResult.error;
    return next(err);
  }

  let { error } = await gerenciaCtrl.cria_observacao(
    req.body.atividade_ids,
    req.body.observacao_atividade,
    req.body.observacao_etapa,
    req.body.observacao_subfase,
    req.body.observacao_unidade_trabalho
  );
  if (error) {
    return next(error);
  }

  let information = {
    atividade_ids: req.body.atividade_ids,
    observacao_atividade: req.body.observacao_atividade,
    observacao_etapa: req.body.observacao_etapa,
    observacao_subfase: req.body.observacao_subfase,
    observacao_unidade_trabalho: req.body.observacao_unidade_trabalho
  };
  return sendJsonAndLog(
    true,
    "Observação criada com sucesso.",
    "gerencia_route",
    information,
    res,
    200,
    null
  );
});

module.exports = router;
