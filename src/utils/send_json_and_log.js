"use strict";

const logger = require("./logger");

const { VERSION } = require("../config");

const sendJsonAndLogMiddleware = (req, res, next) => {
  res.sendJsonAndLog = (sucess, message, status, dados = null) => {
    const url = req.protocol + "://" + req.get("host") + req.originalUrl;

    logger.info(message, {
      url,
      information: req.body,
      status,
      sucess
    });
    const jsonData = {
      version: VERSION,
      sucess: sucess,
      message: message,
      dados
    };

    return res.status(status).json(jsonData);
  };

  next();
};

module.exports = sendJsonAndLogMiddleware;
