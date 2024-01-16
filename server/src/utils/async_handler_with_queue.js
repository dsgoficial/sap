'use strict'

const BetterQueue = require('better-queue');

const processingQueue = new BetterQueue((task, cb) => {
  task.fn(task.req, task.res, task.next)
    .then(() => cb(null, 'success'))
    .catch(cb);
});

const enqueueTask = (fn, req, res, next) => {
  return new Promise((resolve, reject) => {
    processingQueue.push({fn, req, res, next}, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

const asyncHandlerWithQueue = fn => (req, res, next) => {
    return Promise.resolve(enqueueTask( fn, req, res, next)).catch(next);
};

module.exports = asyncHandlerWithQueue
