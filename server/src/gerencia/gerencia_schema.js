'use strict'

const Joi = require('joi')

const models = {}

models.idParams = Joi.object().keys({
  id: Joi.number().integer().required()
})

models.proximaQuery = Joi.object().keys({
  proxima: Joi.string().valid('true', 'false')
})

models.emAndamentoQuery = Joi.object().keys({
  em_andamento: Joi.string().valid('true', 'false')
})

models.unidadeTrabalhoDisponivel = Joi.object().keys({
  unidade_trabalho_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1),
  disponivel: Joi.boolean().required()
})

models.atividadePausar = Joi.object().keys({
  unidade_trabalho_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1)
})

models.atividadeReiniciar = Joi.object().keys({
  unidade_trabalho_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1)
})

models.filaPrioritaria = Joi.object().keys({
  atividade_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1),
  usuario_prioridade_id: Joi.number().integer().strict().required(),
  prioridade: Joi.number().integer().strict().required()
})

models.filaPrioritariaGrupo = Joi.object().keys({
  atividade_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1),
  perfil_producao_id: Joi.number().integer().strict().required(),
  prioridade: Joi.number().integer().strict().required()
})

models.observacao = Joi.object().keys({
  atividade_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1),
  observacao_atividade: Joi.string().allow('', null).required(),
  observacao_unidade_trabalho: Joi.string().allow('', null).required()
})

models.atividadeVoltar = Joi.object().keys({
  atividade_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1),
  manter_usuarios: Joi.boolean().strict().required()
})

models.atividadeAvancar = Joi.object().keys({
  atividade_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1),
  concluida: Joi.boolean().strict().required()
})

models.bancoDados = Joi.object().keys({
  servidor: Joi.string().required(),
  porta: Joi.number().integer().strict().required(),
  banco: Joi.string().required()
})

models.bancoDadosUsuario = Joi.object().keys({
  servidor: Joi.string().required(),
  porta: Joi.number().integer().strict().required(),
  banco: Joi.string().required(),
  usuario_id: Joi.number().integer().strict().required()
})

models.versaoQGIS = Joi.object().keys({
  versao_minima: Joi.string().required()
})

models.qgisShortcuts = Joi.object().keys({
  qgis_shortcuts: Joi.array()
    .items(
      Joi.object().keys({
        ferramenta: Joi.string().required(),
        idioma: Joi.string().required(),
        atalho: Joi.string(),
      })
    )
    .required()
    .min(1)
})

models.qgisShortcutsAtualizacao = Joi.object().keys({
  qgis_shortcuts: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        ferramenta: Joi.string().required(),
        idioma: Joi.string().required(),
        atalho: Joi.string(),
      })
    )
    .unique('id')
    .required()
    .min(1)
})

models.problemaAtividadeAtualizacao = Joi.object().keys({
  problema_atividade: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        resolvido: Joi.boolean().required()
      })
    )
    .unique('id')
    .required()
    .min(1)
})



models.qgisShortcutsIds = Joi.object().keys({
  qgis_shortcuts_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

models.perfilProducaoIds = Joi.object().keys({
  perfil_producao_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1)
})

models.perfilProducao = Joi.object().keys({
  perfil_producao: Joi.array()
    .items(
      Joi.object().keys({
        nome: Joi.string().required()
      })
    )
    .required()
    .min(1)
})

models.perfilProducaoAtualizacao = Joi.object().keys({
  perfil_producao: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        nome: Joi.string().required()
      })
    )
    .unique('id')
    .required()
    .min(1)
})

models.iniciaAtivModoLocal = Joi.object().keys({
  atividade_id: Joi.number().integer().strict().required(),
  usuario_id: Joi.number().integer().strict().required()
})

models.finalizaAtivModoLocal = Joi.object().keys({
  atividade_id: Joi.number().integer().strict().required(),
  usuario_uuid: Joi.string().guid({ version: 'uuidv4' }).required().allow(''),
  data_inicio: Joi.date().required(),
  data_fim: Joi.date().required()
})

models.perfilBlocoOperadorIds = Joi.object().keys({
  perfil_bloco_operador_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1)
})

