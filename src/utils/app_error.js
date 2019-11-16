"use strict";

const { serializeError } = require("serialize-error");

function AppError(
  nome,
  status = 500,
  data = null,
  errorTrace = null,
  context = null
) {
  Error.call(this);
  Error.captureStackTrace(this);
  this.nome = nome;
  this.status = status;
  this.dados = {};
  this.dados.dadosEntrada = data;
  this.dados.descricaoErro = parseError;
  if (errorTrace instanceof Error) {
    this.dados.descricaoErro = serializeError(errorTrace);
  } else {
    this.dados.descricaoErro = errorTrace;
  }
  this.context = context;
}

AppError.prototype.__proto__ = Error.prototype;

module.exports = AppError;
