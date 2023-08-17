'use strict'

const { db } = require('../database')

const controller = {}

controller.getTipoMonitoramento = async () => {
  return db.sapConn
    .any('SELECT code, nome FROM microcontrole.tipo_monitoramento')
}

controller.getTipoOperacao = async () => {
  return db.microConn
    .any('SELECT code, nome FROM microcontrole.tipo_operacao')
}

controller.armazenaFeicao = async (atividadeId, usuarioId, data, dados) => {
  const cs = new db.pgp.helpers.ColumnSet(
    [
      'tipo_operacao_id',
      'camada_id',
      'quantidade',
      'comprimento',
      'vertices',
      { name: 'data', init: () => data },
      { name: 'atividade_id', init: () => atividadeId },
      { name: 'usuario_id', init: () => usuarioId }
    ]
  )

  const query = db.pgp.helpers.insert(dados, cs, { table: 'monitoramento_feicao', schema: 'microcontrole' })

  db.microConn.none(query)
}

controller.armazenaTela = async (atividadeId, usuarioId, dados) => {
  const cs = new db.pgp.helpers.ColumnSet(
    ['geom', 'zoom', 'data', { name: 'atividade_id', init: () => atividadeId }, { name: 'usuario_id', init: () => usuarioId }]
  )

  dados.foreach(d => {
    d.geom = `ST_GeomFromEWKT('SRID=4326;POLYGON(${d.x_min} ${d.y_min},${d.x_min} ${d.y_max},${d.x_max} ${d.y_max}, ${d.x_max} ${d.y_min}, ${d.x_min} ${d.y_min})')`
  })

  const query = db.pgp.helpers.insert(dados, cs, { table: 'monitoramento_tela', schema: 'microcontrole' })

  db.microConn.none(query)
}

controller.getPerfilMonitoramento = async () => {
  return db.sapConn.any(
    `SELECT pm.id, pm.tipo_monitoramento_id, pm.subfase_id, pm.lote_id,
    tm.nome AS tipo_monitoramento
    FROM microcontrole.perfil_monitoramento AS pm
    INNER JOIN microcontrole.tipo_monitoramento AS tm
    ON tm.code = pm.tipo_monitoramento_id
    `)
}

controller.criaPerfilMonitoramento = async perfisMonitoramento => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'subfase_id',
      'lote_id',
      'tipo_monitoramento_id'
    ])

    const query = db.pgp.helpers.insert(perfisMonitoramento, cs, {
      table: 'perfil_monitoramento',
      schema: 'microcontrole'
    })

    await t.none(query)
  })
}

controller.atualizaPerfilMonitoramento = async perfisMonitoramento => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'subfase_id',
      'lote_id',
      'tipo_monitoramento_id'
    ])

    const query =
      db.pgp.helpers.update(
        perfisMonitoramento,
        cs,
        { table: 'perfil_monitoramento', schema: 'microcontrole' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.deletePerfilMonitoramento = async perfisMonitoramentoId => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM microcontrole.perfil_monitoramento
      WHERE id in ($<perfisMonitoramentoId:csv>)`,
      { perfisMonitoramentoId }
    )
    if (exists && exists.length < perfisMonitoramentoId.length) {
      throw new AppError(
        'O id informado não corresponde a um perfil monitoramento id',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM microcontrole.perfil_monitoramento
      WHERE id in ($<perfisMonitoramentoId:csv>)`,
      { perfisMonitoramentoId }
    )
  })
}

module.exports = controller
