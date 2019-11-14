
const Joi = require('joi'); 

const { AppError } = require("../utils");

const middleware = schema => {
  return (req, res, next) => {
    const { error } = Joi.validate(req.body, schema, {
        stripUnknown: true
    }); 

    if (error == null) {
        return next(); 
    }
    const { details } = error; 
    const message = details.map(i => i.message).join(',');

    const err = new AppError("Validation error", 400, message, req.body)
    return next(err);
    
  }
}

module.exports = middleware;