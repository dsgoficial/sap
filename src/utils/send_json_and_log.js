"use strict";

const logger = require("./logger");

const { VERSION } = require("../config");

const sendJsonAndLog = (req, res, next) => {
  res.sendJsonAndLog = (sucess, message, status, dados = null) => {
    const url = req.protocol + "://" + req.get("host") + req.originalUrl;

    logger.info(message, {
      url: url,
      information: req.body,
      status: status
    });
    const jsonData = {
      version: VERSION,
      sucess: sucess,
      message: message
    };

    if (dados) {
      jsonData.dados = dados;
    }

    return res.status(status).json(jsonData);
  };

  next();
};

module.exports = sendJsonAndLog;
