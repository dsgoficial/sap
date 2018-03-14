const winston = require("winston");
require("winston-daily-rotate-file");
const MESSAGE = Symbol.for("message");

const getNamespace = require('continuation-local-storage').getNamespace;

const jsonFormatter = logEntry => {
  const request = getNamespace('request');
  const req_id = request.get('req_id');
  const base = { timestamp: new Date(), request_id: req_id};
  const json = Object.assign(base, logEntry);
  logEntry[MESSAGE] = JSON.stringify(json);
  return logEntry;
};

const logger = winston.createLogger({
  level: "info",
  format: winston.format(jsonFormatter)(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.DailyRotateFile({
      filename: "./src/logger/log/%DATE%-application.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});

module.exports = logger;
