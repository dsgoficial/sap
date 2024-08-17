'use strict'
const express = require('express')

const { databaseVersion, microcontroleDatabaseVersion } = require('./database')
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
const { perigoRoute } = require('./perigo')
const { rhRoute } = require('./rh')

const router = express.Router()

/**
 * @swagger
 * /:
 *   get:
 *     summary: Verifica o status operacional do sistema
 *     description: Retorna a versão atual do banco de dados e a versão do microcontrole utilizados pelo sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - status
 *     responses:
 *       200:
 *         description: Status do sistema retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indica se a requisição ocorreu com sucesso
 *                 message:
 *                   type: string
 *                   description: Descrição do status operacional do sistema
 *                 database_version:
 *                   type: string
 *                   description: Versão atual do banco de dados
 *                 microcontrole_version:
 *                   type: string
 *                   description: Versão atual do microcontrole
 */
router.get('/', (req, res, next) => {
  return res.sendJsonAndLog(
    true,
    'Sistema de Apoio a produção operacional',
    httpCode.OK,
    {
      database_version: databaseVersion.nome,
      microcontrole_version: microcontroleDatabaseVersion.nome
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

router.use('/perigo', perigoRoute)

router.use('/rh', rhRoute)

module.exports = router
