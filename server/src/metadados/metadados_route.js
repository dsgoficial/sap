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

router.get(
  '/usuario',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await metadadosCtrl.getUsuarios()

    const msg = 'Usuários retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.post(
  '/usuario',
  verifyAdmin,
  schemaValidation({ body: metadadosSchema.usuario }),
  asyncHandler(async (req, res, next) => {
    await metadadosCtrl.gravaUsuarios(req.body.usuario)

    const msg = 'Usuários gravados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/usuario',
  verifyAdmin,
  schemaValidation({ body: metadadosSchema.usuarioAtualizacao }),
  asyncHandler(async (req, res, next) => {
    await metadadosCtrl.atualizaUsuarios(req.body.usuario)

    const msg = 'Usuários atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.delete(
  '/usuario',
  verifyAdmin,
  schemaValidation({ body: metadadosSchema.usuarioIds }),
  asyncHandler(async (req, res, next) => {
    await metadadosCtrl.deletaUsuarios(req.body.usuarios_ids)

    const msg = 'Usuários deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.get(
  '/informacoes_produto',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await metadadosCtrl.getInformacoesProduto()

    const msg = 'Informações dos produtos retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.post(
  '/informacoes_produto',
  verifyAdmin,
  schemaValidation({ body: metadadosSchema.informacoesProduto }),
  asyncHandler(async (req, res, next) => {
    await metadadosCtrl.gravaInformacoesProduto(req.body.informacoes_produto)

    const msg = 'Informações dos produtos gravadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/informacoes_produto',
  verifyAdmin,
  schemaValidation({ body: metadadosSchema.informacoesProdutoAtualizacao }),
  asyncHandler(async (req, res, next) => {
    await metadadosCtrl.atualizaInformacoesProduto(req.body.informacoes_produto)

    const msg = 'Informações dos produtos atualizadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.delete(
  '/informacoes_produto',
  verifyAdmin,
  schemaValidation({ body: metadadosSchema.informacoesProdutoIds }),
  asyncHandler(async (req, res, next) => {
    await metadadosCtrl.deletaInformacoesProduto(req.body.informacoes_produto_ids)

    const msg = 'Informações dos produtos deletadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.get(
  '/responsavel_fase_produto',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await metadadosCtrl.getResponsavelFaseProduto()

    const msg = 'Responsável fase produto retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.post(
  '/responsavel_fase_produto',
  verifyAdmin,
  schemaValidation({ body: metadadosSchema.responsavelFaseProduto }),
  asyncHandler(async (req, res, next) => {
    await metadadosCtrl.gravaResponsavelFaseProduto(req.body.responsavel_fase_produto)

    const msg = 'Responsável fase produto gravadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/responsavel_fase_produto',
  verifyAdmin,
  schemaValidation({ body: metadadosSchema.responsavelFaseProdutoAtualizacao }),
  asyncHandler(async (req, res, next) => {
    await metadadosCtrl.atualizaResponsavelFaseProduto(req.body.responsavel_fase_produto)

    const msg = 'Responsável fase produto atualizadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.delete(
  '/responsavel_fase_produto',
  verifyAdmin,
  schemaValidation({ body: metadadosSchema.responsavelFaseProdutoIds }),
  asyncHandler(async (req, res, next) => {
    await metadadosCtrl.deletaResponsavelFaseProduto(req.body.responsavel_fase_produto_ids)

    const msg = 'Responsável fase produto deletadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)


module.exports = router
