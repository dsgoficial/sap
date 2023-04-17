'use strict'

const { db } = require('../database')

const { AppError, httpCode } = require('../utils')

const { DB_USER, DB_PASSWORD } = require('../config')


const {
  checkFMEConnection,
  validadeParameters
} = require('../gerenciador_fme')

const controller = {}

controller.getTipoProduto = async () => {
  return db.sapConn
    .any('SELECT code, nome FROM dominio.tipo_produto')
}

controller.getTipoRotina = async () => {
  return db.sapConn
    .any('SELECT code, nome FROM dominio.tipo_rotina')
}


controller.getTipoCQ = async () => {
  return db.sapConn
    .any('SELECT code, nome FROM dominio.tipo_controle_qualidade')
}

controller.getTipoCriacaoUnidadeTrabalho = async () => {
  return db.sapConn.any('SELECT code, nome FROM dominio.tipo_criacao_unidade_trabalho')
}

controller.getTipoFase = async () => {
  return db.sapConn
    .any('SELECT code, nome FROM dominio.tipo_fase')
}

controller.getTipoPreRequisito = async () => {
  return db.sapConn
    .any('SELECT code, nome FROM metadado.tipo_palavra_chave')
}

controller.getTipoEtapa = async () => {
  return db.sapConn
    .any('SELECT code, nome FROM dominio.tipo_etapa')
}

controller.getTipoExibicao = async () => {
  return db.sapConn
    .any('SELECT code, nome FROM dominio.tipo_exibicao')
}

controller.getTipoRestricao = async () => {
  return db.sapConn
    .any('SELECT code, nome FROM dominio.tipo_restricao')
}

controller.getTipoInsumo = async () => {
  return db.sapConn
    .any('SELECT code, nome FROM dominio.tipo_insumo')
}

controller.getTipoDadoProducao = async () => {
  return db.sapConn
    .any('SELECT code, nome FROM dominio.tipo_dado_producao')
}

const getUsuarioNomeById = async usuarioId => {
  const usuario = await db.sapConn.one(
    `SELECT tpg.nome_abrev || ' ' || u.nome_guerra as posto_nome FROM dgeo.usuario as u
    INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
    WHERE u.id = $<usuarioId>`,
    { usuarioId }
  )
  return usuario.posto_nome
}

controller.getGrupoEstilos = async () => {
  return db.sapConn
    .any('SELECT id, nome FROM dgeo.group_styles')
}


controller.gravaGrupoEstilos = async (grupoEstilos, usuarioId) => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      'nome'
    ])

    const query = db.pgp.helpers.insert(grupoEstilos, cs, {
      table: 'group_styles',
      schema: 'dgeo'
    })

    await t.none(query)
  })
}

controller.atualizaGrupoEstilos = async (grupoEstilos, usuarioId) => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'nome'
    ])

    const query =
      db.pgp.helpers.update(
        grupoEstilos,
        cs,
        { table: 'group_styles', schema: 'dgeo' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.deletaGrupoEstilos = async grupoEstilosId => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM dgeo.group_styles
      WHERE id in ($<grupoEstilosId:csv>)`,
      { grupoEstilosId }
    )
    if (exists && exists.length < grupoEstilosId.length) {
      throw new AppError(
        'O id informado não corresponde a um grupo de estilos',
        httpCode.BadRequest
      )
    }

    const existsAssociation1 = await t.any(
      `SELECT id FROM macrocontrole.perfil_estilo
      WHERE grupo_estilo_id in ($<grupoEstilosId:csv>)`,
      { grupoEstilosId }
    )
    if (existsAssociation1 && existsAssociation1.length > 0) {
      throw new AppError(
        'O grupo de estilos possui perfil de estilos associados',
        httpCode.BadRequest
      )
    }

    const existsAssociation2 = await t.any(
      `SELECT id FROM dgeo.layer_styles 
      WHERE grupo_estilo_id in ($<grupoEstilosId:csv>)`,
      { grupoEstilosId }
    )
    if (existsAssociation2 && existsAssociation2.length > 0) {
      throw new AppError(
        'O grupo de estilos possui estilos associados',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM dgeo.group_styles
      WHERE id in ($<grupoEstilosId:csv>)`,
      { grupoEstilosId }
    )
  })
}

controller.getEstilos = async () => {
  return db.sapConn
    .any(`SELECT ls.id, ls.grupo_estilo_id, ls.f_table_schema, ls.f_table_name, ls.f_geometry_column, gs.nome AS stylename, ls.styleqml, ls.stylesld, ls.ui, ls.owner, ls.update_time
    FROM dgeo.layer_styles AS ls
    INNER JOIN dgeo.group_styles AS gs ON gs.id = ls.grupo_estilo_id
    `)
}

controller.gravaEstilos = async (estilos, usuarioId) => {
  return db.sapConn.tx(async t => {
    const usuarioPostoNome = getUsuarioNomeById(usuarioId)

    const cs = new db.pgp.helpers.ColumnSet([
      'f_table_schema',
      'f_table_name',
      'f_geometry_column',
      'grupo_estilo_id',
      'styleqml',
      'stylesld',
      'ui',
      { name: 'owner', init: () => usuarioPostoNome },
      { name: 'update_time', mod: ':raw', init: () => 'NOW()' }
    ])

    const query = db.pgp.helpers.insert(estilos, cs, {
      table: 'layer_styles',
      schema: 'dgeo'
    })

    await t.none(query)
  })
}

controller.atualizaEstilos = async (estilos, usuarioId) => {
  return db.sapConn.tx(async t => {
    const usuarioPostoNome = getUsuarioNomeById(usuarioId)

    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'f_table_schema',
      'f_table_name',
      'f_geometry_column',
      'grupo_estilo_id',
      'styleqml',
      'stylesld',
      'ui',
      { name: 'owner', init: () => usuarioPostoNome },
      { name: 'update_time', mod: ':raw', init: () => 'NOW()' }
    ])

    const query =
      db.pgp.helpers.update(
        estilos,
        cs,
        { table: 'layer_styles', schema: 'dgeo' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.deletaEstilos = async estilosId => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM dgeo.layer_styles
      WHERE id in ($<estilosId:csv>)`,
      { estilosId }
    )
    if (exists && exists.length < estilosId.length) {
      throw new AppError(
        'O id informado não corresponde a um estilo',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM dgeo.layer_styles
      WHERE id in ($<estilosId:csv>)`,
      { estilosId }
    )
  })
}

controller.getRegras = async () => {
  return db.sapConn.any(`
    SELECT lr.id, lr.nome, lr.regra, lr.owner, lr.update_time
    FROM dgeo.layer_rules AS lr
    `)
}

controller.gravaRegras = async (layerRules, usuarioId) => {
  const usuarioPostoNome = getUsuarioNomeById(usuarioId)
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      'nome',
      'regra',
      { name: 'owner', init: () => usuarioPostoNome },
      { name: 'update_time', mod: ':raw', init: () => 'NOW()' }
    ])

    const query = db.pgp.helpers.insert(layerRules, cs, {
      table: 'layer_rules',
      schema: 'dgeo'
    })

    await t.none(query)
  })
}

controller.atualizaRegras = async (layerRules, usuarioId) => {
  const usuarioPostoNome = getUsuarioNomeById(usuarioId)
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'nome',
      'regra',
      { name: 'owner', init: () => usuarioPostoNome },
      { name: 'update_time', mod: ':raw', init: () => 'NOW()' }
    ])

    const query =
      db.pgp.helpers.update(
        layerRules,
        cs,
        { table: 'layer_rules', schema: 'dgeo' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.deletaRegras = async layerRulesId => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM dgeo.layer_rules
      WHERE id in ($<layerRulesId:csv>)`,
      { layerRulesId }
    )
    if (exists && exists.length < layerRulesId.length) {
      throw new AppError(
        'O id informado não corresponde a um grupo de regras',
        httpCode.BadRequest
      )
    }

    const existsAssociation1 = await t.any(
      `SELECT id FROM macrocontrole.perfil_regras 
      WHERE layer_rules_id in ($<layerRulesId:csv>)`,
      { layerRulesId }
    )
    if (existsAssociation1 && existsAssociation1.length > 0) {
      throw new AppError(
        'O grupo regras possui perfil de regras associadas',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM dgeo.layer_rules
      WHERE id in ($<layerRulesId:csv>)`,
      { layerRulesId }
    )
  })
}

controller.getModelos = async () => {
  return db.sapConn.any(
    'SELECT id, nome, descricao, model_xml, owner, update_time FROM dgeo.qgis_models'
  )
}

controller.gravaModelos = async (modelos, usuarioId) => {
  return db.sapConn.tx(async t => {
    const usuarioPostoNome = getUsuarioNomeById(usuarioId)

    const cs = new db.pgp.helpers.ColumnSet([
      'nome',
      'descricao',
      'model_xml',
      { name: 'owner', init: () => usuarioPostoNome },
      { name: 'update_time', mod: ':raw', init: () => 'NOW()' }
    ])

    const query = db.pgp.helpers.insert(modelos, cs, {
      table: 'qgis_models',
      schema: 'dgeo'
    })

    await t.none(query)
  })
}

