'use strict'

const { db } = require('../database')

// AppError/httpCode eram usados em deletePerfilMonitoramento sem import
// (ReferenceError → 500 em vez de 400 na validação).
const { AppError, httpCode } = require('../utils')

const controller = {}

controller.getTipoMonitoramento = async () => {
  return db.sapConn
    .any('SELECT code, nome FROM microcontrole.tipo_monitoramento')
}

controller.getTipoOperacao = async () => {
  return db.microConn
    .any('SELECT code, nome FROM microcontrole.tipo_operacao')
}

controller.armazenaFeicao = async (atividadeId, usuarioId, dados) => {
  const cs = new db.pgp.helpers.ColumnSet(
    [
      'tipo_operacao_id',
      'camada',
      'quantidade',
      {
        name: 'comprimento',
        def: 0
      },
      {
        name: 'vertices',
        def: 0
      },
      { name: 'data', mod: ':raw', init: () => 'NOW()' },
      { name: 'atividade_id', init: () => atividadeId },
      { name: 'usuario_id', init: () => usuarioId }
    ]
  )

  const query = db.pgp.helpers.insert(dados, cs, { table: 'monitoramento_feicao', schema: 'microcontrole' })

  return db.microConn.none(query)
}

controller.armazenaTela = async (atividadeId, usuarioId, dados) => {
  const cs = new db.pgp.helpers.ColumnSet(
    [{ name: 'geom', mod: ':raw' }, 'zoom', 'data', { name: 'atividade_id', init: () => atividadeId }, { name: 'usuario_id', init: () => usuarioId }]
  )

  // geom é a envelope retangular da extensão de tela (x_min,y_min,x_max,y_max).
  // Coluna `:raw` porque o valor é uma expressão SQL (ST_MakeEnvelope), montada
  // com pgp.as.format para escapar as coordenadas — mesmo padrão de campo_ctrl.
  // Bugs corrigidos aqui: `dados.foreach` (typo → TypeError, rota /tela 100%
  // quebrada); geom sem `:raw` (entrava como texto literal → cast text→geometry
  // falhava); e falta de `return` (insert não aguardado → sucesso falso).
  dados.forEach(d => {
    d.geom = db.pgp.as.format('ST_MakeEnvelope($1, $2, $3, $4, 4326)', [d.x_min, d.y_min, d.x_max, d.y_max])
  })

  const query = db.pgp.helpers.insert(dados, cs, { table: 'monitoramento_tela', schema: 'microcontrole' })

  return db.microConn.none(query)
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
