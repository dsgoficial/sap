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
    INNER JOIN macrocontrole.relacionamento_ut AS ut_sr ON ut_sr.ut_id = a.unidade_trabalho_id
    INNER JOIN macrocontrole.atividade AS a_re ON a_re.unidade_trabalho_id = ut_sr.ut_re_id
    WHERE
    ((a_re.tipo_situacao_id IN (1, 2, 3) AND ut_sr.tipo_pre_requisito_id = 1) OR (a_re.tipo_situacao_id IN (2) AND ut_sr.tipo_pre_requisito_id = 2))	
  )
) AS sit
GROUP BY id, b_prioridade, ut_prioridade
HAVING MIN(situacao_ant) IS NULL OR every(situacao_ant IN (4)) 
ORDER BY b_prioridade, ut_prioridade
LIMIT 1