controller.atualizaModelos = async (modelos, usuarioId) => {
  return db.sapConn.tx(async t => {
    const usuarioPostoNome = getUsuarioNomeById(usuarioId)

    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'nome',
      'descricao',
      'model_xml',
      { name: 'owner', init: () => usuarioPostoNome },
      { name: 'update_time', mod: ':raw', init: () => 'NOW()' }
    ])

    const query =
      db.pgp.helpers.update(
        modelos,
        cs,
        { table: 'qgis_models', schema: 'dgeo' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.deletaModelos = async modelosId => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM dgeo.qgis_models
      WHERE id in ($<modelosId:csv>)`,
      { modelosId }
    )
    if (exists && exists.length < modelosId.length) {
      throw new AppError(
        'O id informado não corresponde a um modelo do QGIS',
        httpCode.BadRequest
      )
    }

    const existsAssociation = await t.any(
      `SELECT id FROM macrocontrole.perfil_model_qgis 
      WHERE qgis_model_id in ($<modelosId:csv>)`,
      { modelosId }
    )
    if (existsAssociation && existsAssociation.length > 0) {
      throw new AppError(
        'O modelo possui perfis associados',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM dgeo.qgis_models
      WHERE id in ($<modelosId:csv>)`,
      { modelosId }
    )
  })
}

controller.getMenus = async () => {
  return db.sapConn.any(
    'SELECT id, nome, definicao_menu, owner, update_time FROM dgeo.qgis_menus'
  )
}

controller.gravaMenus = async (menus, usuarioId) => {
  return db.sapConn.tx(async t => {
    const usuarioPostoNome = getUsuarioNomeById(usuarioId)

    const cs = new db.pgp.helpers.ColumnSet([
      'nome',
      'definicao_menu',
      { name: 'owner', init: () => usuarioPostoNome },
      { name: 'update_time', mod: ':raw', init: () => 'NOW()' }
    ])

    const query = db.pgp.helpers.insert(menus, cs, {
      table: 'qgis_menus',
      schema: 'dgeo'
    })

    await t.none(query)
  })
}

controller.atualizaMenus = async (menus, usuarioId) => {
  return db.sapConn.tx(async t => {
    const usuarioPostoNome = getUsuarioNomeById(usuarioId)

    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'nome',
      'definicao_menu',
      { name: 'owner', init: () => usuarioPostoNome },
      { name: 'update_time', mod: ':raw', init: () => 'NOW()' }
    ])

    const query =
      db.pgp.helpers.update(
        menus,
        cs,
        { table: 'qgis_menus', schema: 'dgeo' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.deletaMenus = async menusId => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM dgeo.qgis_menus
      WHERE id in ($<menusId:csv>)`,
      { menusId }
    )
    if (exists && exists.length < menusId.length) {
      throw new AppError(
        'O id informado não corresponde a um menu',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM dgeo.qgis_menus
      WHERE id in ($<menusId:csv>)`,
      { menusId }
    )
  })
}

controller.getDadoProducao = async () => {
  return db.sapConn.any(
    `SELECT dp.id, dp.tipo_dado_producao_id, tdp.nome AS tipo_dado_producao,
    dp.configuracao_producao
    FROM macrocontrole.dado_producao AS dp
    INNER JOIN dominio.tipo_dado_producao AS tdp On tdp.code = dp.tipo_dado_producao_id`
  )
}

controller.getDatabase = async () => {
  return db.sapConn.any(
    `SELECT id, tipo_dado_producao_id, configuracao_producao,
    split_part(configuracao_producao, ':', 1) AS servidor,
    split_part(split_part(configuracao_producao, ':', 2), '/', 1) AS porta,
    split_part(split_part(configuracao_producao, ':', 2), '/', 2) AS nome
    FROM macrocontrole.dado_producao
    WHERE tipo_dado_producao_id in (2,3)`
  )
}

controller.getLogin = async () => {
  const dados = {
    login: DB_USER,
    senha: DB_PASSWORD
  }
  return dados
}

controller.getBlocos = async () => {
  return db.sapConn.any('SELECT id, nome, prioridade, lote_id FROM macrocontrole.bloco')
}

controller.unidadeTrabalhoBloco = async (unidadeTrabalhoIds, bloco) => {
  return db.sapConn.none(
    `UPDATE macrocontrole.unidade_trabalho
    SET bloco_id = $<bloco>
    WHERE id in ($<unidadeTrabalhoIds:csv>)`,
    { unidadeTrabalhoIds, bloco }
  )
}

controller.deletaAtividades = async atividadeIds => {

  const result = await db.sapConn.result(
    `
    SELECT e.etapa_anterior, e.etapa_posterior FROM
    (SELECT e.lote_id, e.id AS etapa_anterior, e.tipo_etapa_id AS tipo_etapa_anterior, lead(e.id,2) OVER (PARTITION BY e.lote_id, e.subfase_id ORDER BY e.ordem) AS etapa_posterior
    FROM macrocontrole.etapa AS e) AS e
    INNER JOIN macrocontrole.etapa AS e_post ON e_post.id = e.etapa_posterior
    WHERE e.tipo_etapa_anterior = 2 AND e_post.tipo_etapa_id = 3 AND
    (
      (e.etapa_anterior in ($<atividadeIds:csv>) AND e.etapa_posterior not in ($<atividadeIds:csv>))
      OR
      (e.etapa_anterior not in ($<atividadeIds:csv>) AND e.etapa_posterior in ($<atividadeIds:csv>))
    )
    `,
    { atividadeIds }
  )
  if (result.rowCount && result.rowCount > 0) {
    throw new AppError(
      'Atividade de correção e não deve ser deletada',
      httpCode.BadRequest
    )
  }


  return db.sapConn.none(
    `
  DELETE FROM macrocontrole.atividade
  WHERE id in ($<atividadeIds:csv>) AND tipo_situacao_id IN (1)
  `,
    { atividadeIds }
  )
}

controller.deletaAtividadesUnidadeTrabalho = async unidadeTrabalhoIds => {
  return db.sapConn.none(
    `
  DELETE FROM macrocontrole.atividade
  WHERE unidade_trabalho_id in ($<unidadeTrabalhoIds:csv>) AND tipo_situacao_id IN (1,5)
  `,
    { unidadeTrabalhoIds }
  )
}

