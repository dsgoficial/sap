const express = require("express");
const Joi = require("joi");

const sendJsonAndLog = require("../logger/sendJsonAndLog");

const loginCtrl = require("./login_ctrl");
const loginModel = require("./login_model");

const router = express.Router();

//FIXME APIDOC

router.post("/", async (req, res, next) => {
  let validationResult = Joi.validate(req.body, loginModel.login);
  if (validationResult.error) {
    const err = new Error("Login Post validation error");
    err.status = 400;
    err.context = "login_route";
    err.information = {};
    err.information.body = req.body;
    err.information.trace = validationResult.error;
    return next(err);
  }

  let { loginError, token } = await loginCtrl.login(
    req.body.usuario,
    req.body.senha
  );
  if (loginError) {
    return next(loginError);
  }

  return sendJsonAndLog(
    true,
    "Authentication success",
    "login_route",
    null,
    res,
    200,
    token
  );
});

module.exports = router;
