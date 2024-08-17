'use strict'

const express = require('express')

const { schemaValidation, asyncHandler, httpCode } = require('../utils')

const { verifyAdmin } = require('../login')

const acompanhamentoSchema = require('./acompanhamento_schema')
const acompanhamentoCtrl = require('./acompanhamento_ctrl')

const router = express.Router()

const archiver = require('archiver')

/**
 * @swagger
 * /informacoes/{lote}/{subfase}:
 *   get:
 *     summary: Obtém informações detalhadas da subfase de um lote específico
 *     description: Retorna informações sobre as atividades realizadas em uma subfase específica de um lote.
 *     produces:
 *       - application/json
 *     tags:
 *       - acompanhamento
 *     parameters:
 *       - in: path
 *         name: lote
 *         required: true
 *         schema:
 *           type: integer
 *           description: ID do lote
 *       - in: path
 *         name: subfase
 *         required: true
 *         schema:
 *           type: integer
 *           description: ID da subfase
 *     responses:
 *       200:
 *         description: Informações da subfase retornadas com sucesso
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
 *                   description: Descrição do resultado da requisição
 *                 dados:
 *                   type: object
 *                   description: Dados das atividades da subfase
 */
router.get(
  '/informacoes/:lote/:subfase',
  schemaValidation({
    params: acompanhamentoSchema.loteSubfaseParams
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.getInfoSubfaseLote(
      req.params.lote,
      req.params.subfase
    )

    const msg = 'Informações da subfase retornada'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /informacoes/{lote}:
 *   get:
 *     summary: Obtém informações detalhadas de um lote específico
 *     description: Retorna informações sobre as atividades realizadas em um lote.
 *     produces:
 *       - application/json
 *     tags:
 *       - acompanhamento
 *     parameters:
 *       - in: path
 *         name: lote
 *         required: true
 *         schema:
 *           type: integer
 *           description: ID do lote
 *     responses:
 *       200:
 *         description: Informações do lote retornadas com sucesso
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
 *                   description: Descrição do resultado da requisição
 *                 dados:
 *                   type: object
 *                   description: Dados das atividades do lote
 */
router.get(
  '/informacoes/:lote',
  schemaValidation({
    params: acompanhamentoSchema.loteParams
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.getInfoLote(
      req.params.lote
    )

    const msg = 'Informações da subfase retornada'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /usuarios_sem_atividade:
 *   get:
 *     summary: Obtém a lista de usuários sem atividade
 *     description: Retorna uma lista de usuários que não possuem atividades registradas.
 *     produces:
 *       - application/json
 *     tags:
 *       - acompanhamento
 *     responses:
 *       200:
 *         description: Lista de usuários sem atividade retornada com sucesso
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
 *                   description: Descrição do resultado da requisição
 *                 dados:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       usuario_id:
 *                         type: integer
 *                         description: ID do usuário
 *                       usuario:
 *                         type: string
 *                         description: Nome do usuário
 */
router.get(
  '/usuarios_sem_atividade',
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.usuariosSemAtividade(
    )

    const msg = 'Usuários sem atividade retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /ultimos_login:
 *   get:
 *     summary: Obtém os últimos logins
 *     description: Retorna uma lista dos últimos logins registrados no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - acompanhamento
 *     responses:
 *       200:
 *         description: Lista dos últimos logins retornada com sucesso
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
 *                   description: Descrição do resultado da requisição
 *                 dados:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       usuario_id:
 *                         type: integer
 *                         description: ID do usuário
 *                       usuario:
 *                         type: string
 *                         description: Nome do usuário
 *                       data_login:
 *                         type: string
 *                         format: date-time
 *                         description: Data e hora do login
 */
router.get(
  '/ultimos_login',
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.ultimosLogin(
    )

    const msg = 'Últimos logins retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /usuarios_logados_hoje:
 *   get:
 *     summary: Obtém a lista de usuários logados hoje
 *     description: Retorna uma lista de usuários que realizaram login no sistema hoje.
 *     produces:
 *       - application/json
 *     tags:
 *       - acompanhamento
 *     responses:
 *       200:
 *         description: Lista de usuários logados hoje retornada com sucesso
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
 *                   description: Descrição do resultado da requisição
 *                 dados:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       usuario_id:
 *                         type: integer
 *                         description: ID do usuário
 *                       usuario:
 *                         type: string
 *                         description: Nome do usuário
 */
router.get(
  '/usuarios_logados_hoje',
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.usuariosLogadosHoje(
    )

    const msg = 'Usuários logados hoje retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /usuarios_nao_logados_hoje:
 *   get:
 *     summary: Obtém a lista de usuários que não logaram hoje
 *     description: Retorna uma lista de usuários que não realizaram login no sistema hoje.
 *     produces:
 *       - application/json
 *     tags:
 *       - acompanhamento
 *     responses:
 *       200:
 *         description: Lista de usuários não logados hoje retornada com sucesso
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
 *                   description: Descrição do resultado da requisição
 *                 dados:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       usuario_id:
 *                         type: integer
 *                         description: ID do usuário
 *                       usuario:
 *                         type: string
 *                         description: Nome do usuário
 */
router.get(
  '/usuarios_nao_logados_hoje',
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.usuariosNaoLogadosHoje(
    )

    const msg = 'Usuários não logados hoje retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /quantitativo_fila_distribuicao:
 *   get:
 *     summary: Obtém o quantitativo da fila de distribuição
 *     description: Retorna o quantitativo de atividades na fila de distribuição.
 *     produces:
 *       - application/json
 *     tags:
 *       - acompanhamento
 *     responses:
 *       200:
 *         description: Quantitativo da fila de distribuição retornado com sucesso
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
 *                   description: Descrição do resultado da requisição
 *                 dados:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID do registro
 *                       perfil_producao:
 *                         type: string
 *                         description: Nome do perfil de produção
 *                       subfase:
 *                         type: string
 *                         description: Nome da subfase
 *                       bloco:
 *                         type: string
 *                         description: Nome do bloco
 *                       quantidade:
 *                         type: integer
 *                         description: Quantidade de atividades
 */
router.get(
  '/quantitativo_fila_distribuicao',
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.quantitativoFilaDistribuicao(
    )

    const msg = 'Quantitativo da fila de distribuição retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /quantitativo_atividades:
 *   get:
 *     summary: Obtém o quantitativo de atividades
 *     description: Retorna o quantitativo de atividades por etapa e subfase.
 *     produces:
 *       - application/json
 *     tags:
 *       - acompanhamento
 *     responses:
 *       200:
 *         description: Quantitativo de atividades retornado com sucesso
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
 *                   description: Descrição do resultado da requisição
 *                 dados:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID do registro
 *                       etapa:
 *                         type: string
 *                         description: Nome da etapa
 *                       subfase:
 *                         type: string
 *                         description: Nome da subfase
 *                       bloco:
 *                         type: string
 *                         description: Nome do bloco
 *                       quantidade:
 *                         type: integer
 *                         description: Quantidade de atividades
 */
router.get(
  '/quantitativo_atividades',
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.quantitativoAtividades(
    )

    const msg = 'Quantitativo de atividades retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /atividades_em_execucao:
 *   get:
 *     summary: Obtém as atividades em execução
 *     description: Retorna uma lista de atividades que estão em execução no momento.
 *     produces:
 *       - application/json
 *     tags:
 *       - acompanhamento
 *     responses:
 *       200:
 *         description: Atividades em execução retornadas com sucesso
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
 *                   description: Descrição do resultado da requisição
 *                 dados:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       atividade_id:
 *                         type: integer
 *                         description: ID da atividade
 *                       projeto_nome:
 *                         type: string
 *                         description: Nome do projeto
 *                       lote:
 *                         type: string
 *                         description: Nome do lote
 *                       etapa:
 *                         type: string
 *                         description: Nome da etapa
 *                       subfase:
 *                         type: string
 *                         description: Nome da subfase
 *                       unidade_trabalho_nome:
 *                         type: string
 *                         description: Nome da unidade de trabalho
 *                       usuario:
 *                         type: string
 *                         description: Nome do usuário responsável
 *                       duracao:
 *                         type: string
 *                         description: Duração da atividade
 */
router.get(
  '/atividades_em_execucao',
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.atividadesEmExecucao(
    )

    const msg = 'Atividades em execução retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /ultimas_atividades_finalizadas:
 *   get:
 *     summary: Obtém as últimas atividades finalizadas
 *     description: Retorna uma lista das últimas atividades finalizadas no sistema.
 *     produces:
 *       - application/json
 *     tags:
 *       - acompanhamento
 *     responses:
 *       200:
 *         description: Últimas atividades finalizadas retornadas com sucesso
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
 *                   description: Descrição do resultado da requisição
 *                 dados:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       atividade_id:
 *                         type: integer
 *                         description: ID da atividade
 *                       projeto_nome:
 *                         type: string
 *                         description: Nome do projeto
 *                       lote:
 *                         type: string
 *                         description: Nome do lote
 *                       etapa:
 *                         type: string
 *                         description: Nome da etapa
 *                       subfase:
 *                         type: string
 *                         description: Nome da subfase
 *                       unidade_trabalho_nome:
 *                         type: string
 *                         description: Nome da unidade de trabalho
 *                       usuario:
 *                         type: string
 *                         description: Nome do usuário responsável
 *                       data_fim:
 *                         type: string
 *                         format: date-time
 *                         description: Data de finalização da atividade
 */
router.get(
  '/ultimas_atividades_finalizadas',
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.ultimasAtividadesFinalizadas(
    )

    const msg = 'Ultimas atividade finalizadas retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /usuarios_sem_perfil:
 *   get:
 *     summary: Obtém a lista de usuários sem perfil
 *     description: Retorna uma lista de usuários que não possuem perfil associado.
 *     produces:
 *       - application/json
 *     tags:
 *       - acompanhamento
 *     responses:
 *       200:
 *         description: Lista de usuários sem perfil retornada com sucesso
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
 *                   description: Descrição do resultado da requisição
 *                 dados:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       usuario_id:
 *                         type: integer
 *                         description: ID do usuário
 *                       usuario:
 *                         type: string
 *                         description: Nome do usuário
 *                       situacao:
 *                         type: string
 *                         description: Situação do usuário em relação ao perfil
 */
router.get(
  '/usuarios_sem_perfil',
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.usuariosSemPerfil(
    )

    const msg = 'Usuários sem perfil associado retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /grade_acompanhamento:
 *   get:
 *     summary: Obtém as grades de acompanhamento
 *     description: Retorna as grades de acompanhamento para todas as atividades em execução.
 *     produces:
 *       - application/json
 *     tags:
 *       - acompanhamento
 *     responses:
 *       200:
 *         description: Grades de acompanhamento retornadas com sucesso
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
 *                   description: Descrição do resultado da requisição
 *                 dados:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       atividade_id:
 *                         type: integer
 *                         description: ID da atividade
 *                       usuario:
 *                         type: string
 *                         description: Nome do usuário responsável
 *                       grade:
 *                         type: array
 *                         description: Dados da grade de acompanhamento
 *                         items:
 *                           type: object
 *                           properties:
 *                             j:
 *                               type: integer
 *                             i:
 *                               type: integer
 *                             data_atualizacao:
 *                               type: string
 *                               format: date-time
 *                             visited:
 *                               type: boolean
 */
router.get(
  '/grade_acompanhamento',
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.acompanhamentoGrade()

    const msg = 'Grades de acompanhamento retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /atividade_subfase:
 *   get:
 *     summary: Obtém dados de atividades por subfase
 *     description: Retorna dados detalhados das atividades realizadas em cada subfase ao longo do tempo.
 *     produces:
 *       - application/json
 *     tags:
 *       - acompanhamento
 *     responses:
 *       200:
 *         description: Dados de atividade por subfase retornados com sucesso
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
 *                   description: Descrição do resultado da requisição
 *                 dados:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       lote:
 *                         type: string
 *                         description: Nome do lote
 *                       subfase:
 *                         type: string
 *                         description: Nome da subfase
 *                       data:
 *                         type: array
 *                         items:
 *                           type: array
 *                           description: Lista de períodos de atividade
 *                           items:
 *                             type: string
 *                             description: Data de início e término
 */
router.get(
  '/atividade_subfase',
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.atividadeSubfase()

    const msg = 'Dados de atividade por subfase retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /atividade_usuario:
 *   get:
 *     summary: Obtém dados de atividades por usuário
 *     description: Retorna dados detalhados das atividades realizadas por cada usuário ao longo do tempo.
 *     produces:
 *       - application/json
 *     tags:
 *       - acompanhamento
 *     responses:
 *       200:
 *         description: Dados de atividade por usuário retornados com sucesso
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
 *                   description: Descrição do resultado da requisição
 *                 dados:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       usuario:
 *                         type: string
 *                         description: Nome do usuário
 *                       data:
 *                         type: array
 *                         items:
 *                           type: array
 *                           description: Lista de períodos de atividade
 *                           items:
 *                             type: string
 *                             description: Data de início e término
 */
router.get(
  '/atividade_usuario',
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.atividadeUsuario()

    const msg = 'Dados de atividade por usuario retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /situacao_subfase:
 *   get:
 *     summary: Obtém dados de situação das subfases
 *     description: Retorna dados detalhados da situação de cada subfase, incluindo atividades finalizadas e não finalizadas.
 *     produces:
 *       - application/json
 *     tags:
 *       - acompanhamento
 *     responses:
 *       200:
 *         description: Dados de situação das subfases retornados com sucesso
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
 *                   description: Descrição do resultado da requisição
 *                 dados:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       bloco:
 *                         type: string
 *                         description: Nome do bloco
 *                       subfase:
 *                         type: string
 *                         description: Nome da subfase
 *                       finalizadas:
 *                         type: integer
 *                         description: Quantidade de atividades finalizadas
 *                       nao_finalizadas:
 *                         type: integer
 *                         description: Quantidade de atividades não finalizadas
 */
router.get(
  '/situacao_subfase',
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.situacaoSubfase()

    const msg = 'Dados de situação das subfases retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /pit/subfase/{anoParam}:
 *   get:
 *     summary: Obtém informações do PIT por subfase em um ano específico
 *     description: Retorna informações detalhadas do Plano de Integração Técnica (PIT) para as subfases em um ano específico.
 *     produces:
 *       - application/json
 *     tags:
 *       - acompanhamento
 *     parameters:
 *       - in: path
 *         name: anoParam
 *         required: true
 *         schema:
 *           type: integer
 *           description: Ano de referência para o PIT
 *     responses:
 *       200:
 *         description: Informações do PIT retornadas com sucesso
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
 *                   description: Descrição do resultado da requisição
 *                 dados:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       lote:
 *                         type: string
 *                         description: Nome do lote
 *                       subfase:
 *                         type: string
 *                         description: Nome da subfase
 *                       month:
 *                         type: integer
 *                         description: Mês da finalização
 *                       count:
 *                         type: integer
 *                         description: Quantidade de atividades finalizadas
 */
router.get(
  '/pit/subfase/:anoParam',
  schemaValidation({
    params: acompanhamentoSchema.anoParam
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.getInfoSubfasePIT(
      req.params.anoParam
    )

    const msg = 'Informações do PIT retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /pit/{anoParam}:
 *   get:
 *     summary: Obtém informações gerais do PIT em um ano específico
 *     description: Retorna informações detalhadas do Plano de Integração Técnica (PIT) para um ano específico.
 *     produces:
 *       - application/json
 *     tags:
 *       - acompanhamento
 *     parameters:
 *       - in: path
 *         name: anoParam
 *         required: true
 *         schema:
 *           type: integer
 *           description: Ano de referência para o PIT
 *     responses:
 *       200:
 *         description: Informações do PIT retornadas com sucesso
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
 *                   description: Descrição do resultado da requisição
 *                 dados:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       lote:
 *                         type: string
 *                         description: Nome do lote
 *                       fase:
 *                         type: string
 *                         description: Nome da fase
 *                       quantidade:
 *                         type: integer
 *                         description: Quantidade de atividades
 *                       finalizadas:
 *                         type: integer
 *                         description: Quantidade de atividades finalizadas
 */
router.get(
  '/pit/:anoParam',
  schemaValidation({
    params: acompanhamentoSchema.anoParam
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.getInfoPIT(
      req.params.anoParam
    )

    const msg = 'Informações do PIT retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /dados_site_acompanhamento:
 *   get:
 *     summary: Baixa dados do site de acompanhamento
 *     description: Retorna um arquivo zip contendo dados detalhados sobre o site de acompanhamento.
 *     produces:
 *       - application/zip
 *     tags:
 *       - acompanhamento
 *     responses:
 *       200:
 *         description: Dados de acompanhamento retornados e baixados com sucesso
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get(
  '/dados_site_acompanhamento',
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.getDadosSiteAcompanhamento()

    const archive = archiver('zip');
    archive.on('error', (err) => { throw err; });

    res.setHeader('Content-Disposition', 'attachment; filename=dados_acompanhamento.zip');
    res.setHeader('Content-Type', 'application/zip');

    archive.pipe(res);

    dados.forEach(d => {
      archive.append(JSON.stringify(d.dados, null, 2), { name: d.nome });
    })

    archive.finalize();

  })
)

/**
 * @swagger
 * /dashboard/quantidade/{anoParam}:
 *   get:
 *     summary: Obtém informações do dashboard de quantidade para um ano específico
 *     description: Retorna informações detalhadas sobre a quantidade de atividades no dashboard para um ano específico.
 *     produces:
 *       - application/json
 *     tags:
 *       - acompanhamento
 *     parameters:
 *       - in: path
 *         name: anoParam
 *         required: true
 *         schema:
 *           type: integer
 *           description: Ano de referência para o dashboard
 *     responses:
 *       200:
 *         description: Informações do Dashboard de quantidade retornadas com sucesso
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
 *                   description: Descrição do resultado da requisição
 *                 dados:
 *                   type: object
 *                   properties:
 *                     total_atividades:
 *                       type: integer
 *                       description: Total de atividades para o ano
 */
router.get(
  '/dashboard/quantidade/:anoParam',
  schemaValidation({
    params: acompanhamentoSchema.anoParam
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.getQuantidadeAno(
      req.params.anoParam
    )

    const msg = 'Informações do Dashboard de quantidade retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /dashboard/finalizadas/{anoParam}:
 *   get:
 *     summary: Obtém informações do dashboard de atividades finalizadas para um ano específico
 *     description: Retorna informações detalhadas sobre as atividades finalizadas no dashboard para um ano específico.
 *     produces:
 *       - application/json
 *     tags:
 *       - acompanhamento
 *     parameters:
 *       - in: path
 *         name: anoParam
 *         required: true
 *         schema:
 *           type: integer
 *           description: Ano de referência para o dashboard
 *     responses:
 *       200:
 *         description: Informações do Dashboard de finalizadas retornadas com sucesso
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
 *                   description: Descrição do resultado da requisição
 *                 dados:
 *                   type: object
 *                   properties:
 *                     total_finalizadas:
 *                       type: integer
 *                       description: Total de atividades finalizadas para o ano
 */
router.get(
  '/dashboard/finalizadas/:anoParam',
  schemaValidation({
    params: acompanhamentoSchema.anoParam
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.getFinalizadasAno(
      req.params.anoParam
    )

    const msg = 'Informações do Dashboard de finalizadas retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /dashboard/execucao:
 *   get:
 *     summary: Obtém informações do dashboard de execução
 *     description: Retorna informações detalhadas sobre as atividades em execução no dashboard.
 *     produces:
 *       - application/json
 *     tags:
 *       - acompanhamento
 *     responses:
 *       200:
 *         description: Informações do Dashboard de execução retornadas com sucesso
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
 *                   description: Descrição do resultado da requisição
 *                 dados:
 *                   type: object
 *                   properties:
 *                     atividades_em_execucao:
 *                       type: integer
 *                       description: Quantidade de atividades em execução
 */
router.get(
  '/dashboard/execucao',
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.getExecucao()

    const msg = 'Informações do Dashboard de execução retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /mapa/{nome}:
 *   get:
 *     summary: Obtém o GeoJSON de uma camada específica
 *     description: Retorna o GeoJSON da camada especificada pelo nome.
 *     produces:
 *       - application/json
 *     tags:
 *       - acompanhamento
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *           description: Nome da camada para obter o GeoJSON
 *     responses:
 *       200:
 *         description: GeoJSON da camada retornado com sucesso
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
 *                   description: Descrição do resultado da requisição
 *                 dados:
 *                   type: object
 *                   description: Dados do GeoJSON
 */
router.get(
  '/mapa/:nome',
  schemaValidation({ params: acompanhamentoSchema.nomeParams }),
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.getLayerGeoJSON(req.params.nome)

    const msg = 'Geojson da camada retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)


/*
router.get(
  '/projetos',
  schemaValidation({
    params: acompanhamentoSchema.anoParam,
    query: acompanhamentoSchema.finalizadoQuery
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.getInfoProjetos(
      req.params.anoParam,
      req.query.finalizado
    )

    const msg = 'Informações dos projetos retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/projeto/:id/informacao_anual/:ano',
  schemaValidation({
    params: acompanhamentoSchema.anoParam,
    query: acompanhamentoSchema.finalizadoQuery
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.getInfoProjetos(
      req.params.anoParam,
      req.query.finalizado
    )

    const msg = 'Informações dos projetos retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/projeto/:id/informacao_detalhada',
  schemaValidation({
    params: acompanhamentoSchema.anoParam,
    query: acompanhamentoSchema.finalizadoQuery
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.getInfoProjetos(
      req.params.anoParam,
      req.query.finalizado
    )

    const msg = 'Informações dos projetos retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/projeto/:id/informacao_detalhada/:ano',
  schemaValidation({
    params: acompanhamentoSchema.anoParam,
    query: acompanhamentoSchema.finalizadoQuery
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await acompanhamentoCtrl.getInfoProjetos(
      req.params.anoParam,
      req.query.finalizado
    )

    const msg = 'Informações dos projetos retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/linha_producao/:id/:z/:x/:y.pbf',
  schemaValidation({
    params: acompanhamentoSchema.mvtParams
  }),
  asyncHandler(async (req, res, next) => {
    const tile = await acompanhamentoCtrl.getMvtLinhaProducao(
      req.params.id,
      req.params.x,
      req.params.y,
      req.params.z
    )

    res.setHeader('Content-Type', 'application/x-protobuf')
    if (tile.length === 0) {
      res.status(204)
    }
    res.send(tile)
  })
)
*/
module.exports = router
