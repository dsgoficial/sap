'use strict'

const express = require('express')

const { schemaValidation, asyncHandler, httpCode } = require('../utils')

const { verifyAdmin } = require('../login')

const projetoCtrl = require('./projeto_ctrl')
const projetoSchema = require('./projeto_schema')

const router = express.Router()


router.get(
  '/status',
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getStatus()

    const msg = 'Valores possíveis para status retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/tipo_produto:
 *   get:
 *     summary: Retorna os tipos de produto
 *     description: Retorna uma lista de tipos de produto disponíveis no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Tipos
 *     responses:
 *       200:
 *         description: Tipos de produto retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                     description: Código do tipo de produto
 *                   nome:
 *                     type: string
 *                     description: Nome do tipo de produto
 */
router.get(
  '/tipo_produto',
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getTipoProduto()

    const msg = 'Tipos de produto retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/tipo_rotina:
 *   get:
 *     summary: Retorna os tipos de rotina
 *     description: Retorna uma lista de tipos de rotina disponíveis no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Tipos
 *     responses:
 *       200:
 *         description: Tipos de rotina retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                     description: Código do tipo de rotina
 *                   nome:
 *                     type: string
 *                     description: Nome do tipo de rotina
 */
router.get(
  '/tipo_rotina',
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getTipoRotina()

    const msg = 'Tipos de rotina retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/tipo_criacao_unidade_trabalho:
 *   get:
 *     summary: Retorna os tipos de criação de unidade de trabalho
 *     description: Retorna uma lista de tipos de criação de unidade de trabalho disponíveis no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Tipos
 *     responses:
 *       200:
 *         description: Tipos de criação de unidade de trabalho retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                     description: Código do tipo de criação de unidade de trabalho
 *                   nome:
 *                     type: string
 *                     description: Nome do tipo de criação de unidade de trabalho
 */
router.get(
  '/tipo_criacao_unidade_trabalho',
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getTipoCriacaoUnidadeTrabalho()

    const msg = 'Tipos de criação de unidade de trabalho retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/tipo_controle_qualidade:
 *   get:
 *     summary: Retorna os tipos de controle de qualidade
 *     description: Retorna uma lista de tipos de controle de qualidade disponíveis no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Tipos
 *     responses:
 *       200:
 *         description: Tipos de controle de qualidade retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                     description: Código do tipo de controle de qualidade
 *                   nome:
 *                     type: string
 *                     description: Nome do tipo de controle de qualidade
 */
router.get(
  '/tipo_controle_qualidade',
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getTipoCQ()

    const msg = 'Tipos de controle de qualidade retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/tipo_fase:
 *   get:
 *     summary: Retorna os tipos de fase
 *     description: Retorna uma lista de tipos de fase disponíveis no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Tipos
 *     responses:
 *       200:
 *         description: Tipos de fase retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                     description: Código do tipo de fase
 *                   nome:
 *                     type: string
 *                     description: Nome do tipo de fase
 */
router.get(
  '/tipo_fase',
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getTipoFase()

    const msg = 'Tipos de fase retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/tipo_pre_requisito:
 *   get:
 *     summary: Retorna os tipos de pré-requisito
 *     description: Retorna uma lista de tipos de pré-requisito disponíveis no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Tipos
 *     responses:
 *       200:
 *         description: Tipos de pré-requisito retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                     description: Código do tipo de pré-requisito
 *                   nome:
 *                     type: string
 *                     description: Nome do tipo de pré-requisito
 */
router.get(
  '/tipo_pre_requisito',
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getTipoPreRequisito()

    const msg = 'Tipos de pre requisito retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/tipo_etapa:
 *   get:
 *     summary: Retorna os tipos de etapa
 *     description: Retorna uma lista de tipos de etapa disponíveis no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Tipos
 *     responses:
 *       200:
 *         description: Tipos de etapa retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                     description: Código do tipo de etapa
 *                   nome:
 *                     type: string
 *                     description: Nome do tipo de etapa
 */
router.get(
  '/tipo_etapa',
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getTipoEtapa()

    const msg = 'Tipos de etapa retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/tipo_exibicao:
 *   get:
 *     summary: Retorna os tipos de exibição
 *     description: Retorna uma lista de tipos de exibição disponíveis no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Tipos
 *     responses:
 *       200:
 *         description: Tipos de exibição retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                     description: Código do tipo de exibição
 *                   nome:
 *                     type: string
 *                     description: Nome do tipo de exibição
 */
router.get(
  '/tipo_exibicao',
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getTipoExibicao()

    const msg = 'Tipos de exibição retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/tipo_restricao:
 *   get:
 *     summary: Retorna os tipos de restrição
 *     description: Retorna uma lista de tipos de restrição disponíveis no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Tipos
 *     responses:
 *       200:
 *         description: Tipos de restrição retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                     description: Código do tipo de restrição
 *                   nome:
 *                     type: string
 *                     description: Nome do tipo de restrição
 */
router.get(
  '/tipo_restricao',
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getTipoRestricao()

    const msg = 'Tipos de restrição retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/tipo_insumo:
 *   get:
 *     summary: Retorna os tipos de insumo
 *     description: Retorna uma lista de tipos de insumo disponíveis no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Tipos
 *     responses:
 *       200:
 *         description: Tipos de insumo retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                     description: Código do tipo de insumo
 *                   nome:
 *                     type: string
 *                     description: Nome do tipo de insumo
 */
router.get(
  '/tipo_insumo',
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getTipoInsumo()

    const msg = 'Tipos de insumo retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/tipo_dado_producao:
 *   get:
 *     summary: Retorna os tipos de dado de produção
 *     description: Retorna uma lista de tipos de dado de produção disponíveis no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Tipos
 *     responses:
 *       200:
 *         description: Tipos de dado de produção retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                     description: Código do tipo de dado de produção
 *                   nome:
 *                     type: string
 *                     description: Nome do tipo de dado de produção
 */
router.get(
  '/tipo_dado_producao',
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getTipoDadoProducao()

    const msg = 'Tipos de dado de produção retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/grupo_estilos:
 *   get:
 *     summary: Retorna os grupos de estilos
 *     description: Retorna uma lista de grupos de estilos disponíveis no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Grupos de Estilos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Grupos de estilos retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID do grupo de estilos
 *                   nome:
 *                     type: string
 *                     description: Nome do grupo de estilos
 */
router.get(
  '/grupo_estilos',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getGrupoEstilos()

    const msg = 'Grupo de estilos retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/grupo_estilos:
 *   post:
 *     summary: Grava um novo grupo de estilos
 *     description: Grava um novo grupo de estilos no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Grupos de Estilos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/grupoEstilos'
 *     responses:
 *       201:
 *         description: Grupo de estilos gravado com sucesso
 */
router.post(
  '/grupo_estilos',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.grupoEstilos }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.gravaGrupoEstilos(req.body.grupo_estilos, req.usuarioId)

    const msg = 'Grupo de estilos gravados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/grupo_estilos:
 *   put:
 *     summary: Atualiza um grupo de estilos
 *     description: Atualiza um grupo de estilos existente no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Grupos de Estilos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/grupoEstilosAtualizacao'
 *     responses:
 *       201:
 *         description: Grupo de estilos atualizado com sucesso
 */
router.put(
  '/grupo_estilos',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.grupoEstilosAtualizacao }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaGrupoEstilos(req.body.grupo_estilos, req.usuarioId)

    const msg = 'Grupo de estilos atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/grupo_estilos:
 *   delete:
 *     summary: Deleta um grupo de estilos
 *     description: Deleta um grupo de estilos existente no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Grupos de Estilos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/grupoEstilosIds'
 *     responses:
 *       201:
 *         description: Grupo de estilos deletado com sucesso
 */
router.delete(
  '/grupo_estilos',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.grupoEstilosIds }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaGrupoEstilos(req.body.grupo_estilos_ids)

    const msg = 'Grupo de estilos deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/regras:
 *   get:
 *     summary: Retorna as regras
 *     description: Retorna uma lista de regras cadastradas no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Regras
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Regras retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID da regra
 *                   nome:
 *                     type: string
 *                     description: Nome da regra
 *                   regra:
 *                     type: string
 *                     description: Regra detalhada
 */
router.get(
  '/regras',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getRegras()

    const msg = 'Regras retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/regras:
 *   post:
 *     summary: Cria novas regras
 *     description: Grava novas regras no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Regras
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/regras'
 *     responses:
 *       201:
 *         description: Regras gravadas com sucesso
 */
router.post(
  '/regras',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.regras }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.gravaRegras(
      req.body.regras,
      req.usuarioId
    )

    const msg = 'Regras gravados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/regras:
 *   put:
 *     summary: Atualiza regras existentes
 *     description: Atualiza regras já cadastradas no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Regras
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/regrasAtualizacao'
 *     responses:
 *       201:
 *         description: Regras atualizadas com sucesso
 */
router.put(
  '/regras',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.regrasAtualizacao }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaRegras(req.body.regras, req.usuarioId)

    const msg = 'Regras atualizadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/regras:
 *   delete:
 *     summary: Deleta regras
 *     description: Deleta regras cadastradas no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Regras
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/regrasIds'
 *     responses:
 *       201:
 *         description: Regras deletadas com sucesso
 */
router.delete(
  '/regras',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.regrasIds }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaRegras(req.body.regras_ids)

    const msg = 'Regras deletadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/menus:
 *   get:
 *     summary: Retorna os menus
 *     description: Retorna uma lista de menus cadastrados no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Menus
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Menus retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID do menu
 *                   nome:
 *                     type: string
 *                     description: Nome do menu
 *                   definicao_menu:
 *                     type: string
 *                     description: Definição do menu
 */
router.get(
  '/menus',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getMenus()

    const msg = 'Menus retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/menus:
 *   post:
 *     summary: Cria novos menus
 *     description: Grava novos menus no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Menus
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/menus'
 *     responses:
 *       201:
 *         description: Menus gravados com sucesso
 */
router.post(
  '/menus',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.menus }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.gravaMenus(req.body.menus, req.usuarioId)

    const msg = 'Menus gravados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/menus:
 *   put:
 *     summary: Atualiza menus existentes
 *     description: Atualiza menus já cadastrados no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Menus
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/menusAtualizacao'
 *     responses:
 *       201:
 *         description: Menus atualizados com sucesso
 */
router.put(
  '/menus',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.menusAtualizacao }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaMenus(req.body.menus, req.usuarioId)

    const msg = 'Menus atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/menus:
 *   delete:
 *     summary: Deleta menus
 *     description: Deleta menus cadastrados no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Menus
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/menusIds'
 *     responses:
 *       201:
 *         description: Menus deletados com sucesso
 */
router.delete(
  '/menus',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.menusIds }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaMenus(req.body.menus_ids)

    const msg = 'Menus deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/estilos:
 *   get:
 *     summary: Retorna os estilos
 *     description: Retorna uma lista de estilos cadastrados no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Estilos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estilos retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID do estilo
 *                   grupo_estilo_id:
 *                     type: integer
 *                     description: ID do grupo de estilo
 *                   f_table_schema:
 *                     type: string
 *                     description: Schema da tabela
 *                   f_table_name:
 *                     type: string
 *                     description: Nome da tabela
 *                   f_geometry_column:
 *                     type: string
 *                     description: Coluna de geometria
 *                   stylename:
 *                     type: string
 *                     description: Nome do estilo
 *                   styleqml:
 *                     type: string
 *                     description: Estilo QML
 *                   stylesld:
 *                     type: string
 *                     description: Estilo SLD
 *                   ui:
 *                     type: string
 *                     description: Interface do usuário
 *                   owner:
 *                     type: string
 *                     description: Proprietário do estilo
 *                   update_time:
 *                     type: string
 *                     description: Data de atualização
 */
router.get(
  '/estilos',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getEstilos()

    const msg = 'Estilos retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/estilos:
 *   post:
 *     summary: Cria novos estilos
 *     description: Grava novos estilos no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Estilos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/estilos'
 *     responses:
 *       201:
 *         description: Estilos gravados com sucesso
 */
router.post(
  '/estilos',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.estilos }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.gravaEstilos(req.body.estilos, req.usuarioId)

    const msg = 'Estilos gravados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/estilos:
 *   put:
 *     summary: Atualiza estilos existentes
 *     description: Atualiza estilos já cadastrados no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Estilos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/estilosAtualizacao'
 *     responses:
 *       201:
 *         description: Estilos atualizados com sucesso
 */
router.put(
  '/estilos',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.estilosAtualizacao }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaEstilos(req.body.estilos, req.usuarioId)

    const msg = 'Estilos atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/estilos:
 *   delete:
 *     summary: Deleta estilos
 *     description: Deleta estilos cadastrados no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Estilos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/estilosIds'
 *     responses:
 *       201:
 *         description: Estilos deletados com sucesso
 */
router.delete(
  '/estilos',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.estilosIds }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaEstilos(req.body.estilos_ids)

    const msg = 'Estilos deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/modelos:
 *   get:
 *     summary: Retorna os modelos
 *     description: Retorna uma lista de modelos cadastrados no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Modelos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Modelos retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID do modelo
 *                   nome:
 *                     type: string
 *                     description: Nome do modelo
 *                   descricao:
 *                     type: string
 *                     description: Descrição do modelo
 *                   model_xml:
 *                     type: string
 *                     description: Modelo XML
 *                   owner:
 *                     type: string
 *                     description: Proprietário do modelo
 *                   update_time:
 *                     type: string
 *                     description: Data de atualização
 */
router.get(
  '/modelos',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getModelos()

    const msg = 'Modelos retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/modelos:
 *   post:
 *     summary: Cria novos modelos
 *     description: Grava novos modelos no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Modelos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/qgisModels'
 *     responses:
 *       201:
 *         description: Modelos gravados com sucesso
 */
router.post(
  '/modelos',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.qgisModels }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.gravaModelos(req.body.modelos, req.usuarioId)

    const msg = 'Modelos gravados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/modelos:
 *   put:
 *     summary: Atualiza modelos existentes
 *     description: Atualiza modelos já cadastrados no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Modelos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/atualizaQgisModels'
 *     responses:
 *       201:
 *         description: Modelos atualizados com sucesso
 */
router.put(
  '/modelos',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.atualizaQgisModels }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaModelos(req.body.modelos, req.usuarioId)

    const msg = 'Modelos atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/modelos:
 *   delete:
 *     summary: Deleta modelos
 *     description: Deleta modelos cadastrados no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Modelos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/qgisModelsIds'
 *     responses:
 *       201:
 *         description: Modelos deletados com sucesso
 */

router.delete(
  '/modelos',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.qgisModelsIds }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaModelos(req.body.modelos_ids)

    const msg = 'Modelos deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/dado_producao:
 *   get:
 *     summary: Retorna os dados de produção
 *     description: Retorna uma lista de todos os dados de produção cadastrados no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Dados de Produção
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados de produção retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID do dado de produção
 *                   tipo_dado_producao_id:
 *                     type: integer
 *                     description: ID do tipo de dado de produção
 *                   tipo_dado_producao:
 *                     type: string
 *                     description: Nome do tipo de dado de produção
 *                   configuracao_producao:
 *                     type: string
 *                     description: Configuração da produção
 */
router.get(
  '/dado_producao',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getDadoProducao()

    const msg = 'Dados de producão retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/dado_producao:
 *   post:
 *     summary: Cria novos dados de produção
 *     description: Grava novos dados de produção no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Dados de Produção
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/dadoProducao'
 *     responses:
 *       201:
 *         description: Dados de produção criados com sucesso
 */
router.post(
  '/dado_producao',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.dadoProducao }),
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.criaDadoProducao(req.body.dado_producao)

    const msg = 'Dado de produção criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/dado_producao:
 *   put:
 *     summary: Atualiza dados de produção
 *     description: Atualiza dados de produção já cadastrados no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Dados de Produção
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/dadoProducaoUpdate'
 *     responses:
 *       200:
 *         description: Dados de produção atualizados com sucesso
 */
router.put(
  '/dado_producao',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.dadoProducaoUpdate }),
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.atualizaDadoProducao(req.body.dado_producao)

    const msg = 'Dado de produção atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/dado_producao:
 *   delete:
 *     summary: Deleta dados de produção
 *     description: Deleta dados de produção cadastrados no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Dados de Produção
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/dadoProducaoIds'
 *     responses:
 *       200:
 *         description: Dados de produção deletados com sucesso
 */
router.delete(
  '/dado_producao',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.dadoProducaoIds }),
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.deletaDadoProducao(req.body.dado_producao_ids)

    const msg = 'Dado de produção deletado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/banco_dados:
 *   get:
 *     summary: Retorna os bancos de dados
 *     description: Retorna uma lista de todos os bancos de dados cadastrados no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Banco de Dados
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bancos de dados retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID do banco de dados
 *                   tipo_dado_producao_id:
 *                     type: integer
 *                     description: ID do tipo de dado de produção
 *                   configuracao_producao:
 *                     type: string
 *                     description: Configuração da produção
 *                   servidor:
 *                     type: string
 *                     description: Servidor do banco de dados
 *                   porta:
 *                     type: string
 *                     description: Porta do banco de dados
 *                   nome:
 *                     type: string
 *                     description: Nome do banco de dados
 */
router.get(
  '/banco_dados',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getDatabase()

    const msg = 'Banco de dados retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/login:
 *   get:
 *     summary: Retorna os dados de login
 *     description: Retorna os dados de login de usuários cadastrados no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Login
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados de login retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID do login
 *                   usuario:
 *                     type: string
 *                     description: Nome do usuário
 *                   ultimo_login:
 *                     type: string
 *                     format: date-time
 *                     description: Data e hora do último login
 */
router.get(
  '/login',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getLogin()

    const msg = 'Dados de login retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/bloco:
 *   get:
 *     summary: Retorna os blocos
 *     description: Retorna uma lista de blocos cadastrados no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Blocos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Blocos retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID do bloco
 *                   nome:
 *                     type: string
 *                     description: Nome do bloco
 *                   prioridade:
 *                     type: integer
 *                     description: Prioridade do bloco
 *                   lote_id:
 *                     type: integer
 *                     description: ID do lote associado
 */
router.get(
  '/bloco',
  verifyAdmin,
  schemaValidation({
    query: projetoSchema.statusQuery
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getBlocos(req.query.status === 'execucao')

    const msg = 'Blocos retornados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/bloco:
 *   post:
 *     summary: Cria novos blocos
 *     description: Grava novos blocos no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Blocos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/blocos'
 *     responses:
 *       201:
 *         description: Blocos criados com sucesso
 */
router.post(
  '/bloco',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.blocos }),
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.criaBlocos(req.body.blocos)

    const msg = 'Blocos criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/bloco:
 *   put:
 *     summary: Atualiza blocos existentes
 *     description: Atualiza blocos já cadastrados no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Blocos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/blocoUpdate'
 *     responses:
 *       200:
 *         description: Blocos atualizados com sucesso
 */
router.put(
  '/bloco',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.blocoUpdate }),
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.atualizaBlocos(req.body.blocos)

    const msg = 'Blocos atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/bloco:
 *   delete:
 *     summary: Deleta blocos
 *     description: Deleta blocos cadastrados no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Blocos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/blocoIds'
 *     responses:
 *       200:
 *         description: Blocos deletados com sucesso
 */
router.delete(
  '/bloco',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.blocoIds }),
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.deletaBlocos(req.body.bloco_ids)

    const msg = 'Blocos deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/unidade_trabalho/bloco:
 *   put:
 *     summary: Atualiza o bloco das unidades de trabalho
 *     description: Atualiza o bloco associado a um conjunto de unidades de trabalho.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Unidades de Trabalho
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/unidadeTrabalhoBloco'
 *     responses:
 *       200:
 *         description: Bloco das unidades de trabalho atualizado com sucesso
 */
router.put(
  '/unidade_trabalho/bloco',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.unidadeTrabalhoBloco }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.unidadeTrabalhoBloco(
      req.body.unidade_trabalho_ids,
      req.body.bloco_id
    )

    const msg = 'Bloco das unidades de trabalho atualizado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/atividades:
 *   delete:
 *     summary: Deleta atividades não iniciadas
 *     description: Deleta atividades que ainda não foram iniciadas.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Atividades
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/listaAtividades'
 *     responses:
 *       200:
 *         description: Atividades não iniciadas deletadas com sucesso
 */
router.delete(
  '/atividades',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.listaAtividades }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaAtividades(req.body.atividades_ids)

    const msg = 'Atividades não iniciadas deletadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/unidade_trabalho/atividades:
 *   delete:
 *     summary: Deleta atividades não iniciadas relacionadas a unidade de trabalho
 *     description: Deleta todas as atividades não iniciadas associadas a uma unidade de trabalho específica.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Unidades de Trabalho
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/unidadeTrabalhoId'
 *     responses:
 *       200:
 *         description: Atividades não iniciadas relacionadas a unidade de trabalho deletadas com sucesso
 */
router.delete(
  '/unidade_trabalho/atividades',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.unidadeTrabalhoId }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaAtividadesUnidadeTrabalho(req.body.unidade_trabalho_ids)

    const msg = 'Atividades não iniciadas relacionadas a unidade de trabalho deletadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/atividades:
 *   post:
 *     summary: Cria novas atividades
 *     description: Cria novas atividades associadas a unidades de trabalho e etapas específicas.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Atividades
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/unidadeTrabalhoEtapa'
 *     responses:
 *       200:
 *         description: Atividades criadas com sucesso
 */
router.post(
  '/atividades',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.unidadeTrabalhoEtapa }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaAtividades(
      req.body.unidade_trabalho_ids,
      req.body.etapa_ids
    )

    const msg = 'Atividades criadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/atividades/todas:
 *   post:
 *     summary: Cria todas as atividades para um lote
 *     description: Cria todas as atividades necessárias para um lote, incluindo atividades de revisão, correção, e revisão final.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Atividades
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/todasAtividades'
 *     responses:
 *       200:
 *         description: Todas as atividades criadas com sucesso
 */
router.post(
  '/atividades/todas',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.todasAtividades }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaTodasAtividades(
      req.body.lote_id,
      req.body.atividades_revisao,
      req.body.atividades_revisao_correcao,
      req.body.atividades_revisao_final
    )

    const msg = 'Todas Atividades criadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/etapas/padrao:
 *   post:
 *     summary: Cria etapas padrão para um lote
 *     description: Cria etapas padrão associadas a um lote, incluindo fases e padrões de controle de qualidade.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Etapas
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/padrao_etapa'
 *     responses:
 *       200:
 *         description: Etapas padrão criadas com sucesso
 */
router.post(
  '/etapas/padrao',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.padrao_etapa }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaEtapasPadrao(
      req.body.padrao_cq,
      req.body.fase_id,
      req.body.lote_id
    )

    const msg = 'Etapas padrão criadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/projetos:
 *   get:
 *     summary: Retorna os projetos
 *     description: Retorna uma lista de projetos cadastrados no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Projetos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Projetos retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID do projeto
 *                   nome:
 *                     type: string
 *                     description: Nome do projeto
 *                   descricao:
 *                     type: string
 *                     description: Descrição do projeto
 *                   status_id:
 *                     type: integer
 *                     description: Indica o id do status do projeto
 *                   status:
 *                     type: string
 *                     description: Indica o status do projeto
 */
router.get(
  '/projetos',
  verifyAdmin,
  schemaValidation({
    query: projetoSchema.statusQuery
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getProjetos(req.query.status === 'execucao')

    const msg = 'Projetos retornados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/projetos:
 *   post:
 *     summary: Cria novos projetos
 *     description: Grava novos projetos no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Projetos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/projeto'
 *     responses:
 *       201:
 *         description: Projetos criados com sucesso
 */
router.post(
  '/projetos',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.projeto }),
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.criaProjetos(req.body.projetos)

    const msg = 'Projetos criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/projetos:
 *   put:
 *     summary: Atualiza projetos existentes
 *     description: Atualiza projetos já cadastrados no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Projetos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/projetoUpdate'
 *     responses:
 *       200:
 *         description: Projetos atualizados com sucesso
 */
router.put(
  '/projetos',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.projetoUpdate }),
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.atualizaProjetos(req.body.projetos)

    const msg = 'Projetos atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/projetos:
 *   delete:
 *     summary: Deleta projetos
 *     description: Deleta projetos cadastrados no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Projetos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/projetoIds'
 *     responses:
 *       200:
 *         description: Projetos deletados com sucesso
 */
router.delete(
  '/projetos',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.projetoIds }),
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.deletaProjetos(req.body.projeto_ids)

    const msg = 'Projetos deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/linha_producao:
 *   get:
 *     summary: Retorna as linhas de produção
 *     description: Retorna uma lista de todas as linhas de produção cadastradas no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Linhas de Produção
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Linhas de produção retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID da linha de produção
 *                   nome:
 *                     type: string
 *                     description: Nome da linha de produção
 */
router.get(
  '/linha_producao',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getLinhasProducao()

    const msg = 'Linhas de produção retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/fases:
 *   get:
 *     summary: Retorna as fases
 *     description: Retorna uma lista de todas as fases cadastradas no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Fases
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fases retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID da fase
 *                   nome:
 *                     type: string
 *                     description: Nome da fase
 */
router.get(
  '/fases',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getFases()

    const msg = 'Fases retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/subfases:
 *   get:
 *     summary: Retorna as subfases
 *     description: Retorna uma lista de todas as subfases cadastradas no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Subfases
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subfases retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID da subfase
 *                   nome:
 *                     type: string
 *                     description: Nome da subfase
 */
router.get(
  '/subfases',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getSubfases()

    const msg = 'Subfases retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/todas_subfases:
 *   get:
 *     summary: Retorna todas as subfases
 *     description: Retorna uma lista de todas as subfases cadastradas no sistema, independentemente de outros filtros.
 *     produces:
 *       - application/json
 *     tags:
 *       - Subfases
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todas as subfases retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID da subfase
 *                   nome:
 *                     type: string
 *                     description: Nome da subfase
 */
router.get(
  '/todas_subfases',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getAllSubfases()

    const msg = 'Subfases retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/etapas:
 *   get:
 *     summary: Retorna as etapas
 *     description: Retorna uma lista de todas as etapas cadastradas no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Etapas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Etapas retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID da etapa
 *                   nome:
 *                     type: string
 *                     description: Nome da etapa
 */
router.get(
  '/etapas',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getEtapas()

    const msg = 'Etapas retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/gerenciador_fme:
 *   get:
 *     summary: Retorna as informações dos serviços do Gerenciador do FME
 *     description: Retorna uma lista de todos os serviços cadastrados no Gerenciador do FME.
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informações dos serviços do Gerenciador do FME retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID do serviço
 *                   nome:
 *                     type: string
 *                     description: Nome do serviço
 *                   url:
 *                     type: string
 *                     description: URL do serviço
 */
router.get(
  '/configuracao/gerenciador_fme',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getGerenciadorFME()

    const msg =
      'Informações dos serviços do Gerenciador do FME retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/gerenciador_fme:
 *   post:
 *     summary: Cria um novo serviço no Gerenciador do FME
 *     description: Insere as informações de um novo serviço no Gerenciador do FME.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/gerenciadorFME'
 *     responses:
 *       201:
 *         description: Informações dos serviços do Gerenciador do FME inseridas com sucesso
 */
router.post(
  '/configuracao/gerenciador_fme',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.gerenciadorFME }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaGerenciadorFME(req.body.gerenciador_fme)

    const msg =
      'Informações dos serviços do Gerenciador do FME inseridas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/gerenciador_fme:
 *   put:
 *     summary: Atualiza as informações dos serviços do Gerenciador do FME
 *     description: Atualiza as informações de serviços já cadastrados no Gerenciador do FME.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/gerenciadorFMEUpdate'
 *     responses:
 *       201:
 *         description: Informações dos serviços do Gerenciador do FME atualizadas com sucesso
 */
router.put(
  '/configuracao/gerenciador_fme',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.gerenciadorFMEUpdate
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaGerenciadorFME(req.body.gerenciador_fme)

    const msg =
      'Informações dos serviços do Gerenciador do FME atualizadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/gerenciador_fme:
 *   delete:
 *     summary: Deleta um serviço do Gerenciador do FME
 *     description: Deleta as informações de um serviço cadastrado no Gerenciador do FME.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/gerenciadorFMEIds'
 *     responses:
 *       201:
 *         description: Informações dos serviços do Gerenciador do FME deletadas com sucesso
 */
router.delete(
  '/configuracao/gerenciador_fme',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.gerenciadorFMEIds
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaGerenciadorFME(req.body.servidores_id)

    const msg =
      'Informações dos serviços do Gerenciador do FME deletadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/camadas:
 *   get:
 *     summary: Retorna as camadas de configuração
 *     description: Retorna uma lista de todas as camadas cadastradas na configuração do sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Camadas retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID da camada
 *                   nome:
 *                     type: string
 *                     description: Nome da camada
 *                   tipo:
 *                     type: string
 *                     description: Tipo da camada
 */
router.get(
  '/configuracao/camadas',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getCamadas()

    const msg = 'Camadas retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/camadas:
 *   delete:
 *     summary: Deleta uma camada de configuração
 *     description: Deleta uma camada específica cadastrada na configuração do sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/camadasIds'
 *     responses:
 *       200:
 *         description: Camada deletada com sucesso
 */
router.delete(
  '/configuracao/camadas',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.camadasIds
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deleteCamadas(req.body.camadas_ids)

    const msg = 'Camada deletada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/camadas:
 *   post:
 *     summary: Cria uma nova camada de configuração
 *     description: Insere as informações de uma nova camada na configuração do sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/camadas'
 *     responses:
 *       201:
 *         description: Camada criada com sucesso
 */
router.post(
  '/configuracao/camadas',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.camadas
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaCamadas(req.body.camadas)

    const msg = 'Camadas criadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/camadas:
 *   put:
 *     summary: Atualiza uma camada de configuração
 *     description: Atualiza as informações de uma camada já cadastrada na configuração do sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/camadasAtualizacao'
 *     responses:
 *       200:
 *         description: Camada atualizada com sucesso
 */
router.put(
  '/configuracao/camadas',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.camadasAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaCamadas(req.body.camadas)

    const msg = 'Camadas atualizadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_fme:
 *   get:
 *     summary: Retorna os perfis FME
 *     description: Retorna uma lista de todos os perfis FME cadastrados no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil FME retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID do perfil FME
 *                   nome:
 *                     type: string
 *                     description: Nome do perfil FME
 *                   url:
 *                     type: string
 *                     description: URL do serviço FME
 */
router.get(
  '/configuracao/perfil_fme',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getPerfilFME()

    const msg = 'Perfil FME retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_fme:
 *   delete:
 *     summary: Deleta um perfil FME
 *     description: Deleta um perfil FME específico cadastrado no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfilFMEIds'
 *     responses:
 *       200:
 *         description: Perfil FME deletado com sucesso
 */
router.delete(
  '/configuracao/perfil_fme',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilFMEIds
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletePerfilFME(req.body.perfil_fme_ids)

    const msg = 'Perfil FME deletado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_fme:
 *   post:
 *     summary: Cria um novo perfil FME
 *     description: Insere as informações de um novo perfil FME no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfisFME'
 *     responses:
 *       201:
 *         description: Perfis FME criados com sucesso
 */
router.post(
  '/configuracao/perfil_fme',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfisFME
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaPerfilFME(req.body.perfis_fme)

    const msg = 'Perfis FME criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_fme:
 *   put:
 *     summary: Atualiza um perfil FME
 *     description: Atualiza as informações de um perfil FME já cadastrado no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfilFMEAtualizacao'
 *     responses:
 *       200:
 *         description: Perfil FME atualizado com sucesso
 */
router.put(
  '/configuracao/perfil_fme',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilFMEAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaPerfilFME(req.body.perfis_fme)

    const msg = 'Perfis FME atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_menu:
 *   get:
 *     summary: Retorna os perfis de Menu QGIS
 *     description: Retorna uma lista de todos os perfis de Menu QGIS cadastrados no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil Menu QGIS retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID do perfil de Menu QGIS
 *                   nome:
 *                     type: string
 *                     description: Nome do perfil de Menu QGIS
 */
router.get(
  '/configuracao/perfil_menu',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getPerfilMenu()

    const msg = 'Perfil Menu QGIS retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_menu:
 *   delete:
 *     summary: Deleta um perfil de Menu QGIS
 *     description: Deleta um perfil de Menu QGIS específico cadastrado no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfilMenuIds'
 *     responses:
 *       200:
 *         description: Perfil Menu QGIS deletado com sucesso
 */
router.delete(
  '/configuracao/perfil_menu',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilMenuIds
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletePerfilMenu(req.body.perfil_menu_ids)

    const msg = 'Perfil Menu QGIS deletado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_menu:
 *   post:
 *     summary: Cria um novo perfil de Menu QGIS
 *     description: Insere as informações de um novo perfil de Menu QGIS no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfisMenu'
 *     responses:
 *       201:
 *         description: Perfis Menu QGIS criados com sucesso
 */
router.post(
  '/configuracao/perfil_menu',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfisMenu
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaPerfilMenu(req.body.perfis_menu)

    const msg = 'Perfis Menu QGIS criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_menu:
 *   put:
 *     summary: Atualiza um perfil de Menu QGIS
 *     description: Atualiza as informações de um perfil de Menu QGIS já cadastrado no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfilMenuAtualizacao'
 *     responses:
 *       200:
 *         description: Perfil Menu QGIS atualizado com sucesso
 */
router.put(
  '/configuracao/perfil_menu',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilMenuAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaPerfilMenu(req.body.perfis_menu)

    const msg = 'Perfis Menu QGIS atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_linhagem:
 *   get:
 *     summary: Retorna os perfis de Linhagem QGIS
 *     description: Retorna uma lista de todos os perfis de Linhagem QGIS cadastrados no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil Linhagem QGIS retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID do perfil de Linhagem QGIS
 *                   nome:
 *                     type: string
 *                     description: Nome do perfil de Linhagem QGIS
 */
router.get(
  '/configuracao/perfil_linhagem',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getPerfilLinhagem()

    const msg = 'Perfil Linhagem QGIS retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_linhagem:
 *   delete:
 *     summary: Deleta um perfil de Linhagem QGIS
 *     description: Deleta um perfil de Linhagem QGIS específico cadastrado no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfilLinhagemIds'
 *     responses:
 *       200:
 *         description: Perfil Linhagem QGIS deletado com sucesso
 */
router.delete(
  '/configuracao/perfil_linhagem',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilLinhagemIds
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletePerfilLinhagem(req.body.perfil_linhagem_ids)

    const msg = 'Perfil Linhagem QGIS deletado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_linhagem:
 *   post:
 *     summary: Cria um novo perfil de Linhagem QGIS
 *     description: Insere as informações de um novo perfil de Linhagem QGIS no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfisLinhagem'
 *     responses:
 *       201:
 *         description: Perfis Linhagem QGIS criados com sucesso
 */
router.post(
  '/configuracao/perfil_linhagem',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfisLinhagem
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaPerfilLinhagem(req.body.perfis_linhagem)

    const msg = 'Perfis Linhagem QGIS criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_linhagem:
 *   put:
 *     summary: Atualiza um perfil de Linhagem QGIS
 *     description: Atualiza as informações de um perfil de Linhagem QGIS já cadastrado no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfilLinhagemAtualizacao'
 *     responses:
 *       200:
 *         description: Perfil Linhagem QGIS atualizado com sucesso
 */
router.put(
  '/configuracao/perfil_linhagem',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilLinhagemAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaPerfilLinhagem(req.body.perfis_linhagem)

    const msg = 'Perfis Linhagem atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_modelo:
 *   get:
 *     summary: Retorna os perfis de Modelo QGIS
 *     description: Retorna uma lista de todos os perfis de Modelo QGIS cadastrados no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil Modelo QGIS retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID do perfil de Modelo QGIS
 *                   nome:
 *                     type: string
 *                     description: Nome do perfil de Modelo QGIS
 */
router.get(
  '/configuracao/perfil_modelo',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getPerfilModelo()

    const msg = 'Perfil Modelo QGIS retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_modelo:
 *   delete:
 *     summary: Deleta um perfil de Modelo QGIS
 *     description: Deleta um perfil de Modelo QGIS específico cadastrado no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfilModeloIds'
 *     responses:
 *       200:
 *         description: Perfil Modelo QGIS deletado com sucesso
 */
router.delete(
  '/configuracao/perfil_modelo',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilModeloIds
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletePerfilModelo(req.body.perfil_modelo_ids)

    const msg = 'Perfil Modelo QGIS deletado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_modelo:
 *   post:
 *     summary: Cria um novo perfil de Modelo QGIS
 *     description: Insere as informações de um novo perfil de Modelo QGIS no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfisModelo'
 *     responses:
 *       201:
 *         description: Perfis Modelo QGIS criados com sucesso
 */
router.post(
  '/configuracao/perfil_modelo',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfisModelo
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaPerfilModelo(req.body.perfis_modelo)

    const msg = 'Perfis Modelo QGIS criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_modelo:
 *   put:
 *     summary: Atualiza um perfil de Modelo QGIS
 *     description: Atualiza as informações de um perfil de Modelo QGIS já cadastrado no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfilModeloAtualizacao'
 *     responses:
 *       200:
 *         description: Perfil Modelo QGIS atualizado com sucesso
 */
router.put(
  '/configuracao/perfil_modelo',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilModeloAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaPerfilModelo(req.body.perfis_modelo)

    const msg = 'Perfis Modelo QGIS atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_regras:
 *   get:
 *     summary: Retorna os perfis de Regras
 *     description: Retorna uma lista de todos os perfis de Regras cadastrados no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil de Regras retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID do perfil de Regras
 *                   nome:
 *                     type: string
 *                     description: Nome do perfil de Regras
 */
router.get(
  '/configuracao/perfil_regras',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getPerfilRegras()

    const msg = 'Perfil de Regras retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_regras:
 *   delete:
 *     summary: Deleta um perfil de Regras
 *     description: Deleta um perfil de Regras específico cadastrado no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfilRegrasIds'
 *     responses:
 *       200:
 *         description: Perfil de Regras deletado com sucesso
 */
router.delete(
  '/configuracao/perfil_regras',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilRegrasIds
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletePerfilRegras(req.body.perfil_regras_ids)

    const msg = 'Perfil de Regras deletado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_regras:
 *   post:
 *     summary: Cria um novo perfil de Regras
 *     description: Insere as informações de um novo perfil de Regras no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfilRegras'
 *     responses:
 *       201:
 *         description: Perfis de Regras criados com sucesso
 */
router.post(
  '/configuracao/perfil_regras',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilRegras
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaPerfilRegras(req.body.perfis_regras)

    const msg = 'Perfis de Regras criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_regras:
 *   put:
 *     summary: Atualiza um perfil de Regras
 *     description: Atualiza as informações de um perfil de Regras já cadastrado no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfilRegrastualizacao'
 *     responses:
 *       200:
 *         description: Perfis de Regras atualizados com sucesso
 */
router.put(
  '/configuracao/perfil_regras',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilRegrastualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaPerfilRegras(req.body.perfis_regras)

    const msg = 'Perfisde de Regras atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_estilos:
 *   get:
 *     summary: Retorna os perfis de Estilos
 *     description: Retorna uma lista de todos os perfis de Estilos cadastrados no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil de Estilos retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID do perfil de Estilos
 *                   nome:
 *                     type: string
 *                     description: Nome do perfil de Estilos
 */
router.get(
  '/configuracao/perfil_estilos',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getPerfilEstilos()

    const msg = 'Perfil de Estilos retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_estilos:
 *   delete:
 *     summary: Deleta um perfil de Estilos
 *     description: Deleta um perfil de Estilos específico cadastrado no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfilEstilosIds'
 *     responses:
 *       200:
 *         description: Perfil de Estilos deletado com sucesso
 */
router.delete(
  '/configuracao/perfil_estilos',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilEstilosIds
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletePerfilEstilos(req.body.perfil_estilos_ids)

    const msg = 'Perfil de Estilos deletado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_estilos:
 *   post:
 *     summary: Cria um novo perfil de Estilos
 *     description: Insere as informações de um novo perfil de Estilos no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfilEstilos'
 *     responses:
 *       201:
 *         description: Perfis de Estilos criados com sucesso
 */
router.post(
  '/configuracao/perfil_estilos',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilEstilos
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaPerfilEstilos(req.body.perfis_estilos)

    const msg = 'Perfis de Estilos criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_estilos:
 *   put:
 *     summary: Atualiza um perfil de Estilos
 *     description: Atualiza as informações de um perfil de Estilos já cadastrado no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfilEstilostualizacao'
 *     responses:
 *       200:
 *         description: Perfis de Estilos atualizados com sucesso
 */
router.put(
  '/configuracao/perfil_estilos',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilEstilostualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaPerfilEstilos(req.body.perfis_estilos)

    const msg = 'Perfis de Estilos atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_requisito_finalizacao:
 *   get:
 *     summary: Retorna os perfis de Requisito de Finalização
 *     description: Retorna uma lista de todos os perfis de Requisito de Finalização cadastrados no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil de Requisito de Finalização retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID do perfil de Requisito de Finalização
 *                   nome:
 *                     type: string
 *                     description: Nome do perfil de Requisito de Finalização
 */
router.get(
  '/configuracao/perfil_requisito_finalizacao',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getPerfilRequisitoFinalizacao()

    const msg = 'Perfil requisito finalização retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_requisito_finalizacao:
 *   delete:
 *     summary: Deleta um perfil de Requisito de Finalização
 *     description: Deleta um perfil de Requisito de Finalização específico cadastrado no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfilRequisitoIds'
 *     responses:
 *       200:
 *         description: Perfil requisito finalização deletado com sucesso
 */
router.delete(
  '/configuracao/perfil_requisito_finalizacao',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilRequisitoIds
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletePerfilRequisitoFinalizacao(req.body.perfil_requisito_ids)

    const msg = 'Perfil requisito finalização deletado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_requisito_finalizacao:
 *   post:
 *     summary: Cria um novo perfil de Requisito de Finalização
 *     description: Insere as informações de um novo perfil de Requisito de Finalização no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfisRequisito'
 *     responses:
 *       201:
 *         description: Perfis requisito finalização criados com sucesso
 */
router.post(
  '/configuracao/perfil_requisito_finalizacao',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfisRequisito
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaPerfilRequisitoFinalizacao(req.body.perfis_requisito)

    const msg = 'Perfis requisito finalização criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_requisito_finalizacao:
 *   put:
 *     summary: Atualiza um perfil de Requisito de Finalização
 *     description: Atualiza as informações de um perfil de Requisito de Finalização já cadastrado no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfilRequisitoAtualizacao'
 *     responses:
 *       200:
 *         description: Perfis requisito finalização atualizados com sucesso
 */
router.put(
  '/configuracao/perfil_requisito_finalizacao',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilRequisitoAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaPerfilRequisitoFinalizacao(req.body.perfis_requisito)

    const msg = 'Perfis requisito finalização atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/unidade_trabalho/insumos:
 *   delete:
 *     summary: Deleta insumos associados a unidades de trabalho
 *     description: Remove insumos associados a unidades de trabalho com base nos IDs fornecidos.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Unidade de Trabalho
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/deletaInsumos'
 *     responses:
 *       200:
 *         description: Insumos associados deletados com sucesso
 */
router.delete(
  '/unidade_trabalho/insumos',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.deletaInsumos
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaInsumosAssociados(
      req.body.unidade_trabalho_ids,
      req.body.grupo_insumo_id
    )

    const msg = 'Insumos associados deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/grupo_insumo:
 *   get:
 *     summary: Retorna os grupos de insumos
 *     description: Retorna uma lista de todos os grupos de insumos cadastrados no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Grupos de Insumos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Grupos de insumos retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID do grupo de insumos
 *                   nome:
 *                     type: string
 *                     description: Nome do grupo de insumos
 */
router.get(
  '/grupo_insumo',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getGrupoInsumo()

    const msg = 'Grupos de insumos retornados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/grupo_insumo:
 *   put:
 *     summary: Atualiza grupos de insumos
 *     description: Atualiza as informações dos grupos de insumos cadastrados no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Grupos de Insumos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/grupoInsumoAtualizacao'
 *     responses:
 *       201:
 *         description: Grupos de insumos atualizados com sucesso
 */
router.put(
  '/grupo_insumo',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.grupoInsumoAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaGrupoInsumo(req.body.grupo_insumos)

    const msg = 'Grupos de insumos atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/grupo_insumo:
 *   post:
 *     summary: Cria novos grupos de insumos
 *     description: Insere novos grupos de insumos no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Grupos de Insumos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/grupoInsumo'
 *     responses:
 *       201:
 *         description: Grupos de insumos criados com sucesso
 */
router.post(
  '/grupo_insumo',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.grupoInsumo
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.gravaGrupoInsumo(req.body.grupo_insumos)

    const msg = 'Grupos de insumos criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/grupo_insumo:
 *   delete:
 *     summary: Deleta grupos de insumos
 *     description: Remove grupos de insumos do sistema com base nos IDs fornecidos.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Grupos de Insumos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/grupoInsumoId'
 *     responses:
 *       200:
 *         description: Grupos de insumos deletados com sucesso
 */
router.delete(
  '/grupo_insumo',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.grupoInsumoId }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaGrupoInsumo(req.body.grupo_insumos_ids)

    const msg = 'Grupos de insumos deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/unidade_trabalho:
 *   delete:
 *     summary: Deleta unidades de trabalho
 *     description: Remove unidades de trabalho do sistema com base nos IDs fornecidos.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Unidade de Trabalho
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/unidadeTrabalhoId'
 *     responses:
 *       200:
 *         description: Unidades de trabalho deletadas com sucesso
 */
router.delete(
  '/unidade_trabalho',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.unidadeTrabalhoId }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaUnidadeTrabalho(req.body.unidade_trabalho_ids)

    const msg = 'Unidade de trabalho deletadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/tipo_estrategia_associacao:
 *   get:
 *     summary: Retorna tipos de estratégias de associação
 *     description: Retorna uma lista de todos os tipos de estratégias de associação cadastrados no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Tipos de Estratégia de Associação
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estratégias retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID da estratégia de associação
 *                   nome:
 *                     type: string
 *                     description: Nome da estratégia de associação
 */
router.get(
  '/tipo_estrategia_associacao',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getEstrategiaAssociacao()

    const msg = 'Estratégias retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/unidade_trabalho/insumos:
 *   post:
 *     summary: Associa insumos a unidades de trabalho
 *     description: Associa insumos a unidades de trabalho com base nos IDs fornecidos.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Unidade de Trabalho
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/associaInsumos'
 *     responses:
 *       201:
 *         description: Insumos associados com sucesso
 */
router.post(
  '/unidade_trabalho/insumos',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.associaInsumos
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.associaInsumos(
      req.body.unidade_trabalho_ids,
      req.body.grupo_insumo_id,
      req.body.estrategia_id,
      req.body.caminho_padrao
    )

    const msg = 'Insumos associados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/bloco/insumos:
 *   post:
 *     summary: Associa insumos a blocos de unidades de trabalho
 *     description: Associa insumos a blocos de unidades de trabalho com base nos IDs fornecidos.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Blocos de Unidades de Trabalho
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/associaInsumosBloco'
 *     responses:
 *       201:
 *         description: Insumos do bloco associados com sucesso
 */
router.post(
  '/bloco/insumos',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.associaInsumosBloco
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.associaInsumosBloco(
      req.body.bloco_id,
      req.body.subfase_ids,
      req.body.grupo_insumo_id,
      req.body.estrategia_id,
      req.body.caminho_padrao
    )

    const msg = 'Insumos do bloco associados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/unidade_trabalho/copiar:
 *   post:
 *     summary: Copia unidades de trabalho
 *     description: Copia unidades de trabalho existentes com base nos IDs fornecidos.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Unidade de Trabalho
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/unidadeTrabalhoCopiar'
 *     responses:
 *       200:
 *         description: Unidades de trabalho copiadas com sucesso
 */
router.post(
  '/unidade_trabalho/copiar',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.unidadeTrabalhoCopiar
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.copiarUnidadeTrabalho(
      req.body.subfase_ids,
      req.body.unidade_trabalho_ids,
      req.body.associar_insumos
    )

    const msg = 'Unidades de trabalho copiadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/unidade_trabalho:
 *   post:
 *     summary: Cria novas unidades de trabalho
 *     description: Insere novas unidades de trabalho no sistema com base nos IDs fornecidos.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Unidade de Trabalho
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/unidadesTrabalho'
 *     responses:
 *       200:
 *         description: Unidades de trabalho criadas com sucesso
 */
router.post(
  '/unidade_trabalho',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.unidadesTrabalho
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaUnidadeTrabalho(
      req.body.unidades_trabalho,
      req.body.lote_id,
      req.body.subfase_ids
    )

    const msg = 'Unidades de trabalho criadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/insumo:
 *   post:
 *     summary: Cria novos insumos
 *     description: Insere novos insumos no sistema com base nos parâmetros fornecidos.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Insumos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/insumos'
 *     responses:
 *       201:
 *         description: Insumos criados com sucesso
 */
router.post(
  '/insumo',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.insumos
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaInsumos(
      req.body.insumos,
      req.body.tipo_insumo,
      req.body.grupo_insumo,
    )

    const msg = 'Insumos criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/produto:
 *   post:
 *     summary: Cria novos produtos
 *     description: Insere novos produtos no sistema com base nos IDs fornecidos.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Produtos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/produtos'
 *     responses:
 *       201:
 *         description: Produtos criados com sucesso
 */
router.post(
  '/produto',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.produtos
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaProdutos(
      req.body.produtos,
      req.body.lote_id
    )

    const msg = 'Produtos criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/produto:
 *   delete:
 *     summary: Deleta produtos
 *     description: Remove produtos do sistema com base nos IDs fornecidos.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Produtos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/produtosIds'
 *     responses:
 *       200:
 *         description: Produtos deletados com sucesso
 */
router.delete(
  '/produto',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.produtosIds
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deleteProdutos(
      req.body.produto_ids
    )

    const msg = 'Produtos deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/lote:
 *   get:
 *     summary: Retorna os lotes
 *     description: Retorna uma lista de todos os lotes cadastrados no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Lotes
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [execucao, finalizado]
 *         description: Indica se deve filtrar o status do lote
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lotes retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID do lote
 *                   nome:
 *                     type: string
 *                     description: Nome do lote
 */
router.get(
  '/lote',
  verifyAdmin,
  schemaValidation({
    query: projetoSchema.statusQuery
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getLote(req.query.status === 'execucao')

    const msg = 'Lotes retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/lote:
 *   post:
 *     summary: Cria novos lotes
 *     description: Insere novos lotes no sistema com base nos parâmetros fornecidos.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Lotes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/lotes'
 *     responses:
 *       201:
 *         description: Lotes criados com sucesso
 */
router.post(
  '/lote',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.lotes }),
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.criaLotes(req.body.lotes)

    const msg = 'Lotes criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/lote:
 *   put:
 *     summary: Atualiza lotes
 *     description: Atualiza as informações dos lotes cadastrados no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Lotes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/loteUpdate'
 *     responses:
 *       200:
 *         description: Lotes atualizados com sucesso
 */
router.put(
  '/lote',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.loteUpdate }),
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.atualizaLotes(req.body.lotes)

    const msg = 'Lotes atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/lote:
 *   delete:
 *     summary: Deleta lotes
 *     description: Remove lotes do sistema com base nos IDs fornecidos.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Lotes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/loteIds'
 *     responses:
 *       200:
 *         description: Lotes deletados com sucesso
 */
router.delete(
  '/lote',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.loteIds }),
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.deletaLotes(req.body.lote_ids)

    const msg = 'Lotes deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_alias:
 *   get:
 *     summary: Retorna os perfis de Alias
 *     description: Retorna uma lista de todos os perfis de Alias cadastrados no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil Alias retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID do perfil de Alias
 *                   nome:
 *                     type: string
 *                     description: Nome do perfil de Alias
 */
router.get(
  '/configuracao/perfil_alias',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getPerfilAlias()

    const msg = 'Perfil Alias retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_alias:
 *   delete:
 *     summary: Deleta perfis de Alias
 *     description: Remove perfis de Alias do sistema com base nos IDs fornecidos.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfilAliasIds'
 *     responses:
 *       200:
 *         description: Perfil Alias deletado com sucesso
 */
router.delete(
  '/configuracao/perfil_alias',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilAliasIds
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletePerfilAlias(req.body.perfis_alias_ids)

    const msg = 'Perfil Alias deletado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_alias:
 *   post:
 *     summary: Cria um novo perfil de Alias
 *     description: Insere as informações de um novo perfil de Alias no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfilAlias'
 *     responses:
 *       201:
 *         description: Perfis Alias criados com sucesso
 */
router.post(
  '/configuracao/perfil_alias',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilAlias
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaPerfilAlias(req.body.perfis_alias)

    const msg = 'Perfis Alias criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_alias:
 *   put:
 *     summary: Atualiza perfis de Alias
 *     description: Atualiza as informações de perfis de Alias já cadastrados no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfilAliastualizacao'
 *     responses:
 *       200:
 *         description: Perfis Alias atualizados com sucesso
 */
router.put(
  '/configuracao/perfil_alias',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilAliastualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaPerfilAlias(req.body.perfis_alias)

    const msg = 'Perfis Alias atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/alias:
 *   get:
 *     summary: Retorna os aliases
 *     description: Retorna uma lista de todos os aliases cadastrados no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Alias
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Alias retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID do alias
 *                   nome:
 *                     type: string
 *                     description: Nome do alias
 */
router.get(
  '/alias',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getAlias()

    const msg = 'Alias retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/alias:
 *   delete:
 *     summary: Deleta aliases
 *     description: Remove aliases do sistema com base nos IDs fornecidos.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Alias
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/aliasIds'
 *     responses:
 *       200:
 *         description: Alias deletado com sucesso
 */
router.delete(
  '/alias',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.aliasIds
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deleteAlias(req.body.alias_ids)

    const msg = 'Alias deletado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/alias:
 *   post:
 *     summary: Cria novos aliases
 *     description: Insere novos aliases no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Alias
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/alias'
 *     responses:
 *       201:
 *         description: Alias criados com sucesso
 */
router.post(
  '/alias',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.alias
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaAlias(req.body.alias, req.usuarioId)

    const msg = 'Alias criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/alias:
 *   put:
 *     summary: Atualiza aliases
 *     description: Atualiza as informações dos aliases cadastrados no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Alias
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/aliastualizacao'
 *     responses:
 *       200:
 *         description: Alias atualizados com sucesso
 */
router.put(
  '/alias',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.aliastualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaAlias(req.body.alias, req.usuarioId)

    const msg = 'Alias atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/temas:
 *   get:
 *     summary: Retorna os temas
 *     description: Retorna uma lista de todos os temas cadastrados no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Temas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Temas retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID do tema
 *                   nome:
 *                     type: string
 *                     description: Nome do tema
 */
router.get(
  '/temas',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getTemas()

    const msg = 'Temas retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/temas:
 *   post:
 *     summary: Cria novos temas
 *     description: Insere novos temas no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Temas
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/temas'
 *     responses:
 *       201:
 *         description: Temas gravados com sucesso
 */
router.post(
  '/temas',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.temas }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.gravaTemas(req.body.temas, req.usuarioId)

    const msg = 'Temas gravados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/temas:
 *   put:
 *     summary: Atualiza temas
 *     description: Atualiza as informações dos temas cadastrados no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Temas
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/temasAtualizacao'
 *     responses:
 *       200:
 *         description: Temas atualizados com sucesso
 */
router.put(
  '/temas',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.temasAtualizacao }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaTemas(req.body.temas, req.usuarioId)

    const msg = 'Temas atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/temas:
 *   delete:
 *     summary: Deleta temas
 *     description: Remove temas do sistema com base nos IDs fornecidos.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Temas
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/temasIds'
 *     responses:
 *       200:
 *         description: Temas deletados com sucesso
 */
router.delete(
  '/temas',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.temasIds }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaTemas(req.body.temas_ids)

    const msg = 'Temas deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_temas:
 *   get:
 *     summary: Retorna os perfis de temas
 *     description: Retorna uma lista de todos os perfis de temas cadastrados no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil de Temas retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID do perfil de temas
 *                   nome:
 *                     type: string
 *                     description: Nome do perfil de temas
 */
router.get(
  '/configuracao/perfil_temas',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getPerfilTemas()

    const msg = 'Perfil de Temas retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_temas:
 *   delete:
 *     summary: Deleta perfis de temas
 *     description: Remove perfis de temas do sistema com base nos IDs fornecidos.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfilTemasIds'
 *     responses:
 *       200:
 *         description: Perfil de Temas deletado com sucesso
 */
router.delete(
  '/configuracao/perfil_temas',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilTemasIds
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletePerfilTemas(req.body.perfil_temas_ids)

    const msg = 'Perfil de Temas deletado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_temas:
 *   post:
 *     summary: Cria novos perfis de temas
 *     description: Insere as informações de novos perfis de temas no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfilTemas'
 *     responses:
 *       201:
 *         description: Perfis de Temas criados com sucesso
 */
router.post(
  '/configuracao/perfil_temas',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilTemas
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaPerfilTemas(req.body.perfis_temas)

    const msg = 'Perfis de Temas criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_temas:
 *   put:
 *     summary: Atualiza perfis de temas
 *     description: Atualiza as informações dos perfis de temas cadastrados no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfilTemasAtualizacao'
 *     responses:
 *       200:
 *         description: Perfis de Temas atualizados com sucesso
 */
router.put(
  '/configuracao/perfil_temas',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilTemasAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaPerfilTemas(req.body.perfis_temas)

    const msg = 'Perfis de Temas atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/unidade_trabalho/reshape:
 *   put:
 *     summary: Realiza o reshape de uma unidade de trabalho
 *     description: Realiza a operação de reshape em uma unidade de trabalho existente com base no ID e na geometria fornecidos.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Unidade de Trabalho
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/unidadeTrabalhoReshape'
 *     responses:
 *       200:
 *         description: Unidade de trabalho atualizada com sucesso
 */
router.put(
  '/unidade_trabalho/reshape',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.unidadeTrabalhoReshape }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.reshapeUnidadeTrabalho(
      req.body.unidade_trabalho_id,
      req.body.reshape_geom
    )

    const msg = 'Unidade de trabalho atualizada com sucesso'
    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/unidade_trabalho/cut:
 *   put:
 *     summary: Realiza o corte de uma unidade de trabalho
 *     description: Realiza a operação de corte em uma unidade de trabalho existente com base no ID e nas geometrias fornecidos.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Unidade de Trabalho
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/unidadeTrabalhoCut'
 *     responses:
 *       200:
 *         description: Unidade de trabalho atualizada com sucesso
 */
router.put(
  '/unidade_trabalho/cut',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.unidadeTrabalhoCut }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.cutUnidadeTrabalho(
      req.body.unidade_trabalho_id,
      req.body.cut_geoms
    )

    const msg = 'Unidade de trabalho atualizada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/unidade_trabalho/merge:
 *   put:
 *     summary: Realiza o merge de unidades de trabalho
 *     description: Realiza a operação de merge em unidades de trabalho existentes com base nos IDs e na geometria fornecidos.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Unidade de Trabalho
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/unidadeTrabalhoMerge'
 *     responses:
 *       200:
 *         description: Unidade de trabalho atualizada com sucesso
 */
router.put(
  '/unidade_trabalho/merge',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.unidadeTrabalhoMerge }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.mergeUnidadeTrabalho(
      req.body.unidade_trabalho_ids,
      req.body.merge_geom
    )

    const msg = 'Unidade de trabalho atualizada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/linha_producao:
 *   post:
 *     summary: Insere uma nova linha de produção
 *     description: Insere uma nova linha de produção no sistema com base nos parâmetros fornecidos.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Linha de Produção
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/linhaProducao'
 *     responses:
 *       201:
 *         description: Linha de produção inserida com sucesso
 */
router.post(
  '/linha_producao',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.linhaProducao }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.insereLinhaProducao(
      req.body.linha_producao
    )

    const msg = 'Linha de produção inserida com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_configuracao_qgis:
 *   get:
 *     summary: Retorna o perfil de configuração do QGIS
 *     description: Retorna uma lista de perfis de configuração do QGIS cadastrados no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil configuração QGIS retornado com sucesso
 */
router.get(
  '/configuracao/perfil_configuracao_qgis',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getPerfilConfiguracaoQgis()

    const msg = 'Perfil configuração QGIS retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_configuracao_qgis:
 *   delete:
 *     summary: Deleta perfis de configuração do QGIS
 *     description: Remove perfis de configuração do QGIS do sistema com base nos IDs fornecidos.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfilConfiguracaoQgisIds'
 *     responses:
 *       200:
 *         description: Perfil configuração QGIS deletado com sucesso
 */
router.delete(
  '/configuracao/perfil_configuracao_qgis',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilConfiguracaoQgisIds
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletePerfilConfiguracaoQgis(req.body.perfis_configuracao_qgis_ids)

    const msg = 'Perfil configuração QGIS deletado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_configuracao_qgis:
 *   post:
 *     summary: Cria um novo perfil de configuração do QGIS
 *     description: Insere um novo perfil de configuração do QGIS no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfilConfiguracaoQgis'
 *     responses:
 *       201:
 *         description: Perfil configuração QGIS criado com sucesso
 */
router.post(
  '/configuracao/perfil_configuracao_qgis',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilConfiguracaoQgis
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaPerfilConfiguracaoQgis(req.body.perfis_configuracao_qgis)

    const msg = 'Perfis configuração QGIS criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_configuracao_qgis:
 *   put:
 *     summary: Atualiza perfis de configuração do QGIS
 *     description: Atualiza as informações dos perfis de configuração do QGIS cadastrados no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfilConfiguracaoQgisAtualizacao'
 *     responses:
 *       200:
 *         description: Perfis configuração QGIS atualizados com sucesso
 */
router.put(
  '/configuracao/perfil_configuracao_qgis',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilConfiguracaoQgisAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaPerfilConfiguracaoQgis(req.body.perfis_configuracao_qgis)

    const msg = 'Perfis configuração QGIS atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/tipo_perfil_dificuldade:
 *   get:
 *     summary: Retorna tipos de perfil de dificuldade
 *     description: Retorna uma lista de tipos de perfil de dificuldade cadastrados no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Tipos de Perfil
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tipo perfil dificuldade retornado com sucesso
 */
router.get(
  '/tipo_perfil_dificuldade',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getTipoPerfilDificuldade()

    const msg = 'Tipo perfil dificuldade retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_dificuldade_operador:
 *   get:
 *     summary: Retorna perfis de dificuldade do operador
 *     description: Retorna uma lista de perfis de dificuldade do operador cadastrados no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil dificuldade operador retornado com sucesso
 */
router.get(
  '/configuracao/perfil_dificuldade_operador',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getPerfilDificuldadeOperador()

    const msg = 'Perfil dificuldade operador retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_dificuldade_operador:
 *   delete:
 *     summary: Deleta perfis de dificuldade do operador
 *     description: Remove perfis de dificuldade do operador do sistema com base nos IDs fornecidos.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfilDificuldadeOperadorIds'
 *     responses:
 *       200:
 *         description: Perfil dificuldade operador deletado com sucesso
 */
router.delete(
  '/configuracao/perfil_dificuldade_operador',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilDificuldadeOperadorIds
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletePerfilDificuldadeOperador(req.body.perfis_dificuldade_operador_ids)

    const msg = 'Perfil dificuldade operador deletado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_dificuldade_operador:
 *   post:
 *     summary: Cria novos perfis de dificuldade do operador
 *     description: Insere novos perfis de dificuldade do operador no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfilDificuldadeOperador'
 *     responses:
 *       201:
 *         description: Perfis dificuldade operador criados com sucesso
 */
router.post(
  '/configuracao/perfil_dificuldade_operador',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilDificuldadeOperador
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaPerfilDificuldadeOperador(req.body.perfis_dificuldade_operador)

    const msg = 'Perfis dificuldade operador criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_dificuldade_operador:
 *   put:
 *     summary: Atualiza perfis de dificuldade do operador
 *     description: Atualiza as informações dos perfis de dificuldade do operador cadastrados no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfilDificuldadeOperadorAtualizacao'
 *     responses:
 *       200:
 *         description: Perfis dificuldade operador atualizados com sucesso
 */
router.put(
  '/configuracao/perfil_dificuldade_operador',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilDificuldadeOperadorAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaPerfilDificuldadeOperador(req.body.perfis_dificuldade_operador)

    const msg = 'Perfis dificuldade operador atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/lote/copiar:
 *   post:
 *     summary: Copia configurações de lote
 *     description: Copia as configurações de um lote para outro lote com base nos parâmetros fornecidos.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/configuracaoLoteCopiar'
 *     responses:
 *       200:
 *         description: Configurações de Lote copiadas com sucesso.
 */
router.post(
  '/configuracao/lote/copiar',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.configuracaoLoteCopiar
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.copiarConfiguracaoLote(
      req.body.lote_id_origem,
      req.body.lote_id_destino,
      req.body.copiar_estilo,
      req.body.copiar_menu,
      req.body.copiar_regra,
      req.body.copiar_modelo,
      req.body.copiar_workflow,
      req.body.copiar_alias,
      req.body.copiar_linhagem,
      req.body.copiar_finalizacao,
      req.body.copiar_tema,
      req.body.copiar_fme,
      req.body.copiar_configuracao_qgis,
      req.body.copiar_monitoramento
    )

    const msg = 'Configurações de Lote copiadas com sucesso.'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_workflow_dsgtools:
 *   get:
 *     summary: Retorna o perfil de workflow DSGTools
 *     description: Retorna uma lista de perfis de workflow DSGTools cadastrados no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil workflow dsgtools retornado com sucesso
 */
router.get(
  '/configuracao/perfil_workflow_dsgtools',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getPerfilWorkflowDsgtools()

    const msg = 'Perfil workflow dsgtools retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_workflow_dsgtools:
 *   delete:
 *     summary: Deleta perfis de workflow DSGTools
 *     description: Remove perfis de workflow DSGTools do sistema com base nos IDs fornecidos.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfilWorkflowDsgtoolsIds'
 *     responses:
 *       200:
 *         description: Perfil workflow dsgtools deletado com sucesso
 */
router.delete(
  '/configuracao/perfil_workflow_dsgtools',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilWorkflowDsgtoolsIds
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletePerfilWorkflowDsgtools(req.body.perfil_workflow_dsgtools_ids)

    const msg = 'Perfil workflow dsgtools deletado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_workflow_dsgtools:
 *   post:
 *     summary: Cria um novo perfil de workflow DSGTools
 *     description: Insere um novo perfil de workflow DSGTools no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfilWorkflowDsgtools'
 *     responses:
 *       201:
 *         description: Perfil workflow dsgtools criado com sucesso
 */
router.post(
  '/configuracao/perfil_workflow_dsgtools',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilWorkflowDsgtools
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.criaPerfilWorkflowDsgtools(req.body.perfil_workflow_dsgtools)

    const msg = 'Perfil workflow dsgtools criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/configuracao/perfil_workflow_dsgtools:
 *   put:
 *     summary: Atualiza perfis de workflow DSGTools
 *     description: Atualiza as informações dos perfis de workflow DSGTools cadastrados no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/perfilWorkflowDsgtoolsAtualizacao'
 *     responses:
 *       200:
 *         description: Perfis workflow dsgtools atualizados com sucesso
 */
router.put(
  '/configuracao/perfil_workflow_dsgtools',
  verifyAdmin,
  schemaValidation({
    body: projetoSchema.perfilWorkflowDsgtoolsAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaPerfilWorkflowDsgtools(req.body.perfil_workflow_dsgtools)

    const msg = 'Perfil workflow dsgtools atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/projeto/workflow:
 *   get:
 *     summary: Retorna os workflows
 *     description: Retorna uma lista de todos os workflows cadastrados no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - Workflows
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Workflows retornados com sucesso
 */
router.get(
  '/workflow',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await projetoCtrl.getWorkflows()

    const msg = 'Workflows retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/projeto/workflow:
 *   post:
 *     summary: Cria novos workflows
 *     description: Insere novos workflows no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Workflows
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/workflows'
 *     responses:
 *       201:
 *         description: Workflows gravados com sucesso
 */
router.post(
  '/workflow',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.workflows }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.gravaWorkflows(req.body.workflows, req.usuarioId)

    const msg = 'Workflows gravados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/workflow:
 *   put:
 *     summary: Atualiza workflows
 *     description: Atualiza as informações dos workflows cadastrados no sistema.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Workflows
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/atualizaWorkflows'
 *     responses:
 *       200:
 *         description: Workflows atualizados com sucesso
 */
router.put(
  '/workflow',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.atualizaWorkflows }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.atualizaWorkflows(req.body.workflows, req.usuarioId)

    const msg = 'Workflows atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/projeto/workflow:
 *   delete:
 *     summary: Deleta workflows
 *     description: Remove workflows do sistema com base nos IDs fornecidos.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     tags:
 *       - Workflows
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/workflowsIds'
 *     responses:
 *       200:
 *         description: Workflows deletados com sucesso
 */
router.delete(
  '/workflow',
  verifyAdmin,
  schemaValidation({ body: projetoSchema.workflowsIds }),
  asyncHandler(async (req, res, next) => {
    await projetoCtrl.deletaWorkflows(req.body.workflows_ids)

    const msg = 'Workflows deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)


module.exports = router
