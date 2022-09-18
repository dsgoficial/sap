/*
    Verifica se existe alguma atividade disponível para o usuário na fila de atividades de seu perfil
*/
SELECT id
FROM (
  SELECT a.id, a.etapa_id, a.unidade_trabalho_id, a_ant.tipo_situacao_id AS situacao_ant, b.prioridade AS b_prioridade, pse.prioridade AS pse_prioridade, ut.prioridade AS ut_prioridade,
  CASE 
  WHEN pdo.tipo_perfil_dificuldade_id IS NULL THEN 0
  WHEN pdo.tipo_perfil_dificuldade_id = 1 THEN ut.dificuldade
  WHEN pdo.tipo_perfil_dificuldade_id = 2 THEN -ut.dificuldade
  WHEN pdo.tipo_perfil_dificuldade_id = 3 THEN coalesce(utstats.diff_count, 0)
  END AS dificuldade_rank
  FROM macrocontrole.atividade AS a
  INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
  INNER JOIN macrocontrole.perfil_producao_etapa AS pse ON pse.subfase_id = e.subfase_id AND pse.tipo_etapa_id = e.tipo_etapa_id
  INNER JOIN macrocontrole.perfil_producao_operador AS ppo ON ppo.perfil_producao_id = pse.perfil_producao_id
  INNER JOIN dgeo.usuario AS u ON u.id = ppo.usuario_id
  INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
  INNER JOIN macrocontrole.bloco AS b ON b.id = ut.bloco_id
\  INNER JOIN macrocontrole.perfil_bloco_operador AS pbloco ON pbloco.bloco_id = b.id AND pbloco.usuario_id = ppo.usuario_id
  LEFT JOIN macrocontrole.perfil_dificuldade_operador AS pdo ON pdo.bloco_id = b.id AND pdo.subfase_id = e.subfase_id AND pdo.usuario_id = $1
  LEFT JOIN (
    SELECT ut.dificuldade, count(*) AS diff_count
    FROM macrocontrole.perfil_dificuldade_operador AS pdo
    INNER JOIN macrocontrole.bloco AS b ON b.id = pdo.bloco_id
    INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.subfase_id = pdo.subfase_id AND b.id = ut.bloco_id
    INNER JOIN macrocontrole.atividade AS a ON a.unidade_trabalho_id = ut.id AND a.usuario_id = pdo.usuario_id
    WHERE pdo.usuario_id = $1 AND a.tipo_situacao_id = 4
    GROUP BY ut.dificuldade
  ) AS utstats ON utstats.dificuldade = ut.dificuldade
  LEFT JOIN
  (
    SELECT a.tipo_situacao_id, a.unidade_trabalho_id, e.ordem, e.subfase_id FROM macrocontrole.atividade AS a
    INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
    WHERE a.tipo_situacao_id in (1,2,3,4)
  ) 
  AS a_ant ON a_ant.unidade_trabalho_id = a.unidade_trabalho_id AND a_ant.subfase_id = e.subfase_id AND e.ordem > a_ant.ordem
  WHERE ut.disponivel IS TRUE AND ppo.usuario_id = $1 AND a.tipo_situacao_id = 1
  AND a.id NOT IN
  (
    SELECT a.id FROM macrocontrole.atividade AS a
    INNER JOIN macrocontrole.etapa AS et ON et.id = a.etapa_id
    INNER JOIN macrocontrole.perfil_producao_etapa AS pse ON pse.subfase_id = et.subfase_id AND pse.tipo_etapa_id = et.tipo_etapa_id
    INNER JOIN macrocontrole.perfil_producao_operador AS ppo ON ppo.perfil_producao_id = pse.perfil_producao_id
    INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
    INNER JOIN macrocontrole.perfil_bloco_operador AS pbloco ON pbloco.bloco_id = ut.bloco_id AND pbloco.usuario_id = ppo.usuario_id
    INNER JOIN macrocontrole.pre_requisito_subfase AS prs ON prs.subfase_posterior_id = ut.subfase_id
    INNER JOIN macrocontrole.unidade_trabalho AS ut_re ON ut_re.subfase_id = prs.subfase_anterior_id
    INNER JOIN macrocontrole.atividade AS a_re ON a_re.unidade_trabalho_id = ut_re.id
    WHERE ppo.usuario_id = $1 AND prs.tipo_pre_requisito_id = 1 AND 
    ut.geom && ut_re.geom AND
    st_relate(ut.geom, ut_re.geom, '2********') AND
    a_re.tipo_situacao_id IN (1, 2, 3) AND a.tipo_situacao_id = 1
  )
  AND a.id NOT IN
  (
    SELECT a.id FROM macrocontrole.atividade AS a
    INNER JOIN macrocontrole.etapa AS et ON et.id = a.etapa_id
    INNER JOIN macrocontrole.perfil_producao_etapa AS pse ON pse.subfase_id = et.subfase_id AND pse.tipo_etapa_id = et.tipo_etapa_id
    INNER JOIN macrocontrole.perfil_producao_operador AS ppo ON ppo.perfil_producao_id = pse.perfil_producao_id
    INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
    INNER JOIN macrocontrole.perfil_bloco_operador AS pbloco ON pbloco.bloco_id = ut.bloco_id AND pbloco.usuario_id = ppo.usuario_id
    INNER JOIN macrocontrole.pre_requisito_subfase AS prs ON prs.subfase_posterior_id = ut.subfase_id
    INNER JOIN macrocontrole.unidade_trabalho AS ut_re ON ut_re.subfase_id = prs.subfase_anterior_id
    INNER JOIN macrocontrole.atividade AS a_re ON a_re.unidade_trabalho_id = ut_re.id
    WHERE ppo.usuario_id = $1 AND prs.tipo_pre_requisito_id = 2 AND 
    ut.geom && ut_re.geom AND
    st_relate(ut.geom, ut_re.geom, '2********') AND
    a_re.tipo_situacao_id IN (2) AND a.tipo_situacao_id = 1
  )
  AND a.id NOT IN
  (
    SELECT a.id FROM macrocontrole.atividade AS a
    INNER JOIN macrocontrole.etapa AS et ON et.id = a.etapa_id
    INNER JOIN macrocontrole.perfil_producao_etapa AS pse ON pse.subfase_id = et.subfase_id AND pse.tipo_etapa_id = et.tipo_etapa_id
    INNER JOIN macrocontrole.perfil_producao_operador AS ppo ON ppo.perfil_producao_id = pse.perfil_producao_id
    INNER JOIN macrocontrole.subfase AS sub ON sub.id = et.subfase_id
    INNER JOIN macrocontrole.fase AS fa ON fa.id = sub.fase_id
    INNER JOIN dgeo.usuario AS u ON u.id = ppo.usuario_id
    INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
    INNER JOIN macrocontrole.perfil_bloco_operador AS pbloco ON pbloco.bloco_id = ut.bloco_id AND pbloco.usuario_id = ppo.usuario_id
    INNER JOIN macrocontrole.restricao_etapa AS re ON re.etapa_posterior_id = a.etapa_id
    INNER JOIN macrocontrole.etapa AS et_re ON et_re.id = re.etapa_anterior_id AND et_re.subfase_id != et.subfase_id
    INNER JOIN macrocontrole.subfase AS sub_re ON sub_re.id = et_re.subfase_id
    INNER JOIN macrocontrole.fase AS fa_re ON fa_re.id = sub_re.fase_id AND fa_re.linha_producao_id = fa.linha_producao_id
    INNER JOIN macrocontrole.atividade AS a_re ON a_re.etapa_id = et_re.id
    INNER JOIN dgeo.usuario AS u_re ON u_re.id = a_re.usuario_id
    INNER JOIN macrocontrole.unidade_trabalho AS ut_re ON ut_re.id = a_re.unidade_trabalho_id AND ut.geom && ut_re.geom AND st_relate(ut.geom, ut_re.geom, '2********')
    WHERE ppo.usuario_id = $1 AND (
        (re.tipo_restricao_id = 1 AND a_re.usuario_id = $1) OR
        (re.tipo_restricao_id = 2 AND a_re.usuario_id != $1) OR 
        (re.tipo_restricao_id = 3 AND u_re.tipo_turno_id != u.tipo_turno_id AND u_re.tipo_turno_id != 3 AND u.tipo_turno_id != 3)
    ) AND a_re.tipo_situacao_id in (1,2,3,4)  AND a.tipo_situacao_id = 1
  )
  AND a.id NOT IN
  (
    SELECT a.id FROM macrocontrole.atividade AS a
    INNER JOIN macrocontrole.etapa AS et ON et.id = a.etapa_id
    INNER JOIN macrocontrole.perfil_producao_etapa AS pse ON pse.subfase_id = et.subfase_id AND pse.tipo_etapa_id = et.tipo_etapa_id
    INNER JOIN macrocontrole.perfil_producao_operador AS ppo ON ppo.perfil_producao_id = pse.perfil_producao_id
    INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
    INNER JOIN macrocontrole.perfil_bloco_operador AS pbloco ON pbloco.bloco_id = ut.bloco_id AND pbloco.usuario_id = ppo.usuario_id
    INNER JOIN dgeo.usuario AS u ON u.id = ppo.usuario_id
    INNER JOIN macrocontrole.restricao_etapa AS re ON re.etapa_posterior_id = a.etapa_id
    INNER JOIN macrocontrole.atividade AS a_re ON a_re.etapa_id = re.etapa_anterior_id
      AND a_re.unidade_trabalho_id = a.unidade_trabalho_id
    INNER JOIN macrocontrole.etapa AS et_re ON et_re.id = a_re.etapa_id
    INNER JOIN dgeo.usuario AS u_re ON u_re.id = a_re.usuario_id
    WHERE ppo.usuario_id = $1 AND et_re.subfase_id = et.subfase_id AND (
      (re.tipo_restricao_id = 1 AND a_re.usuario_id = $1) OR
      (re.tipo_restricao_id = 2 AND a_re.usuario_id != $1) OR 
      (re.tipo_restricao_id = 3 AND u_re.tipo_turno_id != u.tipo_turno_id AND u_re.tipo_turno_id != 3 AND u.tipo_turno_id != 3)
    ) AND a_re.tipo_situacao_id in (1,2,3,4) AND a.tipo_situacao_id = 1
  )
  AND a.id NOT IN
  (
    SELECT atividade_id FROM macrocontrole.fila_prioritaria
  )
  AND a.id NOT IN
  (
    SELECT atividade_id FROM macrocontrole.fila_prioritaria_grupo
  )
) AS sit
GROUP BY id, b_prioridade, pse_prioridade, dificuldade_rank, ut_prioridade
HAVING MIN(situacao_ant) IS NULL OR every(situacao_ant IN (4)) 
ORDER BY b_prioridade, pse_prioridade, dificuldade_rank, ut_prioridade
LIMIT 1