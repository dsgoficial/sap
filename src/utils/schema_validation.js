"use strict";

const AppError = require("./app_error");

const httpCode = require("./http_code");

const validationError = error => {
  const { details } = error;
  const message = details.map(i => i.message).join(",");

  return new AppError(
    `Erro de validação dos ${context}. Mensagem de erro: ${message}`,
    httpCode.BadRequest,
    message
  );
};

const middleware = ({ body: bodySchema, params: paramsSchema }) => {
  return (req, res, next) => {
    if (paramsSchema) {
      const { error } = paramsSchema.validate(req.params, {
        stripUnknown: true,
        abortEarly: false
      });
      if (error) {
        return next(validationError(error, "Parâmetros"));
      }
    }
    if (bodySchema) {
      const { error } = bodySchema.validate(req.body, {
        abortEarly: false
      });
      if (error) {
        return next(validationError(error, "Dados"));
      }
    }
    return next();
  };
};

module.exports = middleware;
