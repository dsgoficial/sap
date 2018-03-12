const express = require("express");
const Joi = require("joi");

const logger = require("../logger/logger");

const producaoCtrl = require("./distribuicao_ctrl");
const producaoModel = require("./distribuicao_model");

const router = express.Router();

//FIXME APIDOC

router.post("/finaliza", (req, res, next) => {
  let validationResult = Joi.validate(req.body, producaoCtrl);
  if (validationResult.error) {
    logger.error("Finaliza Post validation error", {
      context: "distribuicao_route",
      body: req.body,
      status: 400
    });
    return res.status(400).json({
      sucess: false,
      message: "Finalizar deve conter subfase_etapa_id e unidade_trabalho_id."
    });
  }

  let { finalizaError } = producaoCtrl.finaliza(
    req.usuario_id,
    req.body.subfase_etapa_id,
    req.body.unidade_trabalho_id
  );
  if (finalizaError) {
    return res.status(finalizaError.status).json({
      sucess: false,
      message: finalizaError.message
    });
  }

  logger.info("Atividade finalizada", {
    context: "login_route",
    usuario_id: req.usuario_id,
    subfase_etapa_id: req.body.subfase_etapa_id,
    unidade_trabalho_id: req.body.unidade_trabalho_id,
    status: 200
  });
  return res.status(200).json({
    sucess: true,
    message: "Atividade finalizada com sucesso."
  });
});

router.get("/verifica", (req, res, next) => {
  let { verificaError, dados } = producaoCtrl.verifica(req.usuario_id);
  if (verificaError) {
    return res.status(verificaError.status).json({
      sucess: false,
      message: verificaError.message
    });
  }

  if (dados) {
    logger.info("Atividade em execução retornada.", {
      context: "login_route",
      usuario_id: req.usuario_id,
      status: 200
    });
    return res.status(200).json({
      sucess: true,
      message: "Atividade em execução retornada.",
      dados: dados
    });
  } else {
    logger.info("Sem atividade em execução.", {
      context: "login_route",
      usuario_id: req.usuario_id,
      status: 200
    });
    return res.status(200).json({
      sucess: true,
      message: "Sem atividade em execução."
    });
  }
});

router.post("/inicia", (req, res, next) => {
  let { iniciaError, dados } = inicia.verifica(req.usuario_id);
  if (iniciaError) {
    return res.status(iniciaError.status).json({
      sucess: false,
      message: iniciaError.message
    });
  }

  if (dados) {
    logger.info("Atividade iniciada.", {
      context: "login_route",
      usuario_id: req.usuario_id,
      status: 200
    });
    return res.status(200).json({
      sucess: true,
      message: "Atividade iniciada.",
      dados: dados
    });
  } else {
    logger.info("Sem atividades disponíveis para iniciar.", {
      context: "login_route",
      usuario_id: req.usuario_id,
      status: 200
    });
    return res.status(200).json({
      sucess: true,
      message:
        "O operador não possui unidades de trabalho disponível. Contate o Gerente."
    });
  }
});

router.post("/pausa", (req, res, next) => {
  //pass
});

module.exports = router;
