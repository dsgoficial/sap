'use strict'

const { db, temporaryLogin, managePermissions } = require('../database')

const {
  DB_USER,
  DB_PASSWORD,
  DB_SERVER,
  DB_PORT,
  DB_NAME
} = require('../config')

const { AppError, httpCode } = require('../utils')

const { producaoCtrl } = require('../producao')

const controller = {}

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

  return producaoCtrl.getDadosAtividade(atividadeId, gerenteId)
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

  return producaoCtrl.getDadosAtividade(atividadeId, gerenteId)
}

controller.getPerfilProducao = async () => {
  return db.sapConn.any('SELECT id, nome FROM macrocontrole.perfil_producao')
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
    ) RETURNING id, usuario_id
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
  await db.sapConn.tx(async (t) => {
    await t.none(
      `UPDATE macrocontrole.unidade_trabalho
      SET disponivel = $<disponivel>
      WHERE id in ($<unidadeTrabalhoIds:csv>)`,
      { unidadeTrabalhoIds, disponivel }
    )
    if (!disponivel) {
      await pausaAtividadeMethod(unidadeTrabalhoIds, t)
    }
  })
}

controller.pausaAtividade = async (unidadeTrabalhoIds) => {
  await db.sapConn.tx(async (t) => {
    const changed = await pausaAtividadeMethod(unidadeTrabalhoIds, t)
    if (!changed) {
      throw new AppError(
        'Unidades de trabalho não possuem atividades em execução',
        httpCode.NotFound
      )
    }
  })
}

controller.atualizaAtividadesBloqueadas = async () => {
  return db.sapConn.any(
    'REFRESH MATERIALIZED VIEW acompanhamento.atividades_bloqueadas'
  )
}

controller.reiniciaAtividade = async (unidadeTrabalhoIds) => {
  const dataFim = new Date()
  await db.sapConn.tx(async (t) => {
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
}

controller.voltaAtividade = async (atividadeIds, manterUsuarios) => {
  const dataFim = new Date()
  await db.sapConn.tx(async (t) => {
    const ativEmExec = await t.any(
      `SELECT a_ant.id
        FROM macrocontrole.atividade AS a
        INNER JOIN macrocontrole.atividade AS a_ant ON a_ant.unidade_trabalho_id = a.unidade_trabalho_id
        INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
        INNER JOIN macrocontrole.etapa AS e_ant ON e_ant.id = a_ant.etapa_id
        WHERE a.id in ($<atividadeIds:csv>) AND e_ant.ordem >= e.ordem AND a_ant.tipo_situacao_id IN (2)`,
      { atividadeIds }
    )
    if (ativEmExec && ativEmExec.length > 0) {
      throw new AppError(
        'Não se pode voltar atividades em execução. Pause a atividade primeiro',
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
        WHERE a.id in ($<atividadeIds:csv>) AND e_ant.ordem >= e.ordem AND a_ant.tipo_situacao_id IN (3,4)
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
}

controller.avancaAtividade = async (atividadeIds, concluida) => {
  const comparisonOperator = concluida ? '<=' : '='

  await db.sapConn.tx(async (t) => {
    const ativEmExec = await t.any(
      `SELECT a_ant.id
      FROM macrocontrole.atividade AS a
      INNER JOIN macrocontrole.atividade AS a_ant ON a_ant.unidade_trabalho_id = a.unidade_trabalho_id
      INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
      INNER JOIN macrocontrole.etapa AS e_ant ON e_ant.id = a_ant.etapa_id
      WHERE a.id in ($<atividadeIds:csv>) AND e_ant.ordem $<comparisonOperator:raw> e.ordem AND a_ant.tipo_situacao_id IN (2)`,
      { atividadeIds, comparisonOperator }
    )
    if (ativEmExec && ativEmExec.length > 0) {
      throw new AppError(
        'Não se pode avançar atividades em execução. Pause a atividade primeiro',
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

    await t.none(
      `
        DELETE FROM macrocontrole.atividade
        WHERE id IN (
            SELECT a_ant.id
            FROM macrocontrole.atividade AS a
            INNER JOIN macrocontrole.atividade AS a_ant ON a_ant.unidade_trabalho_id = a.unidade_trabalho_id
            INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
            INNER JOIN macrocontrole.etapa AS e_ant ON e_ant.id = a_ant.etapa_id
            WHERE a.id in ($<atividadeIds:csv>) AND e_ant.ordem $<comparisonOperator:raw> e.ordem AND a_ant.tipo_situacao_id IN (1,3)
        )
        `,
      { atividadeIds, comparisonOperator }
    )
  })
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
  if (!result.rowCount || result.rowCount !== 1) {
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

  if (!result.rowCount || result.rowCount !== 1) {
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
  await db.sapConn.tx(async (t) => {
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
  let views = await db.sapConn.any(`
  SELECT 'acompanhamento' AS schema, mat.matviewname AS nome,
  l.id AS lote_id, l.projeto_id, l.linha_producao_id,
  CASE WHEN mat.matviewname LIKE '%_subfase_%' THEN 'subfase' ELSE 'lote' END AS tipo
  FROM pg_matviews AS mat
  INNER JOIN macrocontrole.lote AS l ON l.id = substring(mat.matviewname from 6 for 1)::int
  WHERE schemaname = 'acompanhamento' AND matviewname ~ '^lote_'
  ORDER BY mat.matviewname;
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

controller.revogarPermissoesDB = async (servidor, porta, banco) => {
  return managePermissions.revokeAllDb(servidor, porta, banco)
}

module.exports = controller
