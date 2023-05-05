'use strict'

const asyncHandlerNoQueue = fn => (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandlerNoQueue
