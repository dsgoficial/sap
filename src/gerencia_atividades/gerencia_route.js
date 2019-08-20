"use strict";

const express = require("express");
const Joi = require("joi");

const { sendJsonAndLog } = require("../logger");

const { verifyAdmin } = require("../login");

const gerenciaCtrl = require("./gerencia_ctrl");
const gerenciaModel = require("./gerencia_model");

const router = express.Router();

router.post("/estilos", verifyAdmin, async (req, res, next) => {
  let validationResult = Joi.validate(req.body, gerenciaModel.estilos);
  if (validationResult.error) {
    const err = new Error("Estilos Post validation error");
    err.status = 400;
    err.context = "gerencia_route";
    err.information = {};
    err.information.body = req.body;
    err.information.trace = validationResult.error;
    return next(err);
  }

  let { error } = await gerenciaCtrl.gravaEstilos(
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

module.exports = router;
