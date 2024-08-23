'use strict'

const express = require('express')

const { schemaValidation, asyncHandler, httpCode } = require('../utils')

const { verifyAdmin } = require('../login')

const perigoCtrl = require('./perigo_ctrl')
const perigoSchema = require('./perigo_schema')

const router = express.Router()

/**
 * @swagger
 * /api/perigo/atividades/usuario/{id}:
 *   delete:
 *     summary: Limpa atividades relacionadas a um usuário
 *     description: Remove as atividades relacionadas ao usuário especificado pelo ID, deixando as atividades sem usuário atribuído.
 *     produces:
 *       - application/json
 *     tags:
 *       - perigo
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           description: ID do usuário cujas atividades serão limpas
 *     responses:
 *       200:
 *         description: Atividades relacionadas ao usuário limpas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 dados:
 *                   type: array
 *                   items:
 *                     type: integer
 *                     description: IDs das atividades limpas
 *       400:
 *         description: Usuário não encontrado ou sem atividades relacionadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.delete(
  '/atividades/usuario/:id',
  verifyAdmin,
  schemaValidation({
    params: perigoSchema.idParams
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await perigoCtrl.limpaAtividades(req.params.id)

    const msg = 'Atividades relacionadas ao usuários limpas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/perigo/log:
 *   delete:
 *     summary: Limpa logs antigos
 *     description: Remove logs mais antigos que 3 dias.
 *     produces:
 *       - application/json
 *     tags:
 *       - perigo
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Log anterior a 3 dias deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.delete(
  '/log',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await perigoCtrl.limpaLog()

    const msg = 'Log anterior a 3 dias deletado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/perigo/propriedades_camada:
 *   get:
 *     summary: Retorna propriedades da camada
 *     description: Retorna as propriedades de todas as camadas cadastradas no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - perigo
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Propriedades da camada retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   camada_id:
 *                     type: integer
 *                     description: ID da camada
 *                   camada_incomum:
 *                     type: boolean
 *                     description: Indica se a camada é incomum
 *                   atributo_filtro_subfase:
 *                     type: string
 *                     description: Atributo de filtro da subfase
 *                   camada_apontamento:
 *                     type: boolean
 *                     description: Indica se a camada é de apontamento
 *                   atributo_situacao_correcao:
 *                     type: string
 *                     description: Atributo de situação de correção
 *                   atributo_justificativa_apontamento:
 *                     type: string
 *                     description: Atributo de justificativa de apontamento
 *                   subfase_id:
 *                     type: integer
 *                     description: ID da subfase associada
 */
