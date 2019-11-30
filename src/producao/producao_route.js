"use strict";

const express = require("express");

const { schemaValidation, asyncHandler, httpCode } = require("../utils");

const { verifyLogin } = require("../login");

const producaoCtrl = require("./producao_ctrl");
const producaoSchema = require("./producao_schema");

const router = express.Router();

router.post(
  "/finaliza",
  verifyLogin,
  schemaValidation({ body: producaoSchema.finaliza }),
  asyncHandler(async (req, res, next) => {
    await producaoCtrl.finaliza(
      req.body.usuarioId,
      req.body.atividade_id,
      req.body.sem_correcao
    );

    const msg = "Atividade finalizada com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

router.get(
  "/verifica",
  verifyLogin,
  asyncHandler(async (req, res, next) => {
    const dados = await producaoCtrl.verifica(req.body.usuarioId);
    const msg = dados
      ? "Atividade em execução retornada"
      : "Sem atividade em execução";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.post(
  "/inicia",
  verifyLogin,
  asyncHandler(async (req, res, next) => {
    const dados = await producaoCtrl.inicia(req.body.usuarioId);

    const msg = dados
      ? "Atividade iniciada"
      : "Sem atividades disponíveis para iniciar";

    return res.sendJsonAndLog(true, msg, httpCode.Created, dados);
  })
);

router.post(
  "/resposta_questionario",
  verifyLogin,
  schemaValidation({ body: producaoSchema.respostaQuestionario }),
  asyncHandler(async (req, res, next) => {
    await producaoCtrl.respondeQuestionario(
      req.body.atividade_id,
      req.body.respostas,
      req.body.usuarioId
    );
    const msg = "Questionário enviado com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

router.post(
  "/problema_atividade",
  verifyLogin,
  schemaValidation({ body: producaoSchema.problemaAtividade }),
  asyncHandler(async (req, res, next) => {
    await producaoCtrl.problemaAtividade(
      req.body.atividade_id,
      req.body.tipo_problema_id,
      req.body.descricao,
      req.body.usuarioId
    );
    const msg = "Problema de atividade reportado com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

router.get(
  "/tipo_problema",
  verifyLogin,
  asyncHandler(async (req, res, next) => {
    const dados = await producaoCtrl.getTipoProblema();

    const msg = "Tipos de problema retornado";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

module.exports = router;
