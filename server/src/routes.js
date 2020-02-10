'use strict'
const express = require('express')

const { databaseVersion } = require('./database')
const {
  httpCode
} = require('./utils')

const { loginRoute } = require('./login')
const { producaoRoute } = require('./producao')
const { microcontroleRoute } = require('./microcontrole')
const { gerenciaRoute } = require('./gerencia')
const { projetoRoute } = require('./projeto')
const { acompanhamentoRoute } = require('./acompanhamento')
const { metadadosRoute } = require('./metadados')
const { usuarioRoute } = require('./usuario')

const router = express.Router()

router.get('/', (req, res, next) => {
  return res.sendJsonAndLog(
    true,
    'Sistema de Apoio a produção operacional',
    httpCode.OK,
    {
      database_version: databaseVersion.nome
    }
  )
})

router.use('/login', loginRoute)

router.use('/distribuicao', producaoRoute)

router.use('/microcontrole', microcontroleRoute)

router.use('/gerencia', gerenciaRoute)

router.use('/projeto', projetoRoute)

router.use('/acompanhamento', acompanhamentoRoute)

router.use('/metadados', metadadosRoute)

router.use('/usuarios', usuarioRoute)

module.exports = router