controller.criaEtapasPadrao = async (padrao_cq, fase_id, lote_id) => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT e.id FROM macrocontrole.etapa AS e
       INNER JOIN macrocontrole.subfase AS s ON s.id = e.subfase_id
      WHERE e.lote_id = $<lote_id> AND s.fase_id = $<fase_id>`,
      { fase_id, lote_id }
    )
    if (exists && exists.length > 0) {
      throw new AppError(
        'Já existem etapas criadas em alguma subfase dessa fase',
        httpCode.BadRequest
      )
    }

    let sqlA = '';
    let sqlB = '';
    switch (padrao_cq) {
      case 1: //Sem controle de qualidade nas subfases
        sqlA = `
        INSERT INTO macrocontrole.etapa(tipo_etapa_id, subfase_id, lote_id, ordem)
        SELECT 1 AS tipo_etapa_id, s.id AS subfase_id, $<lote_id> AS lote_id, 1 AS ordem
        FROM macrocontrole.subfase AS s
        LEFT JOIN (SELECT * FROM macrocontrole.etapa AS e WHERE e.lote_id = $<lote_id> AND e.tipo_etapa_id = 1) AS e ON e.subfase_id = s.id
        WHERE s.fase_id = $<fase_id> AND e.id IS NULL;
        `
        break;
      case 2: //Uma Revisão/Correção em todas as subfases
        sqlA = `
        INSERT INTO macrocontrole.etapa(tipo_etapa_id, subfase_id, lote_id, ordem)
        SELECT 1 AS tipo_etapa_id, s.id AS subfase_id, $<lote_id> AS lote_id, 1 AS ordem
        FROM macrocontrole.subfase AS s
        LEFT JOIN (SELECT * FROM macrocontrole.etapa AS e WHERE e.lote_id = $<lote_id> AND e.tipo_etapa_id = 1) AS e ON e.subfase_id = s.id
        WHERE s.fase_id = $<fase_id> AND e.id IS NULL
        UNION
        SELECT 4 AS tipo_etapa_id, s.id AS subfase_id, $<lote_id> AS lote_id, 2 AS ordem
        FROM macrocontrole.subfase AS s
        LEFT JOIN (SELECT * FROM macrocontrole.etapa AS e WHERE e.lote_id = $<lote_id> AND e.tipo_etapa_id = 4) AS e ON e.subfase_id = s.id
        WHERE s.fase_id = $<fase_id> AND e.id IS NULL;
        `

        sqlB = `
        INSERT INTO macrocontrole.restricao_etapa(tipo_restricao_id, etapa_anterior_id, etapa_posterior_id)
        SELECT 1, e.etapa_anterior, e.etapa_posterior FROM
        (SELECT e.lote_id, e.subfase_id, e.id AS etapa_anterior, e.tipo_etapa_id AS tipo_etapa_anterior, lead(e.id,1) OVER (PARTITION BY e.lote_id, e.subfase_id ORDER BY e.ordem) AS etapa_posterior
        FROM macrocontrole.etapa AS e) AS e
        INNER JOIN macrocontrole.etapa AS e_post ON e_post.id = e.etapa_posterior
        INNER JOIN macrocontrole.subfase AS s ON s.id = e.subfase_id
        WHERE s.fase_id = $<fase_id> AND e.lote_id = $<lote_id>;
        `
        break;
      case 3: //Uma Revisão em todas as subfases
        sqlA = `
        INSERT INTO macrocontrole.etapa(tipo_etapa_id, subfase_id, lote_id, ordem)
        SELECT 1 AS tipo_etapa_id, s.id AS subfase_id, $<lote_id> AS lote_id, 1 AS ordem
        FROM macrocontrole.subfase AS s
        LEFT JOIN (SELECT * FROM macrocontrole.etapa AS e WHERE e.lote_id = $<lote_id> AND e.tipo_etapa_id = 1) AS e ON e.subfase_id = s.id
        WHERE s.fase_id = $<fase_id> AND e.id IS NULL
        UNION
        SELECT 2 AS tipo_etapa_id, s.id AS subfase_id, $<lote_id> AS lote_id, 2 AS ordem
        FROM macrocontrole.subfase AS s
        LEFT JOIN (SELECT * FROM macrocontrole.etapa AS e WHERE e.lote_id = $<lote_id> AND e.tipo_etapa_id = 2) AS e ON e.subfase_id = s.id
        WHERE s.fase_id = $<fase_id> AND e.id IS NULL
        UNION
        SELECT 3 AS tipo_etapa_id, s.id AS subfase_id, $<lote_id> AS lote_id, 3 AS ordem
        FROM macrocontrole.subfase AS s
        LEFT JOIN (SELECT * FROM macrocontrole.etapa AS e WHERE e.lote_id = $<lote_id> AND e.tipo_etapa_id = 3) AS e ON e.subfase_id = s.id 
        WHERE s.fase_id = $<fase_id> AND e.id IS NULL;
        `

        sqlB = `
        INSERT INTO macrocontrole.restricao_etapa(tipo_restricao_id, etapa_anterior_id, etapa_posterior_id)
        SELECT 1, e.etapa_anterior, e.etapa_posterior FROM
        (SELECT e.lote_id, e.subfase_id, e.id AS etapa_anterior, e.tipo_etapa_id AS tipo_etapa_anterior, lead(e.id,1) OVER (PARTITION BY e.lote_id, e.subfase_id ORDER BY e.ordem) AS etapa_posterior
        FROM macrocontrole.etapa AS e) AS e
        INNER JOIN macrocontrole.etapa AS e_post ON e_post.id = e.etapa_posterior
        INNER JOIN macrocontrole.subfase AS s ON s.id = e.subfase_id
        WHERE s.fase_id = $<fase_id> AND e.lote_id = $<lote_id> AND e.tipo_etapa_anterior = 1;

        INSERT INTO macrocontrole.restricao_etapa(tipo_restricao_id, etapa_anterior_id, etapa_posterior_id)
        SELECT 2, e.etapa_anterior, e.etapa_posterior FROM
        (SELECT e.lote_id, e.subfase_id, e.id AS etapa_anterior, e.tipo_etapa_id AS tipo_etapa_anterior, lead(e.id,2) OVER (PARTITION BY e.lote_id, e.subfase_id ORDER BY e.ordem) AS etapa_posterior
        FROM macrocontrole.etapa AS e) AS e
        INNER JOIN macrocontrole.etapa AS e_post ON e_post.id = e.etapa_posterior
        INNER JOIN macrocontrole.subfase AS s ON s.id = e.subfase_id
        WHERE s.fase_id = $<fase_id> AND e.lote_id = $<lote_id> AND e.tipo_etapa_anterior = 1;
        `
        break;
      default:
        throw new AppError(
          'Valor inválido para Padrão CQ',
          httpCode.BadRequest
        )
    }

    const result = await t.result(
      sqlA+sqlB,
      { fase_id, lote_id }
    )
    if (!result.rowCount || result.rowCount === 0) {
      throw new AppError(
        'Sem etapas a serem criadas',
        httpCode.BadRequest
      )
    }
  })
}

controller.criaTodasAtividades = async (lote_id) => {
  const result = await db.sapConn.result(
    `
  INSERT INTO macrocontrole.atividade(etapa_id, unidade_trabalho_id, tipo_situacao_id)
  SELECT e.id AS etapa_id, ut.id AS unidade_trabalho_id, 1 AS tipo_situacao_id
  FROM macrocontrole.unidade_trabalho AS ut
  INNER JOIN macrocontrole.etapa AS e ON e.subfase_id = ut.subfase_id AND e.lote_id = ut.lote_id
  LEFT JOIN macrocontrole.atividade AS a ON a.etapa_id = e.id AND a.unidade_trabalho_id = ut.id
  WHERE ut.lote_id = $<lote_id> AND a.id IS NULL
  `,
    { lote_id }
  )
  if (!result.rowCount || result.rowCount === 0) {
    throw new AppError(
      'Sem atividades a serem criadas',
      httpCode.BadRequest
    )
  }
}

controller.criaAtividades = async (unidadeTrabalhoIds, etapaId) => {
  const result = await db.sapConn.result(
    `
  INSERT INTO macrocontrole.atividade(etapa_id, unidade_trabalho_id, tipo_situacao_id)
  SELECT DISTINCT $<etapaId> AS etapa_id, ut.id AS unidade_trabalho_id, 1 AS tipo_situacao_id
  FROM macrocontrole.unidade_trabalho AS ut
  INNER JOIN macrocontrole.etapa AS e ON e.subfase_id = ut.subfase_id AND e.lote_id = ut.lote_id
  LEFT JOIN (
    SELECT id, etapa_id, unidade_trabalho_id FROM macrocontrole.atividade WHERE tipo_situacao_id != 5
    ) AS a ON ut.id = a.unidade_trabalho_id AND a.etapa_id = e.id
  WHERE ut.id IN ($<unidadeTrabalhoIds:csv>) AND e.id = $<etapaId> AND a.id IS NULL
  `,
    { unidadeTrabalhoIds, etapaId }
  )
  if (!result.rowCount || result.rowCount === 0) {
    throw new AppError(
      'As atividades não podem ser criadas pois já existem.',
      httpCode.BadRequest
    )
  }
}

controller.getProjetos = async () => {
  return db.sapConn.any(
    'SELECT id, nome, nome_abrev, descricao, finalizado FROM macrocontrole.projeto'
  )
}

controller.getLinhasProducao = async () => {
  return db.sapConn.any(
    `SELECT lp.id AS linha_producao_id, lp.nome AS linha_producao, lp.tipo_produto_id, lp.descricao, tp.nome AS tipo_produto
    FROM macrocontrole.linha_producao AS lp
    INNER JOIN dominio.tipo_produto AS tp ON tp.code = lp.tipo_produto_id
    `
  )
}

controller.getFases = async () => {
  return db.sapConn.any(
    `SELECT f.id AS fase_id, tf.nome AS fase, f.tipo_fase_id, f.linha_producao_id, f.ordem,
    lp.nome AS linha_producao, tp.nome AS tipo_produto
    FROM macrocontrole.fase AS f
    INNER JOIN dominio.tipo_fase AS tf ON tf.code = f.tipo_fase_id
    INNER JOIN macrocontrole.linha_producao AS lp ON lp.id = f.linha_producao_id
    INNER JOIN dominio.tipo_produto AS tp ON tp.code = lp.tipo_produto_id`
  )
}

controller.getSubfases = async () => {
  return db.sapConn.any(
    `SELECT lp.id AS linha_producao_id, lp.nome AS linha_producao, lp.tipo_produto_id, lp.descricao, tp.nome AS tipo_produto,
    f.id AS fase_id, tf.nome AS fase, f.ordem AS ordem_fase, l.id AS lote_id, l.nome AS lote, p.id AS projeto_id, p.nome AS projeto,
    sf.id AS subfase_id, sf.nome AS subfase, l.nome_abrev AS lote_nome_abrev, p.nome_abrev AS projeto_nome_abrev
    FROM macrocontrole.linha_producao AS lp
    INNER JOIN macrocontrole.lote AS l ON l.linha_producao_id = lp.id
    INNER JOIN macrocontrole.projeto AS p ON p.id = l.projeto_id
    INNER JOIN dominio.tipo_produto AS tp ON tp.code = lp.tipo_produto_id
    INNER JOIN macrocontrole.fase AS f ON f.linha_producao_id = lp.id
    INNER JOIN dominio.tipo_fase AS tf ON tf.code = f.tipo_fase_id
    INNER JOIN macrocontrole.subfase AS sf ON sf.fase_id = f.id`
  )
}

controller.getAllSubfases = async () => {
  return db.sapConn.any(
    `SELECT lp.id AS linha_producao_id, lp.nome AS linha_producao, lp.nome_abrev AS linha_producao_nome_abrev,
    f.id AS fase_id, tf.nome AS fase, f.ordem AS ordem_fase,
    sf.id AS subfase_id, sf.nome AS subfase,
    FROM macrocontrole.linha_producao AS lp
    INNER JOIN macrocontrole.fase AS f ON f.linha_producao_id = lp.id
    INNER JOIN dominio.tipo_fase AS tf ON tf.code = f.tipo_fase_id
    INNER JOIN macrocontrole.subfase AS sf ON sf.fase_id = f.id
    ORDER BY lp.nome_abrev, f.ordem, sf.nome`
  )
}

controller.getEtapas = async () => {
  return db.sapConn.any(
    `SELECT e.id AS etapa_id, te.nome AS etapa, e.tipo_etapa_id, e.subfase_id, e.lote_id, s.nome AS subfase, e.ordem,
    tf.nome as fase, f.tipo_fase_id, f.linha_producao_id, f.ordem AS ordem_fase, l.nome AS lote,
    lp.nome AS linha_producao, tp.nome AS tipo_produto
    FROM macrocontrole.etapa AS e
    INNER JOIN dominio.tipo_etapa AS te ON te.code = e.tipo_etapa_id
    INNER JOIN macrocontrole.subfase AS s ON s.id = e.subfase_id
    INNER JOIN macrocontrole.fase AS f ON s.fase_id = f.id
    INNER JOIN dominio.tipo_fase AS tf ON tf.code = f.tipo_fase_id
    INNER JOIN macrocontrole.linha_producao AS lp ON lp.id = f.linha_producao_id
    INNER JOIN dominio.tipo_produto AS tp ON tp.code = lp.tipo_produto_id
    INNER JOIN macrocontrole.lote AS l ON l.id = e.lote_id`
  )
}

controller.getGerenciadorFME = async () => {
  return db.sapConn.any(
    `SELECT id, url
    FROM dgeo.gerenciador_fme`
  )
}

controller.criaGerenciadorFME = async servidores => {
  return db.sapConn.tx(async t => {
    for (const s of servidores) {
      const exists = await t.any(
        `SELECT id FROM dgeo.gerenciador_fme
        WHERE url = $<url>`,
        { url: s.url }
      )
      if (exists && exists.length > 0) {
        throw new AppError(
          'O servidor já está cadastrado',
          httpCode.BadRequest
        )
      }

      await checkFMEConnection(s.url)
    }

    const cs = new db.pgp.helpers.ColumnSet(['url'])

    const query = db.pgp.helpers.insert(servidores, cs, {
      table: 'gerenciador_fme',
      schema: 'dgeo'
    })

    await t.none(query)
  })
}

controller.atualizaGerenciadorFME = async servidores => {
  return db.sapConn.tx(async t => {
    for (const s of servidores) {
      await checkFMEConnection(s.url)
    }
    const cs = new db.pgp.helpers.ColumnSet(['?id', 'url'])

    const query =
      db.pgp.helpers.update(
        servidores,
        cs,
        { table: 'gerenciador_fme', schema: 'dgeo' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'

    await t.none(query)
  })
}

controller.deletaGerenciadorFME = async servidoresId => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM dgeo.gerenciador_fme
      WHERE id in ($<servidoresId:csv>)`,
      { servidoresId }
    )
    if (exists && exists.length < servidoresId.length) {
      throw new AppError(
        'O id informado não corresponde a um servidor do Gerenciador do FME',
        httpCode.BadRequest
      )
    }

    const existsAssociation = await t.any(
      `SELECT id FROM macrocontrole.perfil_fme 
      WHERE gerenciador_fme_id in ($<servidoresId:csv>)`,
      { servidoresId }
    )
    if (existsAssociation && existsAssociation.length > 0) {
      throw new AppError(
        'O servidor possui rotinas do fme associadas em perfil_fme',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM dgeo.gerenciador_fme
      WHERE id in ($<servidoresId:csv>)`,
      { servidoresId }
    )
  })
}

controller.getCamadas = async () => {
  return db.sapConn.any(
    `SELECT c.id, c.schema, c.nome, COUNT(ppc.id) > 0 AS perfil
    FROM macrocontrole.camada AS c
    LEFT JOIN macrocontrole.propriedades_camada AS ppc ON ppc.camada_id = c.id
    GROUP BY c.id, c.schema, c.nome`
  )
}

controller.deleteCamadas = async camadasIds => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.camada
      WHERE id in ($<camadasIds:csv>)`,
      { camadasIds }
    )
    if (exists && exists.length < camadasIds.length) {
      throw new AppError(
        'Os ids informados não correspondem a uma camada',
        httpCode.BadRequest
      )
    }

    const existsAssociationPerfil = await t.any(
      `SELECT id FROM macrocontrole.propriedades_camada 
      WHERE camada_id in ($<camadasIds:csv>)`,
      { camadasIds }
    )
    if (existsAssociationPerfil && existsAssociationPerfil.length > 0) {
      throw new AppError(
        'A camada possui perfil propriedades camadas associados',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM macrocontrole.camada
      WHERE id IN ($<camadasIds:csv>)`,
      { camadasIds }
    )
  })
}

controller.atualizaCamadas = async camadas => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'schema',
      'nome'
    ])

    const query =
      db.pgp.helpers.update(
        camadas,
        cs,
        { table: 'camada', schema: 'macrocontrole' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.criaCamadas = async camadas => {
  const cs = new db.pgp.helpers.ColumnSet([
    'schema',
    'nome'
  ])

  const query = db.pgp.helpers.insert(camadas, cs, {
    table: 'camada',
    schema: 'macrocontrole'
  })

  return db.sapConn.none(query)
}

controller.getPerfilFME = async () => {
  return db.sapConn.any(
    `SELECT pf.id, pf.gerenciador_fme_id, pf.rotina, pf.requisito_finalizacao, pf.tipo_rotina_id, pf.subfase_id, pf.ordem, s.nome
    FROM macrocontrole.perfil_fme AS pf
    INNER JOIN macrocontrole.subfase AS s ON s.id = pf.subfase_id`
  )
}

controller.deletePerfilFME = async perfilFMEIds => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.perfil_fme
      WHERE id in ($<perfilFMEIds:csv>)`,
      { perfilFMEIds }
    )
    if (exists && exists.length < perfilFMEIds.length) {
      throw new AppError(
        'Os ids informados não correspondem a um perfil fme',
        httpCode.BadRequest
      )
    }
    return t.any(
      `DELETE FROM macrocontrole.perfil_fme
      WHERE id IN ($<perfilFMEIds:csv>)`,
      { perfilFMEIds }
    )
  })
}

