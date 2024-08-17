'use strict'

const Joi = require('joi')

const models = {}

models.idParams = Joi.object().keys({
  id: Joi.number().integer().required()
})

models.usuarios = Joi.object().keys({
  usuarios: Joi.array()
    .items(
      Joi.object().keys({
        nome: Joi.string().required(),
        nome_guerra: Joi.string().required(),
        tipo_turno_id: Joi.number().integer().strict().required(),
        tipo_posto_grad_id: Joi.number().integer().strict().required(),
        uuid: Joi.string().guid({ version: 'uuidv4' }).required()
      })
    )
    .unique('uuid')
    .required()
    .min(1)
})

models.estilos = Joi.object().keys({
  estilos: Joi.array()
    .items(
      Joi.object().keys({
        f_table_schema: Joi.string().required(),
        f_table_name: Joi.string().required(),
        f_geometry_column: Joi.string().required(),
        grupo_estilo_id: Joi.number().integer().strict().required(),
        styleqml: Joi.string().required(),
        stylesld: Joi.string().allow('', null).required(),
        ui: Joi.string().allow('', null).required()
      })
    )
    .required()
})

models.estilosAtualizacao = Joi.object().keys({
  estilos: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        f_table_schema: Joi.string().required(),
        f_table_name: Joi.string().required(),
        f_geometry_column: Joi.string().required(),
        grupo_estilo_id: Joi.number().integer().strict().required(),
        styleqml: Joi.string().required(),
        stylesld: Joi.string().required(),
        ui: Joi.string().allow('', null).required()
      })
    )
    .unique('id')
    .required()
    .min(1)
})

models.estilosIds = Joi.object().keys({
  estilos_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

models.menus = Joi.object().keys({
  menus: Joi.array()
    .items(
      Joi.object().keys({
        nome: Joi.string().required(),
        definicao_menu: Joi.string().required()
      })
    )
    .required()
})

models.menusAtualizacao = Joi.object().keys({
  menus: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        nome: Joi.string().required(),
        definicao_menu: Joi.string().required()
      })
    )
    .unique('id')
    .required()
    .min(1)
})

models.menusIds = Joi.object().keys({
  menus_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

models.temas = Joi.object().keys({
  temas: Joi.array()
    .items(
      Joi.object().keys({
        nome: Joi.string().required(),
        definicao_tema: Joi.string().required()
      })
    )
    .required()
})

models.temasAtualizacao = Joi.object().keys({
  temas: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        nome: Joi.string().required(),
        definicao_tema: Joi.string().required()
      })
    )
    .unique('id')
    .required()
    .min(1)
})

models.temasIds = Joi.object().keys({
  temas_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})


models.regras = Joi.object().keys({
  regras: Joi.array()
    .items(
      Joi.object().keys({
        nome: Joi.string().required(),
        regra: Joi.string().required()
      })
    )
    .required()
})

models.regrasAtualizacao = Joi.object().keys({
  regras: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        nome: Joi.string().required(),
        regra: Joi.string().required()
      })
    )
    .required()
})

models.regrasIds = Joi.object().keys({
  regras_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

models.grupoEstilos = Joi.object().keys({
  grupo_estilos: Joi.array()
    .items(
      Joi.object().keys({
        nome: Joi.string().required()
      })
    )
    .required()
})

models.grupoEstilosAtualizacao = Joi.object().keys({
  grupo_estilos: Joi.array()
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

models.grupoEstilosIds = Joi.object().keys({
  grupo_estilos_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

models.qgisModels = Joi.object().keys({
  modelos: Joi.array()
    .items(
      Joi.object().keys({
        nome: Joi.string().required(),
        descricao: Joi.string().required(),
        model_xml: Joi.string().required()
      })
    )
    .required()
})

models.atualizaQgisModels = Joi.object().keys({
  modelos: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        nome: Joi.string().required(),
        descricao: Joi.string().required(),
        model_xml: Joi.string().required()
      })
    )
    .required()
})

models.qgisModelsIds = Joi.object().keys({
  modelos_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

models.unidadeTrabalhoBloco = Joi.object().keys({
  unidade_trabalho_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1),
  bloco_id: Joi.number().integer().strict().required()
})

models.unidadeTrabalhoReshape = Joi.object().keys({
  unidade_trabalho_id: Joi.number().integer().strict().required(),
  reshape_geom: Joi.string().required()
})

models.unidadeTrabalhoCut = Joi.object().keys({
  unidade_trabalho_id: Joi.number().integer().strict().required(),
  cut_geoms: Joi.array()
    .items(Joi.string())
    .unique()
    .required()
    .min(2)
})

models.unidadeTrabalhoMerge = Joi.object().keys({
  unidade_trabalho_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(2),
  merge_geom: Joi.string().required()
})

models.linhaProducao = Joi.object().keys({
  linha_producao: Joi.object({
    nome: Joi.string().required(),
    descricao: Joi.string().required(),
    nome_abrev: Joi.string().required(),
    tipo_produto_id: Joi.number().integer().required(),
    fases: Joi.array().items(Joi.object({
      tipo_fase_id: Joi.number().integer().required(),
      ordem: Joi.number().integer().required(),
      subfases: Joi.array().items(Joi.object({
        nome: Joi.string().required(),
        ordem: Joi.number().integer().required()
      })).required(),
      pre_requisito_subfase: Joi.array().items(Joi.object({
        subfase_anterior: Joi.string().required(),
        subfase_posterior: Joi.string().required(),
        tipo_pre_requisito_id: Joi.number().integer().required()
      }))
    })).required(),
    propriedades_camadas: Joi.array().items(Joi.object({
      schema: Joi.string().required(),
      camada: Joi.string().required(),
      subfase: Joi.string().required(),
      camada_apontamento: Joi.boolean().required(),
      camada_incomum: Joi.boolean().required(),
      atributo_filtro_subfase: Joi.string(),
      atributo_situacao_correcao: Joi.string(),
      atributo_justificativa_apontamento: Joi.string()
    }).when(Joi.object({
      camada_apontamento: Joi.boolean().valid(true).required()
    }), {
      then: Joi.object({
        atributo_filtro_subfase: Joi.string().required(),
        atributo_situacao_correcao: Joi.string().required(),
        atributo_justificativa_apontamento: Joi.string().required()
      }),
      otherwise: Joi.object({
        atributo_filtro_subfase: Joi.string().forbidden(),
        atributo_situacao_correcao: Joi.string().forbidden(),
        atributo_justificativa_apontamento: Joi.string().forbidden()
      })
    }))
  })
})


models.listaAtividades = Joi.object().keys({
  atividades_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1)
})

models.unidadeTrabalhoEtapa = Joi.object().keys({
  unidade_trabalho_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1),
  etapa_ids: Joi.array()
  .items(Joi.number().integer().strict())
  .unique()
  .required()
  .min(1)
})

models.gerenciadorFME = Joi.object().keys({
  gerenciador_fme: Joi.array()
    .items(
      Joi.object().keys({
        url: Joi.string().required()
      })
    )
    .unique((a, b) => a.url === b.url)
    .required()
    .min(1)
})

models.gerenciadorFMEUpdate = Joi.object().keys({
  gerenciador_fme: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        url: Joi.string().required()
      })
    )
    .unique('id')
    .required()
    .min(1)
})

