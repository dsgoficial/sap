"use strict";

const express = require("express");
const Joi = require("joi");
const path = require("path");

const { sendJsonAndLog } = require("../logger");

const estatisticasCtrl = require("./estatisticas_ctrl");
const estatisticasModel = require("./estatisticas_model");

const router = express.Router();

router.get("/acao/usuario/:id", async (req, res, next) => {
  let { error, dados } = await estatisticasCtrl.get_acao_usuario(
    req.params.id,
    req.query.dias
  );
  if (error) {
    return next(error);
  }
  let information = {
    usuario_id: req.params.id
  };
  return sendJsonAndLog(
    true,
    "Ações por usuário retornadas.",
    "estatisticas_route",
    information,
    res,
    200,
    dados
  );
});

router.get("/acao/em_execucao", async (req, res, next) => {
  let { error, dados } = await estatisticasCtrl.get_acao_em_execucao();
  if (error) {
    return next(error);
  }

  return sendJsonAndLog(
    true,
    "Ações de usuários com atividade em exeucução retornadas.",
    "estatisticas_route",
    null,
    res,
    200,
    dados
  );
});

module.exports = router;
