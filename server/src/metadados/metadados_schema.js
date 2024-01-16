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

models.palavraChaveProduto = Joi.object().keys({
  palavras_chave_produto: Joi.array()
    .items(
      Joi.object().keys({
        nome: Joi.string().required(),
        tipo_palavra_chave_id: Joi.number().integer().strict().required(),
        produto_id: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})

models.palavraChaveProdutoAtualizacao = Joi.object().keys({
  palavras_chave_produto: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        nome: Joi.string().required(),
        tipo_palavra_chave_id: Joi.number().integer().strict().required(),
        produto_id: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})

models.palavraChaveProdutoIds = Joi.object().keys({
  palavras_chave_produto_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

models.creditosQpt = Joi.object().keys({
  creditos_qpt: Joi.array()
    .items(
      Joi.object().keys({
        nome: Joi.string().required(),
        qpt: Joi.string().required()
      })
    )
    .required()
    .min(1)
})

models.creditosQptAtualizacao = Joi.object().keys({
  creditos_qpt: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        nome: Joi.string().required(),
        qpt: Joi.string().required()
      })
    )
    .required()
    .min(1)
})

models.creditosQptIds = Joi.object().keys({
  creditos_qpt_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

models.informacoesEdicao = Joi.object().keys({
  informacoes_edicao: Joi.array()
    .items(
      Joi.object().keys({
        produto_id: Joi.number().integer().strict().required(),
        pec_planimetrico: Joi.string().required(),
        pec_altimetrico: Joi.string().required(),
        origem_dados_altimetricos: Joi.string().required(),
        territorio_internacional: Joi.boolean().required(),
        acesso_restrito: Joi.boolean().required(),
        carta_militar: Joi.boolean().required(),
        data_criacao: Joi.string().required(),
        creditos_id: Joi.number().integer().strict().required(),
        epsg_mde: Joi.string().required(),
        caminho_mde: Joi.string().required(),
        dados_terceiro: Joi.array().items(Joi.string()).required(),
        quadro_fases: Joi.object().required()
      })
    )
    .required()
    .min(1)
})

models.informacoesEdicaoAtualizacao = Joi.object().keys({
  informacoes_edicao: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        produto_id: Joi.number().integer().strict().required(),
        pec_planimetrico: Joi.string().required(),
        pec_altimetrico: Joi.string().required(),
        origem_dados_altimetricos: Joi.string().required(),
        territorio_internacional: Joi.boolean().required(),
        acesso_restrito: Joi.boolean().required(),
        carta_militar: Joi.boolean().required(),
        data_criacao: Joi.string().required(),
        creditos_id: Joi.number().integer().strict().required(),
        epsg_mde: Joi.string().required(),
        caminho_mde: Joi.string().required(),
        dados_terceiro: Joi.array().items(Joi.string()).required(),
        quadro_fases: Joi.object().required()
      })
    )
    .required()
    .min(1)
})

models.informacoesEdicaoIds = Joi.object().keys({
  informacoes_edicao_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

models.imagensCartaOrtoimagem = Joi.object().keys({
  imagens_carta_ortoimagem: Joi.array()
    .items(
      Joi.object().keys({
        produto_id: Joi.number().integer().strict().required(),
        caminho_imagem: Joi.string().required(),
        caminho_estilo: Joi.string().allow('', null),
        epsg: Joi.string().required()
      })
    )
    .required()
    .min(1)
})

models.imagensCartaOrtoimagemAtualizacao = Joi.object().keys({
  imagens_carta_ortoimagem: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        produto_id: Joi.number().integer().strict().required(),
        caminho_imagem: Joi.string().required(),
        caminho_estilo: Joi.string().allow('', null),
        epsg: Joi.string().required()
      })
    )
    .required()
    .min(1)
})

models.imagensCartaOrtoimagemIds = Joi.object().keys({
  imagens_carta_ortoimagem_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

models.classesComplementaresOrto = Joi.object().keys({
  classes_complementares_orto: Joi.array()
    .items(
      Joi.object().keys({
        nome: Joi.string().required(),
        classes: Joi.array().items(Joi.string()).required()
      })
    )
    .required()
    .min(1)
})

models.classesComplementaresOrtoAtualizacao = Joi.object().keys({
  classes_complementares_orto: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        nome: Joi.string().required(),
        classes: Joi.array().items(Joi.string()).required()
      })
    )
    .required()
    .min(1)
})

models.classesComplementaresOrtoIds = Joi.object().keys({
  classes_complementares_orto_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

models.perfilClassesComplementaresOrto = Joi.object().keys({
  perfil_classes_complementares_orto: Joi.array()
    .items(
      Joi.object().keys({
        produto_id: Joi.number().integer().strict().required(),
        classes_complementares_orto_id: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})

models.perfilClassesComplementaresOrtoAtualizacao = Joi.object().keys({
  perfil_classes_complementares_orto: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        produto_id: Joi.number().integer().strict().required(),
        classes_complementares_orto_id: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})

models.perfilClassesComplementaresOrtoIds = Joi.object().keys({
  perfil_classes_complementares_orto_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

module.exports = models
