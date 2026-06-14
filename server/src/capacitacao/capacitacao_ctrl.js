'use strict'

const { db } = require('../database')

const { AppError, httpCode } = require('../utils')

const controller = {}

controller.getSituacao = async () => {
  return db.sapConn.any(
    `SELECT s.code, s.nome FROM controle_capacitacao.situacao AS s ORDER BY s.code`
  )
}

controller.getTipos = async () => {
  return db.sapConn.any(
    `SELECT unnest(enum_range(NULL::controle_capacitacao.tipo_capacitacao)) AS tipo;`
  )
}

controller.getCapacitacoes = async () => {
  return db.sapConn.any(
    `SELECT c.id, c.nome, c.tipo, c.instituicoes, c.local, c.inicio, c.fim,
            c.efetivo_capacitado, c.militares, c.plano_codigo, c.ano,
            c.situacao_id, s.nome AS situacao, c.documento
     FROM controle_capacitacao.capacitacao AS c
     JOIN controle_capacitacao.situacao AS s ON s.code = c.situacao_id
     ORDER BY c.inicio DESC NULLS LAST, c.nome`
  )
}

controller.getCapacitacaoById = async id => {
  return db.sapConn.oneOrNone(
    `SELECT c.id, c.nome, c.tipo, c.instituicoes, c.local, c.inicio, c.fim,
            c.efetivo_capacitado, c.militares, c.plano_codigo, c.ano,
            c.situacao_id, s.nome AS situacao, c.documento
     FROM controle_capacitacao.capacitacao AS c
     JOIN controle_capacitacao.situacao AS s ON s.code = c.situacao_id
     WHERE c.id = $<id>`,
    { id }
  )
}

// Secoes 2.5 (Ministrada) e 5.2 (Recebida) do RPCMTec. Pega as capacitacoes
// ativas no periodo (sobreposicao com [dataInicio, dataFim]; Recebida em curso
// tem fim NULL e tambem entra).
controller.getRPCMTec = async (dataInicio, dataFim) => {
  const linhas = await db.sapConn.any(
    `SELECT c.id, c.nome, c.tipo, c.instituicoes, c.local, c.inicio, c.fim,
            c.efetivo_capacitado, c.militares, c.plano_codigo, c.ano,
            s.nome AS situacao, c.documento
     FROM controle_capacitacao.capacitacao AS c
     JOIN controle_capacitacao.situacao AS s ON s.code = c.situacao_id
     WHERE c.inicio::date <= $<dataFim>::date
       AND (c.fim IS NULL OR c.fim::date >= $<dataInicio>::date)
     ORDER BY c.tipo, c.inicio`,
    { dataInicio, dataFim }
  )
  return {
    ministrada: linhas.filter(l => l.tipo === 'Ministrada'),
    recebida: linhas.filter(l => l.tipo === 'Recebida')
  }
}

controller.criaCapacitacao = async capacitacao => {
  return db.sapConn.none(
    `INSERT INTO controle_capacitacao.capacitacao
      (nome, tipo, instituicoes, local, inicio, fim, efetivo_capacitado,
       militares, plano_codigo, ano, situacao_id, documento)
     VALUES
      ($<nome>, $<tipo>, $<instituicoes>, $<local>, $<inicio>, $<fim>, $<efetivo_capacitado>,
       $<militares>, $<plano_codigo>, $<ano>, $<situacao_id>, $<documento>)`,
    capacitacao
  )
}

controller.atualizaCapacitacao = async (id, capacitacao) => {
  const result = await db.sapConn.result(
    `UPDATE controle_capacitacao.capacitacao SET
       nome = $<nome>, tipo = $<tipo>, instituicoes = $<instituicoes>, local = $<local>,
       inicio = $<inicio>, fim = $<fim>, efetivo_capacitado = $<efetivo_capacitado>,
       militares = $<militares>, plano_codigo = $<plano_codigo>, ano = $<ano>,
       situacao_id = $<situacao_id>, documento = $<documento>
     WHERE id = $<id>`,
    { id, ...capacitacao }
  )
  if (!result.rowCount) {
    throw new AppError('Capacitação não encontrada', httpCode.NotFound)
  }
}

controller.deletaCapacitacao = async id => {
  const result = await db.sapConn.result(
    `DELETE FROM controle_capacitacao.capacitacao WHERE id = $<id>`,
    { id }
  )
  if (!result.rowCount) {
    throw new AppError('Capacitação não encontrada', httpCode.NotFound)
  }
}

module.exports = controller
