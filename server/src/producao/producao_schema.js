"use strict";

const Joi = require("joi");

const models = {};

/**
 * @swagger
 * components:
 *   schemas:
 *     FinalizaAtividade:
 *       type: object
 *       properties:
 *         atividade_id:
 *           type: integer
 *           description: ID da atividade a ser finalizada
 *         sem_correcao:
 *           type: boolean
 *           description: Indica se a atividade foi finalizada sem correção
 *         alterar_fluxo:
 *           type: string
 *           enum: [Necessita nova revisão, Não é necessário uma nova revisão]
 *           description: Informação sobre alteração de fluxo
 *         info_edicao:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               produto_id:
 *                 type: integer
 *                 description: ID do produto
 *               nome_produto:
 *                 type: string
 *                 description: Nome do produto
 *               palavras_chave:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nome:
 *                       type: string
 *                       description: Nome da palavra-chave
 *                     tipo_palavra_chave_id:
 *                       type: integer
 *                       description: ID do tipo de palavra-chave
 *                 description: Lista de palavras-chave associadas ao produto
 *         observacao_proxima_atividade:
 *           type: string
 *           description: Observação para a próxima atividade
 *       required:
 *         - atividade_id
 *
 *     ProblemaAtividade:
 *       type: object
 *       properties:
 *         atividade_id:
 *           type: integer
 *           description: ID da atividade onde ocorreu o problema
 *         tipo_problema_id:
 *           type: integer
 *           description: ID do tipo de problema
 *         descricao:
 *           type: string
 *           description: Descrição do problema ocorrido
 *         polygon_ewkt:
 *           type: string
 *           description: Representação geométrica do problema
 *       required:
 *         - atividade_id
 *         - tipo_problema_id
 *         - descricao
 *         - polygon_ewkt
 *
 *     FinalizacaoIncorreta:
 *       type: object
 *       properties:
 *         descricao:
 *           type: string
 *           description: Descrição da finalização incorreta
 *       required:
 *         - descricao
 */
models.finaliza = Joi.object().keys({
  atividade_id: Joi.number().integer().strict().required(),
  sem_correcao: Joi.boolean().strict(),
  alterar_fluxo: Joi.string().valid(
    "Necessita nova revisão",
    "Não é necessário uma nova revisão",
  ),
  info_edicao: Joi.array()
    .items(
      Joi.object().keys({
        produto_id: Joi.number().integer().strict().required(),
        nome_produto: Joi.string().required(),
        palavras_chave: Joi.array()
          .items(
            Joi.object().keys({
              nome: Joi.string().required(),
              tipo_palavra_chave_id: Joi.number().integer().strict().required(),
            }),
          )
          .unique("nome")
          .required()
          .min(1),
      }),
    )
    .unique("produto_id")
    .min(1),
  observacao_proxima_atividade: Joi.string(),
  observacao_atividade: Joi.string(),
});

models.problemaAtividade = Joi.object().keys({
  atividade_id: Joi.number().integer().strict().required(),
  tipo_problema_id: Joi.number().integer().strict().required(),
  descricao: Joi.string().required(),
  polygon_ewkt: Joi.string().required(),
});

models.finalizacaoIncorreta = Joi.object().keys({
  descricao: Joi.string().required(),
});

models.atividadeId = Joi.object().keys({
  atividade_id: Joi.number().integer().strict().required(),
});

module.exports = models;
