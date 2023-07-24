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
        dificuldade: Joi.number().integer().strict().required()
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

module.exports = models
