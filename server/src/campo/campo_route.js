'use strict'

const express = require('express')

const { schemaValidation, asyncHandler, httpCode } = require('../utils')

const { verifyAdmin, verifyLogin } = require('../login')

const campoCtrl = require('./campo_ctrl')
const campoSchema = require('./campo_schema')

const router = express.Router()

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
 *           type: integer
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
    '/campos/:id',
    schemaValidation({ params: campoSchema.idParams }),
    asyncHandler(async (req, res, next) => {
        const dados = await campoCtrl.getCampoById(req.params.id)

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
 *                     type: string
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
    '/campos/:id',
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