'use strict'

const { db, temporaryLogin, managePermissions, disableTriggers } = require('../database')

const {
  DB_USER,
  DB_PASSWORD,
  DB_SERVER,
  DB_PORT,
  DB_NAME
} = require('../config')

const { AppError, httpCode } = require('../utils')

const { producaoCtrl } = require('../producao')

const qgisProject = require('./qgis_project')

const controller = {}

const getUsuarioNomeById = async usuarioId => {
  const usuario = await db.sapConn.one(
    `SELECT tpg.nome_abrev || ' ' || u.nome_guerra as posto_nome FROM dgeo.usuario as u
    INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
    WHERE u.id = $<usuarioId>`,
    { usuarioId }
  )
  return usuario.posto_nome
}

const getUsuarioIdbyUUID = async usuarioUUID => {
  let usuario
  try {
    usuario = await db.sapConn.one(
      `SELECT id FROM dgeo.usuario as u
      WHERE u.uuid = $<usuarioUUID>`,
      { usuarioUUID }
    )
  } catch (error) {
    throw new AppError('Usuário não encontrado. Verifique o UUID', httpCode.BadRequest)
  }

  return usuario.id
}

controller.getProject = async () => {
  return { projeto: qgisProject }
}

controller.getAtividade = async (atividadeId, gerenteId) => {
  const atividade = await db.sapConn.oneOrNone(
    `SELECT a.id
    FROM macrocontrole.atividade AS a
    WHERE a.id = $<atividadeId>`,
    { atividadeId }
  )
  if (!atividade) {
    throw new AppError('Atividadade não encontrada', httpCode.NotFound)
  }

  return producaoCtrl.getDadosAtividadeAdmin(atividadeId, gerenteId)
}

controller.getAtividadeUsuario = async (usuarioId, proxima, gerenteId) => {
  let atividadeId

  if (proxima) {
    atividadeId = await producaoCtrl.calculaFila(usuarioId)
    if (!atividadeId) {
      return null
    }
  } else {
    const emAndamento = await db.sapConn.oneOrNone(
      `SELECT a.id FROM macrocontrole.atividade AS a
      INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
      WHERE a.usuario_id = $<usuarioId> and ut.disponivel IS TRUE and a.tipo_situacao_id = 2`,
      { usuarioId }
    )
    if (!emAndamento) {
      return null
    }
    atividadeId = emAndamento.id
  }

  return producaoCtrl.getDadosAtividadeAdmin(atividadeId, gerenteId)
}

controller.getPerfilProducao = async () => {
  return db.sapConn.any('SELECT id, nome FROM macrocontrole.perfil_producao')
}

controller.criaPerfilProducao = async perfilProducao => {
  return db.sapConn.tx(async t => {
    const perfilProducaoList = perfilProducao.map(function (obj) {
      return obj.nome;
    });
    const exists = await t.any(
      `SELECT id FROM macrocontrole.perfil_producao
      WHERE nome in ($<perfilProducaoList:csv>)`,
      { perfilProducaoList }
    )
    if (exists && exists.length > 0) {
      throw new AppError(
        'Nome duplicado em perfil de producao',
        httpCode.BadRequest
      )
    }


    const cs = new db.pgp.helpers.ColumnSet([
      'nome'
    ])

    const query = db.pgp.helpers.insert(perfilProducao, cs, {
      table: 'perfil_producao',
      schema: 'macrocontrole'
    })

    await t.none(query)
  })
}

controller.atualizaPerfilProducao = async perfilProducao => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'nome',
    ])

    const query =
      db.pgp.helpers.update(
        perfilProducao,
        cs,
        { table: 'perfil_producao', schema: 'macrocontrole' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.deletaPerfilProducao = async perfilProducaoId => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.perfil_producao
      WHERE id in ($<perfilProducaoId:csv>)`,
      { perfilProducaoId }
    )
    if (exists && exists.length < perfilProducaoId.length) {
      throw new AppError(
        'O id informado não corresponde a um perfil de producao',
        httpCode.BadRequest
      )
    }

    const existsAssociation1 = await t.any(
      `SELECT id FROM macrocontrole.perfil_producao_operador
      WHERE perfil_producao_id in ($<perfilProducaoId:csv>)`,
      { perfilProducaoId }
    )
    if (existsAssociation1 && existsAssociation1.length > 0) {
      throw new AppError(
        'O perfil de produção possui perfil de produção operador associado',
        httpCode.BadRequest
      )
    }

    const existsAssociation2 = await t.any(
      `SELECT id FROM macrocontrole.fila_prioritaria_grupo
      WHERE perfil_producao_id in ($<perfilProducaoId:csv>)`,
      { perfilProducaoId }
    )
    if (existsAssociation2 && existsAssociation2.length > 0) {
      throw new AppError(
        'O perfil de produção possui fila prioritária de grupo associada',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM macrocontrole.perfil_producao
      WHERE id in ($<perfilProducaoId:csv>)`,
      { perfilProducaoId }
    )
  })
}

