const express = require("express");
const Joi = require("joi");

const logger = require("../logger/logger");
const sendJsonAndLog = require("../logger/sendJsonAndLog");

const loginCtrl = require("./login_ctrl");
const loginModel = require("./login_model");

const router = express.Router();

//FIXME APIDOC

router.post("/", (req, res, next) => {
  let validationResult = Joi.validate(req.body, loginModel);
  if (validationResult.error) {
    const err = new Error("Login Post validation error");
    err.status = 400;
    err.context = "login_route";
    err.information = {};
    err.information.body = req.body;
    next(err);
  }

  let { loginError, token } = loginCtrl.login(req.body.usuario, req.body.senha);
  if (loginError) {
    next(loginError);
  }

  (sucess,  message,  context,  information,  res,  status = 200,  dados = null)

  sendJsonAndLog(true, "Authentication success", "login_route", null, res, 200, token)

});

module.exports = router;
