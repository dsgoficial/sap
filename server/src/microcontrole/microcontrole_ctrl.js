'use strict'

const { db } = require('../database')

const controller = {}

controller.getTipoMonitoramento = async () => {
  return db.sapConn
    .any('SELECT code, nome FROM microcontrole.tipo_monitoramento')
}

controller.getTipoOperacao = async () => {
  return db.sapConn
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

  db.sapConn.none(query)
}

controller.armazenaTela = async (atividadeId, usuarioId, dados) => {
  const cs = new db.pgp.helpers.ColumnSet(
    ['geom', 'zoom', 'data', { name: 'atividade_id', init: () => atividadeId }, { name: 'usuario_id', init: () => usuarioId }]
  )

  dados.foreach(d => {
    d.geom = `ST_GeomFromEWKT('SRID=4326;POLYGON(${d.x_min} ${d.y_min},${d.x_min} ${d.y_max},${d.x_max} ${d.y_max}, ${d.x_max} ${d.y_min}, ${d.x_min} ${d.y_min})')`
  })

  const query = db.pgp.helpers.insert(dados, cs, { table: 'monitoramento_tela', schema: 'microcontrole' })

  db.sapConn.none(query)
}

controller.armazenaComportamento = async (atividadeId, usuarioId, dados) => {
  const cs = new db.pgp.helpers.ColumnSet(
    ['data', { name: 'atividade_id', init: () => atividadeId }, { name: 'usuario_id', init: () => usuarioId }, 'propriedade', 'valor']
  )

  const query = db.pgp.helpers.insert(dados, cs, { table: 'monitoramento_comportamento', schema: 'microcontrole' })

  db.sapConn.none(query)
}

module.exports = controller