controller.atualizaPerfilFME = async perfilFME => { // FIXME retornar mensagem de erro correta quando o usuario tenta inserir novamente o mesmo par subfase_id / rotina
  return db.sapConn.tx(async t => { // FIXME REFATORAR
    const exists = await t.any(
      `SELECT id FROM macrocontrole.perfil_fme
      WHERE id in ($<perfilFMEIds:csv>)`,
      { perfilFMEIds: perfilFME.map(c => c.id) }
    )
    if (!exists && exists.length < perfilFME.length) {
      throw new AppError(
        'Os ids informados não correspondem a um perfil fme',
        httpCode.BadRequest
      )
    }
    const query = []
    perfilFME.forEach(c => {
      query.push(
        t.any(
          `UPDATE macrocontrole.perfil_fme
          SET gerenciador_fme_id = $<gerenciadorFmeId>, rotina = $<rotina>, requisito_finalizacao = $<requisitoFinalizacao>, tipo_rotina_id = $<tipoRotinaId>,
          subfase_id = $<subfaseId>, ordem = $<ordem>
          where id = $<id>`,
          {
            id: c.id,
            gerenciadorFmeId: c.gerenciador_fme_id,
            rotina: c.rotina,
            requisitoFinalizacao: c.requisito_finalizacao,
            tipoRotinaId: c.tipo_rotina_id,
            subfaseId: c.subfase_id,
            ordem: c.ordem
          }
        )
      )
    })

    const rotinasFME = perfilFME.map(c => {
      return { servidor: c.gerenciador_fme_id, rotina: c.rotina }
    })
    const parametrosOk = await validadeParameters(rotinasFME)
    if (!parametrosOk) {
      throw new AppError(
        'A rotina não possui os parâmetros compatíveis para o uso do SAP',
        httpCode.BadRequest
      )
    }

    await t.batch(query)
  })
}

controller.criaPerfilFME = async perfilFME => { // FIXME retornar mensagem de erro correta quando o usuario tenta inserir novamente o mesmo par subfase_id / rotina
  const cs = new db.pgp.helpers.ColumnSet([
    'gerenciador_fme_id',
    'rotina',
    'requisito_finalizacao',
    'tipo_rotina_id',
    'subfase_id',
    'ordem'
  ])

  const rotinasFME = perfilFME.map(c => {
    return { servidor: c.gerenciador_fme_id, rotina: c.rotina }
  })

  const parametrosOk = await validadeParameters(rotinasFME)
  if (!parametrosOk) {
    throw new AppError(
      'A rotina não possui os parâmetros compatíveis para o uso do SAP',
      httpCode.BadRequest
    )
  }

  const query = db.pgp.helpers.insert(perfilFME, cs, {
    table: 'perfil_fme',
    schema: 'macrocontrole'
  })

  return db.sapConn.none(query)
}

