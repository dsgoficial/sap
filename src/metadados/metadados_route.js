"use strict";

const express = require("express");

const { schemaValidation, asyncHandler, httpCode } = require("../utils");

const { verifyAdmin } = require("../login");

const metadadosCtrl = require("./metadados_ctrl");
const metadadosSchema = require("./metadados_schema");

const router = express.Router();

router.get(
  "/:uuid",
  verifyAdmin,
  schemaValidation({
    params: metadadosSchema.uuidParams
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await metadadosCtrl.getMetadado(req.params.uuid);

    const msg = "Metadados retornados";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

//get tipo palavra chave

//insere palavra chave de um produto

// inserir informacoes gerais de um produto

// inserir informacoes gerais da linha de producao

module.exports = router;
