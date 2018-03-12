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
    next(finalizaError)
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
    next(verificaError)
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
    next(iniciaError)
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