controller.getPerfilRequisitoFinalizacao = async () => {
  return db.sapConn.any(
    `SELECT prf.id, prf.descricao, prf.ordem, prf.subfase_id, prf.lote_id
    FROM macrocontrole.perfil_requisito_finalizacao AS prf`
  )
}

controller.deletePerfilRequisitoFinalizacao = async perfilRequisitosIds => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.perfil_requisito_finalizacao
      WHERE id in ($<perfilRequisitosIds:csv>)`,
      { perfilRequisitosIds }
    )
    if (!exists && exists.length < perfilRequisitosIds.length) {
      throw new AppError(
        'Os ids informados não correspondem a um perfil requisito finalização',
        httpCode.BadRequest
      )
    }
    return t.any(
      `DELETE FROM macrocontrole.perfil_requisito_finalizacao
      WHERE id IN ($<perfilRequisitosIds:csv>)`,
      { perfilRequisitosIds }
    )
  })
}

controller.atualizaPerfilRequisitoFinalizacao = async perfilRequisitos => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'descricao',
      'ordem',
      'subfase_id',
      'lote_id',
    ])

    const query =
      db.pgp.helpers.update(
        perfilRequisitos,
        cs,
        { table: 'perfil_requisito_finalizacao', schema: 'macrocontrole' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.criaPerfilRequisitoFinalizacao = async perfilRequisito => {
  const cs = new db.pgp.helpers.ColumnSet([
    'descricao',
    'ordem',
    'subfase_id',
    'lote_id'
  ])

  const query = db.pgp.helpers.insert(perfilRequisito, cs, {
    table: 'perfil_requisito_finalizacao',
    schema: 'macrocontrole'
  })

  return db.sapConn.none(query)
}

controller.getPerfilMenu = async () => {
  return db.sapConn.any(
    `SELECT pm.id, qm.nome, qm.definicao_menu, pm.menu_id, pm.menu_revisao, pm.subfase_id, pm.lote_id 
    FROM macrocontrole.perfil_menu AS pm
    INNER JOIN dgeo.qgis_menus AS qm ON qm.id = pm.menu_id`
  )
}

controller.deletePerfilMenu = async perfilMenuIds => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.perfil_menu
      WHERE id in ($<perfilMenuIds:csv>)`,
      { perfilMenuIds }
    )
    if (!exists && exists.length < perfilMenuIds.length) {
      throw new AppError(
        'Os ids informados não correspondem a um perfil menu',
        httpCode.BadRequest
      )
    }
    return t.any(
      `DELETE FROM macrocontrole.perfil_menu
      WHERE id IN ($<perfilMenuIds:csv>)`,
      { perfilMenuIds }
    )
  })
}

controller.atualizaPerfilMenu = async perfilMenu => {//FIXME
  return db.sapConn.tx(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.perfil_menu
      WHERE id in ($<perfilMenuIds:csv>)`,
      { perfilMenuIds: perfilMenu.map(c => c.id) }
    )
    if (!exists && exists.length < perfilMenu.length) {
      throw new AppError(
        'Os ids informados não correspondem a um perfil menu QGIS',
        httpCode.BadRequest
      )
    }
    const query = []
    perfilMenu.forEach(c => {
      query.push(
        t.any(
          `UPDATE macrocontrole.perfil_menu
          SET lote_id = $<loteId>, menu_id = $<menuId>, menu_revisao = $<menuRevisao>,
          subfase_id = $<subfaseId>
          where id = $<id>`,
          {
            id: c.id,
            loteId: c.lote_id,
            menuId: c.menu_id,
            menuRevisao: c.menu_revisao,
            subfaseId: c.subfase_id
          }
        )
      )
    })

    await t.batch(query)
  })
}

controller.criaPerfilMenu = async perfilMenu => {
  const cs = new db.pgp.helpers.ColumnSet([
    'menu_id',
    'menu_revisao',
    'subfase_id',
    'lote_id'
  ])

  const query = db.pgp.helpers.insert(perfilMenu, cs, {
    table: 'perfil_menu',
    schema: 'macrocontrole'
  })

  return db.sapConn.none(query)
}

controller.getPerfilModelo = async () => {
  return db.sapConn.any(
    `SELECT pmq.id, pmq.lote_id, pmq.qgis_model_id, pmq.requisito_finalizacao, pmq.parametros, pmq.tipo_rotina_id, tr.nome as tipo_rotina, pmq.ordem, pmq.subfase_id, qm.nome, qm.descricao
    FROM macrocontrole.perfil_model_qgis AS pmq
    INNER JOIN dgeo.qgis_models AS qm ON qm.id = pmq.qgis_model_id
    INNER JOIN dominio.tipo_rotina AS tr ON tr.code = pmq.tipo_rotina_id`
  )
}

controller.deletePerfilModelo = async perfilModeloIds => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.perfil_model_qgis
      WHERE id in ($<perfilModeloIds:csv>)`,
      { perfilModeloIds }
    )
    if (!exists && exists.length < perfilModeloIds.length) {
      throw new AppError(
        'Os ids informados não correspondem a um perfil modelo QGIS',
        httpCode.BadRequest
      )
    }
    return t.any(
      `DELETE FROM macrocontrole.perfil_model_qgis
      WHERE id IN ($<perfilModeloIds:csv>)`,
      { perfilModeloIds }
    )
  })
}

controller.atualizaPerfilModelo = async perfilModelo => { // FIXME REFATORAR
  return db.sapConn.tx(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.perfil_model_qgis
      WHERE id in ($<perfilModeloIds:csv>)`,
      { perfilModeloIds: perfilModelo.map(c => c.id) }
    )
    if (!exists && exists.length < perfilModelo.length) {
      throw new AppError(
        'Os ids informados não correspondem a um perfil modelo QGIS',
        httpCode.BadRequest
      )
    }
    const query = []
    perfilModelo.forEach(c => {
      query.push(
        t.any(
          `UPDATE macrocontrole.perfil_model_qgis
          SET lote_id = $<loteId>, qgis_model_id = $<qgisModelId>, parametros = $<parametros>, requisito_finalizacao = $<requisitoFinalizacao>, tipo_rotina_id = $<tipoRotinaId>,
          subfase_id = $<subfaseId>, ordem = $<ordem>
          where id = $<id>`,
          {
            id: c.id,
            loteId: c.lote_id,
            qgisModelId: c.qgis_model_id,
            parametros: c.parametros,
            requisitoFinalizacao: c.requisito_finalizacao,
            tipoRotinaId: c.tipo_rotina_id,
            subfaseId: c.subfase_id,
            ordem: c.ordem
          }
        )
      )
    })

    await t.batch(query)
  })
}

controller.criaPerfilModelo = async perfilModelo => {
  const cs = new db.pgp.helpers.ColumnSet([
    'qgis_model_id',
    'parametros',
    'requisito_finalizacao',
    'tipo_rotina_id',
    'subfase_id',
    'lote_id',
    'ordem'
  ])

  const query = db.pgp.helpers.insert(perfilModelo, cs, {
    table: 'perfil_model_qgis',
    schema: 'macrocontrole'
  })

  return db.sapConn.none(query)
}

controller.getPerfilRegras = async () => {
  return db.sapConn.any(
    `SELECT pr.id, pr.layer_rules_id, pr.subfase_id, pr.lote_id
    FROM macrocontrole.perfil_regras AS pr`
  )
}

controller.deletePerfilRegras = async perfilRegrasIds => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.perfil_regras
      WHERE id in ($<perfilRegrasIds:csv>)`,
      { perfilRegrasIds }
    )
    if (!exists && exists.length < perfilRegrasIds.length) {
      throw new AppError(
        'Os ids informados não correspondem a um perfil de regras',
        httpCode.BadRequest
      )
    }
    return t.any(
      `DELETE FROM macrocontrole.perfil_regras
      WHERE id IN ($<perfilRegrasIds:csv>)`,
      { perfilRegrasIds }
    )
  })
}

controller.atualizaPerfilRegras = async perfilRegras => { // FIXME REFATORAR
  return db.sapConn.tx(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.perfil_regras
      WHERE id in ($<perfilRegrasIds:csv>)`,
      { perfilRegrasIds: perfilRegras.map(c => c.id) }
    )
    if (!exists && exists.length < perfilRegras.length) {
      throw new AppError(
        'Os ids informados não correspondem a um perfil de regras',
        httpCode.BadRequest
      )
    }
    const query = []
    perfilRegras.forEach(c => {
      query.push(
        t.any(
          `UPDATE macrocontrole.perfil_regras
          SET layer_rules_id = $<layerRulesId>, subfase_id = $<subfaseId>, lote_id = $<loteId>
          where id = $<id>`,
          {
            id: c.id,
            layerRulesId: c.layer_rules_id,
            loteId: c.lote_id,
            subfaseId: c.subfase_id
          }
        )
      )
    })

    await t.batch(query)
  })
}

controller.criaPerfilRegras = async perfilRegras => {
  const cs = new db.pgp.helpers.ColumnSet([
    'layer_rules_id',
    'subfase_id',
    'lote_id'
  ])

  const query = db.pgp.helpers.insert(perfilRegras, cs, {
    table: 'perfil_regras',
    schema: 'macrocontrole'
  })

  return db.sapConn.none(query)
}

controller.getPerfilEstilos = async () => {
  return db.sapConn.any(
    `SELECT pe.id, gs.nome, pe.grupo_estilo_id, pe.subfase_id, pe.lote_id
    FROM macrocontrole.perfil_estilo AS pe
    INNER JOIN dgeo.group_styles AS gs ON gs.id = pe.grupo_estilo_id`
  )
}

controller.deletePerfilEstilos = async perfilEstilosIds => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.perfil_estilo
      WHERE id in ($<perfilEstilosIds:csv>)`,
      { perfilEstilosIds }
    )
    if (!exists && exists.length < perfilEstilosIds.length) {
      throw new AppError(
        'Os ids informados não correspondem a um perfil de estilos',
        httpCode.BadRequest
      )
    }
    return t.any(
      `DELETE FROM macrocontrole.perfil_estilo
      WHERE id IN ($<perfilEstilosIds:csv>)`,
      { perfilEstilosIds }
    )
  })
}

