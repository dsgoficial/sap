'use strict'

const dotenv = require('dotenv')
const Joi = require('joi')
const fs = require('fs')
const path = require('path')

const AppError = require('./App_error')
const errorHandler = require('./error_handler')

const configFile =
  process.env.NODE_ENV === 'test' ? 'config_testing.env' : 'config.env'

const configPath = path.join(__dirname, '..', '..', configFile)

if (!fs.existsSync(configPath)) {
  errorHandler(
    new AppError(
      'Arquivo de configuração não encontrado. Configure o serviço primeiro.'
    )
  )
}

dotenv.config({
  path: configPath
})

const VERSION = '2.0.0'
const MIN_DATABASE_VERSION = '2.0.0'

const configSchema = Joi.object().keys({
  PORT: Joi.number()
    .integer()
    .required(),
  DB_SERVER: Joi.string().required(),
  DB_PORT: Joi.number()
    .integer()
    .required(),
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  AUTH_SERVER: Joi.string()
    .uri()
    .required(),
  VERSION: Joi.string().required(),
  MIN_DATABASE_VERSION: Joi.string().required()
})

/**
 * Objeto de configuração
 * @description
 * Objeto que guarda as constantes da aplicação para fins de configuração do serviço
 * @typedef {Object} config
 * @property {number} PORT - Porta do serviço do SAP
 * @property {string} DB_SERVER - Servidor do banco de dados do banco do SAP
 * @property {string} DB_PORT - Porta do banco de dados do banco do SAP
 * @property {string} DB_NAME - Nome do banco de dados do banco do SAP
 * @property {string} DB_USER - Nome do usuário administrador do banco de dados utilizado para controlar o SAP
 * @property {string} DB_PASSWORD - Senha do usuário administrador do banco de dados utilizado para controlar o SAP
 * @property {string} JWT_SECRET - Texto utilizado para encriptar o Json Web Token
 * @property {string} AUTH_SERVER - URL para o serviço de autenticação
 * @property {string} VERSION - Versão da aplicação do SAP
 * @property {string} MIN_DATABASE_VERSION - Versão mínima do banco de dados do SAP compatível com a versão da aplicação
 */
const config = {
  PORT: process.env.PORT,
  DB_SERVER: process.env.DB_SERVER,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  JWT_SECRET: process.env.JWT_SECRET,
  AUTH_SERVER: process.env.AUTH_SERVER,
  VERSION,
  MIN_DATABASE_VERSION
}

const { error } = configSchema.validate(config, {
  abortEarly: false
})
if (error) {
  const { details } = error
  const message = details.map(i => i.message).join(',')

  errorHandler(
    new AppError(
      'Arquivo de configuração inválido. Configure novamente o serviço.',
      null,
      message
    )
  )
}

module.exports = config
