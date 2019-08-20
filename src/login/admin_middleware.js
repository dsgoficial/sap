"use strict";

const { sendJsonAndLog } = require("../logger");

//middleware para verificar se o usuário é administrador
const verifyAdmin = function(req, res, next) {
  
  if(administrador in req.body && req.body.administrador){
    next();
  } else {
    let information = {
      url: req.protocol + "://" + req.get("host") + req.originalUrl,
      usuario_id: req.body.usuario_id,
      administrador: req.body.administrador
    };
    return sendJsonAndLog(
      false,
      "Usuário necessita ser um administrador.",
      "login_middleware",
      information,
      res,
      401,
      null
    );
  }
};

module.exports = verifyAdmin;
