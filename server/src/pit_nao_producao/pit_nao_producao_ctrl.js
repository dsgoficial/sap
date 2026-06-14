'use strict'

const { db } = require('../database')

const { AppError, httpCode } = require('../utils')

const controller = {}

// Metas do PIT que o SAP nao calcula (macrocontrole.pit com lote_id nulo), ja com
// a execucao mensal agregada (realizado acumulado no ano e %). Espelha a aba
// EXEC_PIT do RTM. As metas de producao (com lote) seguem em /acompanhamento/pit.
controller.getByAno = async ano => {
  return db.sapConn.any(
    `SELECT p.id, p.ano, p.numero_meta, p.item, p.descricao, p.unidade, p.meta, p.prazo,
            COALESCE(SUM(e.quantidade), 0) AS realizado,
            CASE WHEN p.meta > 0
                 THEN round(100.0 * COALESCE(SUM(e.quantidade), 0) / p.meta, 1)
                 ELSE NULL END AS percentual
     FROM macrocontrole.pit AS p
     LEFT JOIN macrocontrole.pit_execucao_manual AS e ON e.pit_id = p.id
     WHERE p.ano = $<ano> AND p.lote_id IS NULL
     GROUP BY p.id
     ORDER BY p.numero_meta, p.item`,
    { ano }
  )
}

controller.criaMeta = async pit => {
  return db.sapConn.none(
    `INSERT INTO macrocontrole.pit
      (lote_id, ano, numero_meta, item, descricao, unidade, meta, prazo)
     VALUES
      (NULL, $<ano>, $<numero_meta>, $<item>, $<descricao>, $<unidade>, $<meta>, $<prazo>)`,
    pit
  )
}

controller.atualizaMeta = async (id, pit) => {
  const result = await db.sapConn.result(
    `UPDATE macrocontrole.pit SET
       ano = $<ano>, numero_meta = $<numero_meta>, item = $<item>,
       descricao = $<descricao>, unidade = $<unidade>, meta = $<meta>, prazo = $<prazo>
     WHERE id = $<id> AND lote_id IS NULL`,
    { id, ...pit }
  )
  if (!result.rowCount) {
    throw new AppError('Meta do PIT (nao-producao) não encontrada', httpCode.NotFound)
  }
}

controller.deletaMeta = async id => {
  // As linhas de pit_execucao_manual saem por ON DELETE CASCADE (ver er/macrocontrole.sql).
  const result = await db.sapConn.result(
    'DELETE FROM macrocontrole.pit WHERE id = $<id> AND lote_id IS NULL',
    { id }
  )
  if (!result.rowCount) {
    throw new AppError('Meta do PIT (nao-producao) não encontrada', httpCode.NotFound)
  }
}

// Grid de lancamento de um mes: todas as metas sem lote do ano com o realizado
// daquele mes (campos de execucao nulos quando ainda nao lancado).
controller.getExecucao = async (ano, mes) => {
  return db.sapConn.any(
    `SELECT p.id AS pit_id, p.numero_meta, p.item, p.descricao, p.unidade, p.meta, p.prazo,
            e.id AS execucao_id, e.quantidade, e.data_conclusao, e.observacao
     FROM macrocontrole.pit AS p
     LEFT JOIN macrocontrole.pit_execucao_manual AS e
            ON e.pit_id = p.id AND e.mes = $<mes>
     WHERE p.ano = $<ano> AND p.lote_id IS NULL
     ORDER BY p.numero_meta, p.item`,
    { ano, mes }
  )
}

// Salva o realizado de uma meta num mes (cria a celula ou atualiza a existente).
// O INSERT ... SELECT com guard so grava se o pit_id for uma meta SEM lote
// (nao-producao); execucao manual nunca se prende a meta de producao.
controller.salvaExecucao = async execucao => {
  return db.sapConn.none(
    `INSERT INTO macrocontrole.pit_execucao_manual
      (pit_id, mes, quantidade, data_conclusao, observacao)
     SELECT $<pit_id>, $<mes>, $<quantidade>, $<data_conclusao>, $<observacao>
     WHERE EXISTS (
       SELECT 1 FROM macrocontrole.pit WHERE id = $<pit_id> AND lote_id IS NULL
     )
     ON CONFLICT (pit_id, mes) DO UPDATE SET
       quantidade = EXCLUDED.quantidade,
       data_conclusao = EXCLUDED.data_conclusao,
       observacao = EXCLUDED.observacao`,
    execucao
  )
}

controller.deletaExecucao = async id => {
  const result = await db.sapConn.result(
    'DELETE FROM macrocontrole.pit_execucao_manual WHERE id = $<id>',
    { id }
  )
  if (!result.rowCount) {
    throw new AppError('Lançamento de execução não encontrado', httpCode.NotFound)
  }
}

module.exports = controller