models.gerenciadorFMEIds = Joi.object().keys({
  servidores_id: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

models.camadasIds = Joi.object().keys({
  camadas_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

models.camadas = Joi.object().keys({
  camadas: Joi.array()
    .items(
      Joi.object().keys({
        schema: Joi.string().required(),
        nome: Joi.string().required()
      })
    )
    .required()
    .min(1)
})

models.camadasAtualizacao = Joi.object().keys({
  camadas: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        schema: Joi.string().required(),
        nome: Joi.string().required()
      })
    )
    .unique('id')
    .required()
    .min(1)
})

models.perfilFMEIds = Joi.object().keys({
  perfil_fme_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

models.perfilModeloIds = Joi.object().keys({
  perfil_modelo_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

models.perfilMenuIds = Joi.object().keys({
  perfil_menu_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

models.perfilLinhagemIds = Joi.object().keys({
  perfil_linhagem_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

models.perfilRequisitoIds = Joi.object().keys({
  perfil_requisito_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

models.perfilRegrasIds = Joi.object().keys({
  perfil_regras_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

models.perfilEstilosIds = Joi.object().keys({
  perfil_estilos_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

models.perfilTemasIds = Joi.object().keys({
  perfil_temas_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

models.perfisFME = Joi.object().keys({
  perfis_fme: Joi.array()
    .items(
      Joi.object().keys({
        gerenciador_fme_id: Joi.number().integer().strict().required(),
        rotina: Joi.number().integer().strict().required(),
        requisito_finalizacao: Joi.boolean().strict().required(),
        tipo_rotina_id: Joi.number().integer().strict().required(),
        subfase_id: Joi.number().integer().strict().required(),
        lote_id: Joi.number().integer().strict().required(),
        ordem: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})

models.perfisModelo = Joi.object().keys({
  perfis_modelo: Joi.array()
    .items(
      Joi.object().keys({
        qgis_model_id: Joi.number().integer().strict().required(),
        parametros: Joi.string().required().allow(null, ''),
        requisito_finalizacao: Joi.boolean().strict().required(),
        tipo_rotina_id: Joi.number().integer().strict().required(),
        subfase_id: Joi.number().integer().strict().required(),
        lote_id: Joi.number().integer().strict().required(),
        ordem: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})

models.perfisMenu = Joi.object().keys({
  perfis_menu: Joi.array()
    .items(
      Joi.object().keys({
        menu_id: Joi.number().integer().strict().required(),
        menu_revisao: Joi.boolean().strict().required(),
        subfase_id: Joi.number().integer().strict().required(),
        lote_id: Joi.number().integer().strict().required(),
      })
    )
    .required()
    .min(1)
})

models.perfisLinhagem = Joi.object().keys({
  perfis_linhagem: Joi.array()
    .items(
      Joi.object().keys({
        tipo_exibicao_id: Joi.number().integer().strict().required(),
        subfase_id: Joi.number().integer().strict().required(),
        lote_id: Joi.number().integer().strict().required(),
      })
    )
    .required()
    .min(1)
})

models.perfilRegras = Joi.object().keys({
  perfis_regras: Joi.array()
    .items(
      Joi.object().keys({
        layer_rules_id: Joi.number().integer().strict().required(),
        subfase_id: Joi.number().integer().strict().required(),
        lote_id: Joi.number().integer().strict().required(),
      })
    )
    .required()
    .min(1)
})

models.perfilRegrastualizacao = Joi.object().keys({
  perfis_regras: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        layer_rules_id: Joi.number().integer().strict().required(),
        subfase_id: Joi.number().integer().strict().required(),
        lote_id: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})

models.perfilEstilos = Joi.object().keys({
  perfis_estilos: Joi.array()
    .items(
      Joi.object().keys({
        grupo_estilo_id: Joi.number().integer().strict().required(),
        subfase_id: Joi.number().integer().strict().required(),
        lote_id: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})

models.perfilEstilostualizacao = Joi.object().keys({
  perfis_estilos: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        grupo_estilo_id: Joi.number().integer().strict().required(),
        subfase_id: Joi.number().integer().strict().required(),
        lote_id: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})

models.perfilTemas = Joi.object().keys({
  perfis_temas: Joi.array()
    .items(
      Joi.object().keys({
        tema_id: Joi.number().integer().strict().required(),
        subfase_id: Joi.number().integer().strict().required(),
        lote_id: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})

models.perfilTemasAtualizacao = Joi.object().keys({
  perfis_temas: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        tema_id: Joi.number().integer().strict().required(),
        subfase_id: Joi.number().integer().strict().required(),
        lote_id: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})

models.perfisRequisito = Joi.object().keys({
  perfis_requisito: Joi.array()
    .items(
      Joi.object().keys({
        descricao: Joi.string().required(),
        ordem: Joi.number().integer().strict().required(),
        subfase_id: Joi.number().integer().strict().required(),
        lote_id: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})

models.perfilRequisitoAtualizacao = Joi.object().keys({
  perfis_requisito: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        descricao: Joi.string().required(),
        ordem: Joi.number().integer().strict().required(),
        subfase_id: Joi.number().integer().strict().required(),
        lote_id: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})


models.perfisModeloAtualizacao = Joi.object().keys({
  perfis_modelo: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        qgis_model_id: Joi.number().integer().strict().required(),
        parametros: Joi.string().required(),
        requisito_finalizacao: Joi.boolean().strict().required(),
        tipo_rotina_id: Joi.number().integer().strict().required(),
        subfase_id: Joi.number().integer().strict().required(),
        lote_id: Joi.number().integer().strict().required(),
        ordem: Joi.number().integer().strict().required()
      })
    )
    .unique('id')
    .required()
    .min(1)
})

models.perfilMenuAtualizacao = Joi.object().keys({
  perfis_menu: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        menu_id: Joi.number().integer().strict().required(),
        menu_revisao: Joi.boolean().strict().required(),
        subfase_id: Joi.number().integer().strict().required(),
        lote_id: Joi.number().integer().strict().required(),
      })
    )
    .unique('id')
    .required()
    .min(1)
})

models.perfilLinhagemAtualizacao = Joi.object().keys({
  perfis_linhagem: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        tipo_exibicao_id: Joi.number().integer().strict().required(),
        subfase_id: Joi.number().integer().strict().required(),
        lote_id: Joi.number().integer().strict().required(),
      })
    )
    .unique('id')
    .required()
    .min(1)
})



models.perfilFMEAtualizacao = Joi.object().keys({
  perfis_fme: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        gerenciador_fme_id: Joi.number().integer().strict().required(),
        rotina: Joi.number().integer().strict().required(),
        requisito_finalizacao: Joi.boolean().strict().required(),
        tipo_rotina_id: Joi.number().integer().strict().required(),
        subfase_id: Joi.number().integer().strict().required(),
        lote_id: Joi.number().integer().strict().required(),
        ordem: Joi.number().integer().strict().required()
      })
    )
    .unique('id')
    .required()
    .min(1)
})

models.unidadeTrabalhoId = Joi.object().keys({
  unidade_trabalho_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1)
})

models.unidadeTrabalhoCopiar = Joi.object().keys({
  subfase_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1),
  unidade_trabalho_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1),
  associar_insumos: Joi.boolean().required()
})

models.associaInsumos = Joi.object().keys({
  unidade_trabalho_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1),
  grupo_insumo_id: Joi.number().integer().strict().required(),
  estrategia_id: Joi.number().integer().strict().required(),
  caminho_padrao: Joi.string().required().allow('')
})

models.associaInsumosBloco = Joi.object().keys({
  bloco_id: Joi.number().integer().strict().required(),
  subfase_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1),
  grupo_insumo_id: Joi.number().integer().strict().required(),
  estrategia_id: Joi.number().integer().strict().required(),
  caminho_padrao: Joi.string().required().allow('')
})

models.deletaInsumos = Joi.object().keys({
  unidade_trabalho_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1),
  grupo_insumo_id: Joi.number().integer().strict().required()
})

models.produtos = Joi.object().keys({
  produtos: Joi.array()
    .items(
      Joi.object().keys({
        uuid: Joi.string().guid({ version: 'uuidv4' }).required().allow(''),
        nome: Joi.string().required().allow(''),
        mi: Joi.string().required().allow(''),
        inom: Joi.string().required().allow(''),
        denominador_escala: Joi.string().required(),
        edicao: Joi.string().required().allow(''),
        geom: Joi.string().required()
      })
    )
    .unique('uuid')
    .required()
    .min(1),
  lote_id: Joi.number().integer().strict().required()
})

models.insumos = Joi.object().keys({
  insumos: Joi.array()
    .items(
      Joi.object().keys({
        nome: Joi.string().required(),
        caminho: Joi.string().required(),
        epsg: Joi.string().required().allow(''),
        geom: Joi.string().required().allow('')
      })
    )
    .required()
    .min(1),
  tipo_insumo: Joi.number().integer().strict().required(),
  grupo_insumo: Joi.number().integer().strict().required()
})

models.unidadesTrabalho = Joi.object().keys({
  unidades_trabalho: Joi.array()
    .items(
      Joi.object().keys({
        nome: Joi.string().required().allow(''),
        epsg: Joi.string().required().allow(''),
        observacao: Joi.string().required().allow(''),
        geom: Joi.string().required(),
        dado_producao_id: Joi.number().integer().strict().required(),
        bloco_id: Joi.number().integer().strict().required(),
        disponivel: Joi.boolean().required(),
        prioridade: Joi.number().integer().strict().required(),
        dificuldade: Joi.number().integer().strict().required(),
        tempo_estimado_minutos: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1),
  subfase_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1),
  lote_id: Joi.number().integer().strict().required()
})

models.todasAtividades = Joi.object().keys({
  lote_id: Joi.number().integer().strict().required(),
  atividades_revisao: Joi.boolean().strict().required(),
  atividades_revisao_correcao: Joi.boolean().strict().required(),
  atividades_revisao_final: Joi.boolean().strict().required()
})

models.padrao_etapa = Joi.object().keys({
  padrao_cq: Joi.number().integer().strict().required(),
  fase_id: Joi.number().integer().strict().required(),
  lote_id: Joi.number().integer().strict().required(),
})

models.grupoInsumoId = Joi.object().keys({
  grupo_insumos_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1)
})

models.grupoInsumo = Joi.object().keys({
  grupo_insumos: Joi.array()
    .items(
      Joi.object().keys({
        nome: Joi.string().required()
      })
    )
    .required()
    .min(1)
})


models.grupoInsumoAtualizacao = Joi.object().keys({
  grupo_insumos: Joi.array()
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

models.projeto = Joi.object().keys({
  projetos: Joi.array()
    .items(
      Joi.object().keys({
        nome: Joi.string().required(),
        nome_abrev: Joi.string().required(),
        descricao: Joi.string().required(),
        finalizado: Joi.boolean().strict().required()
      })
    )
    .required()
})

models.projetoUpdate = Joi.object().keys({
  projetos: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        nome: Joi.string().required(),
        nome_abrev: Joi.string().required(),
        descricao: Joi.string().required(),
        finalizado: Joi.boolean().strict().required()
      })
    )
    .unique('id')
    .required()
    .min(1)
})

models.projetoIds = Joi.object().keys({
  projeto_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

models.lotes = Joi.object().keys({
  lotes: Joi.array()
    .items(
      Joi.object().keys({
        nome: Joi.string().required(),
        nome_abrev: Joi.string().required(),
        denominador_escala: Joi.number().integer().strict().required(),
        linha_producao_id: Joi.number().integer().strict().required(),
        projeto_id: Joi.number().integer().strict().required(),
        descricao: Joi.string().required()
      })
    )
    .required()
})

models.loteUpdate = Joi.object().keys({
  lotes: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        nome: Joi.string().required(),
        nome_abrev: Joi.string().required(),
        denominador_escala: Joi.number().integer().strict().required(),
        linha_producao_id: Joi.number().integer().strict().required(),
        projeto_id: Joi.number().integer().strict().required(),
        descricao: Joi.string().required()
      })
    )
    .unique('id')
    .required()
    .min(1)
})

models.loteIds = Joi.object().keys({
  lote_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})


models.blocos = Joi.object().keys({
  blocos: Joi.array()
    .items(
      Joi.object().keys({
        nome: Joi.string().required(),
        prioridade: Joi.number().integer().strict().required(),
        lote_id: Joi.number().integer().strict().required()
      })
    )
    .required()
})

models.blocoUpdate = Joi.object().keys({
  blocos: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        nome: Joi.string().required(),
        prioridade: Joi.number().integer().strict().required(),
        lote_id: Joi.number().integer().strict().required()
      })
    )
    .unique('id')
    .required()
    .min(1)
})

models.blocoIds = Joi.object().keys({
  bloco_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

models.dadoProducao = Joi.object().keys({
  dado_producao: Joi.array()
    .items(
      Joi.object().keys({
        tipo_dado_producao_id: Joi.number().integer().strict().required(),
        configuracao_producao: Joi.string().required()
      })
    )
    .required()
})

models.dadoProducaoUpdate = Joi.object().keys({
  dado_producao: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        tipo_dado_producao_id: Joi.number().integer().strict().required(),
        configuracao_producao: Joi.string().required()
      })
    )
    .unique('id')
    .required()
    .min(1)
})

models.dadoProducaoIds = Joi.object().keys({
  dado_producao_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

models.perfilAlias = Joi.object().keys({
  perfis_alias: Joi.array()
    .items(
      Joi.object().keys({
        alias_id: Joi.number().integer().strict().required(),
        subfase_id: Joi.number().integer().strict().required(),
        lote_id: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})

models.perfilAliastualizacao = Joi.object().keys({
  perfis_alias: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        alias_id: Joi.number().integer().strict().required(),
        subfase_id: Joi.number().integer().strict().required(),
        lote_id: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})

models.perfilAliasIds = Joi.object().keys({
  perfis_alias_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

models.alias = Joi.object().keys({
  alias: Joi.array()
    .items(
      Joi.object().keys({
        nome: Joi.string().required(),
        definicao_alias: Joi.string().required()
      })
    )
    .required()
    .min(1)
})

models.aliastualizacao = Joi.object().keys({
  alias: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        nome: Joi.string().required(),
        definicao_alias: Joi.string().required()
      })
    )
    .required()
    .min(1)
})

models.aliasIds = Joi.object().keys({
  alias_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

models.perfilConfiguracaoQgis = Joi.object().keys({
  perfis_configuracao_qgis: Joi.array()
    .items(
      Joi.object().keys({
        tipo_configuracao_id: Joi.number().integer().strict().required(),
        parametros: Joi.string().required(),
        subfase_id: Joi.number().integer().strict().required(),
        lote_id: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})

models.perfilConfiguracaoQgisAtualizacao = Joi.object().keys({
  perfis_configuracao_qgis: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        tipo_configuracao_id: Joi.number().integer().strict().required(),
        parametros: Joi.string().required(),
        subfase_id: Joi.number().integer().strict().required(),
        lote_id: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})

models.perfilConfiguracaoQgisIds = Joi.object().keys({
  perfis_configuracao_qgis_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

models.perfilDificuldadeOperador = Joi.object().keys({
  perfis_dificuldade_operador: Joi.array()
    .items(
      Joi.object().keys({
        usuario_id: Joi.number().integer().strict().required(),
        subfase_id: Joi.number().integer().strict().required(),
        lote_id: Joi.number().integer().strict().required(),
        tipo_perfil_dificuldade_id: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})

models.perfilDificuldadeOperadorAtualizacao = Joi.object().keys({
  perfis_dificuldade_operador: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        usuario_id: Joi.number().integer().strict().required(),
        subfase_id: Joi.number().integer().strict().required(),
        lote_id: Joi.number().integer().strict().required(),
        tipo_perfil_dificuldade_id: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})

models.perfilDificuldadeOperadorIds = Joi.object().keys({
  perfis_dificuldade_operador_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

models.configuracaoLoteCopiar = Joi.object().keys({
  lote_id_origem: Joi.number().integer().strict().required(),
  lote_id_destino: Joi.number().integer().strict().required(),
  copiar_estilo: Joi.boolean().strict().required(),
  copiar_menu: Joi.boolean().strict().required(),
  copiar_regra: Joi.boolean().strict().required(),
  copiar_modelo: Joi.boolean().strict().required(),
  copiar_workflow: Joi.boolean().strict().required(),
  copiar_alias: Joi.boolean().strict().required(),
  copiar_linhagem: Joi.boolean().strict().required(),
  copiar_finalizacao: Joi.boolean().strict().required(),
  copiar_tema: Joi.boolean().strict().required(),
  copiar_fme: Joi.boolean().strict().required(),
  copiar_configuracao_qgis: Joi.boolean().strict().required(),
  copiar_monitoramento: Joi.boolean().strict().required()
})

models.perfilWorkflowDsgtools = Joi.object().keys({
  perfil_workflow_dsgtools: Joi.array()
    .items(
      Joi.object().keys({
        workflow_dsgtools_id: Joi.number().integer().strict().required(),
        subfase_id: Joi.number().integer().strict().required(),
        lote_id: Joi.number().integer().strict().required(),
        requisito_finalizacao: Joi.boolean().strict().required()
      })
    )
    .required()
    .min(1)
})

models.perfilWorkflowDsgtoolsAtualizacao = Joi.object().keys({
  perfil_workflow_dsgtools: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        workflow_dsgtools_id: Joi.number().integer().strict().required(),
        subfase_id: Joi.number().integer().strict().required(),
        lote_id: Joi.number().integer().strict().required(),
        requisito_finalizacao: Joi.boolean().strict().required()
      })
    )
    .required()
    .min(1)
})

models.perfilWorkflowDsgtoolsIds = Joi.object().keys({
  perfil_workflow_dsgtools_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})


models.workflows = Joi.object().keys({
  workflows: Joi.array()
    .items(
      Joi.object().keys({
        nome: Joi.string().required(),
        descricao: Joi.string().required(),
        workflow_json: Joi.string().required()
      })
    )
    .required()
})

models.atualizaWorkflows = Joi.object().keys({
  workflows: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        nome: Joi.string().required(),
        descricao: Joi.string().required(),
        workflow_json: Joi.string().required()
      })
    )
    .required()
})

models.workflowsIds = Joi.object().keys({
  workflows_ids: Joi.array()
    .items(Joi.number().integer().strict().required())
    .unique()
    .required()
    .min(1)
})

/**
 * @swagger
 * components:
 *   schemas:
 *     idParams:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único requerido para a operação
 *       required:
 *         - id
 *     
 *     usuarios:
 *       type: object
 *       properties:
 *         usuarios:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               nome_guerra:
 *                 type: string
 *               tipo_turno_id:
 *                 type: integer
 *               tipo_posto_grad_id:
 *                 type: integer
 *               uuid:
 *                 type: string
 *                 format: uuid
 *       required:
 *         - usuarios
 *     
 *     estilos:
 *       type: object
 *       properties:
 *         estilos:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               f_table_schema:
 *                 type: string
 *               f_table_name:
 *                 type: string
 *               f_geometry_column:
 *                 type: string
 *               grupo_estilo_id:
 *                 type: integer
 *               styleqml:
 *                 type: string
 *               stylesld:
 *                 type: string
 *               ui:
 *                 type: string
 *       required:
 *         - estilos
 *     
 *     estilosAtualizacao:
 *       type: object
 *       properties:
 *         estilos:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               f_table_schema:
 *                 type: string
 *               f_table_name:
 *                 type: string
 *               f_geometry_column:
 *                 type: string
 *               grupo_estilo_id:
 *                 type: integer
 *               styleqml:
 *                 type: string
 *               stylesld:
 *                 type: string
 *               ui:
 *                 type: string
 *       required:
 *         - estilos
 *     
 *     estilosIds:
 *       type: object
 *       properties:
 *         estilos_ids:
 *           type: array
 *           items:
 *             type: integer
 *       required:
 *         - estilos_ids
 *     
 *     menus:
 *       type: object
 *       properties:
 *         menus:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               definicao_menu:
 *                 type: string
 *       required:
 *         - menus
 *     
 *     menusAtualizacao:
 *       type: object
 *       properties:
 *         menus:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               nome:
 *                 type: string
 *               definicao_menu:
 *                 type: string
 *       required:
 *         - menus
 *     
 *     menusIds:
 *       type: object
 *       properties:
 *         menus_ids:
 *           type: array
 *           items:
 *             type: integer
 *       required:
 *         - menus_ids
 *     
 *     temas:
 *       type: object
 *       properties:
 *         temas:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               definicao_tema:
 *                 type: string
 *       required:
 *         - temas
 *     
 *     temasAtualizacao:
 *       type: object
 *       properties:
 *         temas:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               nome:
 *                 type: string
 *               definicao_tema:
 *                 type: string
 *       required:
 *         - temas
 *     
 *     temasIds:
 *       type: object
 *       properties:
 *         temas_ids:
 *           type: array
 *           items:
 *             type: integer
 *       required:
 *         - temas_ids
 *     
 *     regras:
 *       type: object
 *       properties:
 *         regras:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               regra:
 *                 type: string
 *       required:
 *         - regras
 *     
 *     regrasAtualizacao:
 *       type: object
 *       properties:
 *         regras:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               nome:
 *                 type: string
 *               regra:
 *                 type: string
 *       required:
 *         - regras
 *     
 *     regrasIds:
 *       type: object
 *       properties:
 *         regras_ids:
 *           type: array
 *           items:
 *             type: integer
 *       required:
 *         - regras_ids
 *     
 *     grupoEstilos:
 *       type: object
 *       properties:
 *         grupo_estilos:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *       required:
 *         - grupo_estilos
 *     
 *     grupoEstilosAtualizacao:
 *       type: object
 *       properties:
 *         grupo_estilos:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               nome:
 *                 type: string
 *       required:
 *         - grupo_estilos
 *     
 *     grupoEstilosIds:
 *       type: object
 *       properties:
 *         grupo_estilos_ids:
 *           type: array
 *           items:
 *             type: integer
 *       required:
 *         - grupo_estilos_ids
 *     
 *     qgisModels:
 *       type: object
 *       properties:
 *         modelos:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               model_xml:
 *                 type: string
 *       required:
 *         - modelos
 *     
 *     atualizaQgisModels:
 *       type: object
 *       properties:
 *         modelos:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               model_xml:
 *                 type: string
 *       required:
 *         - modelos
 *     
 *     qgisModelsIds:
 *       type: object
 *       properties:
 *         modelos_ids:
 *           type: array
 *           items:
 *             type: integer
 *       required:
 *         - modelos_ids
 *     
 *     unidadeTrabalhoBloco:
 *       type: object
 *       properties:
 *         unidade_trabalho_ids:
 *           type: array
 *           items:
 *             type: integer
 *         bloco_id:
 *           type: integer
 *       required:
 *         - unidade_trabalho_ids
 *         - bloco_id
 *     
 *     unidadeTrabalhoReshape:
 *       type: object
 *       properties:
 *         unidade_trabalho_id:
 *           type: integer
 *         reshape_geom:
 *           type: string
 *       required:
 *         - unidade_trabalho_id
 *         - reshape_geom
 *     
 *     unidadeTrabalhoCut:
 *       type: object
 *       properties:
 *         unidade_trabalho_id:
 *           type: integer
 *         cut_geoms:
 *           type: array
 *           items:
 *             type: string
 *       required:
 *         - unidade_trabalho_id
 *         - cut_geoms
 *     
 *     unidadeTrabalhoMerge:
 *       type: object
 *       properties:
 *         unidade_trabalho_ids:
 *           type: array
 *           items:
 *             type: integer
 *         merge_geom:
 *           type: string
 *       required:
 *         - unidade_trabalho_ids
 *         - merge_geom
 *     
 *     linhaProducao:
 *       type: object
 *       properties:
 *         linha_producao:
 *           type: object
 *           properties:
 *             nome:
 *               type: string
 *             descricao:
 *               type: string
 *             nome_abrev:
 *               type: string
 *             tipo_produto_id:
 *               type: integer
 *             fases:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   tipo_fase_id:
 *                     type: integer
 *                   ordem:
 *                     type: integer
 *                   subfases:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         nome:
 *                           type: string
 *                         ordem:
 *                           type: integer
 *                   pre_requisito_subfase:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         subfase_anterior:
 *                           type: string
 *                         subfase_posterior:
 *                           type: string
 *                         tipo_pre_requisito_id:
 *                           type: integer
 *             propriedades_camadas:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   schema:
 *                     type: string
 *                   camada:
 *                     type: string
 *                   subfase:
 *                     type: string
 *                   camada_apontamento:
 *                     type: boolean
 *                   camada_incomum:
 *                     type: boolean
 *                   atributo_filtro_subfase:
 *                     type: string
 *                   atributo_situacao_correcao:
 *                     type: string
 *                   atributo_justificativa_apontamento:
 *                     type: string
 *       required:
 *         - linha_producao
 *     
 *     listaAtividades:
 *       type: object
 *       properties:
 *         atividades_ids:
 *           type: array
 *           items:
 *             type: integer
 *       required:
 *         - atividades_ids
 *     
 *     unidadeTrabalhoEtapa:
 *       type: object
 *       properties:
 *         unidade_trabalho_ids:
 *           type: array
 *           items:
 *             type: integer
 *         etapa_ids:
 *           type: array
 *           items:
 *             type: integer
 *       required:
 *         - unidade_trabalho_ids
 *         - etapa_ids
 *     
 *     gerenciadorFME:
 *       type: object
 *       properties:
 *         gerenciador_fme:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *       required:
 *         - gerenciador_fme
 *     
 *     gerenciadorFMEUpdate:
 *       type: object
 *       properties:
 *         gerenciador_fme:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               url:
 *                 type: string
 *       required:
 *         - gerenciador_fme
 *     
 *     gerenciadorFMEIds:
 *       type: object
 *       properties:
 *         servidores_id:
 *           type: array
 *           items:
 *             type: integer
 *       required:
 *         - servidores_id
 *     
 *     camadasIds:
 *       type: object
 *       properties:
 *         camadas_ids:
 *           type: array
 *           items:
 *             type: integer
 *       required:
 *         - camadas_ids
 *     
 *     camadas:
 *       type: object
 *       properties:
 *         camadas:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               schema:
 *                 type: string
 *               nome:
 *                 type: string
 *       required:
 *         - camadas
 *     
 *     camadasAtualizacao:
 *       type: object
 *       properties:
 *         camadas:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               schema:
 *                 type: string
 *               nome:
 *                 type: string
 *       required:
 *         - camadas
 *     
 *     perfilFMEIds:
 *       type: object
 *       properties:
 *         perfil_fme_ids:
 *           type: array
 *           items:
 *             type: integer
 *       required:
 *         - perfil_fme_ids
 *     
 *     perfilModeloIds:
 *       type: object
 *       properties:
 *         perfil_modelo_ids:
 *           type: array
 *           items:
 *             type: integer
 *       required:
 *         - perfil_modelo_ids
 *     
 *     perfilMenuIds:
 *       type: object
 *       properties:
 *         perfil_menu_ids:
 *           type: array
 *           items:
 *             type: integer
 *       required:
 *         - perfil_menu_ids
 *     
 *     perfilLinhagemIds:
 *       type: object
 *       properties:
 *         perfil_linhagem_ids:
 *           type: array
 *           items:
 *             type: integer
 *       required:
 *         - perfil_linhagem_ids
 *     
 *     perfilRequisitoIds:
 *       type: object
 *       properties:
 *         perfil_requisito_ids:
 *           type: array
 *           items:
 *             type: integer
 *       required:
 *         - perfil_requisito_ids
 *     
 *     perfilRegrasIds:
 *       type: object
 *       properties:
 *         perfil_regras_ids:
 *           type: array
 *           items:
 *             type: integer
 *       required:
 *         - perfil_regras_ids
 *     
 *     perfilEstilosIds:
 *       type: object
 *       properties:
 *         perfil_estilos_ids:
 *           type: array
 *           items:
 *             type: integer
 *       required:
 *         - perfil_estilos_ids
 *     
 *     perfilTemasIds:
 *       type: object
 *       properties:
 *         perfil_temas_ids:
 *           type: array
 *           items:
 *             type: integer
 *       required:
 *         - perfil_temas_ids
 *     
 *     perfisFME:
 *       type: object
 *       properties:
 *         perfis_fme:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               gerenciador_fme_id:
 *                 type: integer
 *               rotina:
 *                 type: integer
 *               requisito_finalizacao:
 *                 type: boolean
 *               tipo_rotina_id:
 *                 type: integer
 *               subfase_id:
 *                 type: integer
 *               lote_id:
 *                 type: integer
 *               ordem:
 *                 type: integer
 *       required:
 *         - perfis_fme
 *     
 *     perfisModelo:
 *       type: object
 *       properties:
 *         perfis_modelo:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               qgis_model_id:
 *                 type: integer
 *               parametros:
 *                 type: string
 *               requisito_finalizacao:
 *                 type: boolean
 *               tipo_rotina_id:
 *                 type: integer
 *               subfase_id:
 *                 type: integer
 *               lote_id:
 *                 type: integer
 *               ordem:
 *                 type: integer
 *       required:
 *         - perfis_modelo
 *     
 *     perfisMenu:
 *       type: object
 *       properties:
 *         perfis_menu:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               menu_id:
 *                 type: integer
 *               menu_revisao:
 *                 type: boolean
 *               subfase_id:
 *                 type: integer
 *               lote_id:
 *                 type: integer
 *       required:
 *         - perfis_menu
 *     
 *     perfisLinhagem:
 *       type: object
 *       properties:
 *         perfis_linhagem:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               tipo_exibicao_id:
 *                 type: integer
 *               subfase_id:
 *                 type: integer
 *               lote_id:
 *                 type: integer
 *       required:
 *         - perfis_linhagem
 *     
 *     perfilRegras:
 *       type: object
 *       properties:
 *         perfis_regras:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               layer_rules_id:
 *                 type: integer
 *               subfase_id:
 *                 type: integer
 *               lote_id:
 *                 type: integer
 *       required:
 *         - perfis_regras
 *     
 *     perfilEstilos:
 *       type: object
 *       properties:
 *         perfis_estilos:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               grupo_estilo_id:
 *                 type: integer
 *               subfase_id:
 *                 type: integer
 *               lote_id:
 *                 type: integer
 *       required:
 *         - perfis_estilos
 *     
 *     perfilTemas:
 *       type: object
 *       properties:
 *         perfis_temas:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               tema_id:
 *                 type: integer
 *               subfase_id:
 *                 type: integer
 *               lote_id:
 *                 type: integer
 *       required:
 *         - perfis_temas
 *     
 *     perfisRequisito:
 *       type: object
 *       properties:
 *         perfis_requisito:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               descricao:
 *                 type: string
 *               ordem:
 *                 type: integer
 *               subfase_id:
 *                 type: integer
 *               lote_id:
 *                 type: integer
 *       required:
 *         - perfis_requisito
 *     
 *     perfilAlias:
 *       type: object
 *       properties:
 *         perfis_alias:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               alias_id:
 *                 type: integer
 *               subfase_id:
 *                 type: integer
 *               lote_id:
 *                 type: integer
 *       required:
 *         - perfis_alias
 *     
 *     alias:
 *       type: object
 *       properties:
 *         alias:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               definicao_alias:
 *                 type: string
 *       required:
 *         - alias
 *     
 *     perfilConfiguracaoQgis:
 *       type: object
 *       properties:
 *         perfis_configuracao_qgis:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               tipo_configuracao_id:
 *                 type: integer
 *               parametros:
 *                 type: string
 *               subfase_id:
 *                 type: integer
 *               lote_id:
 *                 type: integer
 *       required:
 *         - perfis_configuracao_qgis
 *     
 *     perfilDificuldadeOperador:
 *       type: object
 *       properties:
 *         perfis_dificuldade_operador:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               usuario_id:
 *                 type: integer
 *               subfase_id:
 *                 type: integer
 *               lote_id:
 *                 type: integer
 *               tipo_perfil_dificuldade_id:
 *                 type: integer
 *       required:
 *         - perfis_dificuldade_operador
 *     
 *     configuracaoLoteCopiar:
 *       type: object
 *       properties:
 *         lote_id_origem:
 *           type: integer
 *         lote_id_destino:
 *           type: integer
 *         copiar_estilo:
 *           type: boolean
 *         copiar_menu:
 *           type: boolean
 *         copiar_regra:
 *           type: boolean
 *         copiar_modelo:
 *           type: boolean
 *         copiar_workflow:
 *           type: boolean
 *         copiar_alias:
 *           type: boolean
 *         copiar_linhagem:
 *           type: boolean
 *         copiar_finalizacao:
 *           type: boolean
 *         copiar_tema:
 *           type: boolean
 *         copiar_fme:
 *           type: boolean
 *         copiar_configuracao_qgis:
 *           type: boolean
 *         copiar_monitoramento:
 *           type: boolean
 *       required:
 *         - lote_id_origem
 *         - lote_id_destino
 *         - copiar_estilo
 *         - copiar_menu
 *         - copiar_regra
 *         - copiar_modelo
 *         - copiar_workflow
 *         - copiar_alias
 *         - copiar_linhagem
 *         - copiar_finalizacao
 *         - copiar_tema
 *         - copiar_fme
 *         - copiar_configuracao_qgis
 *         - copiar_monitoramento
 *     
 *     unidadeTrabalhoId:
 *       type: object
 *       properties:
 *         unidade_trabalho_ids:
 *           type: array
 *           items:
 *             type: integer
 *       required:
 *         - unidade_trabalho_ids
 *     
 *     unidadeTrabalhoCopiar:
 *       type: object
 *       properties:
 *         subfase_ids:
 *           type: array
 *           items:
 *             type: integer
 *         unidade_trabalho_ids:
 *           type: array
 *           items:
 *             type: integer
 *         associar_insumos:
 *           type: boolean
 *       required:
 *         - subfase_ids
 *         - unidade_trabalho_ids
 *         - associar_insumos
 *     
 *     associaInsumos:
 *       type: object
 *       properties:
 *         unidade_trabalho_ids:
 *           type: array
 *           items:
 *             type: integer
 *         grupo_insumo_id:
 *           type: integer
 *         estrategia_id:
 *           type: integer
 *         caminho_padrao:
 *           type: string
 *       required:
 *         - unidade_trabalho_ids
 *         - grupo_insumo_id
 *         - estrategia_id
 *         - caminho_padrao
 *     
 *     associaInsumosBloco:
 *       type: object
 *       properties:
 *         bloco_id:
 *           type: integer
 *         subfase_ids:
 *           type: array
 *           items:
 *             type: integer
 *         grupo_insumo_id:
 *           type: integer
 *         estrategia_id:
 *           type: integer
 *         caminho_padrao:
 *           type: string
 *       required:
 *         - bloco_id
 *         - subfase_ids
 *         - grupo_insumo_id
 *         - estrategia_id
 *         - caminho_padrao
 *     
 *     deletaInsumos:
 *       type: object
 *       properties:
 *         unidade_trabalho_ids:
 *           type: array
 *           items:
 *             type: integer
 *         grupo_insumo_id:
 *           type: integer
 *       required:
 *         - unidade_trabalho_ids
 *         - grupo_insumo_id
 *     
 *     produtos:
 *       type: object
 *       properties:
 *         produtos:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               uuid:
 *                 type: string
 *                 format: uuid
 *               nome:
 *                 type: string
 *               mi:
 *                 type: string
 *               inom:
 *                 type: string
 *               denominador_escala:
 *                 type: string
 *               edicao:
 *                 type: string
 *               geom:
 *                 type: string
 *         lote_id:
 *           type: integer
 *       required:
 *         - produtos
 *         - lote_id
 *     
 *     insumos:
 *       type: object
 *       properties:
 *         insumos:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               caminho:
 *                 type: string
 *               epsg:
 *                 type: string
 *               geom:
 *                 type: string
 *         tipo_insumo:
 *           type: integer
 *         grupo_insumo:
 *           type: integer
 *       required:
 *         - insumos
 *         - tipo_insumo
 *         - grupo_insumo
 *     
 *     unidadesTrabalho:
 *       type: object
 *       properties:
 *         unidades_trabalho:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               epsg:
 *                 type: string
 *               observacao:
 *                 type: string
 *               geom:
 *                 type: string
 *               dado_producao_id:
 *                 type: integer
 *               bloco_id:
 *                 type: integer
 *               disponivel:
 *                 type: boolean
 *               prioridade:
 *                 type: integer
 *               dificuldade:
 *                 type: integer
 *               tempo_estimado_minutos:
 *                 type: integer
 *         subfase_ids:
 *           type: array
 *           items:
 *             type: integer
 *         lote_id:
 *           type: integer
 *       required:
 *         - unidades_trabalho
 *         - subfase_ids
 *         - lote_id
 *     
 *     todasAtividades:
 *       type: object
 *       properties:
 *         lote_id:
 *           type: integer
 *         atividades_revisao:
 *           type: boolean
 *         atividades_revisao_correcao:
 *           type: boolean
 *         atividades_revisao_final:
 *           type: boolean
 *       required:
 *         - lote_id
 *         - atividades_revisao
 *         - atividades_revisao_correcao
 *         - atividades_revisao_final
 *     
 *     padrao_etapa:
 *       type: object
 *       properties:
 *         padrao_cq:
 *           type: integer
 *         fase_id:
 *           type: integer
 *         lote_id:
 *           type: integer
 *       required:
 *         - padrao_cq
 *         - fase_id
 *         - lote_id
 *     
 *     grupoInsumoId:
 *       type: object
 *       properties:
 *         grupo_insumos_ids:
 *           type: array
 *           items:
 *             type: integer
 *       required:
 *         - grupo_insumos_ids
 *     
 *     grupoInsumo:
 *       type: object
 *       properties:
 *         grupo_insumos:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *       required:
 *         - grupo_insumos
 *     
 *     grupoInsumoAtualizacao:
 *       type: object
 *       properties:
 *         grupo_insumos:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               nome:
 *                 type: string
 *       required:
 *         - grupo_insumos
 *     
 *     projeto:
 *       type: object
 *       properties:
 *         projetos:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               nome_abrev:
 *                 type: string
 *               descricao:
 *                 type: string
 *               finalizado:
 *                 type: boolean
 *       required:
 *         - projetos
 *     
 *     projetoUpdate:
 *       type: object
 *       properties:
 *         projetos:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               nome:
 *                 type: string
 *               nome_abrev:
 *                 type: string
 *               descricao:
 *                 type: string
 *               finalizado:
 *                 type: boolean
 *       required:
 *         - projetos
 *     
 *     projetoIds:
 *       type: object
 *       properties:
 *         projeto_ids:
 *           type: array
 *           items:
 *             type: integer
 *       required:
 *         - projeto_ids
 *     
 *     lotes:
 *       type: object
 *       properties:
 *         lotes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               nome_abrev:
 *                 type: string
 *               denominador_escala:
 *                 type: integer
 *               linha_producao_id:
 *                 type: integer
 *               projeto_id:
 *                 type: integer
 *               descricao:
 *                 type: string
 *       required:
 *         - lotes
 *     
 *     loteUpdate:
 *       type: object
 *       properties:
 *         lotes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               nome:
 *                 type: string
 *               nome_abrev:
 *                 type: string
 *               denominador_escala:
 *                 type: integer
 *               linha_producao_id:
 *                 type: integer
 *               projeto_id:
 *                 type: integer
 *               descricao:
 *                 type: string
 *       required:
 *         - lotes
 *     
 *     loteIds:
 *       type: object
 *       properties:
 *         lote_ids:
 *           type: array
 *           items:
 *             type: integer
 *       required:
 *         - lote_ids
 *     
 *     blocos:
 *       type: object
 *       properties:
 *         blocos:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               prioridade:
 *                 type: integer
 *               lote_id:
 *                 type: integer
 *       required:
 *         - blocos
 *     
 *     blocoUpdate:
 *       type: object
 *       properties:
 *         blocos:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               nome:
 *                 type: string
 *               prioridade:
 *                 type: integer
 *               lote_id:
 *                 type: integer
 *       required:
 *         - blocos
 *     
 *     blocoIds:
 *       type: object
 *       properties:
 *         bloco_ids:
 *           type: array
 *           items:
 *             type: integer
 *       required:
 *         - bloco_ids
 *     
 *     dadoProducao:
 *       type: object
 *       properties:
 *         dado_producao:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               tipo_dado_producao_id:
 *                 type: integer
 *               configuracao_producao:
 *                 type: string
 *       required:
 *         - dado_producao
 *     
 *     dadoProducaoUpdate:
 *       type: object
 *       properties:
 *         dado_producao:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               tipo_dado_producao_id:
 *                 type: integer
 *               configuracao_producao:
 *                 type: string
 *       required:
 *         - dado_producao
 *     
 *     dadoProducaoIds:
 *       type: object
 *       properties:
 *         dado_producao_ids:
 *           type: array
 *           items:
 *             type: integer
 *       required:
 *         - dado_producao_ids
 *     
 *     perfilAliasIds:
 *       type: object
 *       properties:
 *         perfis_alias_ids:
 *           type: array
 *           items:
 *             type: integer
 *       required:
 *         - perfis_alias_ids
 *     
 *     aliasIds:
 *       type: object
 *       properties:
 *         alias_ids:
 *           type: array
 *           items:
 *             type: integer
 *       required:
 *         - alias_ids
 *     
 *     perfilConfiguracaoQgisIds:
 *       type: object
 *       properties:
 *         perfis_configuracao_qgis_ids:
 *           type: array
 *           items:
 *             type: integer
 *       required:
 *         - perfis_configuracao_qgis_ids
 *     
 *     perfilDificuldadeOperadorIds:
 *       type: object
 *       properties:
 *         perfis_dificuldade_operador_ids:
 *           type: array
 *           items:
 *             type: integer
 *       required:
 *         - perfis_dificuldade_operador_ids
 *     
 *     perfilWorkflowDsgtools:
 *       type: object
 *       properties:
 *         perfil_workflow_dsgtools:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               workflow_dsgtools_id:
 *                 type: integer
 *               subfase_id:
 *                 type: integer
 *               lote_id:
 *                 type: integer
 *               requisito_finalizacao:
 *                 type: boolean
 *       required:
 *         - perfil_workflow_dsgtools
 *     
 *     workflows:
 *       type: object
 *       properties:
 *         workflows:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               workflow_json:
 *                 type: string
 *       required:
 *         - workflows
 *     
 *     workflowsIds:
 *       type: object
 *       properties:
 *         workflows_ids:
 *           type: array
 *           items:
 *             type: integer
 *       required:
 *         - workflows_ids
 */

module.exports = models
