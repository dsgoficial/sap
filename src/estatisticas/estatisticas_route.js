"use strict";

const express = require("express");

const { schemaValidation, asyncHandler, httpCode } = require("../utils");

const estatisticasSchema = require("./estatisticas_schema");
const estatisticasCtrl = require("./estatisticas_ctrl");

const router = express.Router();

router.get(
  "/acao/usuario/:id",
  schemaValidation({
    params: estatisticasSchema.idParams,
    query: estatisticasSchema.diasQuery
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await estatisticasCtrl.getAcaoUsuario(
      req.params.id,
      req.query.dias
    );

    const msg = "Ações por usuário retornadas";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.get(
  "/acao/em_execucao",
  asyncHandler(async (req, res, next) => {
    const dados = await estatisticasCtrl.get_acao_em_execucao();

    const msg = "Ações de usuários com atividade em exeucução retornadas";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

module.exports = router;
