"use strict";

const express = require("express");

const { schemaValidation, asyncHandler } = require("../utils");

const producaoCtrl = require("./distribuicao_ctrl");
const producaoSchema = require("./distribuicao_schema");

const router = express.Router();

router.post(
  "/finaliza",
  schemaValidation({body: producaoSchema.finaliza}),
  asyncHandler(async (req, res, next) => {
    await producaoCtrl.finaliza(
      req.body.usuarioId,
      req.body.atividade_id,
      req.body.sem_correcao
    );

    const msg = "Atividade finalizada com sucesso";

    return res.sendJsonAndLog(true, msg, 201);
  })
);

router.get(
  "/verifica",
  asyncHandler(async (req, res, next) => {
    const dados = await producaoCtrl.verifica(req.body.usuarioId);

    const msg = dados
      ? "Atividade em execução retornada"
      : "Sem atividade em execução";

    return res.sendJsonAndLog(true, msg, 200, dados);
  })
);

router.post(
  "/inicia",
  asyncHandler(async (req, res, next) => {
    const dados = await producaoCtrl.inicia(req.body.usuarioId);

    const msg = dados
      ? "Atividade iniciada"
      : "Sem atividades disponíveis para iniciar";

    return res.sendJsonAndLog(true, msg, 201, dados);
  })
);

router.post(
  "/resposta_questionario",
  schemaValidation({body: producaoSchema.respostaQuestionario}),
  asyncHandler(async (req, res, next) => {
    await producaoCtrl.respondeQuestionario(
      req.body.atividade_id,
      req.body.respostas
    );
    const msg = "Questionário enviado com sucesso";

    return res.sendJsonAndLog(true, msg, 201);
  })
);

router.post(
  "/problema_atividade",
  schemaValidation({body: producaoSchema.problemaAtividade}),
  asyncHandler(async (req, res, next) => {
    await producaoCtrl.problemaAtividade(
      req.body.atividade_id,
      req.body.tipo_problema_id,
      req.body.descricao
    );
    const msg = "Problema de atividade reportado com sucesso";

    return res.sendJsonAndLog(true, msg, 201);
  })
);

router.get(
  "/tipo_problema",
  asyncHandler(async (req, res, next) => {
    const dados = await producaoCtrl.getTipoProblema();

    const msg = "Tipos de problema retornado";

    return res.sendJsonAndLog(true, msg, 200, dados);
  })
);

module.exports = router;
