'use strict'

const { db, disableTriggers } = require('../database')

const { AppError, httpCode } = require('../utils')

const { DB_USER, DB_PASSWORD } = require('../config')


const {
  checkFMEConnection,
  validadeParameters
} = require('../gerenciador_fme')

const controller = {}

controller.getStatus = async () => {
  return db.sapConn
    .any('SELECT code, nome FROM dominio.status')
}

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

    const query_test = db.pgp.as.format(`SELECT 1 FROM dgeo.layer_styles AS v WHERE (v.f_table_schema, v.f_table_name, v.grupo_estilo_id) IN ($1:raw)`,
      db.pgp.as.format(estilos.map(r => `('${r.f_table_schema}', '${r.f_table_name}', ${r.grupo_estilo_id})`).join()));

    const exists = await t.any(query_test);

    if (exists && exists.length > 0) {
      throw new AppError(
        'O estilo já foi cadastrado',
        httpCode.BadRequest
      )
    }

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
    `SELECT 
      dp.id, 
      dp.tipo_dado_producao_id, 
      tdp.nome AS tipo_dado_producao,
      dp.configuracao_producao,
      CASE 
        WHEN COUNT(ut.id) = 0 THEN 1
        WHEN bool_or(l.status_id = 1) THEN 1
        WHEN bool_or(l.status_id = 2) THEN 2
        ELSE 3
      END AS lote_status_id
    FROM macrocontrole.dado_producao AS dp
    INNER JOIN dominio.tipo_dado_producao AS tdp ON tdp.code = dp.tipo_dado_producao_id
    LEFT JOIN macrocontrole.unidade_trabalho ut ON ut.dado_producao_id = dp.id
    LEFT JOIN macrocontrole.lote l ON l.id = ut.lote_id
    GROUP BY dp.id, dp.tipo_dado_producao_id, tdp.nome, dp.configuracao_producao`
  )
}

controller.getDatabase = async () => {
  return db.sapConn.any(
    `SELECT 
      dp.id,
      dp.tipo_dado_producao_id,
      dp.configuracao_producao,
      split_part(dp.configuracao_producao, ':', 1) AS servidor,
      split_part(split_part(dp.configuracao_producao, ':', 2), '/', 1) AS porta,
      split_part(split_part(dp.configuracao_producao, ':', 2), '/', 2) AS nome,
      CASE 
        WHEN COUNT(ut.id) = 0 THEN 1
        WHEN bool_or(l.status_id = 1) THEN 1
        WHEN bool_or(l.status_id = 2) THEN 2
        ELSE 3
      END AS lote_status_id
    FROM macrocontrole.dado_producao dp
    LEFT JOIN macrocontrole.unidade_trabalho ut ON ut.dado_producao_id = dp.id
    LEFT JOIN macrocontrole.lote l ON l.id = ut.lote_id
    WHERE dp.tipo_dado_producao_id in (2,3)
    GROUP BY dp.id, dp.tipo_dado_producao_id, dp.configuracao_producao`
  )
}

controller.getLogin = async () => {
  const dados = {
    login: DB_USER,
    senha: DB_PASSWORD
  }
  return dados
}

controller.getBlocos = async (filtroExecucao) => {
  if (filtroExecucao) {
    return db.sapConn.any(`
      SELECT b.id, b.nome, b.prioridade, b.lote_id, b.status_id, s.nome AS status
      FROM macrocontrole.bloco AS b
      INNER JOIN dominio.status AS s ON b.status_id = s.code
      WHERE b.status_id = 1`
    )
  } else {
    return db.sapConn.any(`
      SELECT b.id, b.nome, b.prioridade, b.lote_id, b.status_id, s.nome AS status
      FROM macrocontrole.bloco AS b
      INNER JOIN dominio.status AS s ON b.status_id = s.code`
    )
  }
}

controller.unidadeTrabalhoBloco = async (unidadeTrabalhoIds, bloco) => {
  await disableTriggers.disableAllTriggersInTransaction(db.sapConn, async t => {
    await t.none(
      `UPDATE macrocontrole.unidade_trabalho
      SET bloco_id = $<bloco>
      WHERE id in ($<unidadeTrabalhoIds:csv>)`,
      { unidadeTrabalhoIds, bloco }
    )

  })
  await disableTriggers.refreshMaterializedViewFromUTs(db.sapConn, unidadeTrabalhoIds)
}