controller.getPerfilBlocoOperador = async () => {
  return db.sapConn.any(`
    SELECT pbo.id, pbo.usuario_id, pbo.bloco_id, b.prioridade, b.nome AS bloco
    FROM macrocontrole.perfil_bloco_operador AS pbo
    INNER JOIN macrocontrole.bloco AS b ON b.id = pbo.bloco_id
  `)
}

controller.criaPerfilBlocoOperador = async perfilBlocoOperador => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'usuario_id',
      'bloco_id'
    ])

    const query = db.pgp.helpers.insert(perfilBlocoOperador, cs, {
      table: 'perfil_bloco_operador',
      schema: 'macrocontrole'
    })

    await t.none(query)
  })
}

controller.atualizaPerfilBlocoOperador = async perfilBlocoOperador => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'usuario_id',
      'bloco_id'
    ])

    const query =
      db.pgp.helpers.update(
        perfilBlocoOperador,
        cs,
        { table: 'perfil_bloco_operador', schema: 'macrocontrole' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.deletaPerfilBlocoOperador = async perfilBlocoOperadorId => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.perfil_bloco_operador
      WHERE id in ($<perfilBlocoOperadorId:csv>)`,
      { perfilBlocoOperadorId }
    )
    if (exists && exists.length < perfilBlocoOperadorId.length) {
      throw new AppError(
        'O id informado não corresponde a um perfil bloco operador',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM macrocontrole.perfil_bloco_operador
      WHERE id in ($<perfilBlocoOperadorId:csv>)`,
      { perfilBlocoOperadorId }
    )
  })
}

controller.getPerfilProducaoOperador = async () => {
  return db.sapConn.any('SELECT id, usuario_id, perfil_producao_id FROM macrocontrole.perfil_producao_operador')
}

