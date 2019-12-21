'use strict'

const { db } = require('../database')

const controller = {}

controller.armazenaFeicao = async (atividadeId, usuarioId, data, dados) => {
  const table = new db.pgp.helpers.TableName({
    table: 'monitoramento_feicao',
    schema: 'microcontrole'
  })

  const cs = new db.pgp.helpers.ColumnSet(
    [
      'tipo_operacao_id',
      'camada_id',
      'quantidade',
      'comprimento',
      'vertices',
      'data',
      'atividade_id',
      'usuario_id'
    ],
    { table }
  )

  const values = []
  dados.foreach(d => {
    values.push({
      tipo_operacao_id: d.operacao,
      camada_id: d.camada_id,
      quantidade: d.quantidade,
      comprimento: d.comprimento,
      vertices: d.vertices,
      data: data,
      atividade_id: atividadeId,
      usuario_id: usuarioId
    })
  })

  const query = db.pgp.helpers.insert(values, cs)

  db.sapConn.none(query)
}

controller.armazenaApontamento = async (
  atividadeId,
  usuarioId,
  data,
  dados
) => {
  const table = new db.pgp.helpers.TableName({
    table: 'monitoramento_apontamento',
    schema: 'microcontrole'
  })

  const cs = new db.pgp.helpers.ColumnSet(
    ['quantidade', 'categoria', 'data', 'atividade_id', 'usuario_id'],
    { table }
  )

  const values = []
  dados.foreach(d => {
    values.push({
      quantidade: d.quantidade,
      categoria: d.categoria,
      data: data,
      atividade_id: atividadeId,
      usuario_id: usuarioId
    })
  })

  const query = db.pgp.helpers.insert(values, cs)

  db.sapConn.none(query)
}

controller.armazenaTela = async (atividadeId, usuarioId, dados) => {
  const table = new db.pgp.helpers.TableName({
    table: 'monitoramento_tela',
    schema: 'microcontrole'
  })

  const cs = new db.pgp.helpers.ColumnSet(
    ['geom', 'zoom', 'data', 'atividade_id', 'usuario_id'],
    {
      table
    }
  )

  const values = []

  dados.foreach(d => {
    const geom = `ST_GeomFromEWKT('SRID=4326;POLYGON(${d.x_min} ${d.y_min},${d.x_min} ${d.y_max},${d.x_max} ${d.y_max}, ${d.x_max} ${d.y_min}, ${d.x_min} ${d.y_min})')`
    values.push({
      geom: geom,
      zoom: d.zoom,
      data: d.data,
      atividade_id: atividadeId,
      usuario_id: usuarioId
    })
  })

  const query = db.pgp.helpers.insert(values, cs)

  db.sapConn.none(query)
}

controller.armazenaComportamento = async (atividadeId, usuarioId, dados) => {
  const table = new db.pgp.helpers.TableName({
    table: 'monitoramento_comportamento',
    schema: 'microcontrole'
  })

  const cs = new db.pgp.helpers.ColumnSet(
    ['data', 'atividade_id', 'usuario_id', 'propriedade', 'valor'],
    {
      table
    }
  )

  const values = []

  dados.foreach(d => {
    values.push({
      data: d.data,
      atividade_id: atividadeId,
      usuario_id: usuarioId,
      propriedade: d.propriedade,
      valor: d.valor
    })
  })

  const query = db.pgp.helpers.insert(values, cs)

  db.sapConn.none(query)
}

module.exports = controller
