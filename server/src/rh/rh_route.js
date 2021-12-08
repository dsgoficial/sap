'use strict'

const express = require('express')

const { schemaValidation, asyncHandler, httpCode } = require('../utils')

const { verifyAdmin } = require('../login')

const rhCtrl = require('./rh_ctrl')
const rhSchema = require('./rh_schema')

const router = express.Router()

router.get(
  '/tipo_perda_rh',
  asyncHandler(async (req, res, next) => {
    const dados = await rhCtrl.getTipoPerdaHr()

    const msg = 'Tipo perda de rh retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/dias_logados/usuario/:id',
  verifyAdmin,
  schemaValidation({
    params: rhSchema.idParams
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await rhCtrl.getDiasLogadosUsuario(req.params.id)

    const msg = 'Dias logados do usuario retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/** 

router.post(
  '/grupo_estilos',
  verifyAdmin,
  schemaValidation({ body: rhSchema.grupoEstilos }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.gravaGrupoEstilos(req.body.grupo_estilos, req.usuarioId)

    const msg = 'Grupo de estilos gravados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/grupo_estilos',
  verifyAdmin,
  schemaValidation({ body: rhSchema.grupoEstilosAtualizacao }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaGrupoEstilos(req.body.grupo_estilos, req.usuarioId)

    const msg = 'Grupo de estilos atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.delete(
  '/grupo_estilos',
  verifyAdmin,
  schemaValidation({ body: rhSchema.grupoEstilosIds }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaGrupoEstilos(req.body.grupo_estilos_ids)

    const msg = 'Grupo de estilos deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)
*/
module.exports = router
