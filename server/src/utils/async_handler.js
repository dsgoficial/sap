'use strict'

const BetterQueue = require('better-queue');

const processingQueue = new BetterQueue((task, cb) => {
  task.fn(task.req, task.res, task.next).then(() => cb(null, 'success')).catch(cb);
});

const asyncHandler = (fn) => (req, res, next) => {
  if (req.method === 'GET') {
    return Promise.resolve(fn(req, res, next)).catch(next);
  } else {
    processingQueue.push(
      { fn, req, res, next },
      (err, result) => {
        if (err) {
          return next(err);
        }
      }
    );
  }
};


module.exports = asyncHandler
