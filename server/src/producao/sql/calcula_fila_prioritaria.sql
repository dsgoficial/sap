/*
    Verifica se existe alguma atividade disponível para o usuário na fila prioritária
*/
SELECT id
FROM (
  SELECT a.id, a.etapa_id, a.unidade_trabalho_id, a_ant.tipo_situacao_id AS situacao_ant, fp.prioridade AS fp_prioridade
  FROM macrocontrole.atividade AS a
  INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
  INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
  INNER JOIN macrocontrole.bloco AS b ON b.id = ut.bloco_id
  INNER JOIN macrocontrole.fila_prioritaria AS fp ON fp.atividade_id = a.id
  LEFT JOIN
  (
    SELECT a.tipo_situacao_id, a.unidade_trabalho_id, e.ordem, e.subfase_id FROM macrocontrole.atividade AS a
    INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
    WHERE a.tipo_situacao_id in (1,2,3,4)
  ) 
  AS a_ant ON a_ant.unidade_trabalho_id = a.unidade_trabalho_id AND a_ant.subfase_id = e.subfase_id
  AND e.ordem > a_ant.ordem
  WHERE ut.disponivel IS TRUE AND a.tipo_situacao_id = 1 AND fp.usuario_id = $1
  AND a.id NOT IN
  (
    SELECT a.id FROM macrocontrole.atividade AS a
    INNER JOIN macrocontrole.relacionamento_ut AS ut_sr ON ut_sr.ut_id = a.unidade_trabalho_id
    INNER JOIN macrocontrole.atividade AS a_re ON a_re.unidade_trabalho_id = ut_sr.ut_re_id
    WHERE 
    ((a_re.tipo_situacao_id IN (1, 2, 3) AND ut_sr.tipo_pre_requisito_id = 1) OR (a_re.tipo_situacao_id IN (2) AND ut_sr.tipo_pre_requisito_id = 2))	
  )
) AS sit
GROUP BY id, fp_prioridade
HAVING MIN(situacao_ant) IS NULL OR every(situacao_ant IN (4)) 
ORDER BY fp_prioridade
LIMIT 1