controller.deletaAtividades = async atividadeIds => {
  let loteId
  let subfaseIds = []
  await disableTriggers.disableAllTriggersInTransaction(db.sapConn, async t => {
    const result = await t.result(
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


    const lote_subfases = await t.any(
      `SELECT DISTINCT ut.lote_id, ut.subfase_id
      FROM macrocontrole.atividade AS a
      INNER JOIN macrocontrole.unidade_trabalho AS ut ON a.unidade_trabalho_id = ut.id
      WHERE a.id in ($<atividadeIds:csv>)`,
      { atividadeIds }
    )

    loteId = lote_subfases[0].lote_id
    lote_subfases.forEach(e => {
      if (e.lote_id !== loteId) {
        throw new AppError(
          'Atividades de lotes distintos',
          httpCode.BadRequest
        )
      }
      subfaseIds.push(e.subfase_id)
    })

    await t.none(
      `
    DELETE FROM macrocontrole.atividade
    WHERE id in ($<atividadeIds:csv>) AND tipo_situacao_id IN (1)
    `,
      { atividadeIds }
    )

  })
  await disableTriggers.refreshMaterializedViewFromSubfases(db.sapConn, loteId, subfaseIds)
}

controller.deletaAtividadesUnidadeTrabalho = async unidadeTrabalhoIds => {

  await disableTriggers.disableAllTriggersInTransaction(db.sapConn, async t => {
    await t.none(
      `
    DELETE FROM macrocontrole.atividade
    WHERE unidade_trabalho_id in ($<unidadeTrabalhoIds:csv>) AND tipo_situacao_id IN (1,5)
    `,
      { unidadeTrabalhoIds }
    )

  })
  await disableTriggers.refreshMaterializedViewFromUTs(db.sapConn, unidadeTrabalhoIds)


}

controller.criaEtapasPadrao = async (padrao_cq, fase_id, lote_id) => {
  await disableTriggers.disableAllTriggersInTransaction(db.sapConn, async t => {
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


    await t.none(
      sqlA + sqlB,
      { fase_id, lote_id }
    )

  })

  await disableTriggers.reCreateSubfaseMaterializedViewFromFases(db.sapConn, lote_id, fase_id)
  await disableTriggers.refreshMaterializedViewFromLoteNoSubfase(db.sapConn, lote_id)
}

controller.criaTodasAtividades = async (lote_id, atividadesRevisao, atividadeRevCor, atividadeRefFin) => {
  await disableTriggers.disableAllTriggersInTransaction(db.sapConn, async t => {

    await t.any(
      `
    INSERT INTO macrocontrole.atividade(etapa_id, unidade_trabalho_id, tipo_situacao_id)
    SELECT e.id AS etapa_id, ut.id AS unidade_trabalho_id, 1 AS tipo_situacao_id
    FROM macrocontrole.unidade_trabalho AS ut
    INNER JOIN macrocontrole.etapa AS e ON e.subfase_id = ut.subfase_id AND e.lote_id = ut.lote_id
    LEFT JOIN (
      SELECT id, etapa_id, unidade_trabalho_id FROM macrocontrole.atividade WHERE tipo_situacao_id != 5
      ) AS a ON ut.id = a.unidade_trabalho_id AND a.etapa_id = e.id
    WHERE e.tipo_etapa_id in (1) AND ut.lote_id = $<lote_id> AND a.id IS NULL;
    `,
      { lote_id }
    )

    if (atividadesRevisao) {
      await t.any(
        `
      INSERT INTO macrocontrole.atividade(etapa_id, unidade_trabalho_id, tipo_situacao_id)
      SELECT e.id AS etapa_id, ut.id AS unidade_trabalho_id, 1 AS tipo_situacao_id
      FROM macrocontrole.unidade_trabalho AS ut
      INNER JOIN macrocontrole.etapa AS e ON e.subfase_id = ut.subfase_id AND e.lote_id = ut.lote_id
      LEFT JOIN (
        SELECT id, etapa_id, unidade_trabalho_id FROM macrocontrole.atividade WHERE tipo_situacao_id != 5
        ) AS a ON ut.id = a.unidade_trabalho_id AND a.etapa_id = e.id
      WHERE e.tipo_etapa_id in (2,3) AND ut.lote_id = $<lote_id> AND a.id IS NULL;
      `,
        { lote_id }
      )
    }

    if (atividadeRevCor) {
      await t.any(
        `
      INSERT INTO macrocontrole.atividade(etapa_id, unidade_trabalho_id, tipo_situacao_id)
      SELECT e.id AS etapa_id, ut.id AS unidade_trabalho_id, 1 AS tipo_situacao_id
      FROM macrocontrole.unidade_trabalho AS ut
      INNER JOIN macrocontrole.etapa AS e ON e.subfase_id = ut.subfase_id AND e.lote_id = ut.lote_id
      LEFT JOIN (
        SELECT id, etapa_id, unidade_trabalho_id FROM macrocontrole.atividade WHERE tipo_situacao_id != 5
        ) AS a ON ut.id = a.unidade_trabalho_id AND a.etapa_id = e.id
      WHERE e.tipo_etapa_id in (4) AND ut.lote_id = $<lote_id> AND a.id IS NULL;
      `,
        { lote_id }
      )
    }

    if (atividadeRefFin) {
      await t.any(
        `
      INSERT INTO macrocontrole.atividade(etapa_id, unidade_trabalho_id, tipo_situacao_id)
      SELECT e.id AS etapa_id, ut.id AS unidade_trabalho_id, 1 AS tipo_situacao_id
      FROM macrocontrole.unidade_trabalho AS ut
      INNER JOIN macrocontrole.etapa AS e ON e.subfase_id = ut.subfase_id AND e.lote_id = ut.lote_id
      LEFT JOIN (
        SELECT id, etapa_id, unidade_trabalho_id FROM macrocontrole.atividade WHERE tipo_situacao_id != 5
        ) AS a ON ut.id = a.unidade_trabalho_id AND a.etapa_id = e.id
      WHERE e.tipo_etapa_id in (5) AND ut.lote_id = $<lote_id> AND a.id IS NULL;
      `,
        { lote_id }
      )
    }

  })
  await disableTriggers.refreshMaterializedViewFromLote(db.sapConn, lote_id)
}

controller.criaAtividades = async (unidadeTrabalhoIds, etapaIds) => {
  await disableTriggers.disableAllTriggersInTransaction(db.sapConn, async t => {

    // Check if all unidade_trabalho IDs have an associated produto
    const missingProdutos = await t.any(
      `
      SELECT ut.id
      FROM macrocontrole.unidade_trabalho ut
      LEFT JOIN macrocontrole.relacionamento_produto rp ON ut.id = rp.ut_id
      WHERE ut.id IN ($<unidadeTrabalhoIds:csv>)
      GROUP BY ut.id
      HAVING COUNT(rp.p_id) = 0
      `,
      { unidadeTrabalhoIds }
    );

    if (missingProdutos.length > 0) {
      throw new AppError(
        'Uma ou mais unidades de trabalho não têm um produto associado.',
        httpCode.BadRequest
      );
    }

    const etapasCorrecao = await t.any(
      `
      WITH prox AS (SELECT e.id, lead(e.id, 1) OVER(PARTITION BY e.subfase_id ORDER BY e.ordem) as prox_id
      FROM macrocontrole.etapa AS e)
      SELECT p.prox_id
      FROM macrocontrole.etapa AS e
      INNER JOIN prox AS p ON e.id = p.id
      INNER JOIN macrocontrole.etapa AS prox_e ON prox_e.id = p.prox_id
      WHERE e.tipo_etapa_id in (2,5) AND e.id IN ($<etapaIds:csv>) AND prox_e.tipo_etapa_id = 3
      `,
      { etapaIds }
    );

    const uniqueProxIds = [...new Set(etapasCorrecao.map(etapa => etapa.prox_id).filter(id => id !== null))];

    // Combine and deduplicate etapaIds and uniqueProxIds
    etapaIds = [...new Set([...etapaIds, ...uniqueProxIds])];

    const result = await t.result(
      `
    INSERT INTO macrocontrole.atividade(etapa_id, unidade_trabalho_id, tipo_situacao_id)
    SELECT DISTINCT e.id AS etapa_id, ut.id AS unidade_trabalho_id, 1 AS tipo_situacao_id
    FROM macrocontrole.unidade_trabalho AS ut
    INNER JOIN macrocontrole.etapa AS e ON e.subfase_id = ut.subfase_id AND e.lote_id = ut.lote_id
    LEFT JOIN macrocontrole.atividade AS a ON ut.id = a.unidade_trabalho_id AND e.id = a.etapa_id
    WHERE ut.id IN ($<unidadeTrabalhoIds:csv>) AND e.id IN ($<etapaIds:csv>) AND a.id IS NULL
    `,
      { unidadeTrabalhoIds, etapaIds }
    )
    if (!result.rowCount || result.rowCount === 0) {
      throw new AppError(
        'As atividades não podem ser criadas pois já existem.',
        httpCode.BadRequest
      )
    }

  })
  await disableTriggers.refreshMaterializedViewFromUTs(db.sapConn, unidadeTrabalhoIds)
}

controller.getProjetos = async (filtroExecucao) => {
  if (filtroExecucao) {
    return db.sapConn.any(
      `SELECT p.id, p.nome, p.nome_abrev, p.descricao, p.status_id, s.nome AS status FROM macrocontrole.projeto AS p
      INNER JOIN dominio.status AS s ON p.status_id = s.code
      WHERE p.status_id = 1`
    )
  } else {
    return db.sapConn.any(
      `SELECT p.id, p.nome, p.nome_abrev, p.descricao, p.status_id, s.nome AS status FROM macrocontrole.projeto AS p
      INNER JOIN dominio.status AS s ON p.status_id = s.code`
    )
  }
}

controller.getLinhasProducao = async (filtroAtivo) => {
  if (filtroAtivo) {
    return db.sapConn.any(
      `SELECT lp.id AS linha_producao_id, lp.nome_abrev AS linha_producao_abrev, lp.disponivel, lp.nome AS linha_producao, lp.tipo_produto_id, lp.descricao, tp.nome AS tipo_produto
      FROM macrocontrole.linha_producao AS lp
      INNER JOIN dominio.tipo_produto AS tp ON tp.code = lp.tipo_produto_id
      WHERE lp.disponivel = TRUE
      `
    )
  } else {
    return db.sapConn.any(
      `SELECT lp.id AS linha_producao_id, lp.nome_abrev AS linha_producao_abrev, lp.disponivel, lp.nome AS linha_producao, lp.tipo_produto_id, lp.descricao, tp.nome AS tipo_produto
      FROM macrocontrole.linha_producao AS lp
      INNER JOIN dominio.tipo_produto AS tp ON tp.code = lp.tipo_produto_id
      `
    )
  }
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

controller.getSubfases = async (filtroAtivo) => {
  if (filtroAtivo) {
    return db.sapConn.any(
      `SELECT lp.id AS linha_producao_id, lp.disponivel AS linha_producao_ativa, lp.nome AS linha_producao, lp.tipo_produto_id, lp.descricao, tp.nome AS tipo_produto,
      f.id AS fase_id, tf.nome AS fase, f.ordem AS ordem_fase, l.id AS lote_id, l.nome AS lote, p.id AS projeto_id, p.nome AS projeto,
      sf.id AS subfase_id, sf.nome AS subfase, l.nome_abrev AS lote_nome_abrev, p.nome_abrev AS projeto_nome_abrev
      FROM macrocontrole.linha_producao AS lp
      INNER JOIN macrocontrole.lote AS l ON l.linha_producao_id = lp.id
      INNER JOIN macrocontrole.projeto AS p ON p.id = l.projeto_id
      INNER JOIN dominio.tipo_produto AS tp ON tp.code = lp.tipo_produto_id
      INNER JOIN macrocontrole.fase AS f ON f.linha_producao_id = lp.id
      INNER JOIN dominio.tipo_fase AS tf ON tf.code = f.tipo_fase_id
      INNER JOIN macrocontrole.subfase AS sf ON sf.fase_id = f.id
      WHERE lp.disponivel = TRUE`
    )
  }
  else {
    return db.sapConn.any(
      `SELECT lp.id AS linha_producao_id, lp.disponivel AS linha_producao_ativa, lp.nome AS linha_producao, lp.tipo_produto_id, lp.descricao, tp.nome AS tipo_produto,
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
      if (perfil.grupo_estilo_id === perfilbd.grupo_estilo_id && perfil.subfase_id === perfilbd.subfase_id && perfil.lote_id === perfilbd.lote_id) {
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

controller.getGrupoInsumo = async (filtroDisponivel) => {
  if (filtroDisponivel) {
    return db.sapConn.any(`SELECT id, nome, disponivel
    FROM macrocontrole.grupo_insumo
    WHERE disponivel = true`)
  } else {
    return db.sapConn.any(`SELECT id, nome, disponivel
    FROM macrocontrole.grupo_insumo`)
  }
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
      'nome',
      'disponivel'
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
      'nome',
      'disponivel'
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

controller.deletaUnidadeTrabalho = async unidadeTrabalhoIds => {
  let loteId
  let subfaseIds = []
  await disableTriggers.disableAllTriggersInTransaction(db.sapConn, async t => {
    const atividadeAssociada = await t.oneOrNone(
      `SELECT a.id FROM macrocontrole.atividade AS a
      WHERE a.unidade_trabalho_id in ($<unidadeTrabalhoIds:csv>)
      LIMIT 1`,
      { unidadeTrabalhoIds }
    )
    if (atividadeAssociada) {
      throw new AppError(
        'Uma das unidades de trabalho possui atividades iniciadas associadas',
        httpCode.BadRequest
      )
    }

    const lote_subfases = await t.any(
      `SELECT DISTINCT lote_id, subfase_id FROM macrocontrole.unidade_trabalho
      WHERE id in ($<unidadeTrabalhoIds:csv>)`,
      { unidadeTrabalhoIds }
    )

    loteId = lote_subfases[0].lote_id
    lote_subfases.forEach(e => {
      if (e.lote_id !== loteId) {
        throw new AppError(
          'Unidades de trabalho de lotes distintos',
          httpCode.BadRequest
        )
      }
      subfaseIds.push(e.subfase_id)
    })

    await t.any(
      `DELETE FROM macrocontrole.insumo_unidade_trabalho
      WHERE unidade_trabalho_id in ($<unidadeTrabalhoIds:csv>)
    `,
      { unidadeTrabalhoIds }
    )

    await t.any(
      `DELETE FROM macrocontrole.relacionamento_produto
      WHERE ut_id in ($<unidadeTrabalhoIds:csv>)
    `,
      { unidadeTrabalhoIds }
    )

    await t.any(
      `DELETE FROM macrocontrole.unidade_trabalho
      WHERE id in ($<unidadeTrabalhoIds:csv>)
    `,
      { unidadeTrabalhoIds }
    )
  })
  await disableTriggers.handleRelacionamentoUtDelete(db.sapConn, unidadeTrabalhoIds)
  await disableTriggers.refreshMaterializedViewFromSubfases(db.sapConn, loteId, subfaseIds)
}

controller.copiarUnidadeTrabalho = async (
  subfaseIds,
  unidadeTrabalhoIds,
  associarInsumos
) => {
  let newUnidadeTrabalhoIds = [];
  await disableTriggers.disableAllTriggersInTransaction(db.sapConn, async t => {
    // Mapeamento de UT original para suas novas UTs
    const utMapping = {};

    // Para cada combinação de UT e subfase, fazer o insert
    for (const utId of unidadeTrabalhoIds) {
      utMapping[utId] = [];
      
      for (const subfaseId of subfaseIds) {
        const result = await t.one(
          `
          INSERT INTO macrocontrole.unidade_trabalho(
            nome, geom, epsg, dado_producao_id, subfase_id, 
            dificuldade, tempo_estimado_minutos, lote_id, 
            bloco_id, disponivel, prioridade
          )
          SELECT 
            nome, 
            geom, 
            epsg, 
            dado_producao_id, 
            $2 AS subfase_id, 
            dificuldade, 
            tempo_estimado_minutos, 
            lote_id, 
            bloco_id, 
            disponivel, 
            prioridade
          FROM macrocontrole.unidade_trabalho
          WHERE id = $1
          RETURNING id
          `,
          [utId, subfaseId]
        );
        
        const newId = result.id;
        newUnidadeTrabalhoIds.push(newId);
        utMapping[utId].push(newId);
      }
    }

    if (associarInsumos) {
      // Buscar todos os insumos das unidades de trabalho originais
      const insumos = await t.any(
        'SELECT unidade_trabalho_id, insumo_id, caminho_padrao FROM macrocontrole.insumo_unidade_trabalho WHERE unidade_trabalho_id in ($<unidadeTrabalhoIds:csv>)',
        { unidadeTrabalhoIds }
      );

      // Criar novos registros de insumos usando o mapeamento
      const dadosInsumos = insumos.flatMap(insumo => 
        utMapping[insumo.unidade_trabalho_id].map(newUtId => ({
          insumo_id: insumo.insumo_id,
          unidade_trabalho_id: newUtId,
          caminho_padrao: insumo.caminho_padrao
        }))
      );

      if (dadosInsumos.length > 0) {
        const cs = new db.pgp.helpers.ColumnSet([
          'insumo_id',
          'unidade_trabalho_id',
          'caminho_padrao'
        ]);

        const query = db.pgp.helpers.insert(dadosInsumos, cs, {
          table: 'insumo_unidade_trabalho',
          schema: 'macrocontrole'
        });

        await t.none(query);
      }
    }
  });

  await disableTriggers.handleRelacionamentoUtInsertUpdate(db.sapConn, newUnidadeTrabalhoIds);
  await disableTriggers.refreshMaterializedViewFromUTs(db.sapConn, newUnidadeTrabalhoIds);
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
  let produtoIds
  await disableTriggers.disableAllTriggersInTransaction(db.sapConn, async t => {
    let tipoProdutoId = await t.one(
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
    }) + ' RETURNING id'

    produtoIds = await t.map(query, undefined, a => +a.id)
  })
  await disableTriggers.handleRelacionamentoProdutoInsertUpdate(db.sapConn, produtoIds)
  await disableTriggers.refreshMaterializedViewFromLoteOnlyLote(db.sapConn, loteId)
}

controller.deleteProdutos = async produtoIds => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.produto
      WHERE id in ($<produtoIds:csv>)`,
      { produtoIds }
    )
    if (exists && exists.length < produtoIds.length) {
      throw new AppError(
        'O id informado não corresponde a um produto',
        httpCode.BadRequest
      )
    }

    const existsAssociation = await t.any(
      `SELECT p_id FROM macrocontrole.relacionamento_produto 
      WHERE p_id in ($<produtoIds:csv>)`,
      { produtoIds }
    )
    if (existsAssociation && existsAssociation.length > 0) {
      throw new AppError(
        'O lote possui produtos associados',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM macrocontrole.produto
      WHERE id in ($<produtoIds:csv>)`,
      { produtoIds }
    )
  })
}

controller.criaUnidadeTrabalho = async (unidadesTrabalho, loteId, subfaseIds) => {
  let unidadeTrabalhoIds
  await disableTriggers.disableAllTriggersInTransaction(db.sapConn, async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      'nome',
      'epsg',
      'dado_producao_id',
      'bloco_id',
      'subfase_id',
      { name: 'lote_id', init: () => loteId },
      'disponivel',
      'dificuldade',
      'tempo_estimado_minutos',
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
    }) + ' RETURNING id'

    unidadeTrabalhoIds = await t.map(query, undefined, a => +a.id)
  })
  await disableTriggers.handleRelacionamentoUtInsertUpdate(db.sapConn, unidadeTrabalhoIds)
  await disableTriggers.refreshMaterializedViewFromSubfases(db.sapConn, loteId, subfaseIds)
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
  subfaseIds,
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
        WHERE ut.bloco_id = $<blocoId> AND ut.subfase_id in ($<subfaseIds:csv>) AND i.grupo_insumo_id = $<grupoInsumoId> AND iut.id IS NULL
      `,
        { blocoId, subfaseIds, grupoInsumoId, caminhoPadrao }
      )
    case 2:
      return db.sapConn.none(
        `
        INSERT INTO macrocontrole.insumo_unidade_trabalho(unidade_trabalho_id, insumo_id, caminho_padrao)
        SELECT ut.id AS unidade_trabalho_id, i.id AS insumo_id, $<caminhoPadrao> AS caminho_padrao
        FROM macrocontrole.unidade_trabalho AS ut
        INNER JOIN macrocontrole.insumo AS i ON st_intersects(st_centroid(i.geom), ut.geom)
        LEFT JOIN macrocontrole.insumo_unidade_trabalho AS iut ON iut.unidade_trabalho_id = ut.id AND iut.insumo_id = i.id
        WHERE ut.bloco_id = $<blocoId> AND ut.subfase_id in ($<subfaseIds:csv>) AND i.grupo_insumo_id = $<grupoInsumoId> AND iut.id IS NULL
      `,
        { blocoId, subfaseIds, grupoInsumoId, caminhoPadrao }
      )
    case 3:
      return db.sapConn.none(
        `
        INSERT INTO macrocontrole.insumo_unidade_trabalho(unidade_trabalho_id, insumo_id, caminho_padrao)
        SELECT ut.id AS unidade_trabalho_id, i.id AS insumo_id, $<caminhoPadrao> AS caminho_padrao
        FROM macrocontrole.unidade_trabalho AS ut
        INNER JOIN macrocontrole.insumo AS i ON st_intersects(i.geom, ut.geom)
        LEFT JOIN macrocontrole.insumo_unidade_trabalho AS iut ON iut.unidade_trabalho_id = ut.id AND iut.insumo_id = i.id
        WHERE ut.bloco_id = $<blocoId> AND ut.subfase_id in ($<subfaseIds:csv>) AND i.grupo_insumo_id = $<grupoInsumoId> AND iut.id IS NULL
      `,
        { blocoId, subfaseIds, grupoInsumoId, caminhoPadrao }
      )
    case 4:
      return db.sapConn.none(
        `
        INSERT INTO macrocontrole.insumo_unidade_trabalho(unidade_trabalho_id, insumo_id, caminho_padrao)
        SELECT ut.id AS unidade_trabalho_id, i.id AS insumo_id, $<caminhoPadrao> AS caminho_padrao
        FROM macrocontrole.unidade_trabalho AS ut
        INNER JOIN macrocontrole.insumo AS i ON st_relate(ut.geom, i.geom, '2********')
        LEFT JOIN macrocontrole.insumo_unidade_trabalho AS iut ON iut.unidade_trabalho_id = ut.id AND iut.insumo_id = i.id
        WHERE ut.bloco_id = $<blocoId> AND ut.subfase_id in ($<subfaseIds:csv>) AND i.grupo_insumo_id = $<grupoInsumoId> AND iut.id IS NULL
      `,
        { blocoId, subfaseIds, grupoInsumoId, caminhoPadrao }
      )
    case 5:
      return db.sapConn.none(
        `
        INSERT INTO macrocontrole.insumo_unidade_trabalho(unidade_trabalho_id, insumo_id, caminho_padrao)
        SELECT ut.id AS unidade_trabalho_id, i.id AS insumo_id, $<caminhoPadrao> AS caminho_padrao
        FROM macrocontrole.unidade_trabalho AS ut
        CROSS JOIN macrocontrole.insumo AS i
        LEFT JOIN macrocontrole.insumo_unidade_trabalho AS iut ON iut.unidade_trabalho_id = ut.id AND iut.insumo_id = i.id
        WHERE ut.bloco_id = $<blocoId> AND ut.subfase_id in ($<subfaseIds:csv>) AND i.grupo_insumo_id = $<grupoInsumoId> AND iut.id IS NULL
      `,
        { blocoId, subfaseIds, grupoInsumoId, caminhoPadrao }
      )
    default:
      throw new AppError('Estratégia inválida', httpCode.BadRequest)
  }
}

controller.getEstrategiaAssociacao = async () => {
  return db.sapConn.any('SELECT code, nome FROM dominio.tipo_estrategia_associacao')
}

controller.getPlugins = async () => {
  return db.sapConn.any(
    'SELECT id, nome, versao_minima FROM dgeo.plugin'
  )
}

controller.gravaPlugins = async plugins => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'nome',
      'versao_minima'
    ])

    const query = db.pgp.helpers.insert(plugins, cs, {
      table: 'plugin',
      schema: 'dgeo'
    })

    await t.none(query)
  })
}

