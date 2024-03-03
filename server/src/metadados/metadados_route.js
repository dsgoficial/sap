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

router.get(
  '/produto',
  schemaValidation({
    query: metadadosSchema.produtoQuery
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await metadadosCtrl.getProduto(req.query.produtos)

    const msg = 'Informação do Produto retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.put(
  '/produto',
  verifyAdmin,
  schemaValidation({
    body: metadadosSchema.produtoAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await metadadosCtrl.atualizaProduto(req.body.produto)

    const msg = 'Informação do Produto atualizado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.get(
  '/palavra_chave_produto',
  schemaValidation({
    query: metadadosSchema.produtoQuery
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await metadadosCtrl.getPalavraChaveProduto(req.query.produtos)

    const msg = 'Palavra-chave do produto retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.delete(
  '/palavra_chave_produto',
  verifyAdmin,
  schemaValidation({
    body: metadadosSchema.palavraChaveProdutoIds
  }),
  asyncHandler(async (req, res, next) => {
    await metadadosCtrl.deletePalavraChaveProduto(req.body.palavras_chave_produto_ids)

    const msg = 'Palavra-chave do produto deletado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.post(
  '/palavra_chave_produto',
  verifyAdmin,
  schemaValidation({
    body: metadadosSchema.palavraChaveProduto
  }),
  asyncHandler(async (req, res, next) => {
    await metadadosCtrl.criaPalavraChaveProduto(req.body.palavras_chave_produto)

    const msg = 'Palavra-chave do produto criada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/palavra_chave_produto',
  verifyAdmin,
  schemaValidation({
    body: metadadosSchema.palavraChaveProdutoAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await metadadosCtrl.atualizaPalavraChaveProduto(req.body.palavras_chave_produto)

    const msg = 'Palavra-chave do produto atualizado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.get(
  '/creditos_qpt',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await metadadosCtrl.getCreditosQpt()

    const msg = 'Créditos QPT retornados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.delete(
  '/creditos_qpt',
  verifyAdmin,
  schemaValidation({
    body: metadadosCtrl.creditosQptIds
  }),
  asyncHandler(async (req, res, next) => {
    await metadadosCtrl.deleteCreditosQpt(req.body.creditos_qpt_ids)

    const msg = 'Créditos QPT deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.post(
  '/creditos_qpt',
  verifyAdmin,
  schemaValidation({
    body: metadadosCtrl.creditosQpt
  }),
  asyncHandler(async (req, res, next) => {
    await metadadosCtrl.criaCreditosQpt(req.body.creditos_qpt)

    const msg = 'Créditos QPT criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/creditos_qpt',
  verifyAdmin,
  schemaValidation({
    body: metadadosCtrl.creditosQptAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await metadadosCtrl.atualizaCreditosQpt(req.body.creditos_qpt)

    const msg = 'Créditos QPT atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.get(
  '/informacoes_edicao',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await metadadosCtrl.getInformacoesEdicao()

    const msg = 'Informações de edição retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.delete(
  '/informacoes_edicao',
  verifyAdmin,
  schemaValidation({
    body: metadadosSchema.informacoesEdicaoIds
  }),
  asyncHandler(async (req, res, next) => {
    await metadadosCtrl.deleteInformacoesEdicao(req.body.informacoes_edicao_ids)

    const msg = 'Informações de edição deletadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.post(
  '/informacoes_edicao',
  verifyAdmin,
  schemaValidation({
    body: metadadosSchema.informacoesEdicao
  }),
  asyncHandler(async (req, res, next) => {
    await metadadosCtrl.criaInformacoesEdicao(req.body.informacoes_edicao)

    const msg = 'Informações de edição criadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/informacoes_edicao',
  verifyAdmin,
  schemaValidation({
    body: metadadosSchema.informacoesEdicaoAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await metadadosCtrl.atualizaInformacoesEdicao(req.body.informacoes_edicao)

    const msg = 'Informações de edição atualizadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.get(
  '/imagens_carta_ortoimagem',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await metadadosCtrl.getImagensCartaOrtoimagem()

    const msg = 'Imagens da carta ortoimagem retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.delete(
  '/imagens_carta_ortoimagem',
  verifyAdmin,
  schemaValidation({
    body: metadadosSchema.imagensCartaOrtoimagemIds
  }),
  asyncHandler(async (req, res, next) => {
    await metadadosCtrl.deleteImagensCartaOrtoimagem(req.body.imagens_carta_ortoimagem_ids)

    const msg = 'Imagens da carta ortoimagem deletadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.post(
  '/imagens_carta_ortoimagem',
  verifyAdmin,
  schemaValidation({
    body: metadadosSchema.imagensCartaOrtoimagem
  }),
  asyncHandler(async (req, res, next) => {
    await metadadosCtrl.criaImagensCartaOrtoimagem(req.body.imagens_carta_ortoimagem)

    const msg = 'Imagens da carta ortoimagem criadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/imagens_carta_ortoimagem',
  verifyAdmin,
  schemaValidation({
    body: metadadosSchema.imagensCartaOrtoimagemAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await metadadosCtrl.atualizaImagensCartaOrtoimagem(req.body.imagens_carta_ortoimagem)

    const msg = 'Imagens da carta ortoimagem atualizadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.get(
  '/classes_complementares_orto',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await metadadosCtrl.getClassesComplementaresOrto()

    const msg = 'Classes complementares orto retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.delete(
  '/classes_complementares_orto',
  verifyAdmin,
  schemaValidation({
    body: metadadosSchema.classesComplementaresOrtoIds
  }),
  asyncHandler(async (req, res, next) => {
    await metadadosCtrl.deleteClassesComplementaresOrto(req.body.classes_complementares_orto_ids)

    const msg = 'Classes complementares orto deletadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.post(
  '/classes_complementares_orto',
  verifyAdmin,
  schemaValidation({
    body: metadadosSchema.classesComplementaresOrto
  }),
  asyncHandler(async (req, res, next) => {
    await metadadosCtrl.criaClassesComplementaresOrto(req.body.classes_complementares_orto)

    const msg = 'Classes complementares orto criadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/classes_complementares_orto',
  verifyAdmin,
  schemaValidation({
    body: metadadosSchema.classesComplementaresOrtoAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await metadadosCtrl.atualizaClassesComplementaresOrto(req.body.classes_complementares_orto)

    const msg = 'Classes complementares orto atualizadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.get(
  '/perfil_classes_complementares_orto',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await metadadosCtrl.getPerfilClassesComplementaresOrto()

    const msg = 'Perfis das classes complementares orto retornados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.delete(
  '/perfil_classes_complementares_orto',
  verifyAdmin,
  schemaValidation({
    body: metadadosSchema.perfilClassesComplementaresOrtoIds
  }),
  asyncHandler(async (req, res, next) => {
    await metadadosCtrl.deletePerfilClassesComplementaresOrto(req.body.perfil_classes_complementares_orto_ids)

    const msg = 'Perfis das classes complementares orto deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.post(
  '/perfil_classes_complementares_orto',
  verifyAdmin,
  schemaValidation({
    body: metadadosSchema.perfilClassesComplementaresOrto
  }),
  asyncHandler(async (req, res, next) => {
    await metadadosCtrl.criaPerfilClassesComplementaresOrto(req.body.perfil_classes_complementares_orto)

    const msg = 'Perfis das classes complementares orto criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/perfil_classes_complementares_orto',
  verifyAdmin,
  schemaValidation({
    body: metadadosSchema.perfilClassesComplementaresOrtoAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await metadadosCtrl.atualizaPerfilClassesComplementaresOrto(req.body.perfil_classes_complementares_orto)

    const msg = 'Perfis das classes complementares orto atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)


module.exports = router
