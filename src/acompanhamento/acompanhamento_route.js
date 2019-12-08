"use strict";

const express = require("express");

const { schemaValidation, asyncHandler, httpCode } = require("../utils");

const acompanhamentoSchema = require("./acompanhamento_schema");
const acompanhamentoCtrl = require("./acompanhamento_ctrl");

const router = express.Router();

router.get(
  "/acao/usuario/:id",
  schemaValidation({
    params: acompanhamentoSchema.idParams,
    query: acompanhamentoSchema.diasQuery
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.getAcaoUsuario(
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
    const dados = await acompanhamentoCtrl.getAcaoEmExecucao();

    const msg = "Ações de usuários com atividade em exeucução retornadas";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.get(
  "/linha_producao/:nome/:z/:x/:y.mvt",
  schemaValidation({
    params: acompanhamentoSchema.mvtParams
  }),
  asyncHandler(async (req, res, next) => {
    const tile = await acompanhamentoCtrl.getMvtLinhaProducao(
      req.params.nome,
      req.params.x,
      req.params.y,
      req.params.z
    );

    res.setHeader("Content-Type", "application/x-protobuf");
    if (tile.length === 0) {
      res.status(204);
    }
    res.send(tile);
  })
);

module.exports = router;
