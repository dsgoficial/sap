'use strict'

const express = require('express')

const { schemaValidation, asyncHandler, httpCode } = require('../utils')

const { verifyAdmin } = require('../login')

const metadadosCtrl = require('./metadados_ctrl')
const metadadosSchema = require('./metadados_schema')

const router = express.Router()

/** 
router.get(
  '/:uuid',
  verifyAdmin,
  schemaValidation({
    params: metadadosSchema.uuidParams
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await metadadosCtrl.getMetadado(req.params.uuid)

    const msg = 'Metadados retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)
*/

router.get(
  '/tipo_palavra_chave',
  asyncHandler(async (req, res, next) => {
    const dados = await metadadosCtrl.getTipoPalavraChave()

    const msg = 'Tipos palava chave retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/organizacao',
  asyncHandler(async (req, res, next) => {
    const dados = await metadadosCtrl.getOrganizacao()

    const msg = 'Organizações retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/especificacao',
  asyncHandler(async (req, res, next) => {
    const dados = await metadadosCtrl.getEspecificacao()

    const msg = 'Especificações retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/datum_vertical',
  asyncHandler(async (req, res, next) => {
    const dados = await metadadosCtrl.getDatumVertical()

    const msg = 'Datum vertical retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/codigo_restricao',
  asyncHandler(async (req, res, next) => {
    const dados = await metadadosCtrl.getCodigoRestricao()

    const msg = 'Código de restrição retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/codigo_classificacao',
  asyncHandler(async (req, res, next) => {
    const dados = await metadadosCtrl.getCodigoClassificacao()

    const msg = 'Código de classificação retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)


module.exports = router