controller.atualizaPlugins = async plugins => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'nome',
      'versao_minima'
    ])

    const query =
      db.pgp.helpers.update(
        plugins,
        cs,
        { table: 'plugin', schema: 'dgeo' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.deletaPlugins = async pluginsId => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM dgeo.plugin
      WHERE id in ($<pluginsId:csv>)`,
      { pluginsId }
    )
    if (exists && exists.length < pluginsId.length) {
      throw new AppError(
        'O id informado não corresponde a um plugin',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM dgeo.plugin
      WHERE id in ($<pluginsId:csv>)`,
      { pluginsId }
    )
  })
}

controller.getLote = async (filtroExecucao) => {
  if (filtroExecucao) {
    return db.sapConn.any(
      `SELECT l.id, l.nome, l.nome_abrev, l.denominador_escala, l.linha_producao_id, l.projeto_id, l.descricao,
      lp.tipo_produto_id, l.status_id, s.nome AS status
      FROM macrocontrole.lote AS l
      INNER JOIN macrocontrole.linha_producao AS lp ON l.linha_producao_id = lp.id
      INNER JOIN dominio.status AS s ON l.status_id = s.code
      WHERE l.status_id = 1
      `
    )
  } else {
    return db.sapConn.any(
      `SELECT l.id, l.nome, l.nome_abrev, l.denominador_escala, l.linha_producao_id, l.projeto_id, l.descricao,
      lp.tipo_produto_id, l.status_id, s.nome AS status
      FROM macrocontrole.lote AS l
      INNER JOIN macrocontrole.linha_producao AS lp ON l.linha_producao_id = lp.id
      INNER JOIN dominio.status AS s ON l.status_id = s.code
      `
    )
  }
}

