const express = require("express");
const Joi = require("joi");

const logger = require("../logger/logger");
const sendJsonAndLog = require("../logger/sendJsonAndLog");

const producaoCtrl = require("./distribuicao_ctrl");
const producaoModel = require("./distribuicao_model");

const router = express.Router();

//FIXME APIDOC

router.post("/finaliza", (req, res, next) => {
  let validationResult = Joi.validate(req.body, producaoCtrl);
  if (validationResult.error) {
    const err = new Error("Finaliza Post validation error");
    err.status = 400;
    err.context = "distribuicao_route";
    err.information = {};
    err.information.body = req.body;
    next(err);
  }

  let { finalizaError } = producaoCtrl.finaliza(
    req.usuario_id,
    req.body.subfase_etapa_id,
    req.body.unidade_trabalho_id
  );
  if (finalizaError) {
    next(finalizaError);
  }

  let information = {
    usuario_id: req.usuario_id,
    subfase_etapa_id: req.body.subfase_etapa_id,
    unidade_trabalho_id: req.body.unidade_trabalho_id
  };
  sendJsonAndLog(
    true,
    "Atividade finalizada com sucesso.",
    "distribuicao_route",
    information,
    res,
    200,
    null
  );
});

router.get("/verifica", (req, res, next) => {
  let { verificaError, dados } = producaoCtrl.verifica(req.usuario_id);
  if (verificaError) {
    next(verificaError);
  }

  let information = {
    usuario_id: req.usuario_id
  };
  if (dados) {
    sendJsonAndLog(
      true,
      "Atividade em execução retornada.",
      "distribuicao_route",
      information,
      res,
      200,
      dados
    );
  } else {
    sendJsonAndLog(
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

router.post("/inicia", (req, res, next) => {
  let { iniciaError, dados } = inicia.verifica(req.usuario_id);
  if (iniciaError) {
    next(iniciaError);
  }

  let information = {
    usuario_id: req.usuario_id
  };

  if (dados) {
    sendJsonAndLog(
      true,
      "Atividade iniciada.",
      "distribuicao_route",
      information,
      res,
      200,
      dados
    );
  } else {
    sendJsonAndLog(
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
