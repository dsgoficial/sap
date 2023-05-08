'use strict'

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Apoio a Produção',
      version: '2.2.0',
      description: 'API HTTP para utilização do Sistema de Apoio a Produção'
    }
  },
  apis: ['./src/**/*.js']
}

module.exports = swaggerOptions