controller.criaProjetos = async projetos => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'nome',
      'nome_abrev',
      'descricao',
      'status_id'
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

    const projetosFinalizando = projetos.filter(p => p.status_id !== 1);
    if (projetosFinalizando.length > 0) {
      const query = `
        SELECT COUNT(*) 
        FROM macrocontrole.lote 
        WHERE projeto_id = ANY($1)
        AND status_id = 1
      `;

      const lotesEmAndamento = await t.one(query, [projetosFinalizando.map(p => p.id)]);

      if (parseInt(lotesEmAndamento.count) > 0) {
        throw new AppError(
          'Não é possível finalizar o projeto. Existem lotes em andamento.',
          httpCode.BadRequest
        );
      }
    }

    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'nome',
      'nome_abrev',
      'descricao',
      'status_id'
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

    const lotesEmExecucao = lotes.filter(l => l.status_id === 1);

    if (lotesEmExecucao.length > 0) {
      const query = `
        SELECT COUNT(*) 
        FROM macrocontrole.projeto 
        WHERE id = ANY($1) 
        AND status_id != 1
      `;

      const projetosFinalizados = await t.one(
        query,
        [lotesEmExecucao.map(l => l.projeto_id)]
      );

      if (parseInt(projetosFinalizados.count) > 0) {
        throw new AppError(
          'Não é possível criar lotes em execução em projetos finalizados ou abandonados.',
          httpCode.BadRequest
        );
      }
    }

    const cs = new db.pgp.helpers.ColumnSet([
      'nome',
      'nome_abrev',
      'denominador_escala',
      'linha_producao_id',
      'projeto_id',
      'descricao',
      'status_id'
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
    const lotesFinalizando = lotes.filter(l => l.status_id !== 1);
    if (lotesFinalizando.length > 0) {
      const query = `
        SELECT COUNT(*) 
        FROM macrocontrole.bloco 
        WHERE lote_id = ANY($1) 
        AND status_id = 1
      `;

      // Check for linha_producao_id changes
      for (const lote of lotes) {
        const query = `
        SELECT l.linha_producao_id,
               EXISTS(SELECT 1 FROM macrocontrole.etapa e WHERE e.lote_id = l.id) AS has_etapas,
               EXISTS(SELECT 1 FROM macrocontrole.unidade_trabalho ut WHERE ut.lote_id = l.id) AS has_uts
        FROM macrocontrole.lote l
        WHERE l.id = $1
      `;

        const result = await t.one(query, [lote.id]);

        if (result.linha_producao_id !== lote.linha_producao_id) {
          if (result.has_etapas || result.has_uts) {
            throw new AppError(
              'Não é possível alterar a linha de produção do lote pois existem etapas ou unidades de trabalho associadas.',
              httpCode.BadRequest
            );
          }
        }
      }

      const blocosEmAndamento = await t.one(query, [lotesFinalizando.map(l => l.id)]);

      if (parseInt(blocosEmAndamento.count) > 0) {
        throw new AppError(
          'Não é possível finalizar o lote. Existem blocos em andamento.',
          httpCode.BadRequest
        );
      }
    }

    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'nome',
      'nome_abrev',
      'denominador_escala',
      'linha_producao_id',
      'projeto_id',
      'descricao',
      'status_id'
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

    const blocosEmExecucao = blocos.filter(b => b.status_id === 1);

    if (blocosEmExecucao.length > 0) {
      const query = `
        SELECT COUNT(*) 
        FROM macrocontrole.lote 
        WHERE id = ANY($1) 
        AND status_id != 1
      `;

      const lotesFinalizados = await t.one(
        query,
        [blocosEmExecucao.map(b => b.lote_id)]
      );

      if (parseInt(lotesFinalizados.count) > 0) {
        throw new AppError(
          'Não é possível criar blocos em execução em lotes finalizados ou abandonados.',
          httpCode.BadRequest
        );
      }
    }

    const cs = new db.pgp.helpers.ColumnSet([
      'nome',
      'prioridade',
      'lote_id',
      'status_id'
    ])

    const query = db.pgp.helpers.insert(blocos, cs, {
      table: 'bloco',
      schema: 'macrocontrole'
    })

    await t.none(query)
  })
}

controller.atualizaLinhaProducao = async linhasProducao => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'disponivel'
    ])

    const query =
      db.pgp.helpers.update(
        linhasProducao,
        cs,
        { table: 'linha_producao', schema: 'macrocontrole' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.atualizaBlocos = async blocos => {
  return db.sapConn.tx(async t => {

    const blocosEmExecucao = blocos.filter(b => b.status_id === 1);

    if (blocosEmExecucao.length > 0) {
      const query = `
          SELECT COUNT(*) 
          FROM macrocontrole.lote 
          WHERE id = ANY($1) 
          AND status_id != 1
        `;

      const lotesFinalizados = await t.one(
        query,
        [blocosEmExecucao.map(b => b.lote_id)]
      );

      if (parseInt(lotesFinalizados.count) > 0) {
        throw new AppError(
          'Não é possível manter ou colocar blocos em execução em lotes finalizados ou abandonados.',
          httpCode.BadRequest
        );
      }
    }

    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'nome',
      'prioridade',
      'lote_id',
      'status_id'
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

    await disableTriggers.refreshMaterializedViewFromBlocos(t, blocos.map(b => b.id))
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

controller.getPerfilAlias = async () => {
  return db.sapConn.any(
    `SELECT pa.id, pa.alias_id, pa.subfase_id, pa.lote_id,
    la.nome 
    FROM macrocontrole.perfil_alias AS pa
    INNER JOIN dgeo.layer_alias AS la ON la.id = pa.alias_id`
  )
}

controller.criaPerfilAlias = async perfilAlias => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'alias_id',
      'subfase_id',
      'lote_id'
    ])

    const query = db.pgp.helpers.insert(perfilAlias, cs, {
      table: 'perfil_alias',
      schema: 'macrocontrole'
    })

    await t.none(query)
  })
}