controller.criaPerfilProducaoOperador = async perfilProducaoOperador => {
  return db.sapConn.tx(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.perfil_producao_operador
      WHERE usuario_id in ($<perfilProducaoOperadorId:csv>)`,
      { perfilProducaoOperadorId: perfilProducaoOperador.map(c => c.usuario_id) }
    )
    if (exists && exists.length > 0) {
      throw new AppError(
        'Já existe um perfil para este usuário',
        httpCode.BadRequest
      )
    }

    const cs = new db.pgp.helpers.ColumnSet([
      'usuario_id',
      'perfil_producao_id'
    ])

    const query = db.pgp.helpers.insert(perfilProducaoOperador, cs, {
      table: 'perfil_producao_operador',
      schema: 'macrocontrole'
    })

    await t.none(query)
  })
}

controller.atualizaPerfilProducaoOperador = async perfilProducaoOperador => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'usuario_id',
      'perfil_producao_id'
    ])

    const query =
      db.pgp.helpers.update(
        perfilProducaoOperador,
        cs,
        { table: 'perfil_producao_operador', schema: 'macrocontrole' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.deletaPerfilProducaoOperador = async perfilProducaoOperadorId => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.perfil_producao_operador
      WHERE id in ($<perfilProducaoOperadorId:csv>)`,
      { perfilProducaoOperadorId }
    )
    if (exists && exists.length < perfilProducaoOperadorId.length) {
      throw new AppError(
        'O id informado não corresponde a um perfil produção operador',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM macrocontrole.perfil_producao_operador
      WHERE id in ($<perfilProducaoOperadorId:csv>)`,
      { perfilProducaoOperadorId }
    )
  })
}

controller.getPerfilProducaoEtapa = async () => {
  return db.sapConn.any('SELECT id, perfil_producao_id, subfase_id, tipo_etapa_id, prioridade FROM macrocontrole.perfil_producao_etapa')
}

controller.criaPerfilProducaoEtapa = async perfilProducaoEtapa => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'perfil_producao_id',
      'subfase_id',
      'tipo_etapa_id',
      'prioridade'
    ])

    const query = db.pgp.helpers.insert(perfilProducaoEtapa, cs, {
      table: 'perfil_producao_etapa',
      schema: 'macrocontrole'
    })

    await t.none(query)
  })
}

controller.atualizaPerfilProducaoEtapa = async perfilProducaoEtapa => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'perfil_producao_id',
      'subfase_id',
      'tipo_etapa_id',
      'prioridade'
    ])

    const query =
      db.pgp.helpers.update(
        perfilProducaoEtapa,
        cs,
        { table: 'perfil_producao_etapa', schema: 'macrocontrole' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.deletaPerfilProducaoEtapa = async perfilProducaoEtapaId => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.perfil_producao_etapa
      WHERE id in ($<perfilProducaoEtapaId:csv>)`,
      { perfilProducaoEtapaId }
    )
    if (exists && exists.length < perfilProducaoEtapaId.length) {
      throw new AppError(
        'O id informado não corresponde a um perfil produção etapa',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM macrocontrole.perfil_producao_etapa
      WHERE id in ($<perfilProducaoEtapaId:csv>)`,
      { perfilProducaoEtapaId }
    )
  })
}

const pausaAtividadeMethod = async (unidadeTrabalhoIds, connection) => {
  const dataFim = new Date()

  const updatedIds = await connection.any(
    `
  UPDATE macrocontrole.atividade SET
  data_fim = $<dataFim>, tipo_situacao_id = 5
  WHERE id in (
    SELECT a.id FROM macrocontrole.atividade AS a
    INNER JOIN macrocontrole.unidade_trabalho AS ut ON a.unidade_trabalho_id = ut.id
    WHERE ut.id in ($<unidadeTrabalhoIds:csv>) AND a.tipo_situacao_id = 2
    ) RETURNING id, usuario_id;
  `,
    { dataFim, unidadeTrabalhoIds }
  )
  if (updatedIds.length === 0) {
    return false
  }
  const updatedIdsFixed = []
  updatedIds.forEach((u) => {
    updatedIdsFixed.push(u.id)
  })
  const atividades = await connection.any(
    'SELECT etapa_id, unidade_trabalho_id, usuario_id FROM macrocontrole.atividade WHERE id in ($<updatedIdsFixed:csv>)',
    { updatedIdsFixed }
  )

  const cs = new db.pgp.helpers.ColumnSet([
    'etapa_id',
    'unidade_trabalho_id',
    'usuario_id',
    { name: 'tipo_situacao_id', init: () => 3 }
  ])

  const query = db.pgp.helpers.insert(atividades, cs, {
    table: 'atividade',
    schema: 'macrocontrole'
  })

  await connection.none(query)

  for (const u of updatedIds) {
    await temporaryLogin.resetPassword(u.id, u.usuario_id)
  }

  return true
}

controller.unidadeTrabalhoDisponivel = async (
  unidadeTrabalhoIds,
  disponivel
) => {
  await disableTriggers.disableAllTriggersInTransaction(db.sapConn, async t => {
    await t.none(
      `
      UPDATE macrocontrole.unidade_trabalho
      SET disponivel = $<disponivel>
      WHERE id in ($<unidadeTrabalhoIds:csv>);`,
      { unidadeTrabalhoIds, disponivel }
    )
    if (!disponivel) {
      await pausaAtividadeMethod(unidadeTrabalhoIds, t)
    }

  })
  await disableTriggers.refreshMaterializedViewFromUTs(db.sapConn, unidadeTrabalhoIds)
}

controller.pausaAtividade = async (unidadeTrabalhoIds) => {
  await disableTriggers.disableAllTriggersInTransaction(db.sapConn, async t => {
    const changed = await pausaAtividadeMethod(unidadeTrabalhoIds, t)
    if (!changed) {
      throw new AppError(
        'Unidades de trabalho não possuem atividades em execução',
        httpCode.NotFound
      )
    }

  })
  await disableTriggers.refreshMaterializedViewFromUTs(db.sapConn, unidadeTrabalhoIds)
}

controller.reiniciaAtividade = async (unidadeTrabalhoIds) => {
  const dataFim = new Date()
  await disableTriggers.disableAllTriggersInTransaction(db.sapConn, async t => {
    const usersResetPassword = await t.any(
      `
      SELECT DISTINCT ON (ut.id) a.id, a.usuario_id FROM macrocontrole.atividade AS a
      INNER JOIN macrocontrole.unidade_trabalho AS ut ON a.unidade_trabalho_id = ut.id
      INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
      WHERE ut.id in ($<unidadeTrabalhoIds:csv>) AND a.tipo_situacao_id in (2)
      ORDER BY ut.id, e.ordem
    `,
      { unidadeTrabalhoIds }
    )

    const updatedIds = await t.any(
      `
    UPDATE macrocontrole.atividade SET
    data_inicio = COALESCE(data_inicio, $<dataFim>), data_fim = COALESCE(data_fim, $<dataFim>), tipo_situacao_id = 5
    WHERE id in (
      SELECT DISTINCT ON (ut.id) a.id FROM macrocontrole.atividade AS a
      INNER JOIN macrocontrole.unidade_trabalho AS ut ON a.unidade_trabalho_id = ut.id
      INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
      WHERE ut.id in ($<unidadeTrabalhoIds:csv>) AND a.tipo_situacao_id in (2,3)
      ORDER BY ut.id, e.ordem
      ) RETURNING id
    `,
      { dataFim, unidadeTrabalhoIds }
    )
    if (updatedIds && updatedIds.length === 0) {
      throw new AppError(
        'Unidades de trabalho não possuem atividades em execução ou pausadas',
        httpCode.NotFound
      )
    }
    const updatedIdsFixed = []
    updatedIds.forEach((u) => {
      updatedIdsFixed.push(u.id)
    })
    const atividades = await t.any(
      'SELECT etapa_id, unidade_trabalho_id FROM macrocontrole.atividade WHERE id in ($<updatedIdsFixed:csv>)',
      { updatedIdsFixed }
    )

    const cs = new db.pgp.helpers.ColumnSet([
      'etapa_id',
      'unidade_trabalho_id',
      { name: 'tipo_situacao_id', init: () => 1 }
    ])

    const query = db.pgp.helpers.insert(atividades, cs, {
      table: 'atividade',
      schema: 'macrocontrole'
    })

    await t.none(query)

    for (const u of usersResetPassword) {
      await temporaryLogin.resetPassword(u.id, u.usuario_id)
    }
  })
  await disableTriggers.refreshMaterializedViewFromUTs(db.sapConn, unidadeTrabalhoIds)
}

controller.voltaAtividade = async (atividadeIds, manterUsuarios) => {
  const dataFim = new Date()

  await disableTriggers.disableAllTriggersInTransaction(db.sapConn, async t => {
    const ativEmExec = await t.any(
      `SELECT a_ant.id
        FROM macrocontrole.atividade AS a
        INNER JOIN macrocontrole.atividade AS a_ant ON a_ant.unidade_trabalho_id = a.unidade_trabalho_id
        INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
        INNER JOIN macrocontrole.etapa AS e_ant ON e_ant.id = a_ant.etapa_id
        WHERE a.id in ($<atividadeIds:csv>) AND e_ant.ordem >= e.ordem AND a_ant.tipo_situacao_id IN (2,3)`,
      { atividadeIds }
    )
    if (ativEmExec && ativEmExec.length > 0) {
      throw new AppError(
        'Não se pode voltar atividades em execução ou pausadas. Reinicie a atividade primeiro',
        httpCode.BadRequest
      )
    }

    const atividadesUpdates = await t.any(
      `UPDATE macrocontrole.atividade SET
    tipo_situacao_id = 5, data_inicio = COALESCE(data_inicio, $<dataFim>), data_fim = COALESCE(data_fim, $<dataFim>)
    WHERE id IN (
        SELECT a_ant.id
        FROM macrocontrole.atividade AS a
        INNER JOIN macrocontrole.atividade AS a_ant ON a_ant.unidade_trabalho_id = a.unidade_trabalho_id
        INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
        INNER JOIN macrocontrole.etapa AS e_ant ON e_ant.id = a_ant.etapa_id
        WHERE a.id in ($<atividadeIds:csv>) AND e_ant.ordem >= e.ordem AND a_ant.tipo_situacao_id IN (4)
    ) RETURNING id`,
      { atividadeIds, dataFim }
    )
    const ids = []
    atividadesUpdates.forEach((i) => {
      ids.push(i.id)
    })
    if (ids.length === 0) {
      throw new AppError(
        'Atividades não encontradas ou não podem ser retornadas para etapas anteriores',
        httpCode.NotFound
      )
    }
    if (manterUsuarios) {
      await t.none(
        `INSERT INTO macrocontrole.atividade(etapa_id, unidade_trabalho_id, usuario_id, tipo_situacao_id, observacao)
      (
        SELECT etapa_id, unidade_trabalho_id, usuario_id, 3 AS tipo_situacao_id, observacao
        FROM macrocontrole.atividade
        WHERE id in ($<ids:csv>)
      )`,
        { ids }
      )
    } else {
      await t.none(
        `
        INSERT INTO macrocontrole.atividade(etapa_id, unidade_trabalho_id, tipo_situacao_id, observacao)
        (
          SELECT etapa_id, unidade_trabalho_id, 1 AS tipo_situacao_id, observacao
          FROM macrocontrole.atividade
          WHERE id in ($<ids:csv>)
        )`,
        { ids }
      )
    }

  })
  await disableTriggers.refreshMaterializedViewFromAtivs(db.sapConn, atividadeIds)
}

controller.avancaAtividade = async (atividadeIds, concluida) => {
  const comparisonOperator = concluida ? '<=' : '<'

  await disableTriggers.disableAllTriggersInTransaction(db.sapConn, async t => {
    const ativEmExec = await t.any(
      `SELECT a_ant.id
      FROM macrocontrole.atividade AS a
      INNER JOIN macrocontrole.atividade AS a_ant ON a_ant.unidade_trabalho_id = a.unidade_trabalho_id
      INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
      INNER JOIN macrocontrole.etapa AS e_ant ON e_ant.id = a_ant.etapa_id
      WHERE a.id in ($<atividadeIds:csv>) AND e_ant.ordem $<comparisonOperator:raw> e.ordem AND a_ant.tipo_situacao_id IN (2,3)`,
      { atividadeIds, comparisonOperator }
    )
    if (ativEmExec && ativEmExec.length > 0) {
      throw new AppError(
        'Não se pode avançar atividades em execução ou pausadas. Reinicie a atividade primeiro',
        httpCode.BadRequest
      )
    }
    const ativEmFila = await t.any(
      `SELECT a_ant.id
      FROM macrocontrole.atividade AS a
      INNER JOIN macrocontrole.atividade AS a_ant ON a_ant.unidade_trabalho_id = a.unidade_trabalho_id
      INNER JOIN macrocontrole.fila_prioritaria AS fp ON fp.atividade_id = a_ant.id
      INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
      INNER JOIN macrocontrole.etapa AS e_ant ON e_ant.id = a_ant.etapa_id
      WHERE a.id in ($<atividadeIds:csv>) AND e_ant.ordem $<comparisonOperator:raw> e.ordem`,
      { atividadeIds, comparisonOperator }
    )
    if (ativEmFila && ativEmFila.length > 0) {
      throw new AppError(
        'Não se pode avançar atividades em fila prioritária. Remover da fila primeiro',
        httpCode.BadRequest
      )
    }
    const ativEmFilaGrupo = await t.any(
      `SELECT a_ant.id
      FROM macrocontrole.atividade AS a
      INNER JOIN macrocontrole.atividade AS a_ant ON a_ant.unidade_trabalho_id = a.unidade_trabalho_id
      INNER JOIN macrocontrole.fila_prioritaria_grupo AS fpg ON fpg.atividade_id = a_ant.id
      INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
      INNER JOIN macrocontrole.etapa AS e_ant ON e_ant.id = a_ant.etapa_id
      WHERE a.id in ($<atividadeIds:csv>) AND e_ant.ordem $<comparisonOperator:raw> e.ordem`,
      { atividadeIds, comparisonOperator }
    )
    if (ativEmFilaGrupo && ativEmFilaGrupo.length > 0) {
      throw new AppError(
        'Não se pode avançar atividades em fila prioritária de grupo. Remover da fila primeiro',
        httpCode.BadRequest
      )
    }

    const dataFim = new Date()

    await t.none(
      `
        UPDATE macrocontrole.atividade
        SET tipo_situacao_id = 4, data_inicio = COALESCE(data_inicio, $<dataFim>), data_fim = COALESCE(data_fim, $<dataFim>)
        WHERE id IN (
          SELECT a_ant.id
          FROM macrocontrole.atividade AS a
          INNER JOIN macrocontrole.atividade AS a_ant ON a_ant.unidade_trabalho_id = a.unidade_trabalho_id
          INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
          INNER JOIN macrocontrole.etapa AS e_ant ON e_ant.id = a_ant.etapa_id
          WHERE a.id in ($<atividadeIds:csv>) AND e_ant.ordem $<comparisonOperator:raw> e.ordem AND a_ant.tipo_situacao_id IN (1)
        )
        `,
      { atividadeIds, comparisonOperator, dataFim }
    )

  })
  await disableTriggers.refreshMaterializedViewFromAtivs(db.sapConn, atividadeIds)
}

controller.criaFilaPrioritaria = async (
  atividadeIds,
  usuarioPrioridadeId,
  prioridade
) => {
  const exists = await db.sapConn.any(
    `
    SELECT id FROM macrocontrole.fila_prioritaria WHERE atividade_id in ($<atividadeIds:csv>) AND usuario_id = $<usuarioPrioridadeId>
     `,
    { atividadeIds, usuarioPrioridadeId }
  )
  if (exists && exists.length > 0) {
    throw new AppError(
      'Esta atividade já está cadastrada como prioritária para este usuário',
      httpCode.BadRequest
    )
  }

  const result = await db.sapConn.result(
    `
      INSERT INTO macrocontrole.fila_prioritaria(atividade_id, usuario_id, prioridade)
      (
        SELECT a.id, $<usuarioPrioridadeId> as usuario_id, row_number() over(order by a.id) + $<prioridade>-1 as prioridade
        FROM macrocontrole.atividade AS a
        WHERE a.id in ($<atividadeIds:csv>) AND a.tipo_situacao_id IN (1)
      )
      `,
    { atividadeIds, usuarioPrioridadeId, prioridade }
  )
  if (!result.rowCount || result.rowCount == 0) {
    throw new AppError(
      'Atividade não encontrada ou não pode ser adicionada na fila prioritária',
      httpCode.BadRequest
    )
  }
}

controller.criaFilaPrioritariaGrupo = async (
  atividadeIds,
  perfilProducaoId,
  prioridade
) => {
  const exists = await db.sapConn.any(
    `
    SELECT id FROM macrocontrole.fila_prioritaria_grupo WHERE atividade_id in ($<atividadeIds:csv>) AND perfil_producao_id = $<perfilProducaoId>
     `,
    { atividadeIds, perfilProducaoId }
  )
  if (exists && exists.length > 0) {
    throw new AppError(
      'Esta atividade já está cadastrada como prioritária para este perfil de produção',
      httpCode.BadRequest
    )
  }

  const result = await db.sapConn.result(
    `
    INSERT INTO macrocontrole.fila_prioritaria_grupo(atividade_id, perfil_producao_id, prioridade)
    (
      SELECT id, $<perfilProducaoId> as perfil_producao_id, row_number() over(order by id) + $<prioridade>-1 as prioridade
      FROM macrocontrole.atividade
      WHERE id in ($<atividadeIds:csv>) AND tipo_situacao_id IN (1)
    )
    `,
    { atividadeIds, perfilProducaoId, prioridade }
  )

  if (!result.rowCount || result.rowCount == 0) {
    throw new AppError(
      'Atividade não encontrada ou não pode ser adicionada na fila prioritária',
      httpCode.BadRequest
    )
  }
}

controller.criaObservacao = async (
  atividadeIds,
  observacaoAtividade,
  observacaoUnidadeTrabalho
) => {
  await disableTriggers.disableAllTriggersInTransaction(db.sapConn, async t => {
    await t.any(
      `
      UPDATE macrocontrole.atividade SET
      observacao = $<observacaoAtividade> WHERE id in ($<atividadeIds:csv>)
      `,
      { atividadeIds, observacaoAtividade }
    )
    await t.any(
      `
      UPDATE macrocontrole.unidade_trabalho SET
      observacao = $<observacaoUnidadeTrabalho> WHERE id in (
        SELECT DISTINCT a.unidade_trabalho_id FROM macrocontrole.atividade AS a
        WHERE a.id in ($<atividadeIds:csv>)
      )
      `,
      { atividadeIds, observacaoUnidadeTrabalho }
    )
  })
}

controller.getObservacao = async (atividadeId) => {
  return db.sapConn.any(
    `SELECT a.observacao AS observacao_atividade, ut.observacao AS observacao_unidade_trabalho
    FROM macrocontrole.atividade AS a
    INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
    WHERE a.id = $<atividadeId>`,
    { atividadeId }
  )
}

controller.getViewsAcompanhamento = async (emAndamento) => {
  let views = await db.sapConn.any(
  `
  SELECT foo.schema, foo.nome, foo.tipo, p.finalizado, l.nome AS lote FROM
  (SELECT 'acompanhamento' AS schema, mat.matviewname AS nome,
  CASE WHEN mat.matviewname LIKE '%_subfase_%' THEN 'subfase' ELSE 'lote' END AS tipo,
  SUBSTRING(mat.matviewname FROM 'lote_(\\d+)') AS lote_id
  FROM pg_matviews AS mat
  WHERE schemaname = 'acompanhamento' AND matviewname ~ '^lote_'
  ORDER BY mat.matviewname) AS foo
  INNER JOIN macrocontrole.lote AS l ON l.id = foo.lote_id::int
  INNER JOIN macrocontrole.projeto AS p ON p.id = l.projeto_id
  UNION
  SELECT 'acompanhamento' AS schema, 'bloco' AS nome, 'bloco' AS tipo, false AS finalizado, null AS lote;
  `)

  if (!views) {
    return null
  }

  if (emAndamento) {
    views = views.filter((v) => !v.finalizado)
  }

  const dados = {}
  dados.banco_dados = {
    nome_db: DB_NAME,
    servidor: DB_SERVER,
    porta: DB_PORT,
    login: DB_USER,
    senha: DB_PASSWORD
  }
  dados.views = views
  return dados
}

controller.redefinirPermissoes = async () => {
  return managePermissions.revokeAndGrantAllExecution()
}

controller.refreshViews = async () => {
  let sql = await db.sapConn.oneOrNone(
    `SELECT string_agg(query, ' ') AS grant_fk FROM (
              SELECT 'REFRESH MATERIALIZED VIEW CONCURRENTLY ' || schemaname || '.' || matviewname || ';' AS query
              from pg_matviews
          ) AS foo;`
  )

  await db.sapConn.none(sql.grant_fk);
}

controller.revogarPermissoesDB = async (servidor, porta, banco) => {
  return managePermissions.revokeAllDb(servidor, porta, banco)
}

controller.revogarPermissoesDBUser = async (servidor, porta, banco, usuarioId) => {
  return managePermissions.revokeAllDbUser(servidor, porta, banco, usuarioId)
}

controller.getVersaoQGIS = async () => {
  return db.sapConn.one(
    `SELECT versao_minima
    FROM dgeo.versao_qgis`
  )
}

controller.atualizaVersaoQGIS = async (
  versaoQGIS
) => {
  return db.sapConn.any(
    `
    UPDATE dgeo.versao_qgis SET
    versao_minima = $<versaoQGIS> WHERE code = 1
    `,
    { versaoQGIS }
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

controller.getProblemaAtividade = async () => {
  return db.sapConn.any(
    `SELECT pa.id, tpg.nome_abrev || ' ' || u.nome_guerra AS usuario, pa.atividade_id, pa.descricao, pa.data, pa.resolvido, tp.nome AS tipo_problema,
    ST_ASEWKT(pa.geom) AS geom
    FROM macrocontrole.problema_atividade AS pa
    INNER JOIN dominio.tipo_problema AS tp ON tp.code = pa.tipo_problema_id
    INNER JOIN dgeo.usuario AS u ON u.id = pa.usuario_id
    INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id`
  )
}

controller.atualizaProblemaAtividade = async (problemaAtividade) => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'resolvido',
    ])

    const query =
      db.pgp.helpers.update(
        problemaAtividade,
        cs,
        { table: 'problema_atividade', schema: 'macrocontrole' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.iniciaAtividadeModoLocal = async (atividadeId, usuarioId) => {
  return db.sapConn.tx(async t => {
    const dataInicio = new Date()
    try {
      await t.none(
        `
      UPDATE macrocontrole.atividade SET
      data_inicio = $<dataInicio>, tipo_situacao_id = 2, usuario_id = $<usuarioId>
      WHERE id = $<atividadeId>
      `,
        { dataInicio, atividadeId, usuarioId}
      )
    } catch (error) {
      throw new AppError(
        'Atividade inválida',
        httpCode.BadRequest
      )
    }
  })
}

controller.finalizaAtividadeModoLocal = async (atividadeId, usuarioUUID, dataInicio, dataFim) => {
  return db.sapConn.tx(async t => {
    const usuarioId = await getUsuarioIdbyUUID(usuarioUUID)
    try {
      await t.none(
        `
      UPDATE macrocontrole.atividade SET
      data_fim = $<dataFim>, data_inicio = $<dataInicio>, tipo_situacao_id = 4, usuario_id = $<usuarioId>
      WHERE id = $<atividadeId>
      `,
        { dataFim, dataInicio, atividadeId, usuarioId}
      )
    } catch (error) {
      console.log(error)
      throw new AppError(
        'Atividade inválida',
        httpCode.BadRequest
      )
    }
  })
}

controller.getRelatorioAlteracao = async () => {
  return db.sapConn.any(
    'SELECT id, data, descricao FROM macrocontrole.relatorio_alteracao'
  )
}

controller.gravaRelatorioAlteracao = async relatorios => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'data',
      'descricao'
    ])

    const query = db.pgp.helpers.insert(relatorios, cs, {
      table: 'relatorio_alteracao',
      schema: 'macrocontrole'
    })

    await t.none(query)
  })
}

controller.atualizaRelatorioAlteracao = async (relatorios, usuario_id) => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      {
        name: 'data',
        cast: 'timestamptz' // use SQL type casting '::timestamp with timezone'
      },
      'descricao'
    ])

    const query =
      db.pgp.helpers.update(
        relatorios,
        cs,
        { table: 'relatorio_alteracao', schema: 'macrocontrole' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.deletaRelatorioAlteracao = async relatorioIds => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.relatorio_alteracao
      WHERE id in ($<relatorioIds:csv>)`,
      { relatorioIds }
    )
    if (exists && exists.length < relatorioIds.length) {
      throw new AppError(
        'O id informado não corresponde a um relatório de alteração',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM macrocontrole.relatorio_alteracao
      WHERE id in ($<relatorioIds:csv>)`,
      { relatorioIds }
    )
  })
}


controller.atualizaPropriedadesUT = async unidadesTrabalho => {
  
  function int(col) {
    return {
        name: col,
        skip() {
            const val = this[col];
            return val === null || val === undefined;
        },
        init() {
            return parseInt(this[col]);
        }
    };
  }

  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      int('dificuldade'),
      int('tempo_estimado_minutos'),
      int('prioridade')
    ])

    const query =
      db.pgp.helpers.update(
        unidadesTrabalho,
        cs,
        { table: 'unidade_trabalho', schema: 'macrocontrole' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.getPluginPath = async () => {
  return db.sapConn.one(
    `SELECT path
      FROM dgeo.plugin_path WHERE code = 1`
  )
}

controller.atualizaPluginPath = async (
  path
) => {
  return db.sapConn.any(
    `
    UPDATE dgeo.plugin_path SET
    path = $<path> WHERE code = 1
    `,
    { path }
  )
}

controller.getPit = async () => {
  return db.sapConn.any(
    `SELECT p.id, p.lote_id, p.meta, p.ano,
    l.nome AS lote
    FROM macrocontrole.pit AS p
    INNER JOIN macrocontrole.lote AS l ON l.id = p.lote_id`
  )
}

controller.criaPit = async pit => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet(['lote_id', 'meta', 'ano'])

    const query = db.pgp.helpers.insert(pit, cs, {
      table: 'pit',
      schema: 'macrocontrole'
    })

    await t.none(query)
  })
}

controller.atualizaPit = async pit => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet(['id', 'lote_id', 'meta', 'ano'])

    const query =
      db.pgp.helpers.update(
        pit,
        cs,
        { table: 'pit', schema: 'macrocontrole' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'

    await t.none(query)
  })
}

controller.deletePit = async pitIds => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.pit
      WHERE id in ($<pitIds:csv>)`,
      { pitIds }
    )

    if (exists && exists.length < pitIds.length) {
      throw new AppError(
        'O id informado não corresponde a um PIT id',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM macrocontrole.pit
      WHERE id in ($<pitIds:csv>)`,
      { pitIds }
    )
  })
}

controller.getAlteracaoFluxo = async () => {
  return db.sapConn.any(
    `SELECT af.id, af.atividade_id, af.descricao, af.data, af.resolvido, ST_ASEWKT(af.geom) AS geom,
    tpg.nome_abrev || ' ' || u.nome_guerra AS usuario
    FROM macrocontrole.alteracao_fluxo AS af
    INNER JOIN dgeo.usuario AS u ON u.id = af.usuario_id
    INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
    `
  )
}

controller.atualizaAlteracaoFluxo = async alteracaoFluxo => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      'id', 'atividade_id', 'descricao', 'data', 'resolvido', 'geom'
    ])

    const query =
      db.pgp.helpers.update(
        alteracaoFluxo,
        cs,
        { table: 'alteracao_fluxo', schema: 'macrocontrole' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'

    await t.none(query)
  })
}

controller.getFilaPrioritaria = async () => {
  return db.sapConn.any(
    `SELECT fp.id, fp.atividade_id, fp.usuario_id, fp.prioridade,
    tpg.nome_abrev || ' ' || u.nome_guerra AS usuario,
    su.nome AS subfase, lo.nome AS lote, bl.nome AS bloco
    FROM macrocontrole.fila_prioritaria AS fp
    INNER JOIN dgeo.usuario AS u ON u.id = fp.usuario_id
    INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
    INNER JOIN macrocontrole.atividade AS at ON at.id = fp.atividade_id
    INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = at.unidade_trabalho_id
    INNER JOIN macrocontrole.subfase AS su ON su.id = ut.subfase_id
    INNER JOIN macrocontrole.lote AS lo ON lo.id = ut.lote_id
    INNER JOIN macrocontrole.bloco AS bl ON bl.id = ut.bloco_id
    `
  )
}

controller.criaFilaPrioritaria = async filaPrioritaria => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      'atividade_id', 'usuario_id', 'prioridade'
    ])

    const query = db.pgp.helpers.insert(filaPrioritaria, cs, {
      table: 'fila_prioritaria',
      schema: 'macrocontrole'
    })

    await t.none(query)
  })
}

controller.atualizaFilaPrioritaria = async filaPrioritaria => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      'id', 'atividade_id', 'usuario_id', 'prioridade'
    ])

    const query =
      db.pgp.helpers.update(
        filaPrioritaria,
        cs,
        { table: 'fila_prioritaria', schema: 'macrocontrole' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'

    await t.none(query)
  })
}

controller.deleteFilaPrioritaria = async filaPrioritariaIds => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.fila_prioritaria
      WHERE id in ($<filaPrioritariaIds:csv>)`,
      { filaPrioritariaIds }
    )

    if (exists && exists.length < filaPrioritariaIds.length) {
      throw new AppError(
        'O id informado não corresponde a uma entrada da fila prioritária',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM macrocontrole.fila_prioritaria
      WHERE id in ($<filaPrioritariaIds:csv>)`,
      { filaPrioritariaIds }
    )
  })
}

controller.getFilaPrioritariaGrupo = async () => {
  return db.sapConn.any(
    `SELECT fpg.id, fpg.atividade_id, fpg.perfil_producao_id, fpg.prioridade,
    pp.nome AS perfil_producao,
    su.nome AS subfase, lo.nome AS lote, bl.nome AS bloco
    FROM macrocontrole.fila_prioritaria_grupo AS fpg
    INNER JOIN macrocontrole.perfil_producao AS pp ON pp.id = fpg.perfil_producao_id
    INNER JOIN macrocontrole.atividade AS at ON at.id = fpg.atividade_id
    INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = at.unidade_trabalho_id
    INNER JOIN macrocontrole.subfase AS su ON su.id = ut.subfase_id
    INNER JOIN macrocontrole.lote AS lo ON lo.id = ut.lote_id
    INNER JOIN macrocontrole.bloco AS bl ON bl.id = ut.bloco_id
    `
  )
}

controller.criaFilaPrioritariaGrupo = async filaPrioritariaGrupo => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      'atividade_id', 'perfil_producao_id', 'prioridade'
    ])

    const query = db.pgp.helpers.insert(filaPrioritariaGrupo, cs, {
      table: 'fila_prioritaria_grupo',
      schema: 'macrocontrole'
    })

    await t.none(query)
  })
}

controller.atualizaFilaPrioritariaGrupo = async filaPrioritariaGrupo => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      'id', 'atividade_id', 'perfil_producao_id', 'prioridade'
    ])

    const query =
      db.pgp.helpers.update(
        filaPrioritariaGrupo,
        cs,
        { table: 'fila_prioritaria_grupo', schema: 'macrocontrole' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'

    await t.none(query)
  })
}

controller.deleteFilaPrioritariaGrupo = async filaPrioritariaGrupoIds => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.fila_prioritaria_grupo
      WHERE id in ($<filaPrioritariaGrupoIds:csv>)`,
      { filaPrioritariaGrupoIds }
    )

    if (exists && exists.length < filaPrioritariaGrupoIds.length) {
      throw new AppError(
        'O id informado não corresponde a uma entrada da fila prioritária de grupo',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM macrocontrole.fila_prioritaria_grupo
      WHERE id in ($<filaPrioritariaGrupoIds:csv>)`,
      { filaPrioritariaGrupoIds }
    )
  })
}

module.exports = controller
