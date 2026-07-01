'use strict'

const { db } = require('../database')

const { AppError, httpCode } = require('../utils')

const controller = {}

controller.getSituacao = async () => {
  return db.sapConn.any(
    `SELECT s.code, s.nome FROM macrocontrole.situacao_extra_pit AS s ORDER BY s.code`
  )
}

// Secao 2.6 do RPCMTec (Extra-PIT do ano). Traz o lote_id para o guard da 2.1
// (lote com extra_pit.lote_id nao deve ser contado como producao do PIT).
controller.getByAno = async ano => {
  return db.sapConn.any(
    `SELECT e.id, e.ano, e.demandante, e.tipo_produto, e.quantidade,
            e.situacao_id, s.nome AS situacao, e.documento_autorizacao,
            e.descricao, e.data_entrega, e.lote_id, l.nome AS lote_nome
     FROM macrocontrole.extra_pit AS e
     JOIN macrocontrole.situacao_extra_pit AS s ON s.code = e.situacao_id
     LEFT JOIN macrocontrole.lote AS l ON l.id = e.lote_id
     WHERE e.ano = $<ano>
     ORDER BY e.demandante, e.tipo_produto`,
    { ano }
  )
}

controller.criaExtraPit = async extraPit => {
  return db.sapConn.none(
    `INSERT INTO macrocontrole.extra_pit
      (ano, demandante, tipo_produto, quantidade, situacao_id, documento_autorizacao, descricao, data_entrega, lote_id)
     VALUES
      ($<ano>, $<demandante>, $<tipo_produto>, $<quantidade>, $<situacao_id>, $<documento_autorizacao>, $<descricao>, $<data_entrega>, $<lote_id>)`,
    extraPit
  )
}

controller.atualizaExtraPit = async (id, extraPit) => {
  const result = await db.sapConn.result(
    `UPDATE macrocontrole.extra_pit SET
       ano = $<ano>, demandante = $<demandante>, tipo_produto = $<tipo_produto>,
       quantidade = $<quantidade>, situacao_id = $<situacao_id>,
       documento_autorizacao = $<documento_autorizacao>, descricao = $<descricao>,
       data_entrega = $<data_entrega>, lote_id = $<lote_id>
     WHERE id = $<id>`,
    { id, ...extraPit }
  )
  if (!result.rowCount) {
    throw new AppError('Demanda Extra-PIT não encontrada', httpCode.NotFound)
  }
}

controller.deletaExtraPit = async id => {
  const result = await db.sapConn.result(
    `DELETE FROM macrocontrole.extra_pit WHERE id = $<id>`,
    { id }
  )
  if (!result.rowCount) {
    throw new AppError('Demanda Extra-PIT não encontrada', httpCode.NotFound)
  }
}

module.exports = controller
