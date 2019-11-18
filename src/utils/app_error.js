"use strict";

const { serializeError } = require("serialize-error");

class AppError extends Error {
  constructor(message, status = 500, errorTrace = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorTrace = (errorTrace instanceof Error) ? serializeError(errorTrace): errorTrace;
  }

}

module.exports = AppError