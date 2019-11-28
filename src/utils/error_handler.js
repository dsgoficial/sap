"use strict";

const { serializeError } = require("serialize-error");

const logger = require("./logger");

const httpCode = require("./http_code");

const errorHandler = (err, res = null) => {
  const statusCode = err.statusCode || httpCode.InternalError;
  const message = err.message || "Erro no servidor";
  const errorTrace = err.errorTrace || serializeError(err) || null;

  if (res && res.sendJsonAndLog) {
    return res.sendJsonAndLog(false, message, statusCode);
  }

  logger.error(message, {
    information: errorTrace,
    statusCode: statusCode,
    success: false
  });
  //exit node with error
  process.exit(1);
};
module.exports = errorHandler;
