'use strict'

const { createLogger, format, transports } = require('winston')
const DailyRotateFile = require('winston-daily-rotate-file')

const fs = require('fs')
const path = require('path')
const logDir = path.join(__dirname, '..', '..', 'logs')

if (!fs.existsSync(logDir)) {
  // Create the directory if it does not exist
  fs.mkdirSync(logDir)
}

const rotateTransport = new DailyRotateFile({
  format: format.combine(format.timestamp(), format.json()),
  filename: path.join(logDir, '/%DATE%-application.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d'
})

const combinedTransport = new transports.File({
  format: format.printf(info => {
    const date = new Date(Date.now())
    return `${date}|${info.message}|${JSON.stringify(info)}`
}),
  filename: path.join(logDir, 'combined.log')
})

const consoleTransport = new transports.Console({
  format: format.combine(format.colorize(), format.timestamp(), format.simple())
})

const logger = createLogger({
  transports: [consoleTransport, rotateTransport, combinedTransport]
})

module.exports = logger
