"use strict";

const express = require("express");
const Joi = require("joi");

const { sendJsonAndLog } = require("../utils");

const loginCtrl = require("./login_ctrl");
const loginModel = require("./login_model");

const router = express.Router();

router.post("/", async (req, res, next) => {
  const validationResult = Joi.validate(req.body, loginModel.login, {
    stripUnknown: true
  });
  if (validationResult.error) {
    const err = new Error("Login Post validation error");
    err.status = 400;
    err.context = "login_route";
    err.information = {};
    err.information.body = req.body;
    err.information.trace = validationResult.error;
    return next(err);
  }

  const { error, token, administrador } = await loginCtrl.login(
    req.body.usuario,
    req.body.senha,
    req.body.plugins,
    req.body.qgis
  );
  if (error) {
    return next(error);
  }

  return sendJsonAndLog(
    true,
    "Authentication success",
    "login_route",
    null,
    res,
    200,
    { token, administrador }
  );
});

module.exports = router;