controller.atualizaPerfilAlias = async perfilAlias => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'alias_id',
      'subfase_id',
      'lote_id'
    ])

    const query =
      db.pgp.helpers.update(
        perfilAlias,
        cs,
        { table: 'perfil_alias', schema: 'macrocontrole' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.deletePerfilAlias = async perfilAliasId => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.perfil_alias
      WHERE id in ($<perfilAliasId:csv>)`,
      { perfilAliasId }
    )
    if (exists && exists.length < perfilAliasId.length) {
      throw new AppError(
        'O id informado não corresponde a um perfil alias',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM macrocontrole.perfil_alias
      WHERE id in ($<perfilAliasId:csv>)`,
      { perfilAliasId }
    )
  })
}

controller.getAlias = async () => {
  return db.sapConn.any(
    `SELECT la.id, la.nome, la.definicao_alias
    FROM dgeo.layer_alias AS la`
  )
}

controller.criaAlias = async (alias, usuarioId) => {
  return db.sapConn.tx(async t => {
    const usuarioPostoNome = getUsuarioNomeById(usuarioId)

    const cs = new db.pgp.helpers.ColumnSet([
      'nome',
      'definicao_alias',
      { name: 'owner', init: () => usuarioPostoNome },
      { name: 'update_time', mod: ':raw', init: () => 'NOW()' }
    ])

    const query = db.pgp.helpers.insert(alias, cs, {
      table: 'layer_alias',
      schema: 'dgeo'
    })

    await t.none(query)
  })
}

controller.atualizaAlias = async (alias, usuarioId) => {
  return db.sapConn.tx(async t => {
    const usuarioPostoNome = getUsuarioNomeById(usuarioId)

    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'nome',
      'definicao_alias',
      { name: 'owner', init: () => usuarioPostoNome },
      { name: 'update_time', mod: ':raw', init: () => 'NOW()' }
    ])

    const query =
      db.pgp.helpers.update(
        alias,
        cs,
        { table: 'layer_alias', schema: 'dgeo' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.deleteAlias = async aliasId => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM dgeo.layer_alias
      WHERE id in ($<aliasId:csv>)`,
      { aliasId }
    )
    if (exists && exists.length < aliasId.length) {
      throw new AppError(
        'O id informado não corresponde a um alias',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM dgeo.layer_alias
      WHERE id in ($<aliasId:csv>)`,
      { aliasId }
    )
  })
}

controller.getPerfilLinhagem = async () => {
  return db.sapConn.any(
    `SELECT pl.id, te.nome AS tipo_exibicao, pl.tipo_exibicao_id, pl.subfase_id, pl.lote_id
    FROM macrocontrole.perfil_linhagem AS pl
    INNER JOIN dominio.tipo_exibicao AS te ON te.code = pl.tipo_exibicao_id`
  )
}

controller.criaPerfilLinhagem = async perfilLinhagem => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'tipo_exibicao_id',
      'subfase_id',
      'lote_id'
    ])

    const query = db.pgp.helpers.insert(perfilLinhagem, cs, {
      table: 'perfil_linhagem',
      schema: 'macrocontrole'
    })

    await t.none(query)
  })
}

controller.atualizaPerfilLinhagem = async perfilLinhagem => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'tipo_exibicao_id',
      'subfase_id',
      'lote_id'
    ])

    const query =
      db.pgp.helpers.update(
        perfilLinhagem,
        cs,
        { table: 'perfil_linhagem', schema: 'macrocontrole' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.deletePerfilLinhagem = async perfilLinhagemId => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.perfil_linhagem
      WHERE id in ($<perfilLinhagemId:csv>)`,
      { perfilLinhagemId }
    )
    if (exists && exists.length < perfilLinhagemId.length) {
      throw new AppError(
        'O id informado não corresponde a um perfil linhagem',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM macrocontrole.perfil_linhagem
      WHERE id in ($<perfilLinhagemId:csv>)`,
      { perfilLinhagemId }
    )
  })
}

controller.getPerfilTemas = async () => {
  return db.sapConn.any(
    `SELECT pt.id, pt.tema_id, pt.subfase_id, pt.lote_id,
    qt.nome AS tema, qt.definicao_tema
    FROM macrocontrole.perfil_tema AS pt
    INNER JOIN dgeo.qgis_themes AS qt ON qt.id = pt.tema_id`
  )
}

controller.criaPerfilTemas = async perfilTema => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'tema_id',
      'subfase_id',
      'lote_id'
    ])

    const query = db.pgp.helpers.insert(perfilTema, cs, {
      table: 'perfil_tema',
      schema: 'macrocontrole'
    })

    await t.none(query)
  })
}

controller.atualizaPerfilTemas = async perfilTema => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'tema_id',
      'subfase_id',
      'lote_id'
    ])

    const query =
      db.pgp.helpers.update(
        perfilTema,
        cs,
        { table: 'perfil_tema', schema: 'macrocontrole' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.deletePerfilTemas = async perfilTemaId => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.perfil_tema
      WHERE id in ($<perfilTemaId:csv>)`,
      { perfilTemaId }
    )
    if (exists && exists.length < perfilTemaId.length) {
      throw new AppError(
        'O id informado não corresponde a um perfil tema',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM macrocontrole.perfil_tema
      WHERE id in ($<perfilTemaId:csv>)`,
      { perfilTemaId }
    )
  })
}

controller.getTemas = async () => {
  return db.sapConn.any(
    'SELECT id, nome, definicao_tema, owner, update_time FROM dgeo.qgis_themes'
  )
}

controller.gravaTemas = async (temas, usuarioId) => {
  return db.sapConn.tx(async t => {
    const usuarioPostoNome = getUsuarioNomeById(usuarioId)

    const cs = new db.pgp.helpers.ColumnSet([
      'nome',
      'definicao_tema',
      { name: 'owner', init: () => usuarioPostoNome },
      { name: 'update_time', mod: ':raw', init: () => 'NOW()' }
    ])

    const query = db.pgp.helpers.insert(temas, cs, {
      table: 'qgis_themes',
      schema: 'dgeo'
    })

    await t.none(query)
  })
}

controller.atualizaTemas = async (temas, usuarioId) => {
  return db.sapConn.tx(async t => {
    const usuarioPostoNome = getUsuarioNomeById(usuarioId)

    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'nome',
      'definicao_tema',
      { name: 'owner', init: () => usuarioPostoNome },
      { name: 'update_time', mod: ':raw', init: () => 'NOW()' }
    ])

    const query =
      db.pgp.helpers.update(
        temas,
        cs,
        { table: 'qgis_themes', schema: 'dgeo' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.deletaTemas = async temasId => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM dgeo.qgis_themes
      WHERE id in ($<temasId:csv>)`,
      { temasId }
    )
    if (exists && exists.length < temasId.length) {
      throw new AppError(
        'O id informado não corresponde a um tema',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM dgeo.qgis_themes
      WHERE id in ($<temasId:csv>)`,
      { temasId }
    )
  })
}

controller.reshapeUnidadeTrabalho = async (unidadeTrabalhoId, reshapeGeom) => {
  await disableTriggers.disableAllTriggersInTransaction(db.sapConn, async t => {
    let execution = await t.any(
      `SELECT 1 FROM macrocontrole.atividade AS a
      WHERE a.unidade_trabalho_id = $<unidadeTrabalhoId> AND a.tipo_situacao_id IN (2,3)`,
      { unidadeTrabalhoId }
    )
    if (execution && execution.length > 0) {
      throw new AppError(
        'A Unidade de Trabalho possui atividades em execução ou pausada',
        httpCode.BadRequest
      )
    }

    await t.none(
      `UPDATE macrocontrole.unidade_trabalho
      SET geom = ST_GEOMFROMEWKT($<reshapeGeom>)
      WHERE id = $<unidadeTrabalhoId>`,
      { unidadeTrabalhoId, reshapeGeom }
    )

  }) -
    await disableTriggers.handleRelacionamentoUtInsertUpdate(db.sapConn, [unidadeTrabalhoId])
  await disableTriggers.refreshMaterializedViewFromUTs(db.sapConn, [unidadeTrabalhoId])
}

