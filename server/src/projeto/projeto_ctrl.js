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
    .any('SELECT code, nome FROM dominio.tipo_pre_requisito')
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
    if (exists && exists.length < grupoRegrasId.length) {
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
    .any(`SELECT ls.id, ls.f_table_schema, ls.f_table_name, ls.f_geometry_column, gs.nome AS stylename, ls.styleqml, ls.stylesld, ls.ui, ls.owner, ls.update_time
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
    SELECT lr.id, lr.grupo_regra_id, gr.grupo_regra, lr.schema, lr.camada, lr.atributo, lr.regra, lr.descricao, lr.owner, lr.update_time
    FROM dgeo.group_rules AS gr
    INNER JOIN dgeo.layer_rules AS lr ON lr.grupo_regra_id = gr.id
    `)
}

controller.gravaRegras = async (regras, usuarioId) => {
  return db.sapConn.tx(async t => {
    const usuarioPostoNome = getUsuarioNomeById(usuarioId)

    const cs = new db.pgp.helpers.ColumnSet([
      'grupo_regra_id',
      'schema',
      'camada',
      'atributo',
      'regra',
      'descricao',
      { name: 'owner', init: () => usuarioPostoNome },
      { name: 'update_time', mod: ':raw', init: () => 'NOW()' }
    ])

    const query = db.pgp.helpers.insert(regras, cs, {
      table: 'layer_rules',
      schema: 'dgeo'
    })

    await t.none(query)
  })
}

controller.atualizaRegras = async (regras, usuarioId) => {
  return db.sapConn.tx(async t => {
    const usuarioPostoNome = getUsuarioNomeById(usuarioId)

    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'grupo_regra_id',
      'schema',
      'camada',
      'atributo',
      'regra',
      'descricao',
      { name: 'owner', init: () => usuarioPostoNome },
      { name: 'update_time', mod: ':raw', init: () => 'NOW()' }
    ])

    const query =
      db.pgp.helpers.update(
        regras,
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

controller.deletaRegras = async regrasId => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM dgeo.layer_rules
      WHERE id in ($<regrasId:csv>)`,
      { regrasId }
    )
    if (exists && exists.length < regrasId.length) {
      throw new AppError(
        'O id informado não corresponde a regras de atributos',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM dgeo.layer_rules
      WHERE id in ($<regrasId:csv>)`,
      { regrasId }
    )
  })
}

controller.getGrupoRegras = async () => {
  return await db.sapConn.any(`
  SELECT gr.id, gr.grupo_regra, gr.cor_rgb, gr.ordem
  FROM dgeo.group_rules AS gr
  `)
}

controller.gravaGrupoRegras = async (grupoRegras, usuarioId) => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      'grupo_regra',
      'cor_rgb',
      'ordem'
    ])

    const query = db.pgp.helpers.insert(grupoRegras, cs, {
      table: 'group_rules',
      schema: 'dgeo'
    })

    await t.none(query)
  })
}

