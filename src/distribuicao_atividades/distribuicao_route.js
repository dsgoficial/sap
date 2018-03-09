const express = require("express");

const producaoCtrl = require("distribuicao_ctrl");
const producaoModel = require("distribuicao_model");
const joi_middleware = require("express-joi-validation")({});

const router = express.Router();

//FIXME APIDOC
//FIXME Model Validation
//FIXME Login JWT

router.post("/verifica", (req, res, next) => {
  producaoCtrl.verifica(req, res, next, req.body);
});

router.post("/finaliza", (req, res, next) => {
  producaoCtrl.finaliza(req, res, next, req.body);
});

router.post("/inicia", (req, res, next) => {
  producaoCtrl.inicia(req, res, next, req.body);
});

router.post("/pausa", (req, res, next) => {
  //pass
});

module.exports = router;
