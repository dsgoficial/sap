'use strict'

const { db } = require('../database')

const { AppError, httpCode } = require('../utils')

const controller = {}

controller.getTipoPerdaHr = async () => {
  return db.sapConn
    .any('SELECT code, nome FROM dominio.tipo_perda_recurso_humano')
}

controller.getDiasLogadosUsuario = async usuarioId => {
  return db.sapConn.any(
    `SELECT DISTINCT l.data_login::date AS dias_logados
    FROM acompanhamento.login AS l
    WHERE l.usuario_id = $<usuarioId>
    `,
    {usuarioId}
  )
}

controller.getAtividadesPorPeriodo = async (dataInicio, dataFim) => {
  return db.sapConn.any(
    `SELECT  
      u.nome AS nome_usuario, 
      STRING_AGG(DISTINCT b.nome, ', ') AS nome_bloco,
      COUNT(DISTINCT ut.id) AS qtd_ut
      FROM macrocontrole.atividade a
      JOIN dgeo.usuario u ON a.usuario_id = u.id
      JOIN macrocontrole.unidade_trabalho ut ON a.unidade_trabalho_id = ut.id
      JOIN macrocontrole.bloco b ON ut.bloco_id = b.id
    WHERE a.data_inicio >= $<dataInicio>::timestamp OR (a.data_fim BETWEEN $<dataInicio>::timestamp AND $<dataFim>::timestamp)
    GROUP BY u.nome
    ORDER BY u.nome;`,
    { dataInicio: `${dataInicio} 00:00:00`, dataFim: `${dataFim} 23:59:59` }
  );
};

controller.getAtividadesPorUsuarioEPeriodo = async (usuarioId, dataInicio, dataFim) => {
  return db.sapConn.any(
    `SELECT  
      u.nome AS nome_usuario,
      sf.nome AS nome_subfase, 
      b.nome AS nome_bloco,
      COUNT(DISTINCT ut.id) AS qtd_ut
      FROM macrocontrole.atividade a
      JOIN dgeo.usuario u ON a.usuario_id = u.id
      JOIN macrocontrole.unidade_trabalho ut ON a.unidade_trabalho_id = ut.id
      JOIN macrocontrole.bloco b ON ut.bloco_id = b.id
      JOIN macrocontrole.subfase sf ON ut.subfase_id = sf.id
    WHERE a.usuario_id = $<usuarioId>
      AND (a.data_inicio >= $<dataInicio>::timestamp OR (a.data_fim BETWEEN $<dataInicio>::timestamp AND $<dataFim>::timestamp))
    GROUP BY u.nome, sf.nome, b.nome  -- Agrupando por usuário, atividade e bloco
    ORDER BY u.nome, sf.nome;`,
    { usuarioId, dataInicio: `${dataInicio} 00:00:00`, dataFim: `${dataFim} 23:59:59` }
  );
};


module.exports = controller
