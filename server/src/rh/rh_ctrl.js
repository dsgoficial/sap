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

controller.getAllLoteStatsByDate = async (dataInicio, dataFim) => {
  return db.sapConn.any(
    `SELECT 
    l.id AS lote_id,
    l.nome AS lote_nome,
    COUNT(*) AS total_atividades,
    COUNT(CASE WHEN a.tipo_situacao_id = 4 THEN 1 END) * 1.0 / NULLIF(COUNT(*), 0) AS percent_exec,
    COUNT(CASE WHEN a.tipo_situacao_id = 4 
               AND (a.data_inicio >= $<dataInicio>::timestamp 
                    OR (a.data_fim BETWEEN $<dataInicio>::timestamp AND $<dataFim>::timestamp)) 
               THEN 1 END) AS exec_no_periodo,
    AVG(EXTRACT(EPOCH FROM (a.data_fim - a.data_inicio))) / 3600 AS tempo_medio_horas,
    STDDEV(EXTRACT(EPOCH FROM (a.data_fim - a.data_inicio))) / 3600 AS desvio_padrao_tempo
FROM macrocontrole.atividade AS a
INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
INNER JOIN macrocontrole.lote AS l ON l.id = ut.lote_id
WHERE l.status_id = 1
AND a.tipo_situacao_id BETWEEN 1 AND 5
GROUP BY l.id, l.nome
HAVING COUNT(CASE WHEN a.tipo_situacao_id = 4 
                  AND (a.data_inicio >= $<dataInicio>::timestamp 
                       OR (a.data_fim BETWEEN $<dataInicio>::timestamp AND $<dataFim>::timestamp)) 
                  THEN 1 END) > 0
ORDER BY percent_exec DESC;`,
    { dataInicio: `${dataInicio} 00:00:00`, dataFim: `${dataFim} 23:59:59` }
  );
}

controller.getAllBlocksStatsByDate = async (dataInicio, dataFim) => {
  return db.sapConn.any(
    `SELECT 
    b.nome,
    COALESCE(COUNT(CASE WHEN a.tipo_situacao_id = 4 THEN 1 END) * 1.0 / NULLIF(COUNT(*), 0), 0.0) AS proporcao_4,
    COUNT(CASE WHEN a.tipo_situacao_id = 4 
               AND (a.data_inicio >= $<dataInicio>::timestamp 
                    OR (a.data_fim BETWEEN $<dataInicio>::timestamp AND $<dataFim>::timestamp)) 
               THEN 1 END) AS exec_no_periodo
FROM macrocontrole.atividade AS a
INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
INNER JOIN macrocontrole.lote AS l ON l.id = ut.lote_id
INNER JOIN macrocontrole.bloco AS b ON b.id = ut.bloco_id
WHERE b.status_id = 1
AND a.tipo_situacao_id BETWEEN 1 AND 5
GROUP BY b.id, b.nome
HAVING COUNT(CASE WHEN a.tipo_situacao_id = 4 
                  AND (a.data_inicio >= $<dataInicio>::timestamp 
                       OR (a.data_fim BETWEEN $<dataInicio>::timestamp AND $<dataFim>::timestamp)) 
                  THEN 1 END) > 0
ORDER BY proporcao_4 DESC;
`,
    { dataInicio: `${dataInicio} 00:00:00`, dataFim: `${dataFim} 23:59:59` }
  );
}

module.exports = controller
