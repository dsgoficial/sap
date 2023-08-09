'use strict'

const Joi = require('joi')

const models = {}

models.uuidParams = Joi.object().keys({
  uuid: Joi.string()
    .guid({ version: 'uuidv4' })
    .required()
})

models.nomeParams = Joi.object().keys({
  nome: Joi.string().required()
})

models.usuario = Joi.object().keys({
  usuario: Joi.array()
    .items(
      Joi.object().keys({
        usuario_sap_id: Joi.number().integer().strict().required(),
        nome: Joi.string().required(),
        funcao: Joi.string().required(),
        organizacao_id: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})

models.usuarioAtualizacao = Joi.object().keys({
  usuario: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        usuario_sap_id: Joi.number().integer().strict().required(),
        nome: Joi.string().required(),
        funcao: Joi.string().required(),
        organizacao_id: Joi.number().integer().strict().required()
      })
    )
    .unique('id')
    .required()
    .min(1)
})

models.usuarioIds = Joi.object().keys({
  usuarios_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1)
})

models.informacoesProduto = Joi.object().keys({
  informacoes_produto: Joi.array()
  .items(
    Joi.object().keys({
      produto_id: Joi.number().integer().strict().required(),
      resumo: Joi.string().required(),
      proposito: Joi.string().required(),
      creditos: Joi.string().required(),
      informacoes_complementares: Joi.string().required(),
      limitacao_acesso_id: Joi.number().integer().strict().required(),
      limitacao_uso_id: Joi.number().integer().strict().required(),
      restricao_uso_id: Joi.number().integer().strict().required(),
      grau_sigilo_id: Joi.number().integer().strict().required(),
      organizacao_responsavel_id: Joi.number().integer().strict().required(),
      organizacao_distribuicao_id: Joi.number().integer().strict().required(),
      datum_vertical_id: Joi.number().integer().strict().required(),
      especificacao_id: Joi.number().integer().strict().required(),
      responsavel_produto_id: Joi.number().integer().strict().required(),
      declaracao_linhagem: Joi.string().required(),
      projeto_bdgex: Joi.string().required()
    })
  )
})

models.informacoesProdutoAtualizacao = Joi.object().keys({
  informacoes_produto: Joi.array()
  .items(
    Joi.object().keys({
      id: Joi.number().integer().strict().required(),
      produto_id: Joi.number().integer().strict().required(),
      resumo: Joi.string().required(),
      proposito: Joi.string().required(),
      creditos: Joi.string().required(),
      informacoes_complementares: Joi.string().required(),
      limitacao_acesso_id: Joi.number().integer().strict().required(),
      limitacao_uso_id: Joi.number().integer().strict().required(),
      restricao_uso_id: Joi.number().integer().strict().required(),
      grau_sigilo_id: Joi.number().integer().strict().required(),
      organizacao_responsavel_id: Joi.number().integer().strict().required(),
      organizacao_distribuicao_id: Joi.number().integer().strict().required(),
      datum_vertical_id: Joi.number().integer().strict().required(),
      especificacao_id: Joi.number().integer().strict().required(),
      responsavel_produto_id: Joi.number().integer().strict().required(),
      declaracao_linhagem: Joi.string().required(),
      projeto_bdgex: Joi.string().required()
    })
  )
})

models.informacoesProdutoIds = Joi.object().keys({
  informacoes_produto_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1)
})

models.responsavelFaseProduto = Joi.object().keys({
  responsavel_fase_produto: Joi.array()
    .items(
      Joi.object().keys({
        usuario_id: Joi.number().integer().strict().required(),
        fase_id: Joi.number().integer().strict().required(),
        produto_id: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})

models.responsavelFaseProdutoAtualizacao = Joi.object().keys({
  responsavel_fase_produto: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        usuario_id: Joi.number().integer().strict().required(),
        fase_id: Joi.number().integer().strict().required(),
        produto_id: Joi.number().integer().strict().required()
      })
    )
    .unique('id')
    .required()
    .min(1)
})

models.responsavelFaseProdutoIds = Joi.object().keys({
  responsavel_fase_produto_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1)
})

module.exports = models
