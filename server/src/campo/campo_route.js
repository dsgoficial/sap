'use strict'

const express = require('express')

const { schemaValidation, asyncHandler, httpCode } = require('../utils')

const { verifyAdmin, verifyLogin } = require('../login')

const campoCtrl = require('./campo_ctrl')
const campoSchema = require('./campo_schema')

const router = express.Router()

router.get(
    '/campos',
    asyncHandler(async (req, res, next) => {
        const dados = await campoCtrl.getCampos()

        const msg = 'Campos retornado com sucesso'

        return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
    })
)

router.get(
    '/campos/:id',
    schemaValidation({ params: campoSchema.idParams }),
    asyncHandler(async (req, res, next) => {
        const dados = await campoCtrl.getCampoById(req.params.id)

        const msg = 'Dados do campo retornado com sucesso'

        return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
    })
)

router.post(
    '/campos',
    verifyAdmin,
    schemaValidation({ body: campoSchema.campo }),
    asyncHandler(async (req, res, next) => {
      const dados = await campoCtrl.criaCampo(req.body.campo)
  
      const msg = 'Campo criado com sucesso'
  
      return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
    })
  )

  router.put(
    '/campos/:id',
    verifyAdmin,
    schemaValidation({ params: campoSchema.idParams, body: campoSchema.campo }),
    asyncHandler(async (req, res, next) => {
      const dados = await campoCtrl.atualizaCampo(req.params.id, req.body.campo)
  
      const msg = 'Campo atualizado com sucesso'
  
      return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
    })
  )


// Delete Campo, testar se tem imagem, se tem tracker
// Deletar imagem, inserir imagem
// Deletar tracker, inserir tracker, update tracker

router.delete(
    '/campos/:id',
    verifyAdmin,
    schemaValidation({ params: campoSchema.idParams }),
    asyncHandler(async (req, res, next) => {
        await campoCtrl.deletaCampo(req.params.id)

        const msg = 'Campo deletado com sucesso'

        return res.sendJsonAndLog(true, msg, httpCode.OK)
    })
)


module.exports = router