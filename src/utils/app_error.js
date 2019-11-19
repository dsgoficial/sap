"use strict";

const { serializeError } = require("serialize-error");

const httpCode = require("./http_code");

class AppError extends Error {
  constructor(message, status = httpCode.InternalError, errorTrace = null) {
    super(message);
    this.statusCode = status;
    this.errorTrace =
      errorTrace instanceof Error ? serializeError(errorTrace) : errorTrace;
  }
}

module.exports = AppError;
