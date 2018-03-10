const express = require("express");

const loginCtrl = require("login_ctrl");
const loginModel = require("login_model");
const validator = require('express-joi-validation')({});

const router = express.Router();

router.post("/", validator.body(loginModel, {joi: {allowUnknown: false, abortEarly: false}}), function(req, res, next) {
  loginCtrl.login(req.body.usuario, req.body.senha);
});

module.exports = router;
