"use strict";

const logger = require("./logger");

const renderAndLog = (
  message,
  context,
  information,
  res,
  status = 200,
  template,
  dados
) => {
  logger.info(message, {
    context: context,
    information: information,
    status: status
  });

  res.set('Content-Type', 'application/xml');
  return res.render(template, dados);      
};

module.exports = renderAndLog;
