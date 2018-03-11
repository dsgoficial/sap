const express = require("express");
const Joi = require("joi");

const logger = require("../logger/logger");

const loginCtrl = require("login_ctrl");
const loginModel = require("login_model");

const router = express.Router();

router.post("/", (req, res, next) => {
  let validationResult = Joi.validate(req.body, loginModel);
  if (validationResult.error) {
    logger.info("Login Post validation error", {
      context: "login_route",
      body: req.body
    });
    return res.status(400).json({
      sucess: false,
      message: "Login deve conter usuario e senha."
    });
  }

  let { loginError, token } = loginCtrl.login(req.body.usuario, req.body.senha);
  if (loginError) {
    logger.info("Authentication error", {
      context: "login_route",
      usuario: req.body.usuario
    });
    return res.status(loginError.status).json({
      sucess: false,
      message: loginError.message
    });
  }

  return res.status(200).json({
    sucess: true,
    message: "Token generated",
    token: token
  });
});

module.exports = router;
