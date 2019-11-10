"use strict";

const logger = require("./logger");

const { VERSION } = require('./config');

const renderAndLog = (
  sucess,
  message,
  context,
  information,
  res,
  status = 200,
  dados,
  template
) => {
  logger.info(message, {
    context: context,
    information: information,
    status: status
  });
  let jsonData = {
    version: VERSION,
    sucess: sucess,
    message: message
  };

  if (dados) {
    jsonData.dados = dados
  }

  res.set('Content-Type', 'application/xml');
  return res.render(template, dados);  
};

module.exports = renderAndLog;
