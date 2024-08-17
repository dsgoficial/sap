'use strict'

const express = require('express')

const { schemaValidation, asyncHandler, httpCode } = require('../utils')

const { verifyAdmin } = require('../login')

const usuarioCtrl = require('./usuario_ctrl')

const usuarioSchema = require('./usuario_schema')

const router = express.Router()

/**
 * @swagger
 * /usuarios/servico_autenticacao:
 *   get:
 *     summary: Retorna usuários do servidor de autenticação
 *     description: Retorna uma lista de usuários que estão presentes no servidor de autenticação, mas não no sistema atual.
 *     produces:
 *       - application/json
 *     tags:
 *       - usuários
 *     responses:
 *       200:
 *         description: Usuários retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   uuid:
 *                     type: string
 *                     format: uuid
 *                     description: UUID do usuário
 *                   login:
 *                     type: string
 *                     description: Login do usuário
 *                   nome:
 *                     type: string
 *                     description: Nome completo do usuário
 *                   nome_guerra:
 *                     type: string
 *                     description: Nome de guerra do usuário
 */
router.get(
  '/servico_autenticacao',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await usuarioCtrl.getUsuariosAuthServer()

    const msg = 'Usuários retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /usuarios/sincronizar:
 *   put:
 *     summary: Sincroniza a lista de usuários
 *     description: Sincroniza os usuários do sistema com os usuários do servidor de autenticação.
 *     produces:
 *       - application/json
 *     tags:
 *       - usuários
 *     responses:
 *       200:
 *         description: Usuários sincronizados com sucesso
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
 *                   description: Descrição do resultado da sincronização
 */
router.put(
  '/sincronizar',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    await usuarioCtrl.atualizaListaUsuarios()
    const msg = 'Usuários atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /usuarios/{uuid}:
 *   put:
 *     summary: Atualiza um usuário específico
 *     description: Atualiza o status de administrador e ativo de um usuário pelo UUID.
 *     produces:
 *       - application/json
 *     tags:
 *       - usuários
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         description: UUID do usuário a ser atualizado
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUsuario'
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
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
 *                   description: Descrição do resultado da atualização
 *       400:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   description: Descrição do erro ocorrido
 */
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

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Retorna a lista de usuários
 *     description: Retorna uma lista de todos os usuários cadastrados no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - usuários
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID do usuário no sistema
 *                   uuid:
 *                     type: string
 *                     format: uuid
 *                     description: UUID do usuário
 *                   login:
 *                     type: string
 *                     description: Login do usuário
 *                   nome:
 *                     type: string
 *                     description: Nome completo do usuário
 *                   tipo_posto_grad:
 *                     type: string
 *                     description: Tipo de posto ou graduação do usuário
 *                   tipo_turno:
 *                     type: string
 *                     description: Tipo de turno do usuário
 *                   nome_guerra:
 *                     type: string
 *                     description: Nome de guerra do usuário
 *                   administrador:
 *                     type: boolean
 *                     description: Indica se o usuário possui privilégios de administrador
 *                   ativo:
 *                     type: boolean
 *                     description: Indica se o usuário está ativo
 */
router.get(
  '/',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await usuarioCtrl.getUsuarios()

    const msg = 'Usuários retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Cria uma lista de usuários
 *     description: Cria novos usuários no sistema a partir de uma lista de UUIDs.
 *     produces:
 *       - application/json
 *     tags:
 *       - usuários
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ListaUsuario'
 *     responses:
 *       201:
 *         description: Usuários criados com sucesso
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
 *                   description: Descrição do resultado da criação
 *       400:
 *         description: Erro na criação dos usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   description: Descrição do erro ocorrido
 */
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

/**
 * @swagger
 * /usuarios:
 *   put:
 *     summary: Atualiza uma lista de usuários
 *     description: Atualiza as informações de uma lista de usuários, como status de administrador e ativo.
 *     produces:
 *       - application/json
 *     tags:
 *       - usuários
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUsuarioLista'
 *     responses:
 *       200:
 *         description: Usuários atualizados com sucesso
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
 *                   description: Descrição do resultado da atualização
 *       400:
 *         description: Erro na atualização dos usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   description: Descrição do erro ocorrido
 */
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
