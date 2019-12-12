"use strict";

const logger = require("./logger");
const { VERSION } = require("./config");

const truncate = dados => {
  for(let key in dados){
    if(Object.prototype.toString.call(dados[key]) === "[object String]"){
      if(dados[key].length > 500){
        dados[key] = dados[key].substring(0, length)
      }
    }
  }
}

const sendJsonAndLogMiddleware = (req, res, next) => {
  res.sendJsonAndLog = (success, message, status, dados = null) => {
    const url = req.protocol + "://" + req.get("host") + req.originalUrl;

    const trucatedBody = truncate(req.body);

    logger.info(message, {
      url,
      information: trucatedBody,
      status,
      success
    });

    const userMessage = status === 500 ? "Erro no servidor" : message;
    const jsonData = {
      version: VERSION,
      success: success,
      message: userMessage,
      dados
    };

    return res.status(status).json(jsonData);
  };

  next();
};

module.exports = sendJsonAndLogMiddleware;
