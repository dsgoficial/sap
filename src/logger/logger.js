"use strict";

const winston = require("winston");
require("winston-daily-rotate-file");
const MESSAGE = Symbol.for("message");

const jsonFormatter = logEntry => {
  let base = { timestamp: new Date() };
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
      datePattern: "YYYY-MM-DD"
    })
  ]
});

module.exports = logger;