controller.cutUnidadeTrabalho = async (unidadeTrabalhoId, cutGeoms) => {
  let utIdsFixed;
  await disableTriggers.disableAllTriggersInTransaction(db.sapConn, async t => {
    let execution = await t.any(
      `SELECT 1 FROM macrocontrole.atividade AS a
        WHERE a.unidade_trabalho_id = $<unidadeTrabalhoId> AND a.tipo_situacao_id IN (2,3)`,
      { unidadeTrabalhoId }
    )
    if (execution && execution.length > 0) {
      throw new AppError(
        'A Unidade de Trabalho possui atividades em execução ou pausada',
        httpCode.BadRequest
      )
    }

    let firstGeom = cutGeoms.shift()

    await t.none(
      `UPDATE macrocontrole.unidade_trabalho
      SET geom = ST_GEOMFROMEWKT($<firstGeom>)
      WHERE id = $<unidadeTrabalhoId>`,
      { unidadeTrabalhoId, firstGeom }
    )

    let novasUtId = await t.any(
      `INSERT INTO macrocontrole.unidade_trabalho(nome,epsg,dado_producao_id,subfase_id,lote_id,bloco_id,disponivel,dificuldade,tempo_estimado_minutos,prioridade,observacao,geom)
       SELECT ut.nome,ut.epsg,ut.dado_producao_id,ut.subfase_id,ut.lote_id,ut.bloco_id,ut.disponivel,ut.dificuldade,ut.tempo_estimado_minutos,ut.prioridade,ut.observacao,
       ST_GEOMFROMEWKT(ref.geom) as geom
       FROM macrocontrole.unidade_trabalho AS ut
       CROSS JOIN (SELECT v as geom FROM UNNEST($<cutGeoms>::text[]) AS t(v)) AS ref
       WHERE ut.id = $<unidadeTrabalhoId> RETURNING id;
      `,
      { unidadeTrabalhoId, cutGeoms }
    )
    utIdsFixed = [...novasUtId.map(obj => obj.id)]

    await t.none(
      `INSERT INTO macrocontrole.insumo_unidade_trabalho(unidade_trabalho_id,insumo_id,caminho_padrao)
       SELECT ref.unidade_trabalho_id, iut.insumo_id, iut.caminho_padrao
       FROM macrocontrole.insumo_unidade_trabalho AS iut
       CROSS JOIN (SELECT v as unidade_trabalho_id FROM UNNEST($<utIdsFixed>::integer[]) AS t(v)) AS ref
       WHERE iut.unidade_trabalho_id = $<unidadeTrabalhoId>;
      `,
      { unidadeTrabalhoId, utIdsFixed }
    )

    await t.none(
      `INSERT INTO macrocontrole.atividade(etapa_id,unidade_trabalho_id,usuario_id,tipo_situacao_id,data_inicio,data_fim,observacao)
       SELECT a.etapa_id,ref.unidade_trabalho_id,a.usuario_id,a.tipo_situacao_id,a.data_inicio,a.data_fim,a.observacao
       FROM macrocontrole.atividade AS a
       CROSS JOIN (SELECT v as unidade_trabalho_id FROM UNNEST($<utIdsFixed>::integer[]) AS t(v)) AS ref
       WHERE a.unidade_trabalho_id = $<unidadeTrabalhoId>;
      `,
      { unidadeTrabalhoId, utIdsFixed }
    )

    utIdsFixed.push(unidadeTrabalhoId)

  })
  await disableTriggers.handleRelacionamentoUtInsertUpdate(db.sapConn, utIdsFixed)
  await disableTriggers.refreshMaterializedViewFromUTs(db.sapConn, utIdsFixed)
}

controller.mergeUnidadeTrabalho = async (unidadeTrabalhoIds, mergeGeom) => {
  let firstId
  await disableTriggers.disableAllTriggersInTransaction(db.sapConn, async t => {
    let execution = await t.any(
      `SELECT 1 FROM macrocontrole.atividade AS a
      WHERE a.unidade_trabalho_id IN ($<unidadeTrabalhoIds:csv>) AND a.tipo_situacao_id IN (2,3)`,
      { unidadeTrabalhoIds }
    )
    if (execution && execution.length > 0) {
      throw new AppError(
        'A Unidade de Trabalho possui atividades em execução ou pausada',
        httpCode.BadRequest
      )
    }

    let consistency = await t.any(
      `SELECT DISTINCT ON (subfase_id, lote_id, bloco_id) 1 FROM macrocontrole.unidade_trabalho
      WHERE id IN ($<unidadeTrabalhoIds:csv>)`,
      { unidadeTrabalhoIds }
    )
    if (consistency && consistency.length > 1) {
      throw new AppError(
        'A Unidade de Trabalho são de subfases, lotes ou blocos divergentes',
        httpCode.BadRequest
      )
    }

    firstId = unidadeTrabalhoIds.shift()

    await t.none(
      `UPDATE macrocontrole.unidade_trabalho
      SET geom = ST_GEOMFROMEWKT($<mergeGeom>)
      WHERE id = $<firstId>`,
      { firstId, mergeGeom }
    )

    let updatedIds = await t.any(
      `UPDATE macrocontrole.atividade AS a
      SET tipo_situacao_id = 5
      FROM (
        SELECT etapa_id, MIN(tipo_situacao_id)
        FROM macrocontrole.atividade
        WHERE unidade_trabalho_id IN ($<unidadeTrabalhoIds:csv>, $<firstId>) AND tipo_situacao_id != 5
        GROUP BY etapa_id
        HAVING MIN(tipo_situacao_id) = 1
      ) AS sub
      WHERE a.unidade_trabalho_id = $<firstId> AND a.etapa_id = sub.etapa_id
      AND a.tipo_situacao_id = 4 RETURNING id`,
      { firstId, unidadeTrabalhoIds }
    )
    let fixedIds = updatedIds.map(c => c.id);
    if (fixedIds.length > 0) {
      await t.none(
        `INSERT INTO macrocontrole.atividade(etapa_id,unidade_trabalho_id,tipo_situacao_id,observacao)
        SELECT a.etapa_id, $<firstId> AS unidade_trabalho_id, 1, a.observacao
        FROM macrocontrole.atividade AS a
        WHERE a.id in ($<fixedIds:csv>)`,
        { firstId, fixedIds }
      )
    }

    await t.any(
      `UPDATE macrocontrole.atividade AS a
      SET observacao = concat_ws(' | ', observacao, sub.observacao_agg)
      FROM (
        SELECT etapa_id, string_agg(observacao, ' | ') AS observacao_agg
        FROM macrocontrole.atividade
        WHERE unidade_trabalho_id IN ($<unidadeTrabalhoIds:csv>) AND tipo_situacao_id = 1
        GROUP BY etapa_id
      ) AS sub
      WHERE a.unidade_trabalho_id = $<firstId> AND a.etapa_id = sub.etapa_id
      AND a.tipo_situacao_id = 1`,
      { firstId, unidadeTrabalhoIds }
    )

    await t.none(
      `INSERT INTO macrocontrole.insumo_unidade_trabalho(unidade_trabalho_id,insumo_id,caminho_padrao)
      SELECT DISTINCT ON (iut.insumo_id, iut.caminho_padrao) $<firstId> AS unidade_trabalho_id, iut.insumo_id, iut.caminho_padrao
      FROM macrocontrole.insumo_unidade_trabalho AS iut
      WHERE iut.unidade_trabalho_id IN ($<unidadeTrabalhoIds:csv>) AND 
      (iut.insumo_id, iut.caminho_padrao) NOT IN (
        SELECT insumo_id, caminho_padrao FROM macrocontrole.insumo_unidade_trabalho
        WHERE unidade_trabalho_id = $<firstId>
      )`,
      { firstId, unidadeTrabalhoIds }
    )

    await t.none(
      `UPDATE macrocontrole.insumo_unidade_trabalho
      SET unidade_trabalho_id = $<firstId>
      WHERE unidade_trabalho_id IN ($<unidadeTrabalhoIds:csv>) AND 
      (insumo_id, caminho_padrao) NOT IN (
        SELECT insumo_id, caminho_padrao FROM macrocontrole.insumo_unidade_trabalho
        WHERE unidade_trabalho_id = $<firstId>
      )`,
      { firstId, unidadeTrabalhoIds }
    )

    await t.none(
      `DELETE FROM macrocontrole.insumo_unidade_trabalho
       WHERE unidade_trabalho_id IN ($<unidadeTrabalhoIds:csv>);
      `,
      { unidadeTrabalhoIds }
    )

    await t.none(
      `UPDATE macrocontrole.atividade
       SET tipo_situacao_id = 5, unidade_trabalho_id = $<firstId>
       WHERE unidade_trabalho_id IN ($<unidadeTrabalhoIds:csv>) AND tipo_situacao_id in (4,5);
      `,
      { firstId, unidadeTrabalhoIds }
    )

    await t.none(
      `DELETE FROM macrocontrole.atividade
       WHERE unidade_trabalho_id IN ($<unidadeTrabalhoIds:csv>) AND tipo_situacao_id = 1;
      `,
      { unidadeTrabalhoIds }
    )

    await t.none(
      `DELETE FROM macrocontrole.unidade_trabalho
       WHERE id IN ($<unidadeTrabalhoIds:csv>);
      `,
      { unidadeTrabalhoIds }
    )

  })
  await disableTriggers.handleRelacionamentoUtInsertUpdate(db.sapConn, [firstId])
  await disableTriggers.handleRelacionamentoUtDelete(db.sapConn, unidadeTrabalhoIds)
  await disableTriggers.refreshMaterializedViewFromUTs(db.sapConn, [firstId])
}

