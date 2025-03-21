'use strict'

const express = require('express')
const { schemaValidation, asyncHandler, httpCode } = require('../utils')
const { verifyAdmin, verifyLogin } = require('../login')
const campoCtrl = require('./campo_ctrl')
const campoSchema = require('./campo_schema')
const router = express.Router()

router.get(
  '/situacao',
  asyncHandler(async (req, res, next) => {
    const dados = await campoCtrl.getSituacao()

    const msg = 'Situações retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/categoria',
  asyncHandler(async (req, res, next) => {
    const dados = await campoCtrl.getCategorias()

    const msg = 'Categorias retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/campo/campos:
 *   get:
 *     summary: Obtém todos os campos disponíveis
 *     description: Retorna uma lista de todos os campos disponíveis.
 *     produces:
 *       - application/json
 *     tags:
 *       - Campo
 *     responses:
 *       200:
 *         description: Lista de campos retornada com sucesso
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
 *                     description: Detalhes de um campo específico
 */
router.get(
  '/campos',
  asyncHandler(async (req, res, next) => {
    const dados = await campoCtrl.getCampos()

    const msg = 'Campos retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/campo/campos/{id}:
 *   get:
 *     summary: Obtém os detalhes de um campo específico
 *     description: Retorna os dados de um campo com base no ID fornecido.
 *     produces:
 *       - application/json
 *     tags:
 *       - Campo
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: ID do campo
 *     responses:
 *       200:
 *         description: Dados do campo retornados com sucesso
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
 *                   description: Detalhes do campo específico
 */
router.get(
  '/campos/:uuid',
  schemaValidation({ params: campoSchema.uuidParams }),
  asyncHandler(async (req, res, next) => {
    const dados = await campoCtrl.getCampoById(req.params.uuid)

    const msg = 'Dados do campo retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/campo/campos:
 *   post:
 *     summary: Cria um novo campo
 *     description: Cria um novo campo no sistema. Requer privilégios de administrador.
 *     produces:
 *       - application/json
 *     tags:
 *       - Campo
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       description: Dados do campo a ser criado
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               campo:
 *                 type: object
 *                 properties:
 *                   nome:
 *                     type: string
 *                     description: Nome do campo
 *                   orgao:
 *                     type: string
 *                     description: Órgão responsável pelo campo
 *                   pit:
 *                     type: integer
 *                     description: Informações sobre o PIT
 *                   descricao:
 *                     type: string
 *                     description: Descrição do campo
 *                   militares:
 *                     type: string
 *                     description: Informações sobre os militares
 *                   placas_vtr:
 *                     type: string
 *                     description: Placas dos veículos (VTR)
 *                   inicio:
 *                     type: string
 *                     format: date-time
 *                     description: Data e hora de início
 *                   fim:
 *                     type: string
 *                     format: date-time
 *                     description: Data e hora de término
 *                   situacao_id:
 *                     type: integer
 *                     description: ID da situação do campo
 *                   produtos_id:
 *                     type: array
 *                     items:
 *                       type: integer
 *                       description: ID dos produtos
 *                     required: true
 *                     minItems: 1
 *                     uniqueItems: true
 *     responses:
 *       200:
 *         description: Campo criado com sucesso
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
 *                   description: Dados do campo recém-criado
 */
router.post(
  '/campos',
  schemaValidation({ body: campoSchema.campo }),
  asyncHandler(async (req, res, next) => {
    const dados = await campoCtrl.criaCampo(req.body.campo)

    const msg = 'Campo criado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/campo/campos/{id}:
 *   put:
 *     summary: Atualiza um campo existente
 *     description: Atualiza as informações de um campo específico. Requer privilégios de administrador.
 *     tags:
 *       - Campo
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do campo a ser atualizado
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       description: Dados para atualização do campo
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               campo:
 *                 type: object
 *                 required:
 *                   - nome
 *                   - orgao
 *                   - pit
 *                   - situacao_id
 *                   - produtos_id
 *                 properties:
 *                   nome:
 *                     type: string
 *                     description: Nome do campo
 *                     example: "Campo de Teste Atualizado"
 *                   descricao:
 *                     type: string
 *                     description: Descrição detalhada do campo
 *                     example: "Descrição atualizada do campo de teste"
 *                   orgao:
 *                     type: string
 *                     description: Órgão responsável pelo campo
 *                     example: "DSG"
 *                   pit:
 *                     type: integer
 *                     description: Ano do PIT associado
 *                     example: 2024
 *                   militares:
 *                     type: string
 *                     description: Informações sobre os militares envolvidos
 *                     example: "Marcel, João, Pedro"
 *                   placas_vtr:
 *                     type: string
 *                     description: Placas dos veículos (VTR) associados
 *                     example: "2550-33, 2550-34"
 *                   inicio:
 *                     type: string
 *                     format: date-time
 *                     description: Data e hora de início do campo
 *                     example: "2024-08-24T21:09:42.432Z"
 *                   fim:
 *                     type: string
 *                     format: date-time
 *                     description: Data e hora de término do campo
 *                     example: "2024-08-30T18:00:00.000Z"
 *                   situacao_id:
 *                     type: integer
 *                     description: ID representando a situação atual do campo
 *                     example: 2
 *                   produtos_id:
 *                     type: array
 *                     description: Lista de IDs dos produtos associados ao campo
 *                     items:
 *                       type: integer
 *                     example: [20, 21, 22]
 *     responses:
 *       200:
 *         description: Campo atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indica se a operação foi bem-sucedida
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Mensagem descritiva do resultado
 *                   example: "Campo atualizado com sucesso"
 *                 dados:
 *                   type: object
 *                   description: Dados do campo atualizado
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       description: ID do campo atualizado
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     nome:
 *                       type: string
 *                       description: Nome atualizado do campo
 *                       example: "Campo de Teste Atualizado"
 *                     descricao:
 *                       type: string
 *                       description: Descrição atualizada do campo
 *                       example: "Descrição atualizada do campo de teste"
 *                     orgao:
 *                       type: string
 *                       description: Órgão responsável atualizado
 *                       example: "DSG"
 *                     pit:
 *                       type: integer
 *                       description: Ano do PIT atualizado
 *                       example: 2024
 *                     militares:
 *                       type: string
 *                       description: Informações atualizadas sobre os militares
 *                       example: "Marcel, João, Pedro"
 *                     placas_vtr:
 *                       type: string
 *                       description: Placas dos veículos atualizadas
 *                       example: "2550-33, 2550-34"
 *                     inicio:
 *                       type: string
 *                       format: date-time
 *                       description: Data e hora de início atualizadas
 *                       example: "2024-08-24T21:09:42.432Z"
 *                     fim:
 *                       type: string
 *                       format: date-time
 *                       description: Data e hora de término atualizadas
 *                       example: "2024-08-30T18:00:00.000Z"
 *                     situacao_id:
 *                       type: integer
 *                       description: ID da situação atualizada do campo
 *                       example: 2
 *                     produtos_id:
 *                       type: array
 *                       description: Lista atualizada de IDs dos produtos associados
 *                       items:
 *                         type: integer
 *                       example: [20, 21, 22]
 *       400:
 *         description: Erro de validação nos dados fornecidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indica que a operação falhou
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Descrição do erro de validação
 *                   example: "Erro de validação dos dados fornecidos"
 *                 errors:
 *                   type: array
 *                   description: Lista de erros de validação
 *                   items:
 *                     type: string
 *                   example:
 *                     - "O campo 'nome' é obrigatório."
 *                     - "O campo 'pit' deve ser um número inteiro."
 *       401:
 *         description: Não autorizado. Token de autenticação ausente ou inválido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indica que a operação falhou devido à falta de autorização
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Mensagem de erro de autorização
 *                   example: "Acesso negado. Credenciais inválidas."
 *       404:
 *         description: Campo não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indica que o campo especificado não foi encontrado
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Mensagem de erro indicando que o recurso não foi encontrado
 *                   example: "Campo com o ID especificado não foi encontrado."
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indica que ocorreu um erro interno no servidor
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Mensagem de erro genérica
 *                   example: "Ocorreu um erro interno no servidor."
 */
router.put(
  '/campos/:uuid',
  schemaValidation({ params: campoSchema.uuidParams, body: campoSchema.campo }),
  asyncHandler(async (req, res, next) => {
    const dados = await campoCtrl.atualizaCampo(req.params.uuid, req.body.campo)

    const msg = 'Campo atualizado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/campo/campos/{id}:
 *   delete:
 *     summary: Deleta um campo e todas as suas referências associadas
 *     description: Remove um campo do sistema, incluindo todas as suas referências em outras tabelas como relacionamento_campo_produto, imagem, e track. Requer privilégios de administrador.
 *     tags:
 *       - Campo
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do campo a ser deletado
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Campo deletado com sucesso, junto com todas as suas referências associadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indica se a operação foi bem-sucedida
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Mensagem descritiva do resultado
 *                   example: "Campo deletado com sucesso"
 *       400:
 *         description: Erro de validação no ID fornecido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indica que a operação falhou
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Mensagem de erro de validação
 *                   example: "ID inválido fornecido"
 *       401:
 *         description: Não autorizado. Token de autenticação ausente ou inválido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indica que a operação falhou devido à falta de autorização
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Mensagem de erro de autorização
 *                   example: "Acesso negado. Credenciais inválidas."
 *       404:
 *         description: Campo não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indica que o campo especificado não foi encontrado
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Mensagem de erro indicando que o recurso não foi encontrado
 *                   example: "Campo com o ID especificado não foi encontrado."
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indica que ocorreu um erro interno no servidor
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Mensagem de erro genérica
 *                   example: "Ocorreu um erro interno no servidor."
 */
router.delete(
  '/campos/:uuid',
  schemaValidation({ params: campoSchema.uuidParams }),
  asyncHandler(async (req, res, next) => {
    await campoCtrl.deletaCampo(req.params.uuid)

    const msg = 'Campo deletado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.get(
  '/campos/estatisticas',
  asyncHandler(async (req, res, next) => {
    const dados = await campoCtrl.getEstatisticasCampos()

    const msg = 'Estatísticas de campos retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/campo/fotos:
 *   post:
 *     summary: Cria novas fotos associadas a um campo
 *     description: Permite ao usuário fazer upload de novas fotos para um campo específico, fornecendo as informações necessárias no corpo da requisição.
 *     tags:
 *       - Campo
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               campo_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID do campo ao qual as fotos estão associadas
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               descricao:
 *                 type: string
 *                 description: Descrição da foto
 *                 example: "Uma descrição da foto"
 *               foto:
 *                 type: string
 *                 format: binary
 *                 description: O arquivo de foto a ser carregado
 *                 example: "foto.jpg"
 *     responses:
 *       200:
 *         description: Fotos criadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indica se a operação foi bem-sucedida
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Mensagem descritiva do resultado
 *                   example: "Fotos criadas com sucesso"
 *       400:
 *         description: Erro de validação nos dados fornecidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indica que a operação falhou
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Mensagem de erro de validação
 *                   example: "Dados fornecidos são inválidos"
 *       401:
 *         description: Não autorizado. Token de autenticação ausente ou inválido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indica que a operação falhou devido à falta de autorização
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Mensagem de erro de autorização
 *                   example: "Acesso negado. Credenciais inválidas."
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indica que ocorreu um erro interno no servidor
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Mensagem de erro genérica
 *                   example: "Ocorreu um erro interno no servidor."
 */
router.post(
  '/fotos',
  schemaValidation({ body: campoSchema.fotos }),
  asyncHandler(async (req, res, next) => {
      await campoCtrl.criaFotos(req.body.fotos)

      const msg = 'Fotos criadas com sucesso'

      return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/campo/fotos/{id}:
 *   delete:
 *     summary: Deleta uma foto específica
 *     description: Remove uma foto do sistema com base no ID fornecido. Requer privilégios de administrador.
 *     tags:
 *       - Campo
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da foto a ser deletada
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Foto deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indica se a operação foi bem-sucedida
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Mensagem descritiva do resultado
 *                   example: "Fotos deletadas com sucesso"
 *       400:
 *         description: Erro de validação no ID fornecido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indica que a operação falhou
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Mensagem de erro de validação
 *                   example: "ID inválido fornecido"
 *       401:
 *         description: Não autorizado. Token de autenticação ausente ou inválido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indica que a operação falhou devido à falta de autorização
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Mensagem de erro de autorização
 *                   example: "Acesso negado. Credenciais inválidas."
 *       404:
 *         description: Foto não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indica que a foto especificada não foi encontrada
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Mensagem de erro indicando que o recurso não foi encontrado
 *                   example: "Foto com o ID especificado não foi encontrada."
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indica que ocorreu um erro interno no servidor
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Mensagem de erro genérica
 *                   example: "Ocorreu um erro interno no servidor."
 */
router.delete(
  '/fotos/:id',
  schemaValidation({ params: campoSchema.uuidParams }),
  asyncHandler(async (req, res, next) => {
    await campoCtrl.deletaFotos(req.params.id)

    const msg = 'Fotos deletadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
);

/**
 * @swagger
 * /api/campo/fotos/{campo_id}:
 *   delete:
 *     summary: Deleta todas as fotos associadas a um campo específico
 *     description: Remove todas as fotos do sistema que estão associadas a um campo específico, identificado pelo seu `campo_id`. Requer privilégios de administrador.
 *     tags:
 *       - Campo
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: campo_id
 *         required: true
 *         description: ID do campo cujas fotos devem ser deletadas
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Fotos deletadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indica se a operação foi bem-sucedida
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Mensagem descritiva do resultado
 *                   example: "Fotos deletadas com sucesso"
 *       400:
 *         description: Erro de validação no ID fornecido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indica que a operação falhou
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Mensagem de erro de validação
 *                   example: "ID inválido fornecido"
 *       401:
 *         description: Não autorizado. Token de autenticação ausente ou inválido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indica que a operação falhou devido à falta de autorização
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Mensagem de erro de autorização
 *                   example: "Acesso negado. Credenciais inválidas."
 *       404:
 *         description: Campo ou fotos não encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indica que o campo especificado ou as fotos associadas não foram encontrados
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Mensagem de erro indicando que o recurso não foi encontrado
 *                   example: "Campo ou fotos associadas não foram encontrados."
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indica que ocorreu um erro interno no servidor
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Mensagem de erro genérica
 *                   example: "Ocorreu um erro interno no servidor."
 */
router.delete(
  '/fotos/:campo_id',
  schemaValidation({ params: campoSchema.uuidParams }),
  asyncHandler(async (req, res, next) => {
    await campoCtrl.deletaFotosByCampo(req.params.uuid)

    const msg = 'Fotos deletadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
);

router.get(
  '/fotos/:uuid',
  schemaValidation({ params: campoSchema.uuidParams }),
  asyncHandler(async (req, res, next) => {
    const dados = await campoCtrl.getFotoById(req.params.uuid)

    const msg = 'Foto retornada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)


router.get(
  '/fotos/campos/:uuid',
  schemaValidation({ params: campoSchema.uuidParams }),
  asyncHandler(async (req, res, next) => {
    const dados = await campoCtrl.getFotosByCampo(req.params.uuid)

    const msg = 'Fotos retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.put(
  '/fotos/:uuid',
  schemaValidation({ params: campoSchema.uuidParams, body: campoSchema.fotoUpdate }),
  asyncHandler(async (req, res, next) => {
    await campoCtrl.atualizaFoto(req.params.uuid, req.body.foto)

    const msg = 'Foto atualizada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/campo/tracks:
 *   post:
 *     summary: Cria um novo track associado a um campo
 *     description: Permite registrar um novo track (percurso) associado a um campo específico
 *     tags:
 *       - Campo
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Track'
 *     responses:
 *       200:
 *         description: Track criado com sucesso
 */
router.post(
  '/tracks',
  schemaValidation({ body: campoSchema.track }),
  asyncHandler(async (req, res, next) => {
    const dados = await campoCtrl.criaTracker(req.body.track)

    const msg = 'Track criado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/campo/tracks/{uuid}:
 *   get:
 *     summary: Obtém detalhes de um track específico
 *     description: Retorna os detalhes de um track específico, identificado pelo seu ID.
 *     tags:
 *       - Campo
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         description: ID do track a ser consultado
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Detalhes do track retornados com sucesso
 */
router.get(
  '/tracks/:uuid',
  schemaValidation({ params: campoSchema.uuidParams }),
  asyncHandler(async (req, res, next) => {
    const dados = await campoCtrl.getTrackById(req.params.uuid)

    const msg = 'Track retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/campo/tracks/campos/{uuid}:
 *   get:
 *     summary: Obtém todos os tracks associados a um campo específico
 *     description: Retorna todos os tracks associados a um campo específico, identificado pelo seu ID.
 *     tags:
 *       - Campo
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         description: ID do campo cujos tracks devem ser retornados
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de tracks retornada com sucesso
 */
router.get(
  '/tracks/campos/:uuid',
  schemaValidation({ params: campoSchema.uuidParams }),
  asyncHandler(async (req, res, next) => {
    const dados = await campoCtrl.getTracksByCampo(req.params.uuid)

    const msg = 'Tracks retornados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

/**
 * @swagger
 * /api/campo/tracks/{uuid}:
 *   put:
 *     summary: Atualiza um track específico
 *     description: Atualiza as informações de um track específico, identificado pelo seu ID.
 *     tags:
 *       - Campo
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         description: ID do track a ser atualizado
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TrackUpdate'
 *     responses:
 *       200:
 *         description: Track atualizado com sucesso
 */
router.put(
  '/tracks/:uuid',
  schemaValidation({ params: campoSchema.uuidParams, body: campoSchema.trackUpdate }),
  asyncHandler(async (req, res, next) => {
    await campoCtrl.atualizaTrack(req.params.uuid, req.body.track)

    const msg = 'Track atualizado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

/**
 * @swagger
 * /api/campo/tracks/{uuid}:
 *   delete:
 *     summary: Deleta um track específico
 *     description: Remove um track do sistema com base no ID fornecido
 *     tags:
 *       - Campo
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         description: ID do track a ser deletado
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Track deletado com sucesso
 */
router.delete(
  '/tracks/:uuid',
  schemaValidation({ params: campoSchema.uuidParams }),
  asyncHandler(async (req, res, next) => {
    await campoCtrl.deleteTracker(req.params.uuid)

    const msg = 'Track deletado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

module.exports = router