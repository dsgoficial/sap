"use strict";

const AppError = require("./app_error");

const httpCode = require("./http_code");


/**
 * Retorna objeto de erro da validação realizada pelo middleware do Joi
 *
 * @param {object} error - Objeto de erro retornado pelo Joi
 * @param {string} context - Em qual tipo de entrada foi realizada a validação
 * @returns {AppError} Objeto de erro da validação
 */
const validationError = (error, context) => {
  const { details } = error;
  const message = details.map(i => i.message).join(",");

  return new AppError(
    `Erro de validação dos ${context}. Mensagem de erro: ${message}`,
    httpCode.BadRequest,
    message
  );
};

/**
 *
 *
 * @param {object} schema - Objeto com schemas de body, query e params
 * @param {object} [schema.body] - Schema do Joi para validação do body
 * @param {object} [schema.query] - Schema do Joi para validação da query
 * @param {object} [schema.params] - Schema do Joi para validação dos params
 * @returns {RequestHandler} Middleware de validação utilizando Joi
 */
const middleware = ({ body: bodySchema, query: querySchema, params: paramsSchema }) => {
  return (req, res, next) => {
    if (querySchema) {
      const { error } = querySchema.validate(req.query, {
        abortEarly: false
      });
      if (error) {
        return next(validationError(error, "Query"));
      }
    }
    if (paramsSchema) {
      const { error } = paramsSchema.validate(req.params, {
        abortEarly: false
      });
      if (error) {
        return next(validationError(error, "Parâmetros"));
      }
    }
    if (bodySchema) {
      const { error } = bodySchema.validate(req.body, {
        stripUnknown: true,
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
