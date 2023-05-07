/*
    Verifica se existe alguma atividade disponível para o usuário na fila de atividades pausadas
*/
SELECT id
FROM (
  SELECT a.id, a.etapa_id, a.unidade_trabalho_id, e_ant.tipo_situacao_id AS situacao_ant, b.prioridade AS b_prioridade, ut.prioridade AS ut_prioridade
  FROM macrocontrole.atividade AS a
  INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
  INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
  INNER JOIN macrocontrole.bloco AS b ON b.id = ut.bloco_id
  LEFT JOIN
  (
    SELECT a.tipo_situacao_id, a.unidade_trabalho_id, e.ordem, e.subfase_id FROM macrocontrole.atividade AS a
    INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
    WHERE a.tipo_situacao_id in (1,2,3,4)
  ) 
  AS e_ant ON e_ant.unidade_trabalho_id = a.unidade_trabalho_id AND e_ant.subfase_id = e.subfase_id
  AND e.ordem > e_ant.ordem
  WHERE ut.disponivel IS TRUE AND a.usuario_id = $1 AND a.tipo_situacao_id = 3
  AND a.id NOT IN
  (
    SELECT a.id FROM macrocontrole.atividade AS a
    INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
    INNER JOIN macrocontrole.pre_requisito_subfase AS prs ON prs.subfase_posterior_id = ut.subfase_id
    INNER JOIN macrocontrole.unidade_trabalho AS ut_re ON ut_re.subfase_id = prs.subfase_anterior_id AND ut.lote_id = ut_re.lote_id
    INNER JOIN macrocontrole.atividade AS a_re ON a_re.unidade_trabalho_id = ut_re.id
    WHERE a.usuario_id = $1 AND a.tipo_situacao_id = 3 AND prs.tipo_pre_requisito_id = 1 AND 
    ut.geom && ut_re.geom AND
    st_relate(ut.geom, ut_re.geom, '2********') AND
    ((a_re.tipo_situacao_id IN (1, 2, 3) AND prs.tipo_pre_requisito_id = 1) OR (a_re.tipo_situacao_id IN (2) AND prs.tipo_pre_requisito_id = 2))
  )
) AS sit
GROUP BY id, b_prioridade, ut_prioridade
HAVING MIN(situacao_ant) IS NULL OR every(situacao_ant IN (4)) 
ORDER BY b_prioridade, ut_prioridade
LIMIT 1