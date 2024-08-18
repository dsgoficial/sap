'use strict'

const path = require('path');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Apoio a Produção',
      version: '2.2.0',
      description: 'API HTTP para utilização do Sistema de Apoio a Produção'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: [path.join(__dirname, '../**/*.js')],
}


module.exports = swaggerOptions
