"use strict";

const express = require("express");

const { schemaValidation, asyncHandler, httpCode } = require("../utils");

const { verifyLogin } = require("../login");

const microcontroleCtrl = require("./microcontrole_ctrl");
const microcontroleSchema = require("./microcontrole_schema");

const router = express.Router();

router.post(
  "/feicao",
  verifyLogin,
  schemaValidation({ body: microcontroleSchema.feicao }),
  asyncHandler(async (req, res, next) => {
    await microcontroleCtrl.armazenaFeicao(
      req.body.atividade_id,
      req.body.usuario_id,
      req.body.data,
      req.body.dados
    );

    const msg = "Informações de produção de feição armazenadas com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

router.post(
  "/apontamento",
  verifyLogin,
  schemaValidation({ body: microcontroleSchema.apontamento }),
  asyncHandler(async (req, res, next) => {
    await microcontroleCtrl.armazenaApontamento(
      req.body.atividade_id,
      req.body.usuario_id,
      req.body.data,
      req.body.dados
    );

    const msg =
      "Informações de produção de apontamento armazenadas com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

router.post(
  "/tela",
  verifyLogin,
  schemaValidation({ body: microcontroleSchema.tela }),
  asyncHandler(async (req, res, next) => {
    await microcontroleCtrl.armazenaTela(
      req.body.atividade_id,
      req.body.usuario_id,
      req.body.dados
    );

    const msg = "Informações de tela armazenadas com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

router.post(
  "/comportamento",
  verifyLogin,
  schemaValidation({ body: microcontroleSchema.comportamento }),
  asyncHandler(async (req, res, next) => {
    await microcontroleCtrl.armazenaComportamento(
      req.body.atividade_id,
      req.body.usuario_id,
      req.body.dados
    );

    const msg = "Informações de ação armazenadas com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

module.exports = router;