controller.atualizaGrupoRegras = async (grupoRegras, usuarioId) => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'grupo_regra',
      'cor_rgb',
      'ordem'
    ])

    const query =
      db.pgp.helpers.update(
        grupoRegras,
        cs,
        { table: 'group_rules', schema: 'dgeo' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.deletaGrupoRegras = async grupoRegrasId => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM dgeo.group_rules
      WHERE id in ($<grupoRegrasId:csv>)`,
      { grupoRegrasId }
    )
    if (exists && exists.length < grupoRegrasId.length) {
      throw new AppError(
        'O id informado não corresponde a um grupo de regras',
        httpCode.BadRequest
      )
    }

    const existsAssociation1 = await t.any(
      `SELECT id FROM macrocontrole.perfil_regras 
      WHERE grupo_regra_id in ($<grupoRegrasId:csv>)`,
      { grupoRegrasId }
    )
    if (existsAssociation1 && existsAssociation1.length > 0) {
      throw new AppError(
        'O grupo regras possui perfil de regras associadas',
        httpCode.BadRequest
      )
    }

    const existsAssociation2 = await t.any(
      `SELECT id FROM dgeo.layer_rules 
      WHERE grupo_regra_id in ($<grupoRegrasId:csv>)`,
      { grupoRegrasId }
    )
    if (existsAssociation2 && existsAssociation2.length > 0) {
      throw new AppError(
        'O grupo regras possui regras associadas',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM dgeo.group_rules
      WHERE id in ($<grupoRegrasId:csv>)`,
      { grupoRegrasId }
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
      'nome_menu',
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
      'nome_menu',
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

controller.getBancoDados = async () => {
  return db.sapConn.any(
    `SELECT nome, split_part(configuracao_producao, ':', 1) AS servidor,
    split_part(split_part(configuracao_producao, ':', 2), '/', 1) AS porta,
    split_part(split_part(configuracao_producao, ':', 2), '/', 2) AS nome
    FROM macrocontrole.dado_producao WHERE tipo_dado_producao_id IN (2,3)`
  )
}

controller.getDadoProducao = async () => {
  return db.sapConn.any(
    `SELECT dp.id, dp.tipo_dado_producao_id, tdp.nome AS tipo_dado_producao,
    configuracao_producao
    FROM macrocontrole.dado_producao AS dp
    INNER JOIN dominio.tipo_dado_producao AS tdp On tdp.code = dp.tipo_dado_producao_id`
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
  return db.sapConn.any('SELECT id, nome, lote_id FROM macrocontrole.bloco')
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
  WHERE unidade_trabalho_id in ($<unidadeTrabalhoIds:csv>) AND tipo_situacao_id IN (1)
  `,
    { unidadeTrabalhoIds }
  )
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
    'SELECT id, nome FROM macrocontrole.projeto'
  )
}

controller.getLinhasProducao = async () => {
  return db.sapConn.any(
    `SELECT lp.id, lp.nome, lp.tipo_produto_id, tp.nome AS tipo_produto
    FROM macrocontrole.linha_producao AS lp
    INNER JOIN dominio.tipo_produto AS tp ON tp.code = lp.tipo_produto_id
    `
  )
}

controller.getFases = async () => {
  return db.sapConn.any(
    `SELECT f.id, tf.nome, f.tipo_fase_id, f.linha_producao_id, f.ordem,
    lp.nome AS linha_producao, tp.nome AS tipo_produto
    FROM macrocontrole.fase AS f
    INNER JOIN dominio.tipo_fase AS tf ON tf.code = f.tipo_fase_id
    INNER JOIN macrocontrole.linha_producao AS lp ON lp.id = f.linha_producao_id
    INNER JOIN dominio.tipo_produto AS tp ON tp.code = lp.tipo_produto_id`
  )
}

controller.getSubfases = async () => {
  return db.sapConn.any(
    `SELECT s.id, s.nome, s.fase_id,
    tf.nome as fase, f.tipo_fase_id, f.linha_producao_id, f.ordem,
    lp.nome AS linha_producao, tp.nome AS tipo_produto
    FROM macrocontrole.subfase AS s
    INNER JOIN macrocontrole.fase AS f ON s.fase_id = f.id
    INNER JOIN dominio.tipo_fase AS tf ON tf.code = f.tipo_fase_id
    INNER JOIN macrocontrole.linha_producao AS lp ON lp.id = f.linha_producao_id
    INNER JOIN dominio.tipo_produto AS tp ON tp.code = lp.tipo_produto_id`
  )
}

controller.getEtapas = async () => {
  return db.sapConn.any(
    `SELECT e.id, te.nome, e.tipo_etapa_id, e.subfase_id, e.lote_id, s.nome AS subfase, e.ordem,
    tf.nome as fase, f.tipo_fase_id, f.linha_producao_id, f.ordem,
    lp.nome AS linha_producao, tp.nome AS tipo_produto
    FROM macrocontrole.etapa AS e
    INNER JOIN dominio.tipo_etapa AS te ON te.code = e.tipo_etapa_id
    INNER JOIN macrocontrole.subfase AS s ON s.id = e.subfase_id
    INNER JOIN macrocontrole.fase AS f ON s.fase_id = f.id
    INNER JOIN dominio.tipo_fase AS tf ON tf.code = f.tipo_fase_id
    INNER JOIN macrocontrole.linha_producao AS lp ON lp.id = f.linha_producao_id
    INNER JOIN dominio.tipo_produto AS tp ON tp.code = lp.tipo_produto_id`
  )
}

controller.getGerenciadorFME = async () => {
  return db.sapConn.any(
    `SELECT id, servidor, porta
    FROM dgeo.gerenciador_fme`
  )
}

controller.criaGerenciadorFME = async servidores => {
  return db.sapConn.tx(async t => {
    for (const s of servidores) {
      const exists = await t.any(
        `SELECT id FROM dgeo.gerenciador_fme
        WHERE servidor = $<servidor> AND porta = $<porta>`,
        { servidor: s.servidor, porta: s.porta }
      )
      if (exists && exists.length > 0) {
        throw new AppError(
          'O servidor já está cadastrado',
          httpCode.BadRequest
        )
      }

      await checkFMEConnection(s.servidor, s.porta)
    }

    const cs = new db.pgp.helpers.ColumnSet(['servidor', 'porta'])

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
      await checkFMEConnection(s.servidor, s.porta)
    }
    const cs = new db.pgp.helpers.ColumnSet(['?id', 'servidor', 'porta'])

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
    `SELECT c.id, c.schema, c.nome, c.alias, COUNT(a.id) > 0 AS atributo, COUNT(ppc.id) > 0 AS perfil
    FROM macrocontrole.camada AS c
    LEFT JOIN macrocontrole.atributo AS a ON a.camada_id = c.id
    LEFT JOIN macrocontrole.propriedades_camada AS ppc ON ppc.camada_id = c.id
    GROUP BY c.id, c.schema, c.nome, c.alias`
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

    const existsAssociationAtributo = await t.any(
      `SELECT id FROM macrocontrole.atributo 
      WHERE camada_id in ($<camadasIds:csv>)`,
      { camadasIds }
    )
    if (existsAssociationAtributo && existsAssociationAtributo.length > 0) {
      throw new AppError(
        'A camada possui atributos associados',
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
      'alias'
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
    'nome',
    'alias'
  ])

  const query = db.pgp.helpers.insert(camadas, cs, {
    table: 'camada',
    schema: 'macrocontrole'
  })

  return db.sapConn.none(query)
}

controller.getPerfilFME = async () => {
  return db.sapConn.any(
    `SELECT pf.id, pf.gerenciador_fme_id, pf.rotina, pf.requisito_finalizacao, pf.gera_falso_positivo, pf.subfase_id, pf.ordem, s.nome
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
          SET gerenciador_fme_id = $<gerenciadorFmeId>, rotina = $<rotina>, requisito_finalizacao = $<requisitoFinalizacao>, gera_falso_positivo = $<geraFalsoPositivo>,
          subfase_id = $<subfaseId>, ordem = $<ordem>
          where id = $<id>`,
          {
            id: c.id,
            gerenciadorFmeId: c.gerenciador_fme_id,
            rotina: c.rotina,
            requisitoFinalizacao: c.requisito_finalizacao,
            geraFalsoPositivo: c.gera_falso_positivo,
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
    'gera_falso_positivo',
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

controller.getPerfilModelo = async () => {
  return db.sapConn.any(
    `SELECT pmq.id, pmq.qgis_model_id, pmq.requisito_finalizacao, pmq.parametros, pmq.gera_falso_positivo, pmq.ordem, pmq.subfase_id, qm.nome, qm.descricao
    FROM macrocontrole.perfil_model_qgis AS pmq
    INNER JOIN dgeo.qgis_models AS qm ON qm.id = pmq.qgis_model_id`
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
          SET qgis_model_id = $<qgisModelId>, parametros = $<parametros>, requisito_finalizacao = $<requisitoFinalizacao>, gera_falso_positivo = $<geraFalsoPositivo>,
          subfase_id = $<subfaseId>, ordem = $<ordem>
          where id = $<id>`,
          {
            id: c.id,
            qgisModelId: c.qgis_model_id,
            parametros: c.parametros,
            requisitoFinalizacao: c.requisito_finalizacao,
            geraFalsoPositivo: c.gera_falso_positivo,
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
    'gera_falso_positivo',
    'subfase_id',
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
    `SELECT pr.id, pr.grupo_regra_id, pr.subfase_id
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
          SET grupo_regra_id = $<grupoRegraId>, subfase_id = $<subfaseId>
          where id = $<id>`,
          {
            id: c.id,
            grupoRegraId: c.grupo_regra_id,
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
    'grupo_regra_id',
    'subfase_id'
  ])

  const query = db.pgp.helpers.insert(perfilRegras, cs, {
    table: 'perfil_regras',
    schema: 'macrocontrole'
  })

  return db.sapConn.none(query)
}
controller.getPerfilEstilos = async () => {
  return db.sapConn.any(
    `SELECT pe.id, gs.nome, pe.grupo_estilo_id, pe.subfase_id
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

controller.atualizaPerfilEstilos = async perfilEstilos => {
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
    'subfase_id'
  ])

  const perfisbd = await db.sapConn.any(`SELECT id, grupo_estilo_id, subfase_id FROM macrocontrole.perfil_estilo`)

  perfisbd.forEach(perfilbd => {
    perfilEstilos.array.forEach(perfil => {
      if(perfil.grupo_estilo_id === perfilbd.grupo_estilo_id && perfil.subfase_id === perfilbd.subfase_id){
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
      WHERE a.unidade_trabalho_id in ($<unidadeTrabalhoId:csv>) AND a.tipo_situacao_id != 1
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
  unidadeTrabalhoIds,
  etapaIds,
  associarInsumos
) => {
  return db.sapConn.tx(async t => {
    const subfase = await t.oneOrNone(
      'SELECT subfase_id FROM macrocontrole.etapa WHERE id = $1',
      [etapaIds[0]]
    )

    if (!subfase) {
      throw new AppError('Etapa não encontrada', httpCode.BadRequest)
    }
    const utOldNew = {}
    for (const unidadeTrabalhoId of unidadeTrabalhoIds) {
      const unidadeTrabalho = await t.oneOrNone(
        `
          INSERT INTO macrocontrole.unidade_trabalho(nome, geom, epsg, dado_producao_id, subfase_id, dificuldade, lote_id, bloco_id, disponivel, prioridade)
          SELECT nome, geom, epsg, dado_producao_id, $<subfaseId> AS subfase_id, dificuldade, lote_id, bloco_id, disponivel, prioridade
          FROM macrocontrole.unidade_trabalho
          WHERE id = $<unidadeTrabalhoId>
          RETURNING id
        `,
        { subfaseId: subfase.subfase_id, unidadeTrabalhoId }
      )

      utOldNew[unidadeTrabalhoId] = unidadeTrabalho.id
    }
    const dados = []
    etapaIds.forEach(e => {
      Object.values(utOldNew).forEach(u => {
        const aux = {}
        aux.etapa_id = e
        aux.unidade_trabalho_id = +u
        dados.push(aux)
      })
    })

    const cs = new db.pgp.helpers.ColumnSet([
      'etapa_id',
      'unidade_trabalho_id',
      { name: 'tipo_situacao_id', init: () => 1 }
    ])

    const query = db.pgp.helpers.insert(dados, cs, {
      table: 'atividade',
      schema: 'macrocontrole'
    })

    await t.none(query)

    if (associarInsumos) {
      const insumos = await t.any(
        'SELECT unidade_trabalho_id, insumo_id, caminho_padrao FROM macrocontrole.insumo_unidade_trabalho WHERE unidade_trabalho_id in ($<unidadeTrabalhoIds:csv>)',
        { unidadeTrabalhoIds }
      )
      const dadosInsumos = []
      insumos.forEach(i => {
        dadosInsumos.push({
          insumo_id: i.insumo_id,
          unidade_trabalho_id: utOldNew[i.unidade_trabalho_id],
          caminho_padrao: i.caminho_padrao
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

controller.criaProdutos = async (produtos, linhaProducaoId) => {
  const cs = new db.pgp.helpers.ColumnSet([
    'uuid',
    'nome',
    'mi',
    'inom',
    'escala',
    { name: 'linha_producao_id', init: () => linhaProducaoId },
    { name: 'geom', mod: ':raw' }
  ])

  produtos.forEach(p => {
    p.geom = `st_geomfromewkt('${p.geom}')`
  })

  const query = db.pgp.helpers.insert(produtos, cs, {
    table: 'produto',
    schema: 'macrocontrole'
  })

  return db.sapConn.none(query)
}

controller.criaUnidadeTrabalho = async (unidadesTrabalho, subfaseId) => {
  const cs = new db.pgp.helpers.ColumnSet([
    'nome',
    'epsg',
    'dado_producao_id',
    'bloco_id',
    { name: 'subfase_id', init: () => subfaseId },
    'disponivel',
    'dificuldade',
    'prioridade',
    'observacao',
    { name: 'geom', mod: ':raw' }
  ])

  unidadesTrabalho.forEach(p => {
    p.geom = `st_geomfromewkt('${p.geom}')`
  })

  const query = db.pgp.helpers.insert(unidadesTrabalho, cs, {
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

controller.getEstrategiaAssociacao = async () => {
  return db.sapConn.any('SELECT code, nome FROM dominio.estrategia_associacao')
}

controller.getAtalhos = async () => {
  return db.sapConn.any(
    'SELECT id, ferramenta, idioma, atalho FROM dgeo.qgis_shortcuts'
  )
}

controller.gravaAtalhos = async (atalhos, usuarioId) => {
  return db.sapConn.tx(async t => {
    const usuarioPostoNome = getUsuarioNomeById(usuarioId)

    const cs = new db.pgp.helpers.ColumnSet([
      'ferramenta',
      'idioma',
      'atalho',
      { name: 'owner', init: () => usuarioPostoNome },
      { name: 'update_time', mod: ':raw', init: () => 'NOW()' }
    ])

    const query = db.pgp.helpers.insert(atalhos, cs, {
      table: 'qgis_shortcuts',
      schema: 'dgeo'
    })

    await t.none(query)
  })
}

controller.atualizaAtalhos = async (atalhos, usuarioId) => {
  return db.sapConn.tx(async t => {
    const usuarioPostoNome = getUsuarioNomeById(usuarioId)

    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'ferramenta',
      'idioma',
      'atalho',
      { name: 'owner', init: () => usuarioPostoNome },
      { name: 'update_time', mod: ':raw', init: () => 'NOW()' }
    ])

    const query =
      db.pgp.helpers.update(
        atalhos,
        cs,
        { table: 'qgis_shortcuts', schema: 'dgeo' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.deletaAtalhos = async atalhoIds => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM dgeo.qgis_shortcuts
      WHERE id in ($<atalhoIds:csv>)`,
      { atalhoIds }
    )
    if (exists && exists.length < atalhoIds.length) {
      throw new AppError(
        'O id informado não corresponde a um atalho',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM dgeo.qgis_shortcuts
      WHERE id in ($<atalhoIds:csv>)`,
      { atalhoIds }
    )
  })
}

controller.getVersaoQgis = async () => {
  return db.sapConn.any(
    'SELECT versao_minima FROM dgeo.versao_qgis'
  )
}

controller.atualizaVersaoQgis = async versaoQgis => {
  return db.sapConn.none(
    `UPDATE dgeo.versao_qgis SET
    versao_minima = $<versaoQgis>`,
    { versaoQgis }
  )
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


module.exports = controller
