"use strict";

const { serializeError } = require("serialize-error");

const logger = require("./logger");

const errorHandler = (err, req = null, res = null, next = null) => {
  const status = err.status || 500;
  const nome = err.nome || err.message || null;
  const context = err.context || null;
  const dados = err.dados || serializeError(err);

  if (res) {
    return res.sendJsonAndLog(false, nome, status, dados, context);
  }

  return logger.error(nome, {
    context: context,
    information: dados,
    status: status
  });
};
module.exports = errorHandler;