models.perfilBlocoOperador = Joi.object().keys({
  perfil_bloco_operador: Joi.array()
    .items(
      Joi.object().keys({
        usuario_id: Joi.number().integer().strict().required(),
        bloco_id: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})

models.perfilBlocoOperadorAtualizacao = Joi.object().keys({
  perfil_bloco_operador: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        usuario_id: Joi.number().integer().strict().required(),
        bloco_id: Joi.number().integer().strict().required()
      })
    )
    .unique('id')
    .required()
    .min(1)
})

models.perfilProducaoOperadorIds = Joi.object().keys({
  perfil_producao_operador_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1)
})

models.perfilProducaoOperador = Joi.object().keys({
  perfil_producao_operador: Joi.array()
    .items(
      Joi.object().keys({
        usuario_id: Joi.number().integer().strict().required(),
        perfil_producao_id: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})

models.perfilProducaoOperadorAtualizacao = Joi.object().keys({
  perfil_producao_operador: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        usuario_id: Joi.number().integer().strict().required(),
        perfil_producao_id: Joi.number().integer().strict().required()
      })
    )
    .unique('id')
    .required()
    .min(1)
})

models.perfilProducaoEtapaIds = Joi.object().keys({
  perfil_producao_etapa_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1)
})

models.perfilProducaoEtapa = Joi.object().keys({
  perfil_producao_etapa: Joi.array()
    .items(
      Joi.object().keys({
        perfil_producao_id: Joi.number().integer().strict().required(),
        subfase_id: Joi.number().integer().strict().required(),
        tipo_etapa_id: Joi.number().integer().strict().required(),
        prioridade: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})

models.perfilProducaoEtapaAtualizacao = Joi.object().keys({
  perfil_producao_etapa: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        perfil_producao_id: Joi.number().integer().strict().required(),
        subfase_id: Joi.number().integer().strict().required(),
        tipo_etapa_id: Joi.number().integer().strict().required(),
        prioridade: Joi.number().integer().strict().required()
      })
    )
    .unique('id')
    .required()
    .min(1)
})

models.perfilDificuldadeOperadorIds = Joi.object().keys({
  perfil_dificuldade_operador_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1)
})

models.perfilDificuldadeOperador = Joi.object().keys({
  perfil_dificuldade_operador: Joi.array()
    .items(
      Joi.object().keys({
        usuario_id: Joi.number().integer().strict().required(),
        subfase_id: Joi.number().integer().strict().required(),
        bloco_id: Joi.number().integer().strict().required(),
        tipo_perfil_dificuldade_id: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})

models.perfilDificuldadeOperadorAtualizacao = Joi.object().keys({
  perfil_dificuldade_operador: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        usuario_id: Joi.number().integer().strict().required(),
        subfase_id: Joi.number().integer().strict().required(),
        bloco_id: Joi.number().integer().strict().required(),
        tipo_perfil_dificuldade_id: Joi.number().integer().strict().required()
      })
    )
    .unique('id')
    .required()
    .min(1)
})

models.plugins = Joi.object().keys({
  plugins: Joi.array()
    .items(
      Joi.object().keys({
        nome: Joi.string().required(),
        versao_minima: Joi.string().required()
      })
    )
    .required()
})

models.pluginsAtualizacao = Joi.object().keys({
  plugins: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        nome: Joi.string().required(),
        versao_minima: Joi.string().required()
      })
    )
    .unique('id')
    .required()
    .min(1)
})

models.pluginsIds = Joi.object().keys({
  plugins_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

models.relatorioAlteracao = Joi.object().keys({
  relatorio_alteracao: Joi.array()
    .items(
      Joi.object().keys({
        data: Joi.date().required(),
        descricao: Joi.string().required()
      })
    )
    .required()
    .min(1)
})

models.relatorioAlteracaoAtualizacao = Joi.object().keys({
  relatorio_alteracao: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        data: Joi.date().required(),
        descricao: Joi.string().required()
      })
    )
    .unique('id')
    .required()
    .min(1)
})

models.relatorioAlteracaoIds = Joi.object().keys({
  relatorio_alteracao_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1)
})

models.dificuldadeTempoEstimadoAtualizacao = Joi.object().keys({
  unidades_trabalho: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        dificuldade: Joi.number().integer().required(),
        tempo_estimado_minutos: Joi.number().integer().required()
      })
    )
    .unique('id')
    .required()
    .min(1)
})

module.exports = models
