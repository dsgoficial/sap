WITH atividade_data AS (
  SELECT a.id, a.etapa_id, e.subfase_id, e.ordem, a.tipo_situacao_id, a.unidade_trabalho_id, ppo.usuario_id, ut.dificuldade, ut.tempo_estimado_minutos,
	b.prioridade as b_prioridade, ut.prioridade AS ut_prioridade, pse.prioridade as pse_prioridade, b.id AS bloco_id, ut.lote_id
  FROM macrocontrole.atividade AS a
  INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
  INNER JOIN macrocontrole.perfil_producao_etapa AS pse ON pse.subfase_id = e.subfase_id AND pse.tipo_etapa_id = e.tipo_etapa_id
  INNER JOIN macrocontrole.perfil_producao_operador AS ppo ON ppo.perfil_producao_id = pse.perfil_producao_id
  INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
  INNER JOIN macrocontrole.bloco AS b ON b.id = ut.bloco_id
  INNER JOIN macrocontrole.perfil_bloco_operador AS pbo ON pbo.bloco_id = b.id AND pbo.usuario_id = ppo.usuario_id
	WHERE ppo.usuario_id = $1 AND a.tipo_situacao_id = 1 AND ut.disponivel IS TRUE
), filtro1 AS (
    SELECT DISTINCT a.id FROM atividade_data AS a
    INNER JOIN macrocontrole.relacionamento_ut AS ut_sr ON ut_sr.ut_id = a.unidade_trabalho_id
    INNER JOIN macrocontrole.atividade AS a_re ON a_re.unidade_trabalho_id = ut_sr.ut_re_id
    WHERE
    ((a_re.tipo_situacao_id IN (1, 2, 3) AND ut_sr.tipo_pre_requisito_id = 1) OR (a_re.tipo_situacao_id IN (2) AND ut_sr.tipo_pre_requisito_id = 2))	
), filtro3 AS (
    SELECT DISTINCT a.id FROM atividade_data AS a
    INNER JOIN macrocontrole.subfase AS sub ON sub.id = a.subfase_id
    INNER JOIN macrocontrole.fase AS fa ON fa.id = sub.fase_id
    INNER JOIN dgeo.usuario AS u ON u.id = a.usuario_id
    INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
    INNER JOIN macrocontrole.restricao_etapa AS re ON re.etapa_posterior_id = a.etapa_id
    INNER JOIN macrocontrole.etapa AS et_re ON et_re.id = re.etapa_anterior_id AND et_re.subfase_id != a.subfase_id
    INNER JOIN macrocontrole.subfase AS sub_re ON sub_re.id = et_re.subfase_id
    INNER JOIN macrocontrole.fase AS fa_re ON fa_re.id = sub_re.fase_id AND fa_re.linha_producao_id = fa.linha_producao_id
    INNER JOIN macrocontrole.atividade AS a_re ON a_re.etapa_id = et_re.id
    INNER JOIN dgeo.usuario AS u_re ON u_re.id = a_re.usuario_id
    WHERE (
        (re.tipo_restricao_id = 1 AND a_re.usuario_id = $1) OR
        (re.tipo_restricao_id = 2 AND a_re.usuario_id != $1) OR 
        (re.tipo_restricao_id = 3 AND (a_re.usuario_id = $1 OR (u_re.tipo_turno_id != u.tipo_turno_id AND u_re.tipo_turno_id != 3 AND u.tipo_turno_id != 3)))
    ) AND a_re.tipo_situacao_id in (1,2,3,4)
), filtro4 AS (
    SELECT DISTINCT a.id FROM atividade_data AS a
    INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
    INNER JOIN dgeo.usuario AS u ON u.id = a.usuario_id
    INNER JOIN macrocontrole.restricao_etapa AS re ON re.etapa_posterior_id = a.etapa_id
    INNER JOIN macrocontrole.atividade AS a_re ON a_re.etapa_id = re.etapa_anterior_id
      AND a_re.unidade_trabalho_id = a.unidade_trabalho_id
    INNER JOIN macrocontrole.etapa AS et_re ON et_re.id = a_re.etapa_id
    INNER JOIN dgeo.usuario AS u_re ON u_re.id = a_re.usuario_id
    WHERE et_re.subfase_id = a.subfase_id AND (
      (re.tipo_restricao_id = 1 AND a_re.usuario_id = $1) OR
      (re.tipo_restricao_id = 2 AND a_re.usuario_id != $1) OR 
      (re.tipo_restricao_id = 3 AND (a_re.usuario_id = $1 OR (u_re.tipo_turno_id != u.tipo_turno_id AND u_re.tipo_turno_id != 3 AND u.tipo_turno_id != 3)))
    ) AND a_re.tipo_situacao_id in (1,2,3,4)
), filtro5 AS (
  SELECT DISTINCT atividade_id AS id FROM macrocontrole.fila_prioritaria
  UNION
  SELECT DISTINCT atividade_id AS id FROM macrocontrole.fila_prioritaria_grupo
), atividade_filtered AS (
  SELECT ad.*
  FROM atividade_data AS ad
  LEFT JOIN filtro1 AS f1 ON ad.id = f1.id
  LEFT JOIN filtro3 AS f3 ON ad.id = f3.id
  LEFT JOIN filtro4 AS f4 ON ad.id = f4.id
  LEFT JOIN filtro5 AS f5 ON ad.id = f5.id
  WHERE f1.id IS NULL AND f3.id IS NULL AND f4.id IS NULL AND f5.id IS NULL
), utstats AS (
  SELECT ut.dificuldade, count(*) AS diff_count
  FROM macrocontrole.perfil_dificuldade_operador AS pdo
  JOIN macrocontrole.unidade_trabalho AS ut ON ut.subfase_id = pdo.subfase_id AND pdo.lote_id = ut.lote_id
  JOIN macrocontrole.atividade AS a ON a.unidade_trabalho_id = ut.id AND a.usuario_id = pdo.usuario_id
  WHERE pdo.usuario_id = $1 AND a.tipo_situacao_id = 4
  GROUP BY ut.dificuldade
), a_ant AS (
  SELECT a.tipo_situacao_id, a.unidade_trabalho_id, e.ordem, e.subfase_id
  FROM macrocontrole.atividade AS a
  JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
  WHERE a.tipo_situacao_id in (1,2,3,4)
)
SELECT id
FROM (
SELECT a.id, a.etapa_id, a.unidade_trabalho_id, a_ant.tipo_situacao_id AS situacao_ant, a.b_prioridade, a.pse_prioridade, a.ut_prioridade,
  CASE 
  WHEN pdo.tipo_perfil_dificuldade_id IS NULL THEN 0
  WHEN pdo.tipo_perfil_dificuldade_id = 1 THEN a.dificuldade
  WHEN pdo.tipo_perfil_dificuldade_id = 2 THEN -a.dificuldade
  WHEN pdo.tipo_perfil_dificuldade_id = 3 THEN coalesce(utstats.diff_count, 0)
  END AS dificuldade_rank
  FROM atividade_filtered AS a
  LEFT JOIN macrocontrole.perfil_dificuldade_operador AS pdo ON pdo.lote_id = a.lote_id AND pdo.subfase_id = a.subfase_id AND pdo.usuario_id = a.usuario_id
  LEFT JOIN utstats ON utstats.dificuldade = a.dificuldade
  LEFT JOIN a_ant ON a_ant.unidade_trabalho_id = a.unidade_trabalho_id AND a_ant.subfase_id = A.subfase_id AND A.ordem > a_ant.ordem
) AS sit
GROUP BY id, b_prioridade, pse_prioridade, dificuldade_rank, ut_prioridade
HAVING MIN(situacao_ant) IS NULL OR every(situacao_ant IN (4)) 
ORDER BY b_prioridade, pse_prioridade, dificuldade_rank, ut_prioridade
LIMIT 1