controller.insereLinhaProducao = async linha_producao => {
  return db.sapConn.tx(async t => {
    const linha = await t.one(
      `INSERT INTO macrocontrole.linha_producao(nome, descricao, nome_abrev, tipo_produto_id, disponivel) VALUES($1, $2, $3, $4, true) RETURNING id`,
      [linha_producao.nome, linha_producao.descricao, linha_producao.nome_abrev, linha_producao.tipo_produto_id]
    );

    let subfaseMap = {};
    for (const fase of linha_producao.fases) {
      const faseInserted = await t.one(
        `INSERT INTO macrocontrole.fase(tipo_fase_id, linha_producao_id, ordem) VALUES($1, $2, $3) RETURNING id`,
        [fase.tipo_fase_id, linha.id, fase.ordem]
      );

      for (const subfase of fase.subfases) {
        const subfaseInserted = await t.one(
          `INSERT INTO macrocontrole.subfase(nome, fase_id, ordem) VALUES($1, $2, $3) RETURNING id`,
          [subfase.nome, faseInserted.id, subfase.ordem]
        );
        subfaseMap[subfase.nome] = subfaseInserted.id;
      }

      for (const preReq of fase.pre_requisito_subfase) {
        const anteriorId = subfaseMap[preReq.subfase_anterior];
        const posteriorId = subfaseMap[preReq.subfase_posterior];
        await t.none(
          `INSERT INTO macrocontrole.pre_requisito_subfase(tipo_pre_requisito_id, subfase_anterior_id, subfase_posterior_id) VALUES($1, $2, $3)`,
          [preReq.tipo_pre_requisito_id, anteriorId, posteriorId]
        );
      }
    }

    for (const prop of linha_producao.propriedades_camadas) {
      let camadaId;
      const camadaQuery = await t.oneOrNone(`SELECT id FROM macrocontrole.camada WHERE nome = $1 and schema = $2`, [prop.camada, prop.schema]);
      if (!camadaQuery) {
        const insertResult = await t.one(`INSERT INTO macrocontrole.camada (nome, schema) VALUES ($1, $2) RETURNING id`, [prop.camada, prop.schema]);
        camadaId = insertResult.id;
      } else {
        camadaId = camadaQuery.id;
      }

      const subfaseId = subfaseMap[prop.subfase];
      await t.none(
        `INSERT INTO macrocontrole.propriedades_camada(camada_id, atributo_filtro_subfase, camada_apontamento, camada_incomum, atributo_situacao_correcao, atributo_justificativa_apontamento, subfase_id) 
        VALUES($1, $2, $3, $4, $5, $6, $7)`,
        [camadaId, prop.atributo_filtro_subfase, prop.camada_apontamento, prop.camada_incomum, prop.atributo_situacao_correcao, prop.atributo_justificativa_apontamento, subfaseId]);
    }

  })
}

controller.getPerfilConfiguracaoQgis = async () => {
  return db.sapConn.any(
    `SELECT pcg.tipo_configuracao_id, tc.nome AS tipo_configuracao, pcg.parametros, pcg.subfase_id, pcg.lote_id
    FROM macrocontrole.perfil_configuracao_qgis AS pcg
    INNER JOIN dominio.tipo_configuracao AS tc ON tc.code = pa.tipo_configuracao_id`
  )
}

controller.criaPerfilConfiguracaoQgis = async perfisConfiguracaoQgis => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'tipo_configuracao_id',
      'parametros',
      'subfase_id',
      'lote_id'
    ])

    const query = db.pgp.helpers.insert(perfisConfiguracaoQgis, cs, {
      table: 'perfil_configuracao_qgis',
      schema: 'macrocontrole'
    })

    await t.none(query)
  })
}

controller.atualizaPerfilConfiguracaoQgis = async perfisConfiguracaoQgisId => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'tipo_configuracao_id',
      'parametros',
      'subfase_id',
      'lote_id'
    ])

    const query =
      db.pgp.helpers.update(
        perfisConfiguracaoQgisId,
        cs,
        { table: 'perfil_configuracao_qgis', schema: 'macrocontrole' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.deletePerfilConfiguracaoQgis = async perfisConfiguracaoQgisId => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.perfil_configuracao_qgis
      WHERE id in ($<perfisConfiguracaoQgisId:csv>)`,
      { perfisConfiguracaoQgisId }
    )
    if (exists && exists.length < perfisConfiguracaoQgisId.length) {
      throw new AppError(
        'O id informado não corresponde a um perfil configuracao id',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM macrocontrole.perfil_configuracao_qgis
      WHERE id in ($<perfisConfiguracaoQgisId:csv>)`,
      { perfisConfiguracaoQgisId }
    )
  })
}

controller.getPerfilDificuldadeOperador = async () => {
  return db.sapConn.any(
    `SELECT pdo.id, pdo.usuario_id, pdo.subfase_id, pdo.lote_id, pdo.tipo_perfil_dificuldade_id,
     tpd.nome AS tipo_perfil_dificuldade
     FROM macrocontrole.perfil_dificuldade_operador AS pdo
     INNER JOIN dominio.tipo_perfil_dificuldade AS tpd
     ON tpd.code = pdo.tipo_perfil_dificuldade_id
    `)
}

controller.criaPerfilDificuldadeOperador = async perfisDificuldadeOperador => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'usuario_id',
      'subfase_id',
      'lote_id',
      'tipo_perfil_dificuldade_id'
    ])

    const query = db.pgp.helpers.insert(perfisDificuldadeOperador, cs, {
      table: 'perfil_dificuldade_operador',
      schema: 'macrocontrole'
    })

    await t.none(query)
  })
}

controller.atualizaPerfilDificuldadeOperador = async perfisDificuldadeOperador => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'usuario_id',
      'subfase_id',
      'lote_id',
      'tipo_perfil_dificuldade_id'
    ])

    const query =
      db.pgp.helpers.update(
        perfisDificuldadeOperador,
        cs,
        { table: 'perfil_dificuldade_operador', schema: 'macrocontrole' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.deletePerfilDificuldadeOperador = async perfisDificuldadeOperadorId => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.perfil_dificuldade_operador
      WHERE id in ($<perfisDificuldadeOperadorId:csv>)`,
      { perfisDificuldadeOperadorId }
    )
    if (exists && exists.length < perfisDificuldadeOperadorId.length) {
      throw new AppError(
        'O id informado não corresponde a um perfil configuracao id',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM macrocontrole.perfil_dificuldade_operador
      WHERE id in ($<perfisDificuldadeOperadorId:csv>)`,
      { perfisDificuldadeOperadorId }
    )
  })
}

controller.getTipoPerfilDificuldade = async () => {
  return db.sapConn.any(
    `SELECT tpd.code, tpd.nome AS tipo_perfil_dificuldade
     FROM dominio.tipo_perfil_dificuldade AS tpd
    `)
}

