"use strict";

const { AppError } = require(".");

const middleware = schema => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      stripUnknown: true
    });

    if (error == null) {
      return next();
    }
    const { details } = error;
    const message = details.map(i => i.message).join(",");

    const err = new AppError("Validation error", 400, req.body, message);
    return next(err);
  };
};

module.exports = middleware;
