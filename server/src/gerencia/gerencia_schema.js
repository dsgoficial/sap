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

models.pluginPath = Joi.object().keys({
  plugin_path: Joi.string().required()
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

models.propriedadesAtualizacao = Joi.object().keys({
  unidades_trabalho: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        dificuldade: Joi.number().integer(),
        tempo_estimado_minutos: Joi.number().integer(),
        prioridade: Joi.number().integer()
      })
    )
    .unique('id')
    .required()
    .min(1)
})

models.pit = Joi.object().keys({
  pit: Joi.array()
    .items(
      Joi.object().keys({
        lote_id: Joi.number().integer().strict().required(),
        meta: Joi.number().integer().strict().required(),
        ano: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})

models.pitAtualizacao = Joi.object().keys({
  pit: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        lote_id: Joi.number().integer().strict().required(),
        meta: Joi.number().integer().strict().required(),
        ano: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})

models.pitIds = Joi.object().keys({
  pit_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

models.alteracaoFluxoAtualizacao = Joi.object().keys({
  alteracao_fluxo: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        atividade_id: Joi.number().integer().strict().required(),
        descricao: Joi.string().required(),
        data: Joi.date().required(),
        resolvido: Joi.boolean().required(),
        geom: Joi.string().required()
      })
    )
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

models.filaPrioritariaAtualizacao = Joi.object().keys({
  fila_prioritaria: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        atividade_id: Joi.number().integer().strict().required(),
        usuario_id: Joi.number().integer().strict().required(),
        prioridade: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})

models.filaPrioritariaIds = Joi.object().keys({
  fila_prioritaria_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

models.filaPrioritariaGrupoAtualizacao = Joi.object().keys({
  fila_prioritaria_grupo: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        atividade_id: Joi.number().integer().strict().required(),
        perfil_producao_id: Joi.number().integer().strict().required(),
        prioridade: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})

models.filaPrioritariaGrupoIds = Joi.object().keys({
  fila_prioritaria_grupo_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

/**
 * @swagger
 * components:
 *   schemas:
 *     ProximaQuery:
 *       type: object
 *       properties:
 *         proxima:
 *           type: string
 *           enum: [true, false]
 *           description: Indica se é a próxima consulta
 *
 *     EmAndamentoQuery:
 *       type: object
 *       properties:
 *         em_andamento:
 *           type: string
 *           enum: [true, false]
 *           description: Indica se a consulta está em andamento
 *
 *     UnidadeTrabalhoDisponivel:
 *       type: object
 *       required:
 *         - unidade_trabalho_ids
 *         - disponivel
 *       properties:
 *         unidade_trabalho_ids:
 *           type: array
 *           items:
 *             type: integer
 *           uniqueItems: true
 *           description: IDs das unidades de trabalho
 *         disponivel:
 *           type: boolean
 *           description: Indica se a unidade de trabalho está disponível
 *
 *     AtividadePausar:
 *       type: object
 *       required:
 *         - unidade_trabalho_ids
 *       properties:
 *         unidade_trabalho_ids:
 *           type: array
 *           items:
 *             type: integer
 *           uniqueItems: true
 *           description: IDs das unidades de trabalho que serão pausadas
 *
 *     AtividadeReiniciar:
 *       type: object
 *       required:
 *         - unidade_trabalho_ids
 *       properties:
 *         unidade_trabalho_ids:
 *           type: array
 *           items:
 *             type: integer
 *           uniqueItems: true
 *           description: IDs das unidades de trabalho que serão reiniciadas
 *
 *     FilaPrioritaria:
 *       type: object
 *       required:
 *         - atividade_ids
 *         - usuario_prioridade_id
 *         - prioridade
 *       properties:
 *         atividade_ids:
 *           type: array
 *           items:
 *             type: integer
 *           uniqueItems: true
 *           description: IDs das atividades na fila prioritária
 *         usuario_prioridade_id:
 *           type: integer
 *           description: ID do usuário com prioridade
 *         prioridade:
 *           type: integer
 *           description: Nível de prioridade
 *
 *     FilaPrioritariaGrupo:
 *       type: object
 *       required:
 *         - atividade_ids
 *         - perfil_producao_id
 *         - prioridade
 *       properties:
 *         atividade_ids:
 *           type: array
 *           items:
 *             type: integer
 *           uniqueItems: true
 *           description: IDs das atividades no grupo de fila prioritária
 *         perfil_producao_id:
 *           type: integer
 *           description: ID do perfil de produção
 *         prioridade:
 *           type: integer
 *           description: Nível de prioridade
 *
 *     Observacao:
 *       type: object
 *       required:
 *         - atividade_ids
 *         - observacao_atividade
 *         - observacao_unidade_trabalho
 *       properties:
 *         atividade_ids:
 *           type: array
 *           items:
 *             type: integer
 *           uniqueItems: true
 *           description: IDs das atividades
 *         observacao_atividade:
 *           type: string
 *           description: Observação sobre a atividade
 *         observacao_unidade_trabalho:
 *           type: string
 *           description: Observação sobre a unidade de trabalho
 *
 *     AtividadeVoltar:
 *       type: object
 *       required:
 *         - atividade_ids
 *         - manter_usuarios
 *       properties:
 *         atividade_ids:
 *           type: array
 *           items:
 *             type: integer
 *           uniqueItems: true
 *           description: IDs das atividades que serão voltadas para a etapa anterior
 *         manter_usuarios:
 *           type: boolean
 *           description: Indica se os usuários serão mantidos na atividade
 *
 *     AtividadeAvancar:
 *       type: object
 *       required:
 *         - atividade_ids
 *         - concluida
 *       properties:
 *         atividade_ids:
 *           type: array
 *           items:
 *             type: integer
 *           uniqueItems: true
 *           description: IDs das atividades que serão avançadas
 *         concluida:
 *           type: boolean
 *           description: Indica se a atividade foi concluída
 *
 *     BancoDados:
 *       type: object
 *       required:
 *         - servidor
 *         - porta
 *         - banco
 *       properties:
 *         servidor:
 *           type: string
 *           description: Endereço do servidor do banco de dados
 *         porta:
 *           type: integer
 *           description: Porta do banco de dados
 *         banco:
 *           type: string
 *           description: Nome do banco de dados
 *
 *     BancoDadosUsuario:
 *       type: object
 *       required:
 *         - servidor
 *         - porta
 *         - banco
 *         - usuario_id
 *       properties:
 *         servidor:
 *           type: string
 *           description: Endereço do servidor do banco de dados
 *         porta:
 *           type: integer
 *           description: Porta do banco de dados
 *         banco:
 *           type: string
 *           description: Nome do banco de dados
 *         usuario_id:
 *           type: integer
 *           description: ID do usuário do banco de dados
 *
 *     VersaoQGIS:
 *       type: object
 *       required:
 *         - versao_minima
 *       properties:
 *         versao_minima:
 *           type: string
 *           description: Versão mínima do QGIS requerida
 *
 *     PluginPath:
 *       type: object
 *       required:
 *         - plugin_path
 *       properties:
 *         plugin_path:
 *           type: string
 *           description: Caminho do plugin do QGIS
 *
 *     QgisShortcuts:
 *       type: object
 *       required:
 *         - qgis_shortcuts
 *       properties:
 *         qgis_shortcuts:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - ferramenta
 *               - idioma
 *             properties:
 *               ferramenta:
 *                 type: string
 *                 description: Nome da ferramenta do QGIS
 *               idioma:
 *                 type: string
 *                 description: Idioma da ferramenta
 *               atalho:
 *                 type: string
 *                 description: Atalho da ferramenta
 *
 *     QgisShortcutsAtualizacao:
 *       type: object
 *       required:
 *         - qgis_shortcuts
 *       properties:
 *         qgis_shortcuts:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - id
 *               - ferramenta
 *               - idioma
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID do atalho
 *               ferramenta:
 *                 type: string
 *                 description: Nome da ferramenta do QGIS
 *               idioma:
 *                 type: string
 *                 description: Idioma da ferramenta
 *               atalho:
 *                 type: string
 *                 description: Atalho da ferramenta
 *
 *     ProblemaAtividadeAtualizacao:
 *       type: object
 *       required:
 *         - problema_atividade
 *       properties:
 *         problema_atividade:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - id
 *               - resolvido
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID do problema de atividade
 *               resolvido:
 *                 type: boolean
 *                 description: Indica se o problema foi resolvido
 *
 *     QgisShortcutsIds:
 *       type: object
 *       required:
 *         - qgis_shortcuts_ids
 *       properties:
 *         qgis_shortcuts_ids:
 *           type: array
 *           items:
 *             type: integer
 *           uniqueItems: true
 *           description: IDs dos atalhos do QGIS
 *
 *     PerfilProducaoIds:
 *       type: object
 *       required:
 *         - perfil_producao_ids
 *       properties:
 *         perfil_producao_ids:
 *           type: array
 *           items:
 *             type: integer
 *           uniqueItems: true
 *           description: IDs dos perfis de produção
 *
 *     PerfilProducao:
 *       type: object
 *       required:
 *         - perfil_producao
 *       properties:
 *         perfil_producao:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - nome
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome do perfil de produção
 *
 *     PerfilProducaoAtualizacao:
 *       type: object
 *       required:
 *         - perfil_producao
 *       properties:
 *         perfil_producao:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - id
 *               - nome
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID do perfil de produção
 *               nome:
 *                 type: string
 *                 description: Nome do perfil de produção
 *
 *     IniciaAtivModoLocal:
 *       type: object
 *       required:
 *         - atividade_id
 *         - usuario_id
 *       properties:
 *         atividade_id:
 *           type: integer
 *           description: ID da atividade a ser iniciada no modo local
 *         usuario_id:
 *           type: integer
 *           description: ID do usuário responsável pela atividade
 *
 *     FinalizaAtivModoLocal:
 *       type: object
 *       required:
 *         - atividade_id
 *         - usuario_uuid
 *         - data_inicio
 *         - data_fim
 *       properties:
 *         atividade_id:
 *           type: integer
 *           description: ID da atividade a ser finalizada no modo local
 *         usuario_uuid:
 *           type: string
 *           format: uuid
 *           description: UUID do usuário que finalizou a atividade
 *         data_inicio:
 *           type: string
 *           format: date-time
 *           description: Data e hora de início da atividade
 *         data_fim:
 *           type: string
 *           format: date-time
 *           description: Data e hora de fim da atividade
 *
 *     PerfilBlocoOperadorIds:
 *       type: object
 *       required:
 *         - perfil_bloco_operador_ids
 *       properties:
 *         perfil_bloco_operador_ids:
 *           type: array
 *           items:
 *             type: integer
 *           uniqueItems: true
 *           description: IDs dos perfis de bloco operador
 *
 *     PerfilBlocoOperador:
 *       type: object
 *       required:
 *         - perfil_bloco_operador
 *       properties:
 *         perfil_bloco_operador:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - usuario_id
 *               - bloco_id
 *             properties:
 *               usuario_id:
 *                 type: integer
 *                 description: ID do usuário associado ao bloco
 *               bloco_id:
 *                 type: integer
 *                 description: ID do bloco associado ao perfil
 *
 *     PerfilBlocoOperadorAtualizacao:
 *       type: object
 *       required:
 *         - perfil_bloco_operador
 *       properties:
 *         perfil_bloco_operador:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - id
 *               - usuario_id
 *               - bloco_id
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID do perfil de bloco operador
 *               usuario_id:
 *                 type: integer
 *                 description: ID do usuário associado ao bloco
 *               bloco_id:
 *                 type: integer
 *                 description: ID do bloco associado ao perfil
 *
 *     PerfilProducaoOperadorIds:
 *       type: object
 *       required:
 *         - perfil_producao_operador_ids
 *       properties:
 *         perfil_producao_operador_ids:
 *           type: array
 *           items:
 *             type: integer
 *           uniqueItems: true
 *           description: IDs dos perfis de produção operador
 *
 *     PerfilProducaoOperador:
 *       type: object
 *       required:
 *         - perfil_producao_operador
 *       properties:
 *         perfil_producao_operador:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - usuario_id
 *               - perfil_producao_id
 *             properties:
 *               usuario_id:
 *                 type: integer
 *                 description: ID do usuário associado ao perfil de produção
 *               perfil_producao_id:
 *                 type: integer
 *                 description: ID do perfil de produção associado
 *
 *     PerfilProducaoOperadorAtualizacao:
 *       type: object
 *       required:
 *         - perfil_producao_operador
 *       properties:
 *         perfil_producao_operador:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - id
 *               - usuario_id
 *               - perfil_producao_id
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID do perfil de produção operador
 *               usuario_id:
 *                 type: integer
 *                 description: ID do usuário associado ao perfil de produção
 *               perfil_producao_id:
 *                 type: integer
 *                 description: ID do perfil de produção associado
 * 
 *     PerfilProducaoEtapaIds:
 *       type: object
 *       required:
 *         - perfil_producao_etapa_ids
 *       properties:
 *         perfil_producao_etapa_ids:
 *           type: array
 *           items:
 *             type: integer
 *           uniqueItems: true
 *           description: IDs das etapas de produção do perfil
 *
 *     PerfilProducaoEtapa:
 *       type: object
 *       required:
 *         - perfil_producao_etapa
 *       properties:
 *         perfil_producao_etapa:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - perfil_producao_id
 *               - subfase_id
 *               - tipo_etapa_id
 *               - prioridade
 *             properties:
 *               perfil_producao_id:
 *                 type: integer
 *                 description: ID do perfil de produção
 *               subfase_id:
 *                 type: integer
 *                 description: ID da subfase
 *               tipo_etapa_id:
 *                 type: integer
 *                 description: ID do tipo de etapa
 *               prioridade:
 *                 type: integer
 *                 description: Nível de prioridade da etapa
 *
 *     PerfilProducaoEtapaAtualizacao:
 *       type: object
 *       required:
 *         - perfil_producao_etapa
 *       properties:
 *         perfil_producao_etapa:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - id
 *               - perfil_producao_id
 *               - subfase_id
 *               - tipo_etapa_id
 *               - prioridade
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID da etapa de produção do perfil
 *               perfil_producao_id:
 *                 type: integer
 *                 description: ID do perfil de produção
 *               subfase_id:
 *                 type: integer
 *                 description: ID da subfase
 *               tipo_etapa_id:
 *                 type: integer
 *                 description: ID do tipo de etapa
 *               prioridade:
 *                 type: integer
 *                 description: Nível de prioridade da etapa
 *
 *     Plugins:
 *       type: object
 *       required:
 *         - plugins
 *       properties:
 *         plugins:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - nome
 *               - versao_minima
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome do plugin
 *               versao_minima:
 *                 type: string
 *                 description: Versão mínima requerida do plugin
 *
 *     PluginsAtualizacao:
 *       type: object
 *       required:
 *         - plugins
 *       properties:
 *         plugins:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - id
 *               - nome
 *               - versao_minima
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID do plugin
 *               nome:
 *                 type: string
 *                 description: Nome do plugin
 *               versao_minima:
 *                 type: string
 *                 description: Versão mínima requerida do plugin
 *
 *     PluginsIds:
 *       type: object
 *       required:
 *         - plugins_ids
 *       properties:
 *         plugins_ids:
 *           type: array
 *           items:
 *             type: integer
 *           uniqueItems: true
 *           description: IDs dos plugins
 *
 *     RelatorioAlteracao:
 *       type: object
 *       required:
 *         - relatorio_alteracao
 *       properties:
 *         relatorio_alteracao:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - data
 *               - descricao
 *             properties:
 *               data:
 *                 type: string
 *                 format: date
 *                 description: Data da alteração
 *               descricao:
 *                 type: string
 *                 description: Descrição da alteração
 *
 *     RelatorioAlteracaoAtualizacao:
 *       type: object
 *       required:
 *         - relatorio_alteracao
 *       properties:
 *         relatorio_alteracao:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - id
 *               - data
 *               - descricao
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID da alteração no relatório
 *               data:
 *                 type: string
 *                 format: date
 *                 description: Data da alteração
 *               descricao:
 *                 type: string
 *                 description: Descrição da alteração
 *
 *     RelatorioAlteracaoIds:
 *       type: object
 *       required:
 *         - relatorio_alteracao_ids
 *       properties:
 *         relatorio_alteracao_ids:
 *           type: array
 *           items:
 *             type: integer
 *           uniqueItems: true
 *           description: IDs das alterações no relatório
 *
 *     PropriedadesAtualizacao:
 *       type: object
 *       required:
 *         - unidades_trabalho
 *       properties:
 *         unidades_trabalho:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID da unidade de trabalho
 *               dificuldade:
 *                 type: integer
 *                 description: Dificuldade da unidade de trabalho
 *               tempo_estimado_minutos:
 *                 type: integer
 *                 description: Tempo estimado em minutos para completar a unidade de trabalho
 *               prioridade:
 *                 type: integer
 *                 description: Nível de prioridade da unidade de trabalho
 *
 *     Pit:
 *       type: object
 *       required:
 *         - pit
 *       properties:
 *         pit:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - lote_id
 *               - meta
 *               - ano
 *             properties:
 *               lote_id:
 *                 type: integer
 *                 description: ID do lote
 *               meta:
 *                 type: integer
 *                 description: Meta associada ao lote
 *               ano:
 *                 type: integer
 *                 description: Ano da meta
 *
 *     PitAtualizacao:
 *       type: object
 *       required:
 *         - pit
 *       properties:
 *         pit:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - id
 *               - lote_id
 *               - meta
 *               - ano
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID da entrada do PIT
 *               lote_id:
 *                 type: integer
 *                 description: ID do lote
 *               meta:
 *                 type: integer
 *                 description: Meta associada ao lote
 *               ano:
 *                 type: integer
 *                 description: Ano da meta
 *
 *     PitIds:
 *       type: object
 *       required:
 *         - pit_ids
 *       properties:
 *         pit_ids:
 *           type: array
 *           items:
 *             type: integer
 *           uniqueItems: true
 *           description: IDs das entradas do PIT
 *
 *     AlteracaoFluxoAtualizacao:
 *       type: object
 *       required:
 *         - alteracao_fluxo
 *       properties:
 *         alteracao_fluxo:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - id
 *               - atividade_id
 *               - descricao
 *               - data
 *               - resolvido
 *               - geom
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID da alteração de fluxo
 *               atividade_id:
 *                 type: integer
 *                 description: ID da atividade associada à alteração de fluxo
 *               descricao:
 *                 type: string
 *                 description: Descrição da alteração de fluxo
 *               data:
 *                 type: string
 *                 format: date
 *                 description: Data da alteração de fluxo
 *               resolvido:
 *                 type: boolean
 *                 description: Indica se a alteração de fluxo foi resolvida
 *               geom:
 *                 type: string
 *                 description: Geometria associada à alteração de fluxo
 *
 *     FilaPrioritariaAtualizacao:
 *       type: object
 *       required:
 *         - fila_prioritaria
 *       properties:
 *         fila_prioritaria:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - id
 *               - atividade_id
 *               - usuario_id
 *               - prioridade
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID da fila prioritária
 *               atividade_id:
 *                 type: integer
 *                 description: ID da atividade na fila prioritária
 *               usuario_id:
 *                 type: integer
 *                 description: ID do usuário responsável pela atividade
 *               prioridade:
 *                 type: integer
 *                 description: Nível de prioridade da atividade
 *
 *     FilaPrioritariaIds:
 *       type: object
 *       required:
 *         - fila_prioritaria_ids
 *       properties:
 *         fila_prioritaria_ids:
 *           type: array
 *           items:
 *             type: integer
 *           uniqueItems: true
 *           description: IDs das entradas na fila prioritária
 *
 *     FilaPrioritariaGrupoAtualizacao:
 *       type: object
 *       required:
 *         - fila_prioritaria_grupo
 *       properties:
 *         fila_prioritaria_grupo:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - id
 *               - atividade_id
 *               - perfil_producao_id
 *               - prioridade
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID da entrada no grupo de fila prioritária
 *               atividade_id:
 *                 type: integer
 *                 description: ID da atividade no grupo de fila prioritária
 *               perfil_producao_id:
 *                 type: integer
 *                 description: ID do perfil de produção
 *               prioridade:
 *                 type: integer
 *                 description: Nível de prioridade da atividade
 *
 *     FilaPrioritariaGrupoIds:
 *       type: object
 *       required:
 *         - fila_prioritaria_grupo_ids
 *       properties:
 *         fila_prioritaria_grupo_ids:
 *           type: array
 *           items:
 *             type: integer
 *           uniqueItems: true
 *           description: IDs das entradas no grupo de fila prioritária
 */

module.exports = models
