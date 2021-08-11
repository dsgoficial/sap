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
        stylesld: Joi.string().required(),
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
        nome_menu: Joi.string().required(),
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
        nome_menu: Joi.string().required(),
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

models.regras = Joi.object().keys({
  regras: Joi.array()
    .items(
      Joi.object().keys({
        grupo_regra_id: Joi.number().integer().strict().required(),
        schema: Joi.string().required(),
        camada: Joi.string().required(),
        atributo: Joi.string().required(),
        regra: Joi.string().required(),
        descricao: Joi.string().required()
      })
    )
    .required()
})

models.regrasAtualizacao = Joi.object().keys({
  regras: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        grupo_regra_id: Joi.number().integer().strict().required(),
        schema: Joi.string().required(),
        camada: Joi.string().required(),
        atributo: Joi.string().required(),
        regra: Joi.string().required(),
        descricao: Joi.string().required()
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

models.grupoRegras = Joi.object().keys({
  grupo_regras: Joi.array()
    .items(
      Joi.object().keys({
        grupo_regra: Joi.string().required(),
        cor_rgb: Joi.string().required(),
        ordem: Joi.number().integer().strict().required()
      })
    )
    .required()
})

models.grupoRegrasAtualizacao = Joi.object().keys({
  grupo_regras: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        grupo_regra: Joi.string().required(),
        cor_rgb: Joi.string().required(),
        ordem: Joi.number().integer().strict().required()
      })
    )
    .unique('id')
    .required()
    .min(1)
})

models.grupoRegrasIds = Joi.object().keys({
  grupo_regras_ids: Joi.array()
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
  etapa_id: Joi.number().integer().strict().required()
})

models.gerenciadorFME = Joi.object().keys({
  gerenciador_fme: Joi.array()
    .items(
      Joi.object().keys({
        servidor: Joi.string().required(),
        porta: Joi.string().strict().required()
      })
    )
    .unique((a, b) => a.servidor === b.servidor && a.porta === b.porta)
    .required()
    .min(1)
})

models.gerenciadorFMEUpdate = Joi.object().keys({
  gerenciador_fme: Joi.array()
    .items(
      Joi.object().keys({
        id: Joi.number().integer().strict().required(),
        servidor: Joi.string().required(),
        porta: Joi.string().strict().required()
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
        nome: Joi.string().required(),
        alias: Joi.string().required().allow('')
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
        alias: Joi.string().required().allow('')
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

models.perfisFME = Joi.object().keys({
  perfis_fme: Joi.array()
    .items(
      Joi.object().keys({
        gerenciador_fme_id: Joi.number().integer().strict().required(),
        rotina: Joi.number().integer().strict().required(),
        requisito_finalizacao: Joi.boolean().strict().required(),
        gera_falso_positivo: Joi.boolean().strict().required(),
        subfase_id: Joi.number().integer().strict().required(),
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
        gera_falso_positivo: Joi.boolean().strict().required(),
        subfase_id: Joi.number().integer().strict().required(),
        ordem: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1)
})

models.perfilRegras = Joi.object().keys({
  perfis_regras: Joi.array()
    .items(
      Joi.object().keys({
        grupo_regra_id: Joi.number().integer().strict().required(),
        subfase_id: Joi.number().integer().strict().required()
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
        grupo_regra_id: Joi.number().integer().strict().required(),
        subfase_id: Joi.number().integer().strict().required()
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
        subfase_id: Joi.number().integer().strict().required()
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
        subfase_id: Joi.number().integer().strict().required()
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
        gera_falso_positivo: Joi.boolean().strict().required(),
        subfase_id: Joi.number().integer().strict().required(),
        ordem: Joi.number().integer().strict().required()
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
        gera_falso_positivo: Joi.boolean().strict().required(),
        subfase_id: Joi.number().integer().strict().required(),
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
  unidade_trabalho_ids: Joi.array()
    .items(Joi.number().integer().strict())
    .unique()
    .required()
    .min(1),
  etapa_ids: Joi.array()
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
        escala: Joi.string().required(),
        geom: Joi.string().required()
      })
    )
    .unique('uuid')
    .required()
    .min(1),
  linha_producao_id: Joi.number().integer().strict().required()
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
        prioridade: Joi.number().integer().strict().required()
      })
    )
    .required()
    .min(1),
  subfase_id: Joi.number().integer().strict().required()
})

module.exports = models
