'use strict'

const express = require('express')

const { schemaValidation, asyncHandler, httpCode } = require('../utils')

const { verifyAdmin } = require('../login')

const usuarioCtrl = require('./usuario_ctrl')

const usuarioSchema = require('./usuario_schema')

const router = express.Router()

router.get(
  '/servico_autenticacao',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await usuarioCtrl.getUsuariosAuthServer()

    const msg = 'Usuários retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.put(
  '/sincronizar',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    await usuarioCtrl.atualizaListaUsuarios()
    const msg = 'Usuários atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.put(
  '/:uuid',
  verifyAdmin,
  schemaValidation({
    body: usuarioSchema.updateUsuario,
    params: usuarioSchema.uuidParams
  }),
  asyncHandler(async (req, res, next) => {
    await usuarioCtrl.atualizaUsuario(
      req.params.uuid,
      req.body.administrador,
      req.body.ativo
    )
    const msg = 'Usuário atualizado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.get(
  '/',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await usuarioCtrl.getUsuarios()

    const msg = 'Usuários retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.post(
  '/',
  verifyAdmin,
  schemaValidation({ body: usuarioSchema.listaUsuario }),
  asyncHandler(async (req, res, next) => {
    await usuarioCtrl.criaListaUsuarios(
      req.body.usuarios
    )
    const msg = 'Usuários criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/',
  verifyAdmin,
  schemaValidation({
    body: usuarioSchema.updateUsuarioLista
  }),
  asyncHandler(async (req, res, next) => {
    await usuarioCtrl.atualizaUsuarioLista(
      req.body.usuarios
    )
    const msg = 'Usuários atualizado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

module.exports = router
