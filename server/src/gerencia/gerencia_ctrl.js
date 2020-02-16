'use strict'

const { db, temporaryLogin, managePermissions } = require('../database')

const { DB_USER, DB_PASSWORD, DB_SERVER, DB_PORT, DB_NAME } = require('../config')

const { AppError, httpCode } = require('../utils')

const { producaoCtrl } = require('../producao')

const controller = {}

controller.getAtividade = async (atividadeId, gerenteId) => {
  const atividade = await db.sapConn.oneOrNone(
    `SELECT a.etapa_id, a.unidade_trabalho_id
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
  data_fim = $<dataFim>, tipo_situacao_id = 5, tempo_execucao_microcontrole = macrocontrole.tempo_execucao_microcontrole(id), tempo_execucao_estimativa = macrocontrole.tempo_execucao_estimativa(id)
  WHERE id in (
    SELECT a.id FROM macrocontrole.atividade AS a
    INNER JOIN macrocontrole.unidade_trabalho AS ut ON a.unidade_trabalho_id = ut.id
    WHERE ut.id in ($<unidadeTrabalhoIds) AND a.tipo_situacao_id = 2
    ) RETURNING id, usuario_id
  `,
    { dataFim, unidadeTrabalhoIds }
  )
  if (updatedIds.length === 0) {
    return false
  }
  const updatedIdsFixed = []
  updatedIds.forEach(u => {
    updatedIdsFixed.push(u.id)
  })
  const atividades = await connection.any(
    'SELECT etapa_id, unidade_trabalho_id, usuario_id FROM macrocontrole.atividade WHERE id in ($<updatedIdsFixed:csv>)',
    { updatedIdsFixed }
  )

  const cs = new db.pgp.helpers.ColumnSet(
    ['etapa_id', 'unidade_trabalho_id', 'usuario_id', { name: 'tipo_situacao_id', init: () => 3 }]
  )

  const query = db.pgp.helpers.insert(atividades, cs, { table: 'atividade', schema: 'macrocontrole' })

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
  await db.sapConn.tx(async t => {
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

controller.pausaAtividade = async unidadeTrabalhoIds => {
  await db.sapConn.tx(async t => {
    const changed = await pausaAtividadeMethod(unidadeTrabalhoIds, t)
    if (!changed) {
      throw new AppError(
        'Unidades de trabalho não possuem atividades em execução',
        httpCode.NotFound
      )
    }
  })
}

controller.reiniciaAtividade = async unidadeTrabalhoIds => {
  const dataFim = new Date()
  await db.sapConn.tx(async t => {
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
    data_inicio = COALESCE(data_inicio, $<dataFim>), data_fim = COALESCE(data_fim, $<dataFim>), tipo_situacao_id = 5, tempo_execucao_microcontrole = macrocontrole.tempo_execucao_microcontrole(id), tempo_execucao_estimativa = macrocontrole.tempo_execucao_estimativa(id)
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
    if (updatedIds.length === 0) {
      throw new AppError(
        'Unidades de trabalho não possuem atividades em execução ou pausadas',
        httpCode.NotFound
      )
    }
    const updatedIdsFixed = []
    updatedIds.forEach(u => {
      updatedIdsFixed.push(u.id)
    })
    const atividades = await t.any(
      'SELECT etapa_id, unidade_trabalho_id FROM macrocontrole.atividade WHERE id in ($<updatedIdsFixed:csv>)',
      { updatedIdsFixed }
    )

    const cs = new db.pgp.helpers.ColumnSet(
      ['etapa_id', 'unidade_trabalho_id', { name: 'tipo_situacao_id', init: () => 1 }]
    )

    const query = db.pgp.helpers.insert(atividades, cs, { table: 'atividade', schema: 'macrocontrole' })

    await t.none(query)

    for (const u of usersResetPassword) {
      await temporaryLogin.resetPassword(u.id, u.usuario_id)
    }
  })
}

controller.voltaAtividade = async (atividadeIds, manterUsuarios) => {
  const dataFim = new Date()
  await db.sapConn.tx(async t => {
    const ativEmExec = await t.any(
      `SELECT a_ant.id
        FROM macrocontrole.atividade AS a
        INNER JOIN macrocontrole.atividade AS a_ant ON a_ant.unidade_trabalho_id = a.unidade_trabalho_id
        INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
        INNER JOIN macrocontrole.etapa AS e_ant ON e_ant.id = a_ant.etapa_id
        WHERE a.id in ($<atividadeIds:csv>) AND e_ant.ordem >= e.ordem AND a_ant.tipo_situacao_id IN (2)`,
      { atividadeIds }
    )
    if (ativEmExec) {
      throw new AppError(
        'Não se pode voltar atividades em execução. Pause a atividade primeiro',
        httpCode.BadRequest
      )
    }

    const atividadesUpdates = await t.any(
      `UPDATE macrocontrole.atividade SET
    tipo_situacao_id = 5, data_inicio = COALESCE(data_inicio, $<dataFim>), data_fim = COALESCE(data_fim, $<dataFim>), tempo_execucao_microcontrole = macrocontrole.tempo_execucao_microcontrole(id), tempo_execucao_estimativa = macrocontrole.tempo_execucao_estimativa(id)
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
    atividadesUpdates.forEach(i => {
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

  await db.sapConn.tx(async t => {
    const ativEmExec = await t.any(
      `SELECT a_ant.id
      FROM macrocontrole.atividade AS a
      INNER JOIN macrocontrole.atividade AS a_ant ON a_ant.unidade_trabalho_id = a.unidade_trabalho_id
      INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
      INNER JOIN macrocontrole.etapa AS e_ant ON e_ant.id = a_ant.etapa_id
      WHERE a.id in ($<atividadeIds:csv>) AND e_ant.ordem $<comparisonOperator:raw> e.ordem AND a_ant.tipo_situacao_id IN (2)`,
      { atividadeIds, comparisonOperator }
    )
    if (ativEmExec) {
      throw new AppError(
        'Não se pode avançar atividades em execução. Pause a atividade primeiro',
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
  observacaoEtapa,
  observacaoSubfase,
  observacaoUnidadeTrabalho,
  observacaoLote
) => {
  await db.sapConn.tx(async t => {
    await t.any(
      `
      UPDATE macrocontrole.atividade SET
      observacao = $<observacaoAtividade> WHERE id in ($<atividadeIds:csv>)
      `,
      [atividadeIds, observacaoAtividade]
    )
    await t.any(
      `
      UPDATE macrocontrole.etapa SET
      observacao = $<observacaoEtapa> WHERE id in (
        SELECT DISTINCT e.id FROM macrocontrole.atividade AS a
        INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id WHERE a.id in ($<atividadeIds:csv>)
      )
      `,
      [atividadeIds, observacaoEtapa]
    )

    await t.any(
      `
      UPDATE macrocontrole.subfase SET
      observacao = $<observacaoSubfase> WHERE id in (
        SELECT DISTINCT e.subfase_id FROM macrocontrole.atividade AS a
        INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id WHERE a.id in ($<atividadeIds:csv>)
      )
      `,
      [atividadeIds, observacaoSubfase]
    )

    await t.any(
      `
      UPDATE macrocontrole.unidade_trabalho SET
      observacao = $<observacaoUnidadeTrabalho> WHERE id in (
        SELECT DISTINCT a.unidade_trabalho_id FROM macrocontrole.atividade AS a
        WHERE a.id in ($<atividadeIds:csv>)
      )
      `,
      [atividadeIds, observacaoUnidadeTrabalho]
    )

    await t.any(
      `
      UPDATE macrocontrole.lote SET
      observacao = $<observacaoLote> WHERE id in (
        SELECT DISTINCT ut.lote_id FROM macrocontrole.atividade AS a
        INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id WHERE a.id in ($<atividadeIds:csv>)
      )
      `,
      [atividadeIds, observacaoLote]
    )
  })
}

controller.getObservacao = async atividadeId => {
  return db.sapConn.any(
    `SELECT a.observacao AS observacao_atividade, ut.observacao AS observacao_unidade_trabalho,
    l.observacao AS observacao_lote, e.observacao AS observacao_etapa, sf.observacao AS observacao_subfase
    FROM macrocontrole.atividade AS a
    INNER JOIN macrocontrole.unidade_trabalho_id AS ut ON ut.id = a.unidade_trabalho_id
    INNER JOIN macrocontrole.lote AS l ON l.id = ut.lote_id
    INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
    INNER JOIN macrocontrole.subfase AS sf ON sf.id = e.subfase_id
    WHERE a.id = $<atividadeId>`,
    { atividadeId }
  )
}

controller.getViewsAcompanhamento = async emAndamento => {
  let views = await db.sapConn.any(`
    SELECT v.schema, v.nome, v.tipo, coalesce(s.nome, f.nome, lp.nome) AS projeto,
    coalesce(s.finalizado, f.finalizado, lp.finalizado) AS finalizado
    FROM (SELECT v.table_schema AS schema, v.table_name AS nome,
    regexp_replace(substring(v.table_name, '^(subfase_|fase_|linha_producao_)'), '_$', '') AS tipo,
    substring(regexp_replace(v.table_name,'^(subfase_|fase_|linha_producao_)', ''), '^(\d+)_')::integer AS id
    FROM information_schema.views AS v
    WHERE v.table_schema = 'acompanhamento'
    AND substring(v.table_name, '^(subfase_|fase_|linha_producao_)') IS NOT NULL) AS v
    LEFT JOIN (
      SELECT s.id, p.nome, p.finalizado FROM macrocontrole.subfase AS s
        INNER JOIN macrocontrole.fase AS f ON f.id = s.fase_id
        INNER JOIN macrocontrole.linha_producao AS lp ON lp.id = f.linha_producao_id
        INNER JOIN macrocontrole.projeto AS p ON p.id = lp.projeto_id
    ) AS s ON s.id = v.id AND v.tipo = 'subfase'
    LEFT JOIN (
      SELECT f.id, p.nome, p.finalizado FROM macrocontrole.fase AS f
        INNER JOIN macrocontrole.linha_producao AS lp ON lp.id = f.linha_producao_id
        INNER JOIN macrocontrole.projeto AS p ON p.id = lp.projeto_id
    ) AS f ON f.id = v.id AND v.tipo = 'fase'
    LEFT JOIN (
        SELECT lp.id, p.nome, p.finalizado FROM macrocontrole.linha_producao AS lp
        INNER JOIN macrocontrole.projeto AS p ON p.id = lp.projeto_id
    ) AS lp ON lp.id = v.id AND v.tipo = 'linha_producao'
    ORDER BY projeto, tipo, nome
  `)
  if (!views) {
    return null
  }
  if (emAndamento) {
    views = views.filter(v => !v.finalizado)
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
