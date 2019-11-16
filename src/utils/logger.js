"use strict";

const { createLogger, format, transports } = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const MESSAGE = Symbol.for("message");

const fs = require("fs");
const path = require("path");
var logDir = "./logs";
if (!fs.existsSync(logDir)) {
  // Create the directory if it does not exist
  fs.mkdirSync(logDir);
}

const jsonFormatter = logEntry => {
  const base = { timestamp: new Date() };
  const json = Object.assign(base, logEntry);
  logEntry[MESSAGE] = JSON.stringify(json);
  return logEntry;
};

const rotateTransport = new DailyRotateFile({
  filename: path.join(logDir, "/%DATE%-application.log"),
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d"
});

const consoleTransport = new transports.Console({});

const logger = createLogger({
  format: format(jsonFormatter)(),
  transports: [consoleTransport, rotateTransport]
});

module.exports = logger;
