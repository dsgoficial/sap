'use strict'

const express = require('express')
const path = require('path')
const fs = require('fs')
//const bodyParser = require('body-parser')
const cors = require('cors')
const hpp = require('hpp')
const rateLimit = require('express-rate-limit')
const swaggerUi = require('swagger-ui-express')
const swaggerJSDoc = require('swagger-jsdoc')
const noCache = require('nocache')

const appRoutes = require('../routes')
const swaggerOptions = require('./swagger_options')

const swaggerSpec = swaggerJSDoc(swaggerOptions)

const {
  AppError,
  httpCode,
  logger,
  errorHandler,
  sendJsonAndLogMiddleware
} = require('../utils')

const app = express()

// Add sendJsonAndLog to res object
app.use(sendJsonAndLogMiddleware)

app.use(express.json({ limit: '50mb' })) // parsear POST em JSON
app.use(hpp()) // protection against parameter polution

// CORS middleware
app.use(cors())

// Helmet Protection
app.use(noCache())

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 200
})

// apply limit all requests
app.use(limiter)

app.use((req, res, next) => {
  const url = req.protocol + '://' + req.get('host') + req.originalUrl

  logger.info(`${req.method} request`, {
    url,
    ip: req.ip
  })
  return next()
})

// All routes used by the App
app.use('/api', appRoutes)

app.use('/logs', (req, res) => {
  const logDir = path.join(__dirname, '..', '..', 'logs/combined.log')
  const daysToShow = 3
  const cutofftimestamp = new Date(Date.now() - daysToShow * 24 * 60 * 60 * 1000);

  fs.readFile(logDir, 'utf8', (err, data) => {
    if(err) {
      res.status(500).send('Error reading log file')
    } else {
      const logData = data.split('\n').filter(entry => {
        const logDate = new Date(entry.split('|')[0])
        return logDate > cutofftimestamp
      }).join('\n')

      res.setHeader('Content-Type', 'text/plain')
      res.send(logData)
    }
  })
})

// Serve SwaggerDoc
app.use('/api/api_docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Serve JSDocs
app.use('/api/js_docs', express.static(path.join(__dirname, '..', 'js_docs')))

// Serve Client
app.use(express.static(path.join(__dirname, "..", "build")));

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});

app.use((req, res, next) => {
  const err = new AppError(
    `URL não encontrada para o método ${req.method}`,
    httpCode.NotFound
  )
  return next(err)
})

// Error handling
app.use((err, req, res, next) => {
  return errorHandler.log(err, res)
})

module.exports = app
