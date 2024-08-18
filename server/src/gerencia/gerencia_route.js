'use strict'

const express = require('express')

const { schemaValidation, asyncHandler, httpCode, asyncHandlerWithQueue } = require('../utils')

const { verifyAdmin } = require('../login')

const gerenciaCtrl = require('./gerencia_ctrl')
const gerenciaSchema = require('./gerencia_schema')

const router = express.Router()

/**
 * @swagger
 * /api/gerencia/projeto_qgis:
 *   get:
 *     summary: Retorna o projeto do QGIS
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Projeto QGIS
 *     responses:
 *       200:
 *         description: Projeto do QGIS retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 projeto:
 *                   type: object
 */
router.get(
  '/projeto_qgis',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getProject()

    const msg = 'Projeto do QGIS retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/gerencia/atividade/{id}:
 *   get:
 *     summary: Retorna uma atividade pelo ID
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Atividade
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da atividade
 *     responses:
 *       200:
 *         description: Atividade retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Atividade não encontrada
 */
router.get(
  '/atividade/:id',
  verifyAdmin,
  schemaValidation({ params: gerenciaSchema.idParams }),
  asyncHandlerWithQueue(async (req, res, next) => {
    const dados = await gerenciaCtrl.getAtividade(
      req.params.id,
      req.usuarioId // gerenteId
    )

    const msg = dados ? 'Atividade retornada' : 'Atividade não encontrada'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/gerencia/atividade/usuario/{id}:
 *   get:
 *     summary: Retorna a atividade de um usuário
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Atividade
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *       - in: query
 *         name: proxima
 *         required: false
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Indica se deve buscar a próxima atividade
 *     responses:
 *       200:
 *         description: Atividade retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Usuário não possui atividade
 */
router.get(
  '/atividade/usuario/:id',
  verifyAdmin,
  schemaValidation({
    params: gerenciaSchema.idParams,
    query: gerenciaSchema.proximaQuery
  }),
  asyncHandlerWithQueue(async (req, res, next) => {
    const dados = await gerenciaCtrl.getAtividadeUsuario(
      req.params.id,
      req.query.proxima === 'true',
      req.usuarioId // gerenteId
    )
    const msg = dados ? 'Atividade retornada' : 'Usuário não possui atividade'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/gerencia/perfil_producao:
 *   get:
 *     summary: Retorna os perfis de produção
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Perfil Produção
 *     responses:
 *       200:
 *         description: Perfis de produção retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nome:
 *                     type: string
 */
router.get(
  '/perfil_producao',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getPerfilProducao()

    const msg = 'Perfis de produção retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/gerencia/perfil_producao:
 *   put:
 *     summary: Atualiza os perfis de produção
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Perfil Produção
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PerfilProducaoAtualizacao'
 *     responses:
 *       200:
 *         description: Perfis de produção atualizados com sucesso
 */
router.put(
  '/perfil_producao',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.perfilProducaoAtualizacao }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.atualizaPerfilProducao(req.body.perfil_producao)

    const msg = 'Perfis de produção atualizados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/gerencia/perfil_producao:
 *   post:
 *     summary: Cria novos perfis de produção
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Perfil Produção
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PerfilProducao'
 *     responses:
 *       200:
 *         description: Perfis de produção criados com sucesso
 */
router.post(
  '/perfil_producao',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.perfilProducao }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.criaPerfilProducao(req.body.perfil_producao)

    const msg = 'Perfis de produção criados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/gerencia/perfil_producao:
 *   delete:
 *     summary: Deleta perfis de produção
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Perfil Produção
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PerfilProducaoIds'
 *     responses:
 *       200:
 *         description: Perfis de produção deletados com sucesso
 */
router.delete(
  '/perfil_producao',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.perfilProducaoIds }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.deletaPerfilProducao(req.body.perfil_producao_ids)

    const msg = 'Perfis de produção deletados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/gerencia/perfil_bloco_operador:
 *   get:
 *     summary: Retorna os perfis bloco operador
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Perfil Bloco Operador
 *     responses:
 *       200:
 *         description: Perfis bloco operador retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   usuario_id:
 *                     type: integer
 *                   bloco_id:
 *                     type: integer
 *                   bloco:
 *                     type: string
 *                   prioridade:
 *                     type: integer
 */
router.get(
  '/perfil_bloco_operador',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getPerfilBlocoOperador()

    const msg = 'Perfis bloco operador retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/gerencia/perfil_bloco_operador:
 *   put:
 *     summary: Atualiza os perfis bloco operador
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Perfil Bloco Operador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PerfilBlocoOperadorAtualizacao'
 *     responses:
 *       200:
 *         description: Perfis bloco operador atualizados com sucesso
 */
router.put(
  '/perfil_bloco_operador',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.perfilBlocoOperadorAtualizacao }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.atualizaPerfilBlocoOperador(req.body.perfil_bloco_operador)

    const msg = 'Perfis bloco operador atualizados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/gerencia/perfil_bloco_operador:
 *   post:
 *     summary: Cria novos perfis bloco operador
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Perfil Bloco Operador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PerfilBlocoOperador'
 *     responses:
 *       200:
 *         description: Perfis bloco operador criados com sucesso
 */
router.post(
  '/perfil_bloco_operador',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.perfilBlocoOperador }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.criaPerfilBlocoOperador(req.body.perfil_bloco_operador)

    const msg = 'Perfis bloco operador criados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/gerencia/perfil_bloco_operador:
 *   delete:
 *     summary: Deleta perfis bloco operador
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Perfil Bloco Operador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PerfilBlocoOperadorIds'
 *     responses:
 *       200:
 *         description: Perfis bloco operador deletados com sucesso
 */
router.delete(
  '/perfil_bloco_operador',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.perfilBlocoOperadorIds }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.deletaPerfilBlocoOperador(req.body.perfil_bloco_operador_ids)

    const msg = 'Perfis bloco operador deletados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/gerencia/perfil_producao_operador:
 *   get:
 *     summary: Retorna os perfis produção operador
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Perfil Produção Operador
 *     responses:
 *       200:
 *         description: Perfis produção operador retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   usuario_id:
 *                     type: integer
 *                   perfil_producao_id:
 *                     type: integer
 */
router.get(
  '/perfil_producao_operador',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getPerfilProducaoOperador()

    const msg = 'Perfis produção operador retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/gerencia/perfil_producao_operador:
 *   put:
 *     summary: Atualiza os perfis produção operador
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Perfil Produção Operador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PerfilProducaoOperadorAtualizacao'
 *     responses:
 *       200:
 *         description: Perfis produção operador atualizados com sucesso
 */
router.put(
  '/perfil_producao_operador',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.perfilProducaoOperadorAtualizacao }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.atualizaPerfilProducaoOperador(req.body.perfil_producao_operador)

    const msg = 'Perfis produção operador atualizados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/gerencia/perfil_producao_operador:
 *   post:
 *     summary: Cria novos perfis produção operador
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Perfil Produção Operador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PerfilProducaoOperador'
 *     responses:
 *       200:
 *         description: Perfis produção operador criados com sucesso
 */
router.post(
  '/perfil_producao_operador',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.perfilProducaoOperador }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.criaPerfilProducaoOperador(req.body.perfil_producao_operador)

    const msg = 'Perfis produção operador criados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/gerencia/perfil_producao_operador:
 *   delete:
 *     summary: Deleta perfis produção operador
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Perfil Produção Operador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PerfilProducaoOperadorIds'
 *     responses:
 *       200:
 *         description: Perfis produção operador deletados com sucesso
 */
router.delete(
  '/perfil_producao_operador',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.perfilProducaoOperadorIds }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.deletaPerfilProducaoOperador(req.body.perfil_producao_operador_ids)

    const msg = 'Perfis produção operador deletados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/gerencia/perfil_producao_etapa:
 *   get:
 *     summary: Retorna os perfis produção etapa
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Perfil Produção Etapa
 *     responses:
 *       200:
 *         description: Perfis produção etapa retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   perfil_producao_id:
 *                     type: integer
 *                   subfase_id:
 *                     type: integer
 *                   tipo_etapa_id:
 *                     type: integer
 *                   prioridade:
 *                     type: integer
 */
router.get(
  '/perfil_producao_etapa',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getPerfilProducaoEtapa()

    const msg = 'Perfis produção etapa retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/gerencia/perfil_producao_etapa:
 *   put:
 *     summary: Atualiza os perfis produção etapa
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Perfil Produção Etapa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PerfilProducaoEtapaAtualizacao'
 *     responses:
 *       200:
 *         description: Perfis produção etapa atualizados com sucesso
 */
router.put(
  '/perfil_producao_etapa',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.perfilProducaoEtapaAtualizacao }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.atualizaPerfilProducaoEtapa(req.body.perfil_producao_etapa)

    const msg = 'Perfis produção etapa atualizados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/gerencia/perfil_producao_etapa:
 *   post:
 *     summary: Cria novos perfis produção etapa
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Perfil Produção Etapa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PerfilProducaoEtapa'
 *     responses:
 *       200:
 *         description: Perfis produção etapa criados com sucesso
 */
router.post(
  '/perfil_producao_etapa',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.perfilProducaoEtapa }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.criaPerfilProducaoEtapa(req.body.perfil_producao_etapa)

    const msg = 'Perfis produção etapa criados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/gerencia/perfil_producao_etapa:
 *   delete:
 *     summary: Deleta perfis produção etapa
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Perfil Produção Etapa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PerfilProducaoEtapaIds'
 *     responses:
 *       200:
 *         description: Perfis produção etapa deletados com sucesso
 */
router.delete(
  '/perfil_producao_etapa',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.perfilProducaoEtapaIds }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.deletaPerfilProducaoEtapa(req.body.perfil_producao_etapa_ids)

    const msg = 'Perfis produção etapa deletados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/gerencia/unidade_trabalho/disponivel:
 *   post:
 *     summary: Atualiza a disponibilidade das unidades de trabalho
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Unidade Trabalho
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UnidadeTrabalhoDisponivel'
 *     responses:
 *       201:
 *         description: Atributo disponível das unidades de trabalho atualizado com sucesso
 */
router.post(
  '/unidade_trabalho/disponivel',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.unidadeTrabalhoDisponivel }),
  asyncHandlerWithQueue(async (req, res, next) => {
    await gerenciaCtrl.unidadeTrabalhoDisponivel(
      req.body.unidade_trabalho_ids,
      req.body.disponivel
    )

    const msg =
      'Atributo disponível das unidades de trabalho atualizado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/gerencia/atividade/pausar:
 *   post:
 *     summary: Pausa atividades
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Atividade
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtividadePausar'
 *     responses:
 *       201:
 *         description: Atividade pausada com sucesso
 */
router.post(
  '/atividade/pausar',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.atividadePausar }),
  asyncHandlerWithQueue(async (req, res, next) => {
    await gerenciaCtrl.pausaAtividade(req.body.unidade_trabalho_ids)

    const msg = 'Atividade pausada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/gerencia/atividade/reiniciar:
 *   post:
 *     summary: Reinicia atividades
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Atividade
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtividadeReiniciar'
 *     responses:
 *       201:
 *         description: Atividade reiniciada com sucesso
 */
router.post(
  '/atividade/reiniciar',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.atividadeReiniciar }),
  asyncHandlerWithQueue(async (req, res, next) => {
    await gerenciaCtrl.reiniciaAtividade(req.body.unidade_trabalho_ids)

    const msg = 'Atividade reiniciada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/gerencia/atividade/voltar:
 *   post:
 *     summary: Volta atividades para a etapa anterior
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Atividade
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtividadeVoltar'
 *     responses:
 *       201:
 *         description: Atividade voltou para etapa anterior com sucesso
 */
router.post(
  '/atividade/voltar',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.atividadeVoltar }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.voltaAtividade(
      req.body.atividade_ids,
      req.body.manter_usuarios
    )

    const msg = 'Atividade voltou para etapa anterior com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/gerencia/atividade/avancar:
 *   post:
 *     summary: Avança atividades para a próxima etapa
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Atividade
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtividadeAvancar'
 *     responses:
 *       201:
 *         description: Atividade avançou para próxima etapa com sucesso
 */
router.post(
  '/atividade/avancar',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.atividadeAvancar }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.avancaAtividade(
      req.body.atividade_ids,
      req.body.concluida
    )

    const msg = 'Atividade avançou para próxima etapa com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/gerencia/observacao:
 *   put:
 *     summary: Cria observações em atividades
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Observação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Observacao'
 *     responses:
 *       201:
 *         description: Observação criada com sucesso
 */
router.put(
  '/observacao',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.observacao }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.criaObservacao(
      req.body.atividade_ids,
      req.body.observacao_atividade,
      req.body.observacao_unidade_trabalho
    )

    const msg = 'Observação criada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/gerencia/atividade/{id}/observacao:
 *   get:
 *     summary: Retorna observações de uma atividade
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Observação
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da atividade
 *     responses:
 *       200:
 *         description: Observações retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Observação não encontrada
 */
router.get(
  '/atividade/:id/observacao',
  verifyAdmin,
  schemaValidation({ params: gerenciaSchema.idParams }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getObservacao(req.params.id)

    const msg = 'Observações retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/gerencia/view_acompanhamento:
 *   get:
 *     summary: Retorna views de acompanhamento
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - View Acompanhamento
 *     parameters:
 *       - in: query
 *         name: em_andamento
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Indica se deve retornar as views em andamento
 *     responses:
 *       200:
 *         description: Views de acompanhamento retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get(
  '/view_acompanhamento',
  verifyAdmin,
  schemaValidation({
    query: gerenciaSchema.emAndamentoQuery
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getViewsAcompanhamento(
      req.query.em_andamento === 'true'
    )

    const msg = 'Views de acompanhamento retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/gerencia/atividades/permissoes:
 *   put:
 *     summary: Redefine permissões das atividades em execução
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Atividade
 *     responses:
 *       200:
 *         description: Permissões das atividades em execução redefinidas com sucesso
 */
router.put(
  '/atividades/permissoes',
  verifyAdmin,
  asyncHandlerWithQueue(async (req, res, next) => {
    await gerenciaCtrl.redefinirPermissoes()

    const msg = 'Permissões das atividades em execução redefinidas'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/gerencia/refresh_views:
 *   put:
 *     summary: Atualiza as views do sistema
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Sistema
 *     responses:
 *       200:
 *         description: Views atualizadas com sucesso
 */
router.put(
  '/refresh_views',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.refreshViews()

    const msg = 'Views atualizadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/gerencia/banco_dados/revogar_permissoes:
 *   post:
 *     summary: Revoga todas as permissões do banco de dados
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Banco de Dados
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BancoDados'
 *     responses:
 *       200:
 *         description: Permissões do banco revogadas com sucesso
 */
router.post(
  '/banco_dados/revogar_permissoes',
  verifyAdmin,
  schemaValidation({
    body: gerenciaSchema.bancoDados
  }),
  asyncHandlerWithQueue(async (req, res, next) => {
    await gerenciaCtrl.revogarPermissoesDB(
      req.body.servidor,
      req.body.porta,
      req.body.banco
    )

    const msg = 'Permissões do banco revogadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/gerencia/banco_dados/revogar_permissoes_usuario:
 *   post:
 *     summary: Revoga as permissões de um usuário específico no banco de dados
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Banco de Dados
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BancoDadosUsuario'
 *     responses:
 *       200:
 *         description: Permissões do usuário no banco revogadas com sucesso
 */
router.post(
  '/banco_dados/revogar_permissoes_usuario',
  verifyAdmin,
  schemaValidation({
    body: gerenciaSchema.bancoDadosUsuario
  }),
  asyncHandlerWithQueue(async (req, res, next) => {
    await gerenciaCtrl.revogarPermissoesDBUser(
      req.body.servidor,
      req.body.porta,
      req.body.banco,
      req.body_usuario_id
    )

    const msg = 'Permissões do usuário no banco revogadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/gerencia/versao_qgis:
 *   get:
 *     summary: Retorna a versão mínima requerida do QGIS
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - QGIS
 *     responses:
 *       200:
 *         description: Versão QGIS retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 versao_minima:
 *                   type: string
 *                   description: Versão mínima do QGIS
 */
router.get(
  '/versao_qgis',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getVersaoQGIS(
    )

    const msg = 'Versão QGIS retornada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/gerencia/versao_qgis:
 *   put:
 *     summary: Atualiza a versão mínima requerida do QGIS
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - QGIS
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VersaoQGIS'
 *     responses:
 *       200:
 *         description: Versão QGIS atualizada com sucesso
 */
router.put(
  '/versao_qgis',
  verifyAdmin,
  schemaValidation({
    body: gerenciaSchema.versaoQGIS
  }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.atualizaVersaoQGIS(req.body.versao_minima)

    const msg = 'Versão QGIS atualizada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/gerencia/plugins:
 *   get:
 *     summary: Retorna a lista de plugins do QGIS
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Plugins QGIS
 *     responses:
 *       200:
 *         description: Plugins retornados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nome:
 *                     type: string
 *                   versao_minima:
 *                     type: string
 */
router.get(
  '/plugins',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getPlugins()

    const msg = 'Plugins retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/gerencia/plugins:
 *   post:
 *     summary: Grava novos plugins do QGIS
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Plugins QGIS
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Plugins'
 *     responses:
 *       201:
 *         description: Plugins gravados com sucesso
 */
router.post(
  '/plugins',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.plugins }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.gravaPlugins(req.body.plugins)

    const msg = 'Plugins gravados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/gerencia/plugins:
 *   put:
 *     summary: Atualiza plugins do QGIS
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Plugins QGIS
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PluginsAtualizacao'
 *     responses:
 *       201:
 *         description: Plugins atualizados com sucesso
 */
router.put(
  '/plugins',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.pluginsAtualizacao }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.atualizaPlugins(req.body.plugins)

    const msg = 'Plugins atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/gerencia/plugins:
 *   delete:
 *     summary: Deleta plugins do QGIS
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Plugins QGIS
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PluginsIds'
 *     responses:
 *       201:
 *         description: Plugins deletados com sucesso
 */
router.delete(
  '/plugins',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.pluginsIds }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.deletaPlugins(req.body.plugins_ids)

    const msg = 'Plugins deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/gerencia/atalhos:
 *   get:
 *     summary: Retorna os atalhos do QGIS
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Atalhos QGIS
 *     responses:
 *       200:
 *         description: Atalhos retornados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   ferramenta:
 *                     type: string
 *                   idioma:
 *                     type: string
 *                   atalho:
 *                     type: string
 */
router.get(
  '/atalhos',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getAtalhos()

    const msg = 'Atalhos retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/gerencia/atalhos:
 *   post:
 *     summary: Grava novos atalhos do QGIS
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Atalhos QGIS
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QgisShortcuts'
 *     responses:
 *       201:
 *         description: Atalhos gravados com sucesso
 */
router.post(
  '/atalhos',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.qgisShortcuts }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.gravaAtalhos(req.body.qgis_shortcuts, req.usuarioId)

    const msg = 'Atalhos gravados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/gerencia/atalhos:
 *   put:
 *     summary: Atualiza atalhos do QGIS
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Atalhos QGIS
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QgisShortcutsAtualizacao'
 *     responses:
 *       201:
 *         description: Atalhos atualizados com sucesso
 */
router.put(
  '/atalhos',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.qgisShortcutsAtualizacao }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.atualizaAtalhos(req.body.qgis_shortcuts, req.usuarioId)

    const msg = 'Atalhos atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/gerencia/atalhos:
 *   delete:
 *     summary: Deleta atalhos do QGIS
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Atalhos QGIS
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QgisShortcutsIds'
 *     responses:
 *       201:
 *         description: Atalhos deletados com sucesso
 */
router.delete(
  '/atalhos',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.qgisShortcutsIds }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.deletaAtalhos(req.body.qgis_shortcuts_ids)

    const msg = 'Atalhos deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/gerencia/problema_atividade:
 *   get:
 *     summary: Retorna os problemas de atividade
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Problema Atividade
 *     responses:
 *       200:
 *         description: Problema atividade retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   descricao:
 *                     type: string
 *                   resolvido:
 *                     type: boolean
 */
router.get(
  '/problema_atividade',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getProblemaAtividade()

    const msg = 'Problema atividade retornada'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/gerencia/problema_atividade:
 *   put:
 *     summary: Atualiza problemas de atividade
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Problema Atividade
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProblemaAtividadeAtualizacao'
 *     responses:
 *       201:
 *         description: Problema atividade atualizados com sucesso
 */
router.put(
  '/problema_atividade',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.problemaAtividadeAtualizacao }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.atualizaProblemaAtividade(req.body.problema_atividade)

    const msg = 'Problema atividade atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/gerencia/iniciar_modo_local:
 *   put:
 *     summary: Inicia uma atividade no modo local
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Modo Local
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IniciaAtivModoLocal'
 *     responses:
 *       200:
 *         description: Atividade do modo local iniciada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 data_inicio:
 *                   type: string
 *                   format: date-time
 */
router.put(
  '/iniciar_modo_local',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.iniciaAtivModoLocal }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.iniciaAtividadeModoLocal(
      req.body.atividade_id,
      req.usuarioId
    )

    const msg = 'Atividade do modo local atualizadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/gerencia/finalizar_modo_local:
 *   put:
 *     summary: Finaliza uma atividade no modo local
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Modo Local
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FinalizaAtivModoLocal'
 *     responses:
 *       200:
 *         description: Atividade do modo local finalizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 data_inicio:
 *                   type: string
 *                   format: date-time
 *                 data_fim:
 *                   type: string
 *                   format: date-time
 */
router.put(
  '/finalizar_modo_local',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.finalizaAtivModoLocal }),
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.finalizaAtividadeModoLocal(
      req.body.atividade_id,
      req.body.usuario_uuid,
      req.body.data_inicio,
      req.body.data_fim
    )

    const msg = 'Atividade do modo local atualizadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/gerencia/relatorio_alteracao:
 *   get:
 *     summary: Retorna o relatório de alterações
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Relatório de Alteração
 *     responses:
 *       200:
 *         description: Relatório de alterações retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   data:
 *                     type: string
 *                     format: date
 *                   descricao:
 *                     type: string
 */
router.get(
  '/relatorio_alteracao',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getRelatorioAlteracao()

    const msg = 'Relatório de alteração retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/gerencia/relatorio_alteracao:
 *   post:
 *     summary: Grava um novo relatório de alterações
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Relatório de Alteração
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RelatorioAlteracao'
 *     responses:
 *       201:
 *         description: Relatório de alterações gravado com sucesso
 */
router.post(
  '/relatorio_alteracao',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.relatorioAlteracao }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.gravaRelatorioAlteracao(req.body.relatorio_alteracao, req.usuarioId)

    const msg = 'Relatório de alteração gravados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/gerencia/relatorio_alteracao:
 *   put:
 *     summary: Atualiza um relatório de alterações existente
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Relatório de Alteração
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RelatorioAlteracaoAtualizacao'
 *     responses:
 *       201:
 *         description: Relatório de alterações atualizado com sucesso
 */
router.put(
  '/relatorio_alteracao',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.relatorioAlteracaoAtualizacao }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.atualizaRelatorioAlteracao(req.body.relatorio_alteracao, req.usuarioId)

    const msg = 'Relatório de alteração atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/gerencia/relatorio_alteracao:
 *   delete:
 *     summary: Deleta um relatório de alterações
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Relatório de Alteração
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RelatorioAlteracaoIds'
 *     responses:
 *       201:
 *         description: Relatório de alterações deletado com sucesso
 */
router.delete(
  '/relatorio_alteracao',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.relatorioAlteracaoIds }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.deletaRelatorioAlteracao(req.body.relatorio_alteracao_ids)

    const msg = 'Relatório de alteração deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/gerencia/unidade_trabalho/propriedades:
 *   put:
 *     summary: Atualiza as propriedades da Unidade de Trabalho (UT)
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Unidade Trabalho
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PropriedadesAtualizacao'
 *     responses:
 *       201:
 *         description: Propriedades da UT atualizadas com sucesso
 */
router.put(
  '/unidade_trabalho/propriedades',
  verifyAdmin,
  schemaValidation({ body: gerenciaSchema.propriedadesAtualizacao }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.atualizaPropriedadesUT(req.body.unidades_trabalho)

    const msg = 'Propriedades da UT atualizadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/gerencia/plugin_path:
 *   get:
 *     summary: Retorna o caminho do plugin
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Plugin QGIS
 *     responses:
 *       200:
 *         description: Caminho do plugin retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 plugin_path:
 *                   type: string
 */
router.get(
  '/plugin_path',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getPluginPath(
    )

    const msg = 'Plugin Path retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/gerencia/plugin_path:
 *   put:
 *     summary: Atualiza o caminho do plugin
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Plugin QGIS
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PluginPath'
 *     responses:
 *       200:
 *         description: Caminho do plugin atualizado com sucesso
 */
router.put(
  '/plugin_path',
  verifyAdmin,
  schemaValidation({
    body: gerenciaSchema.pluginPath
  }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.atualizaPluginPath(req.body.plugin_path)

    const msg = 'Plugin Path atualizado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/gerencia/pit:
 *   get:
 *     summary: Retorna os Planos de Integração e Trabalho (PITs)
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - PIT
 *     responses:
 *       200:
 *         description: PITs retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   lote_id:
 *                     type: integer
 *                   meta:
 *                     type: integer
 *                   ano:
 *                     type: integer
 */
router.get(
  '/pit',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getPit()

    const msg = 'PITs retornados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/gerencia/pit:
 *   delete:
 *     summary: Deleta PITs existentes
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - PIT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PitIds'
 *     responses:
 *       200:
 *         description: PITs deletados com sucesso
 */
router.delete(
  '/pit',
  verifyAdmin,
  schemaValidation({
    body: gerenciaSchema.pitIds
  }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.deletePit(req.body.pit_ids)

    const msg = 'PITs deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/gerencia/pit:
 *   post:
 *     summary: Cria novos PITs
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - PIT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pit'
 *     responses:
 *       201:
 *         description: PITs criados com sucesso
 */
router.post(
  '/pit',
  verifyAdmin,
  schemaValidation({
    body: gerenciaSchema.pit
  }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.criaPit(req.body.pit)

    const msg = 'PITs criados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/gerencia/pit:
 *   put:
 *     summary: Atualiza PITs existentes
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - PIT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PitAtualizacao'
 *     responses:
 *       200:
 *         description: PITs atualizados com sucesso
 */
router.put(
  '/pit',
  verifyAdmin,
  schemaValidation({
    body: gerenciaSchema.pitAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.atualizaPit(req.body.pit)

    const msg = 'PITs atualizados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/gerencia/alteracao_fluxo:
 *   get:
 *     summary: Retorna as alterações de fluxo
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Alteração Fluxo
 *     responses:
 *       200:
 *         description: Alterações de fluxo retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   atividade_id:
 *                     type: integer
 *                   descricao:
 *                     type: string
 *                   data:
 *                     type: string
 *                     format: date
 *                   resolvido:
 *                     type: boolean
 *                   geom:
 *                     type: string
 */
router.get(
  '/alteracao_fluxo',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getAlteracaoFluxo()

    const msg = 'Alterações de fluxo retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/gerencia/alteracao_fluxo:
 *   put:
 *     summary: Atualiza as alterações de fluxo
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Alteração Fluxo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AlteracaoFluxoAtualizacao'
 *     responses:
 *       200:
 *         description: Alterações de fluxo atualizadas com sucesso
 */
router.put(
  '/alteracao_fluxo',
  verifyAdmin,
  schemaValidation({
    body: gerenciaSchema.alteracaoFluxoAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.atualizaAlteracaoFluxo(req.body.alteracao_fluxo)

    const msg = 'Alterações de fluxo atualizadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/gerencia/fila_prioritaria:
 *   get:
 *     summary: Retorna as entradas da fila prioritária
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Fila Prioritária
 *     responses:
 *       200:
 *         description: Fila prioritária retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   atividade_id:
 *                     type: integer
 *                   usuario_id:
 *                     type: integer
 *                   prioridade:
 *                     type: integer
 */
router.get(
  '/fila_prioritaria',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getFilaPrioritaria()

    const msg = 'Fila prioritária retornada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/gerencia/fila_prioritaria:
 *   delete:
 *     summary: Deleta entradas na fila prioritária
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Fila Prioritária
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FilaPrioritariaIds'
 *     responses:
 *       200:
 *         description: Entradas da fila prioritária deletadas com sucesso
 */
router.delete(
  '/fila_prioritaria',
  verifyAdmin,
  schemaValidation({
    body: gerenciaSchema.filaPrioritariaIds
  }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.deleteFilaPrioritaria(req.body.fila_prioritaria_ids)

    const msg = 'Entradas da fila prioritária deletadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/gerencia/fila_prioritaria:
 *   post:
 *     summary: Cria novas entradas na fila prioritária
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Fila Prioritária
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FilaPrioritaria'
 *     responses:
 *       201:
 *         description: Entradas da fila prioritária criadas com sucesso
 */
router.post(
  '/fila_prioritaria',
  verifyAdmin,
  schemaValidation({
    body: gerenciaSchema.filaPrioritaria
  }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.criaFilaPrioritaria(req.body.fila_prioritaria)

    const msg = 'Entradas da fila prioritária criadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/gerencia/fila_prioritaria:
 *   put:
 *     summary: Atualiza entradas na fila prioritária
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Fila Prioritária
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FilaPrioritariaAtualizacao'
 *     responses:
 *       200:
 *         description: Entradas da fila prioritária atualizadas com sucesso
 */
router.put(
  '/fila_prioritaria',
  verifyAdmin,
  schemaValidation({
    body: gerenciaSchema.filaPrioritariaAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.atualizaFilaPrioritaria(req.body.fila_prioritaria)

    const msg = 'Entradas da fila prioritária atualizadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/gerencia/fila_prioritaria_grupo:
 *   get:
 *     summary: Retorna as entradas da fila prioritária de grupo
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Fila Prioritária Grupo
 *     responses:
 *       200:
 *         description: Fila prioritária de grupo retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   atividade_id:
 *                     type: integer
 *                   perfil_producao_id:
 *                     type: integer
 *                   prioridade:
 *                     type: integer
 */
router.get(
  '/fila_prioritaria_grupo',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await gerenciaCtrl.getFilaPrioritariaGrupo()

    const msg = 'Fila prioritária de grupo retornada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/gerencia/fila_prioritaria_grupo:
 *   delete:
 *     summary: Deleta entradas na fila prioritária de grupo
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Fila Prioritária Grupo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FilaPrioritariaGrupoIds'
 *     responses:
 *       200:
 *         description: Entradas da fila prioritária de grupo deletadas com sucesso
 */
router.delete(
  '/fila_prioritaria_grupo',
  verifyAdmin,
  schemaValidation({
    body: gerenciaSchema.filaPrioritariaGrupoIds
  }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.deleteFilaPrioritariaGrupo(req.body.fila_prioritaria_grupo_ids)

    const msg = 'Entradas da fila prioritária de grupo deletadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/gerencia/fila_prioritaria_grupo:
 *   post:
 *     summary: Cria novas entradas na fila prioritária de grupo
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Fila Prioritária Grupo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FilaPrioritariaGrupo'
 *     responses:
 *       201:
 *         description: Entradas da fila prioritária de grupo criadas com sucesso
 */
router.post(
  '/fila_prioritaria_grupo',
  verifyAdmin,
  schemaValidation({
    body: gerenciaSchema.filaPrioritariaGrupo
  }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.criaFilaPrioritariaGrupo(req.body.fila_prioritaria_grupo)

    const msg = 'Entradas da fila prioritária de grupo criadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

/**
 * @swagger
 * /api/gerencia/fila_prioritaria_grupo:
 *   put:
 *     summary: Atualiza entradas na fila prioritária de grupo
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Fila Prioritária Grupo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FilaPrioritariaGrupoAtualizacao'
 *     responses:
 *       200:
 *         description: Entradas da fila prioritária de grupo atualizadas com sucesso
 */
router.put(
  '/fila_prioritaria_grupo',
  verifyAdmin,
  schemaValidation({
    body: gerenciaSchema.filaPrioritariaGrupoAtualizacao
  }),
  asyncHandler(async (req, res, next) => {
    await gerenciaCtrl.atualizaFilaPrioritariaGrupo(req.body.fila_prioritaria_grupo)

    const msg = 'Entradas da fila prioritária de grupo atualizadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

module.exports = router