router.get(
  '/propriedades_camada',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await perigoCtrl.getPropriedadesCamada()

    const msg = 'Propriedades da camada retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/perigo/propriedades_camada:
 *   delete:
 *     summary: Deleta propriedades da camada
 *     description: Deleta as propriedades das camadas especificadas por seus IDs.
 *     produces:
 *       - application/json
 *     tags:
 *       - perigo
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PropriedadesCamadaIds'
 *     responses:
 *       200:
 *         description: Propriedades da camada deletadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: ID inválido fornecido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.delete(
  '/propriedades_camada',
  verifyAdmin,
  schemaValidation({
    body: perigoSchema.propriedadesCamadaIds
  }),
  asyncHandler(async (req, res, next) => {
    await perigoCtrl.deletePropriedadesCamada(req.body.propriedades_camada_ids)

    const msg = 'Propriedades da camada deletadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/perigo/propriedades_camada:
 *   post:
 *     summary: Cria propriedades da camada
 *     description: Cria novas propriedades para as camadas no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - perigo
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PropriedadesCamada'
 *     responses:
 *       201:
 *         description: Propriedades da camada criadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post(
  '/propriedades_camada',
  verifyAdmin,
  schemaValidation({
    body: perigoSchema.propriedadesCamada
  }),
  asyncHandler(async (req, res, next) => {
    await perigoCtrl.criaPropriedadesCamada(req.body.propriedades_camada)

    const msg = 'Propriedades da camada criadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/perigo/propriedades_camada:
 *   put:
 *     summary: Atualiza propriedades da camada
 *     description: Atualiza as propriedades das camadas no sistema com base nos IDs fornecidos.
 *     produces:
 *       - application/json
 *     tags:
 *       - perigo
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PropriedadesCamadaAtualizacao'
 *     responses:
 *       200:
 *         description: Propriedades da camada atualizadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.put(
  '/propriedades_camada',
  verifyAdmin,
  schemaValidation({
    body: perigoSchema.propriedadesCamadaAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await perigoCtrl.atualizaPropriedadesCamada(req.body.propriedades_camada)

    const msg = 'Propriedades da camada atualizadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/perigo/insumo:
 *   get:
 *     summary: Retorna insumos
 *     description: Retorna os insumos cadastrados no sistema, com detalhes de cada um.
 *     produces:
 *       - application/json
 *     tags:
 *       - perigo
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Insumos retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID do insumo
 *                   nome:
 *                     type: string
 *                     description: Nome do insumo
 *                   caminho:
 *                     type: string
 *                     description: Caminho do insumo
 *                   epsg:
 *                     type: string
 *                     description: EPSG do insumo
 *                   tipo_insumo_id:
 *                     type: integer
 *                     description: ID do tipo do insumo
 *                   grupo_insumo_id:
 *                     type: integer
 *                     description: ID do grupo do insumo
 *                   geom:
 *                     type: string
 *                     description: Representação da geometria do insumo
 */
router.get(
  '/insumo',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await perigoCtrl.getInsumo()

    const msg = 'Insumos retornados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/perigo/insumo:
 *   delete:
 *     summary: Deleta insumos
 *     description: Deleta insumos especificados por seus IDs.
 *     produces:
 *       - application/json
 *     tags:
 *       - perigo
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InsumoIds'
 *     responses:
 *       200:
 *         description: Insumos deletados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: ID inválido fornecido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.delete(
  '/insumo',
  verifyAdmin,
  schemaValidation({
    body: perigoSchema.insumoIds
  }),
  asyncHandler(async (req, res, next) => {
    await perigoCtrl.deleteInsumo(req.body.insumo_ids)

    const msg = 'Insumos deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/perigo/insumo:
 *   post:
 *     summary: Cria insumos
 *     description: Cria novos insumos no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - perigo
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Insumo'
 *     responses:
 *       201:
 *         description: Insumos criados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post(
  '/insumo',
  verifyAdmin,
  schemaValidation({
    body: perigoSchema.insumo
  }),
  asyncHandler(async (req, res, next) => {
    await perigoCtrl.criaInsumo(req.body.insumo)

    const msg = 'Insumos criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/perigo/insumo:
 *   put:
 *     summary: Atualiza insumos
 *     description: Atualiza os insumos no sistema com base nos IDs fornecidos.
 *     produces:
 *       - application/json
 *     tags:
 *       - perigo
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InsumoAtualizacao'
 *     responses:
 *       200:
 *         description: Insumos atualizados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.put(
  '/insumo',
  verifyAdmin,
  schemaValidation({
    body: perigoSchema.insumoAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await perigoCtrl.atualizaInsumo(req.body.insumo)

    const msg = 'Insumos atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/perigo/produtos_sem_unidade_trabalho:
 *   delete:
 *     summary: Deleta Produtos sem UT
 *     description: Deleta produtos sem unidade de trabalho relacionados.
 *     produces:
 *       - application/json
 *     tags:
 *       - perigo
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Produtos sem unidade de trabalho removidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 deletedProducts:
 *                   type: array
 *                   items:
 *                     type: integer
 *                     description: ID of the deleted product
 */
router.delete(
  '/produtos_sem_unidade_trabalho',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await perigoCtrl.deleteProdutosSemUT()

    const msg = 'Produtos sem unidade de trabalho removidos com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/perigo/ut_sem_atividade:
 *   delete:
 *     summary: Deleta Unidades de Trabalho sem Atividade
 *     description: Deleta unidades de trabalho que não possuem atividades associadas.
 *     produces:
 *       - application/json
 *     tags:
 *       - perigo
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Unidades de Trabalho sem atividade removidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 deletedUTs:
 *                   type: array
 *                   items:
 *                     type: integer
 *                     description: ID of the deleted Unidade de Trabalho
 */
router.delete(
  '/ut_sem_atividade',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await perigoCtrl.deleteUTSemAtividade()

    const msg = 'Unidades de Trabalho sem atividade removidos com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/perigo/lote_sem_produto:
 *   delete:
 *     summary: Deleta Lotes sem Produtos
 *     description: Deleta lotes que não possuem produtos associados.
 *     produces:
 *       - application/json
 *     tags:
 *       - perigo
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lotes sem produtos removidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 deletedLotes:
 *                   type: array
 *                   items:
 *                     type: integer
 *                     description: ID of the deleted Lote
 */
router.delete(
  '/lote_sem_produto',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await perigoCtrl.deleteLoteSemProduto()

    const msg = 'Lotes sem produtos removidos com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

module.exports = router