controller.copiarConfiguracaoLote = async (
  lote_id_origem,
  lote_id_destino,
  copiar_estilo,
  copiar_menu,
  copiar_regra,
  copiar_modelo,
  copiar_workflow,
  copiar_alias,
  copiar_linhagem,
  copiar_finalizacao,
  copiar_tema,
  copiar_fme,
  copiar_configuracao_qgis,
  copiar_monitoramento
) => {
  let valid = await db.sapConn.any(
    `
    SELECT 1
    FROM macrocontrole.lote AS l1
    INNER JOIN macrocontrole.lote AS l2 ON l1.linha_producao_id = l2.linha_producao_id
    WHERE l1.id = $<lote_id_origem> AND l2.id = $<lote_id_destino> AND l1.id != l2.id
    `,
    { lote_id_origem, lote_id_destino }
  )
  if (valid.length === 0) {
    throw new AppError(
      'Lotes inválidos',
      httpCode.BadRequest
    )
  }

  if (copiar_estilo) {
    await db.sapConn.any(
      `
      INSERT INTO macrocontrole.perfil_estilo(grupo_estilo_id,subfase_id,lote_id)
      SELECT pe.grupo_estilo_id, pe.subfase_id, $<lote_id_destino> AS lote_id
      FROM macrocontrole.perfil_estilo AS pe
      WHERE pe.lote_id = $<lote_id_origem>
      `,
      { lote_id_origem, lote_id_destino }
    )
  }

  if (copiar_menu) {
    await db.sapConn.any(
      `
      INSERT INTO macrocontrole.perfil_menu(menu_id,menu_revisao,subfase_id,lote_id)
      SELECT pe.menu_id, pe.menu_revisao, pe.subfase_id, $<lote_id_destino> AS lote_id
      FROM macrocontrole.perfil_menu AS pe
      WHERE pe.lote_id = $<lote_id_origem>
      `,
      { lote_id_origem, lote_id_destino }
    )
  }

  if (copiar_regra) {
    await db.sapConn.any(
      `
      INSERT INTO macrocontrole.perfil_regras(layer_rules_id,subfase_id,lote_id)
      SELECT pe.layer_rules_id, pe.subfase_id, $<lote_id_destino> AS lote_id
      FROM macrocontrole.perfil_regras AS pe
      WHERE pe.lote_id = $<lote_id_origem>
      `,
      { lote_id_origem, lote_id_destino }
    )
  }

  if (copiar_modelo) {
    await db.sapConn.any(
      `
      INSERT INTO macrocontrole.perfil_model_qgis(qgis_model_id,parametros,requisito_finalizacao,tipo_rotina_id,ordem,subfase_id,lote_id)
      SELECT pe.qgis_model_id, pe.parametros, pe.requisito_finalizacao, pe.tipo_rotina_id, pe.ordem, pe.subfase_id, $<lote_id_destino> AS lote_id
      FROM macrocontrole.perfil_model_qgis AS pe
      WHERE pe.lote_id = $<lote_id_origem>
      `,
      { lote_id_origem, lote_id_destino }
    )
  }

  if (copiar_workflow) {
    await db.sapConn.any(
      `
      INSERT INTO macrocontrole.perfil_workflow_dsgtools(workflow_dsgtools_id,requisito_finalizacao,subfase_id,lote_id)
      SELECT pe.workflow_dsgtools_id, pe.requisito_finalizacao, pe.subfase_id, $<lote_id_destino> AS lote_id
      FROM macrocontrole.perfil_workflow_dsgtools AS pe
      WHERE pe.lote_id = $<lote_id_origem>
      `,
      { lote_id_origem, lote_id_destino }
    )
  }

  if (copiar_alias) {
    await db.sapConn.any(
      `
      INSERT INTO macrocontrole.perfil_alias(alias_id,subfase_id,lote_id)
      SELECT pe.alias_id, pe.subfase_id, $<lote_id_destino> AS lote_id
      FROM macrocontrole.perfil_alias AS pe
      WHERE pe.lote_id = $<lote_id_origem>
      `,
      { lote_id_origem, lote_id_destino }
    )
  }

  if (copiar_linhagem) {
    await db.sapConn.any(
      `
      INSERT INTO macrocontrole.perfil_linhagem(tipo_exibicao_id,subfase_id,lote_id)
      SELECT pe.tipo_exibicao_id, pe.subfase_id, $<lote_id_destino> AS lote_id
      FROM macrocontrole.perfil_linhagem AS pe
      WHERE pe.lote_id = $<lote_id_origem>
      `,
      { lote_id_origem, lote_id_destino }
    )
  }

  if (copiar_finalizacao) {
    await db.sapConn.any(
      `
      INSERT INTO macrocontrole.perfil_requisito_finalizacao(descricao,ordem,subfase_id,lote_id)
      SELECT pe.descricao, pe.ordem, pe.subfase_id, $<lote_id_destino> AS lote_id
      FROM macrocontrole.perfil_requisito_finalizacao AS pe
      WHERE pe.lote_id = $<lote_id_origem>
      `,
      { lote_id_origem, lote_id_destino }
    )
  }

  if (copiar_tema) {
    await db.sapConn.any(
      `
      INSERT INTO macrocontrole.perfil_tema(tema_id,subfase_id,lote_id)
      SELECT pe.tema_id, pe.subfase_id, $<lote_id_destino> AS lote_id
      FROM macrocontrole.perfil_tema AS pe
      WHERE pe.lote_id = $<lote_id_origem>
      `,
      { lote_id_origem, lote_id_destino }
    )
  }

  if (copiar_fme) {
    await db.sapConn.any(
      `
      INSERT INTO macrocontrole.perfil_fme(gerenciador_fme_id,rotina,requisito_finalizacao,tipo_rotina_id,ordem,subfase_id,lote_id)
      SELECT pe.gerenciador_fme_id, pe.rotina, pe.requisito_finalizacao, pe.tipo_rotina_id, pe.ordem, pe.subfase_id, $<lote_id_destino> AS lote_id
      FROM macrocontrole.perfil_fme AS pe
      WHERE pe.lote_id = $<lote_id_origem>
      `,
      { lote_id_origem, lote_id_destino }
    )
  }

  if (copiar_configuracao_qgis) {
    await db.sapConn.any(
      `
      INSERT INTO macrocontrole.perfil_configuracao_qgis(tipo_configuracao_id,parametros,subfase_id,lote_id)
      SELECT pe.tipo_configuracao_id, pe.parametros, pe.subfase_id, $<lote_id_destino> AS lote_id
      FROM macrocontrole.perfil_configuracao_qgis AS pe
      WHERE pe.lote_id = $<lote_id_origem>
      `,
      { lote_id_origem, lote_id_destino }
    )
  }

  // if(copiar_monitoramento){
  //   await db.sapConn.any(
  //     `
  //     INSERT INTO microcontrole.perfil_monitoramento(tipo_monitoramento_id,subfase_id,lote_id)
  //     SELECT pe.tipo_monitoramento_id, pe.subfase_id, $<lote_id_destino> AS lote_id
  //     FROM microcontrole.perfil_monitoramento AS pe
  //     WHERE pe.lote_id = $<lote_id_origem>
  //     `,
  //     { lote_id_origem, lote_id_destino }
  //   )
  // }

}

controller.getPerfilWorkflowDsgtools = async () => {
  return db.sapConn.any(
    `SELECT pwd.id, pwd.workflow_dsgtools_id, pwd.subfase_id, pwd.lote_id, pwd.requisito_finalizacao,
    wd.nome, wd.descricao, wd.workflow_json, wd.owner, wd.update_time
     FROM macrocontrole.perfil_workflow_dsgtools AS pwd
     INNER JOIN dgeo.workflow_dsgtools AS wd
     ON wd.id = pwd.workflow_dsgtools_id
    `)
}

controller.criaPerfilWorkflowDsgtools = async perfilWorkflowDsgtools => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'workflow_dsgtools_id',
      'subfase_id',
      'lote_id',
      'requisito_finalizacao'
    ])

    const query = db.pgp.helpers.insert(perfilWorkflowDsgtools, cs, {
      table: 'perfil_workflow_dsgtools',
      schema: 'macrocontrole'
    })

    await t.none(query)
  })
}

controller.atualizaPerfilWorkflowDsgtools = async perfilWorkflowDsgtools => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'workflow_dsgtools_id',
      'subfase_id',
      'lote_id',
      'requisito_finalizacao'
    ])

    const query =
      db.pgp.helpers.update(
        perfilWorkflowDsgtools,
        cs,
        { table: 'perfil_workflow_dsgtools', schema: 'macrocontrole' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.deletePerfilWorkflowDsgtools = async perfilWorkflowDsgtoolsId => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.perfil_workflow_dsgtools
      WHERE id in ($<perfilWorkflowDsgtoolsId:csv>)`,
      { perfilWorkflowDsgtoolsId }
    )
    if (exists && exists.length < perfilWorkflowDsgtoolsId.length) {
      throw new AppError(
        'O id informado não corresponde a um perfil workflow dsgtools',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM macrocontrole.perfil_workflow_dsgtools
      WHERE id in ($<perfilWorkflowDsgtoolsId:csv>)`,
      { perfilWorkflowDsgtoolsId }
    )
  })
}

controller.getWorkflows = async () => {
  return db.sapConn.any(
    `SELECT id, nome, descricao, workflow_json, owner, update_time 
    FROM dgeo.workflow_dsgtools`
  )
}

controller.gravaWorkflows = async (workflows, usuarioId) => {
  return db.sapConn.tx(async t => {
    const usuarioPostoNome = getUsuarioNomeById(usuarioId)

    const cs = new db.pgp.helpers.ColumnSet([
      'nome',
      'descricao',
      'workflow_json',
      { name: 'owner', init: () => usuarioPostoNome },
      { name: 'update_time', mod: ':raw', init: () => 'NOW()' }
    ])

    const query = db.pgp.helpers.insert(workflows, cs, {
      table: 'workflow_dsgtools',
      schema: 'dgeo'
    })

    await t.none(query)
  })
}

controller.atualizaWorkflows = async (workflows, usuarioId) => {
  return db.sapConn.tx(async t => {
    const usuarioPostoNome = getUsuarioNomeById(usuarioId)

    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'nome',
      'descricao',
      'workflow_json',
      { name: 'owner', init: () => usuarioPostoNome },
      { name: 'update_time', mod: ':raw', init: () => 'NOW()' }
    ])

    const query =
      db.pgp.helpers.update(
        workflows,
        cs,
        { table: 'workflow_dsgtools', schema: 'dgeo' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.deletaWorkflows = async workflowsId => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM dgeo.workflow_dsgtools
      WHERE id in ($<workflowsId:csv>)`,
      { workflowsId }
    )
    if (exists && exists.length < workflowsId.length) {
      throw new AppError(
        'O id informado não corresponde a um workflow dsgtools',
        httpCode.BadRequest
      )
    }

    const existsAssociation = await t.any(
      `SELECT id FROM macrocontrole.perfil_workflow_dsgtools 
      WHERE workflow_dsgtools_id in ($<workflowsId:csv>)`,
      { workflowsId }
    )
    if (existsAssociation && existsAssociation.length > 0) {
      throw new AppError(
        'O workflow possui perfis associados',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM dgeo.workflow_dsgtools
      WHERE id in ($<workflowsId:csv>)`,
      { workflowsId }
    )
  })
}


module.exports = controller
