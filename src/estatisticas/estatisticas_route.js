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
    "Ações por usuário retornados.",
    "estatisticas_route",
    information,
    res,
    200,
    dados
  );
});

router.get("/activity_time", function(req, res) {
  res.sendFile(path.join(__dirname + "/html/activity_time.html"));
});

module.exports = router;
