"use strict";

const express = require("express");

const { schemaValidation, asyncHandler, httpCode } = require("../utils");

const microcontroleCtrl = require("./microcontrole_ctrl");
const microcontroleSchema = require("./microcontrole_schema");

const router = express.Router();

router.post("/feicao", schemaValidation({ body: microcontroleSchema.feicao }),  asyncHandler(async (req, res, next) => {
  await microcontroleCtrl.armazenaFeicao(
    req.body.atividade_id,
    req.body.data,
    req.body.dados
  );

  const msg = "Informações de produção de feição armazenadas com sucesso";

  return res.sendJsonAndLog(true, msg, httpCode.Created);

}));

router.post("/apontamento", schemaValidation({ body: microcontroleSchema.apontamento }),  asyncHandler(async (req, res, next) => {
  await microcontroleCtrl.armazenaApontamento(
    req.body.atividade_id,
    req.body.data,
    req.body.dados
  );

  const msg = "Informações de produção de apontamento armazenadas com sucesso";

  return res.sendJsonAndLog(true, msg, httpCode.Created);

}));

router.post("/tela", schemaValidation({ body: microcontroleSchema.tela }),  asyncHandler(async (req, res, next) => {
  await microcontroleCtrl.armazenaTela(
    req.body.atividade_id,
    req.body.dados
  );

  const msg = "Informações de tela armazenadas com sucesso";

  return res.sendJsonAndLog(true, msg, httpCode.Created);

}));

router.post("/acao", schemaValidation({ body: microcontroleSchema.acao }),  asyncHandler(async (req, res, next) => {
  await microcontroleCtrl.armazenaAcao(req.body.atividade_id);

  const msg = "Informações de ação armazenadas com sucesso";

  return res.sendJsonAndLog(true, msg, httpCode.Created);

}));

module.exports = router;
