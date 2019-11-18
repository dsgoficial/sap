"use strict";

const express = require("express");

const { schemaValidation, asyncHandler } = require("../utils");

const loginCtrl = require("./login_ctrl");
const loginSchema = require("./login_schema");

const router = express.Router();

router.post("/", schemaValidation({body: loginSchema.login}), asyncHandler(async (req, res, next) => {

  const { token, administrador } = await loginCtrl.login(
    req.body.usuario,
    req.body.senha,
    req.body.plugins,
    req.body.qgis
  );

  return res.sendJsonAndLog(true, "Usuário autenticado com sucesso", 200, { token, administrador });

}));

module.exports = router;