controller.atualizaPerfilEstilos = async perfilEstilos => {//FIXME
  return db.sapConn.tx(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.perfil_estilo
      WHERE id in ($<perfilEstilosIds:csv>)`,
      { perfilEstilosIds: perfilEstilos.map(c => c.id) }
    )
    if (!exists && exists.length < perfilEstilos.length) {
      throw new AppError(
        'Os ids informados não correspondem a um perfil de estilos',
        httpCode.BadRequest
      )
    }
    const query = []
    perfilEstilos.forEach(c => {
      query.push(
        t.any(
          `UPDATE macrocontrole.perfil_estilo
          SET grupo_estilo_id = $<grupoEstiloId>, subfase_id = $<subfaseId>
          where id = $<id>`,
          {
            id: c.id,
            grupoEstiloId: c.grupo_estilo_id,
            subfaseId: c.subfase_id
          }
        )
      )
    })

    await t.batch(query)
  })
}

controller.criaPerfilEstilos = async perfilEstilos => {
  const cs = new db.pgp.helpers.ColumnSet([
    'grupo_estilo_id',
    'subfase_id',
    'lote_id'
  ])

  const perfisbd = await db.sapConn.any(`SELECT id, grupo_estilo_id, subfase_id, lote_id FROM macrocontrole.perfil_estilo`)

  perfisbd.forEach(perfilbd => {
    perfilEstilos.forEach(perfil => {
      if(perfil.grupo_estilo_id === perfilbd.grupo_estilo_id && perfil.subfase_id === perfilbd.subfase_id && perfil.lote_id === perfilbd.lote_id){
        throw new AppError(
          'Já existem perfis estilos com a mesma subfase_id and grupo_estilo_id',
          httpCode.BadRequest
        )
      }
    });
  })

  const query = db.pgp.helpers.insert(perfilEstilos, cs, {
    table: 'perfil_estilo',
    schema: 'macrocontrole'
  })

  return db.sapConn.none(query)
}

controller.getGrupoInsumo = async () => {
  return db.sapConn.any(`SELECT id, nome
    FROM macrocontrole.grupo_insumo`)
}


controller.deletaGrupoInsumo = async grupoInsumoIds => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.grupo_insumo
      WHERE id in ($<grupoInsumoIds:csv>)`,
      { grupoInsumoIds }
    )
    if (exists && exists.length < grupoInsumoIds.length) {
      throw new AppError(
        'O id informado não corresponde a um grupo insumo',
        httpCode.BadRequest
      )
    }

    const insumoAssociado = await t.oneOrNone(
      `SELECT i.id FROM macrocontrole.insumo AS i
      WHERE i.grupo_insumo_id in ($<grupoInsumoIds:csv>)
      LIMIT 1`,
      { grupoInsumoIds }
    )
    if (insumoAssociado) {
      throw new AppError(
        'Um dos grupo de insumos possui insumos associados',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM macrocontrole.grupo_insumo
      WHERE id in ($<grupoInsumoIds:csv>)`,
      { grupoInsumoIds }
    )
  })
}

controller.atualizaGrupoInsumo = async grupo_insumos => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'nome'
    ])

    const query =
      db.pgp.helpers.update(
        grupo_insumos,
        cs,
        { table: 'grupo_insumo', schema: 'macrocontrole' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.gravaGrupoInsumo = async grupo_insumos => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      'nome'
    ])

    const query = db.pgp.helpers.insert(grupo_insumos, cs, {
      table: 'grupo_insumo',
      schema: 'macrocontrole'
    })

    await t.none(query)
  })
}

controller.deletaInsumosAssociados = async (
  unidadeTrabalhoId,
  grupoInsumoId
) => {
  if (!grupoInsumoId) {
    return db.sapConn.any(
      `DELETE FROM macrocontrole.insumo_unidade_trabalho
       WHERE unidade_trabalho_id in ($<unidadeTrabalhoId:csv>)
    `,
      { unidadeTrabalhoId }
    )
  }

  return db.sapConn.any(
    `DELETE FROM macrocontrole.insumo_unidade_trabalho
    WHERE id in (
      SELECT iut.id FROM macrocontrole.insumo_unidade_trabalho AS iut
      INNER JOIN macrocontrole.insumo AS i ON i.id = iut.insumo_id
      WHERE i.grupo_insumo_id = $<grupoInsumoId> AND
      unidade_trabalho_id in ($<unidadeTrabalhoId:csv>)
    )
  `,
    { unidadeTrabalhoId, grupoInsumoId }
  )
}

controller.deletaUnidadeTrabalho = async unidadeTrabalhoId => {
  return db.sapConn.tx(async t => {
    const atividadeAssociada = await t.oneOrNone(
      `SELECT a.id FROM macrocontrole.atividade AS a
      WHERE a.unidade_trabalho_id in ($<unidadeTrabalhoId:csv>)
      LIMIT 1`,
      { unidadeTrabalhoId }
    )
    if (atividadeAssociada) {
      throw new AppError(
        'Uma das unidades de trabalho possui atividades iniciadas associadas',
        httpCode.BadRequest
      )
    }

    t.any(
      `DELETE FROM macrocontrole.insumo_unidade_trabalho
      WHERE unidade_trabalho_id in ($<unidadeTrabalhoId:csv>)
    `,
      { unidadeTrabalhoId }
    )

    return t.any(
      `DELETE FROM macrocontrole.unidade_trabalho
      WHERE id in ($<unidadeTrabalhoId:csv>)
    `,
      { unidadeTrabalhoId }
    )
  })
}

controller.copiarUnidadeTrabalho = async (
  subfaseIds,
  unidadeTrabalhoIds,
  associarInsumos
) => {
  return db.sapConn.tx(async t => {
    const utOldNew = {}
    for (const unidadeTrabalhoId of unidadeTrabalhoIds) {
      for (const subfaseId of subfaseIds) {
        const unidadeTrabalho = await t.oneOrNone(
          `
            INSERT INTO macrocontrole.unidade_trabalho(nome, geom, epsg, dado_producao_id, subfase_id, dificuldade, lote_id, bloco_id, disponivel, prioridade)
            SELECT nome, geom, epsg, dado_producao_id, $<subfaseId> AS subfase_id, dificuldade, lote_id, bloco_id, disponivel, prioridade
            FROM macrocontrole.unidade_trabalho
            WHERE id = $<unidadeTrabalhoId>
            RETURNING id
          `,
          { subfaseId, unidadeTrabalhoId }
        )
        if(!(unidadeTrabalhoId in utOldNew)) {
          utOldNew[unidadeTrabalhoId] = []
        }
        utOldNew[unidadeTrabalhoId].push(unidadeTrabalho.id)
      }
    }

    if (associarInsumos) {
      const insumos = await t.any(
        'SELECT unidade_trabalho_id, insumo_id, caminho_padrao FROM macrocontrole.insumo_unidade_trabalho WHERE unidade_trabalho_id in ($<unidadeTrabalhoIds:csv>)',
        { unidadeTrabalhoIds }
      )
      const dadosInsumos = []
      insumos.forEach(i => {
        utOldNew[i.unidade_trabalho_id].forEach(j => {
          dadosInsumos.push({
            insumo_id: i.insumo_id,
            unidade_trabalho_id: j,
            caminho_padrao: i.caminho_padrao
          })
        })
      })

      const cs = new db.pgp.helpers.ColumnSet([
        'insumo_id',
        'unidade_trabalho_id',
        'caminho_padrao'
      ])

      const query = db.pgp.helpers.insert(dadosInsumos, cs, {
        table: 'insumo_unidade_trabalho',
        schema: 'macrocontrole'
      })

      await t.none(query)
    }
  })
}

controller.criaInsumos = async (insumos, tipo_insumo, grupo_insumo) => {

  const cs = new db.pgp.helpers.ColumnSet([
    'nome',
    'caminho',
    'epsg',
    { name: 'tipo_insumo_id', init: () => tipo_insumo },
    { name: 'grupo_insumo_id', init: () => grupo_insumo },
    { name: 'geom', mod: ':raw' }
  ])

  insumos.forEach(p => {
    if (p.geom.toLowerCase().includes("multipolygon")) {
      throw new AppError(
        'Geometria deve ser POLYGON',
        httpCode.BadRequest
      )
    }
    p.geom = `st_geomfromewkt('${p.geom}')`
  })



  const query = db.pgp.helpers.insert(insumos, cs, {
    table: 'insumo',
    schema: 'macrocontrole'
  })

  return db.sapConn.none(query)
}

controller.criaProdutos = async (produtos, loteId) => {

  let tipoProdutoId = await db.sapConn.one(
    `SELECT lp.tipo_produto_id FROM macrocontrole.lote AS l
    INNER JOIN macrocontrole.linha_producao AS lp ON lp.id = l.linha_producao_id
    WHERE l.id = $<loteId>`,
    { loteId }
  );

  const cs = new db.pgp.helpers.ColumnSet([
    'uuid',
    'nome',
    'mi',
    'inom',
    'denominador_escala',
    'edicao',
    { name: 'tipo_produto_id', init: () => tipoProdutoId.tipo_produto_id },
    { name: 'lote_id', init: () => loteId },
    { name: 'geom', mod: ':raw' }
  ])

  produtos.forEach(p => {
    if (p.geom.toLowerCase().includes(";polygon")) {
      throw new AppError(
        'Geometria deve ser MULTIPOLYGON',
        httpCode.BadRequest
      )
    }
    p.geom = `st_geomfromewkt('${p.geom}')`
  })

  const query = db.pgp.helpers.insert(produtos, cs, {
    table: 'produto',
    schema: 'macrocontrole'
  })

  return db.sapConn.none(query)
}

controller.criaUnidadeTrabalho = async (unidadesTrabalho, loteId, subfaseIds) => {
  const cs = new db.pgp.helpers.ColumnSet([
    'nome',
    'epsg',
    'dado_producao_id',
    'bloco_id',
    'subfase_id',
    { name: 'lote_id', init: () => loteId },
    'disponivel',
    'dificuldade',
    'prioridade',
    'observacao',
    { name: 'geom', mod: ':raw' }
  ])

  unidadesTrabalho.forEach(p => {
    p.geom = `st_geomfromewkt('${p.geom}')`
  })

  const unidadesTrabalhoTotal = []

  subfaseIds.forEach(s => {
    unidadesTrabalho.forEach(p => {
      const newObj = { ...p, subfase_id: s };
      unidadesTrabalhoTotal.push(newObj);
    })
  })

  const query = db.pgp.helpers.insert(unidadesTrabalhoTotal, cs, {
    table: 'unidade_trabalho',
    schema: 'macrocontrole'
  })

  return db.sapConn.none(query)
}

controller.associaInsumos = async (
  unidadesTrabalhoIs,
  grupoInsumoId,
  estrategiaId,
  caminhoPadrao
) => {
  // (1, 'Centroide da unidade de trabalho contido no insumo'),
  // (2, 'Centroide do insumo contido na unidade de trabalho'),
  // (3, 'Interseção entre insumo e unidade de trabalho'),
  // (4, 'Sobreposição entre insumo e unidade de trabalho'),
  // (5, 'Associar insumo a todas as unidades de trabalho');
  switch (estrategiaId) {
    case 1:
      return db.sapConn.none(
        `
        INSERT INTO macrocontrole.insumo_unidade_trabalho(unidade_trabalho_id, insumo_id, caminho_padrao)
        SELECT ut.id AS unidade_trabalho_id, i.id AS insumo_id, $<caminhoPadrao> AS caminho_padrao
        FROM macrocontrole.unidade_trabalho AS ut
        INNER JOIN macrocontrole.insumo AS i ON st_intersects(st_centroid(ut.geom), i.geom)
        LEFT JOIN macrocontrole.insumo_unidade_trabalho AS iut ON iut.unidade_trabalho_id = ut.id AND iut.insumo_id = i.id
        WHERE ut.id in ($<unidadesTrabalhoIs:csv>) AND i.grupo_insumo_id = $<grupoInsumoId> AND iut.id IS NULL
      `,
        { unidadesTrabalhoIs, grupoInsumoId, caminhoPadrao }
      )
    case 2:
      return db.sapConn.none(
        `
        INSERT INTO macrocontrole.insumo_unidade_trabalho(unidade_trabalho_id, insumo_id, caminho_padrao)
        SELECT ut.id AS unidade_trabalho_id, i.id AS insumo_id, $<caminhoPadrao> AS caminho_padrao
        FROM macrocontrole.unidade_trabalho AS ut
        INNER JOIN macrocontrole.insumo AS i ON st_intersects(st_centroid(i.geom), ut.geom)
        LEFT JOIN macrocontrole.insumo_unidade_trabalho AS iut ON iut.unidade_trabalho_id = ut.id AND iut.insumo_id = i.id
        WHERE ut.id in ($<unidadesTrabalhoIs:csv>) AND i.grupo_insumo_id = $<grupoInsumoId> AND iut.id IS NULL
      `,
        { unidadesTrabalhoIs, grupoInsumoId, caminhoPadrao }
      )
    case 3:
      return db.sapConn.none(
        `
        INSERT INTO macrocontrole.insumo_unidade_trabalho(unidade_trabalho_id, insumo_id, caminho_padrao)
        SELECT ut.id AS unidade_trabalho_id, i.id AS insumo_id, $<caminhoPadrao> AS caminho_padrao
        FROM macrocontrole.unidade_trabalho AS ut
        INNER JOIN macrocontrole.insumo AS i ON st_intersects(i.geom, ut.geom)
        LEFT JOIN macrocontrole.insumo_unidade_trabalho AS iut ON iut.unidade_trabalho_id = ut.id AND iut.insumo_id = i.id
        WHERE ut.id in ($<unidadesTrabalhoIs:csv>) AND i.grupo_insumo_id = $<grupoInsumoId> AND iut.id IS NULL
      `,
        { unidadesTrabalhoIs, grupoInsumoId, caminhoPadrao }
      )
    case 4:
      return db.sapConn.none(
        `
        INSERT INTO macrocontrole.insumo_unidade_trabalho(unidade_trabalho_id, insumo_id, caminho_padrao)
        SELECT ut.id AS unidade_trabalho_id, i.id AS insumo_id, $<caminhoPadrao> AS caminho_padrao
        FROM macrocontrole.unidade_trabalho AS ut
        INNER JOIN macrocontrole.insumo AS i ON st_relate(ut.geom, i.geom, '2********')
        LEFT JOIN macrocontrole.insumo_unidade_trabalho AS iut ON iut.unidade_trabalho_id = ut.id AND iut.insumo_id = i.id
        WHERE ut.id in ($<unidadesTrabalhoIs:csv>) AND i.grupo_insumo_id = $<grupoInsumoId> AND iut.id IS NULL
      `,
        { unidadesTrabalhoIs, grupoInsumoId, caminhoPadrao }
      )
    case 5:
      return db.sapConn.none(
        `
        INSERT INTO macrocontrole.insumo_unidade_trabalho(unidade_trabalho_id, insumo_id, caminho_padrao)
        SELECT ut.id AS unidade_trabalho_id, i.id AS insumo_id, $<caminhoPadrao> AS caminho_padrao
        FROM macrocontrole.unidade_trabalho AS ut
        CROSS JOIN macrocontrole.insumo AS i
        LEFT JOIN macrocontrole.insumo_unidade_trabalho AS iut ON iut.unidade_trabalho_id = ut.id AND iut.insumo_id = i.id
        WHERE ut.id in ($<unidadesTrabalhoIs:csv>) AND i.grupo_insumo_id = $<grupoInsumoId> AND iut.id IS NULL
      `,
        { unidadesTrabalhoIs, grupoInsumoId, caminhoPadrao }
      )
    default:
      throw new AppError('Estratégia inválida', httpCode.BadRequest)
  }
}

controller.associaInsumosBloco = async (
  blocoId,
  grupoInsumoId,
  estrategiaId,
  caminhoPadrao
) => {
  // (1, 'Centroide da unidade de trabalho contido no insumo'),
  // (2, 'Centroide do insumo contido na unidade de trabalho'),
  // (3, 'Interseção entre insumo e unidade de trabalho'),
  // (4, 'Sobreposição entre insumo e unidade de trabalho'),
  // (5, 'Associar insumo a todas as unidades de trabalho');
  switch (estrategiaId) {
    case 1:
      return db.sapConn.none(
        `
        INSERT INTO macrocontrole.insumo_unidade_trabalho(unidade_trabalho_id, insumo_id, caminho_padrao)
        SELECT ut.id AS unidade_trabalho_id, i.id AS insumo_id, $<caminhoPadrao> AS caminho_padrao
        FROM macrocontrole.unidade_trabalho AS ut
        INNER JOIN macrocontrole.insumo AS i ON st_intersects(st_centroid(ut.geom), i.geom)
        LEFT JOIN macrocontrole.insumo_unidade_trabalho AS iut ON iut.unidade_trabalho_id = ut.id AND iut.insumo_id = i.id
        WHERE ut.bloco_id = $<blocoId> AND i.grupo_insumo_id = $<grupoInsumoId> AND iut.id IS NULL
      `,
        { blocoId, grupoInsumoId, caminhoPadrao }
      )
    case 2:
      return db.sapConn.none(
        `
        INSERT INTO macrocontrole.insumo_unidade_trabalho(unidade_trabalho_id, insumo_id, caminho_padrao)
        SELECT ut.id AS unidade_trabalho_id, i.id AS insumo_id, $<caminhoPadrao> AS caminho_padrao
        FROM macrocontrole.unidade_trabalho AS ut
        INNER JOIN macrocontrole.insumo AS i ON st_intersects(st_centroid(i.geom), ut.geom)
        LEFT JOIN macrocontrole.insumo_unidade_trabalho AS iut ON iut.unidade_trabalho_id = ut.id AND iut.insumo_id = i.id
        WHERE ut.bloco_id = $<blocoId> AND i.grupo_insumo_id = $<grupoInsumoId> AND iut.id IS NULL
      `,
        { blocoId, grupoInsumoId, caminhoPadrao }
      )
    case 3:
      return db.sapConn.none(
        `
        INSERT INTO macrocontrole.insumo_unidade_trabalho(unidade_trabalho_id, insumo_id, caminho_padrao)
        SELECT ut.id AS unidade_trabalho_id, i.id AS insumo_id, $<caminhoPadrao> AS caminho_padrao
        FROM macrocontrole.unidade_trabalho AS ut
        INNER JOIN macrocontrole.insumo AS i ON st_intersects(i.geom, ut.geom)
        LEFT JOIN macrocontrole.insumo_unidade_trabalho AS iut ON iut.unidade_trabalho_id = ut.id AND iut.insumo_id = i.id
        WHERE ut.bloco_id = $<blocoId> AND i.grupo_insumo_id = $<grupoInsumoId> AND iut.id IS NULL
      `,
        { blocoId, grupoInsumoId, caminhoPadrao }
      )
    case 4:
      return db.sapConn.none(
        `
        INSERT INTO macrocontrole.insumo_unidade_trabalho(unidade_trabalho_id, insumo_id, caminho_padrao)
        SELECT ut.id AS unidade_trabalho_id, i.id AS insumo_id, $<caminhoPadrao> AS caminho_padrao
        FROM macrocontrole.unidade_trabalho AS ut
        INNER JOIN macrocontrole.insumo AS i ON st_relate(ut.geom, i.geom, '2********')
        LEFT JOIN macrocontrole.insumo_unidade_trabalho AS iut ON iut.unidade_trabalho_id = ut.id AND iut.insumo_id = i.id
        WHERE ut.bloco_id = $<blocoId> AND i.grupo_insumo_id = $<grupoInsumoId> AND iut.id IS NULL
      `,
        { blocoId, grupoInsumoId, caminhoPadrao }
      )
    case 5:
      return db.sapConn.none(
        `
        INSERT INTO macrocontrole.insumo_unidade_trabalho(unidade_trabalho_id, insumo_id, caminho_padrao)
        SELECT ut.id AS unidade_trabalho_id, i.id AS insumo_id, $<caminhoPadrao> AS caminho_padrao
        FROM macrocontrole.unidade_trabalho AS ut
        CROSS JOIN macrocontrole.insumo AS i
        LEFT JOIN macrocontrole.insumo_unidade_trabalho AS iut ON iut.unidade_trabalho_id = ut.id AND iut.insumo_id = i.id
        WHERE ut.bloco_id = $<blocoId> AND i.grupo_insumo_id = $<grupoInsumoId> AND iut.id IS NULL
      `,
        { blocoId, grupoInsumoId, caminhoPadrao }
      )
    default:
      throw new AppError('Estratégia inválida', httpCode.BadRequest)
  }
}

controller.getEstrategiaAssociacao = async () => {
  return db.sapConn.any('SELECT code, nome FROM dominio.tipo_estrategia_associacao')
}

controller.getLote = async () => {
  return db.sapConn.any(
    'SELECT id, nome, nome_abrev, denominador_escala, linha_producao_id, projeto_id, descricao  FROM macrocontrole.lote'
  )
}

controller.criaProjetos = async projetos => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'nome',
      'nome_abrev',
      'descricao',
      'finalizado'
    ])

    const query = db.pgp.helpers.insert(projetos, cs, {
      table: 'projeto',
      schema: 'macrocontrole'
    })

    await t.none(query)
  })
}

controller.atualizaProjetos = async projetos => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'nome',
      'nome_abrev',
      'descricao',
      'finalizado'
    ])

    const query =
      db.pgp.helpers.update(
        projetos,
        cs,
        { table: 'projeto', schema: 'macrocontrole' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.deletaProjetos = async projetoIds => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.projeto
      WHERE id in ($<projetoIds:csv>)`,
      { projetoIds }
    )
    if (exists && exists.length < projetoIds.length) {
      throw new AppError(
        'O id informado não corresponde a um projeto',
        httpCode.BadRequest
      )
    }

    const existsAssociation = await t.any(
      `SELECT id FROM macrocontrole.lote 
      WHERE projeto_id in ($<projetoIds:csv>)`,
      { projetoIds }
    )
    if (existsAssociation && existsAssociation.length > 0) {
      throw new AppError(
        'O projeto possui lotes associados',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM macrocontrole.projeto
      WHERE id in ($<projetoIds:csv>)`,
      { projetoIds }
    )
  })
}

controller.criaLotes = async lotes => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'nome',
      'nome_abrev',
      'denominador_escala',
      'linha_producao_id',
      'projeto_id',
      'descricao'
    ])

    const query = db.pgp.helpers.insert(lotes, cs, {
      table: 'lote',
      schema: 'macrocontrole'
    })

    await t.none(query)
  })
}

controller.atualizaLotes = async lotes => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'nome',
      'nome_abrev',
      'denominador_escala',
      'linha_producao_id',
      'projeto_id',
      'descricao'
    ])

    const query =
      db.pgp.helpers.update(
        lotes,
        cs,
        { table: 'lote', schema: 'macrocontrole' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.deletaLotes = async loteIds => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.lote
      WHERE id in ($<loteIds:csv>)`,
      { loteIds }
    )
    if (exists && exists.length < loteIds.length) {
      throw new AppError(
        'O id informado não corresponde a um lote',
        httpCode.BadRequest
      )
    }

    const existsAssociation = await t.any(
      `SELECT id FROM macrocontrole.produto 
      WHERE lote_id in ($<loteIds:csv>)`,
      { loteIds }
    )
    if (existsAssociation && existsAssociation.length > 0) {
      throw new AppError(
        'O lote possui produtos associados',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM macrocontrole.lote
      WHERE id in ($<loteIds:csv>)`,
      { loteIds }
    )
  })
}

controller.criaBlocos = async blocos => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'nome',
      'prioridade',
      'lote_id'
    ])

    const query = db.pgp.helpers.insert(blocos, cs, {
      table: 'bloco',
      schema: 'macrocontrole'
    })

    await t.none(query)
  })
}

controller.atualizaBlocos = async blocos => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'nome',
      'prioridade',
      'lote_id'
    ])

    const query =
      db.pgp.helpers.update(
        blocos,
        cs,
        { table: 'bloco', schema: 'macrocontrole' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.deletaBlocos = async blocoIds => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.bloco
      WHERE id in ($<blocoIds:csv>)`,
      { blocoIds }
    )
    if (exists && exists.length < blocoIds.length) {
      throw new AppError(
        'O id informado não corresponde a um bloco',
        httpCode.BadRequest
      )
    }

    const existsAssociation = await t.any(
      `SELECT id FROM macrocontrole.unidade_trabalho 
      WHERE bloco_id in ($<blocoIds:csv>)`,
      { blocoIds }
    )
    if (existsAssociation && existsAssociation.length > 0) {
      throw new AppError(
        'O bloco possui unidades de trabalho associadas',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM macrocontrole.bloco
      WHERE id in ($<blocoIds:csv>)`,
      { blocoIds }
    )
  })
}

controller.criaDadoProducao = async dado_producao => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'tipo_dado_producao_id',
      'configuracao_producao'
    ])

    const query = db.pgp.helpers.insert(dado_producao, cs, {
      table: 'dado_producao',
      schema: 'macrocontrole'
    })

    await t.none(query)
  })
}

controller.atualizaDadoProducao = async dado_producao => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'tipo_dado_producao_id',
      'configuracao_producao'
    ])

    const query =
      db.pgp.helpers.update(
        dado_producao,
        cs,
        { table: 'dado_producao', schema: 'macrocontrole' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.deletaDadoProducao = async dadoProducaoIds => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.dado_producao
      WHERE id in ($<dadoProducaoIds:csv>)`,
      { dadoProducaoIds }
    )
    if (exists && exists.length < dadoProducaoIds.length) {
      throw new AppError(
        'O id informado não corresponde a um dado de produção',
        httpCode.BadRequest
      )
    }

    const existsAssociation = await t.any(
      `SELECT id FROM macrocontrole.unidade_trabalho 
      WHERE dado_producao_id in ($<dadoProducaoIds:csv>)`,
      { dadoProducaoIds }
    )
    if (existsAssociation && existsAssociation.length > 0) {
      throw new AppError(
        'O dado_producao_id possui unidades de trabalho associadas',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM macrocontrole.dado_producao
      WHERE id in ($<dadoProducaoIds:csv>)`,
      { dadoProducaoIds }
    )
  })
}


module.exports = controller
