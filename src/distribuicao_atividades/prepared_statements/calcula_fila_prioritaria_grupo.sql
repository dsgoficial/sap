/*
    Verifica se existe alguma atividade disponível para o usuário na fila prioritária de grupo
*/
SELECT id
FROM (
  SELECT ee.id, ee.etapa_id, ee.unidade_trabalho_id, ee_ant.tipo_situacao_id AS situacao_ant, fpg.prioridade AS fpg_prioridade
  FROM macrocontrole.atividade AS ee
  INNER JOIN macrocontrole.etapa AS se ON se.id = ee.etapa_id
  INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = ee.unidade_trabalho_id
  INNER JOIN macrocontrole.lote AS lo ON lo.id = ut.lote_id
  INNER JOIN macrocontrole.fila_prioritaria_grupo AS fpg ON fpg.atividade_id = ee.id
  INNER JOIN macrocontrole.perfil_producao_operador AS ppo ON ppo.perfil_producao_id = fpg.perfil_producao_id
  LEFT JOIN
  (
    SELECT ee.tipo_situacao_id, ee.unidade_trabalho_id, se.ordem, se.subfase_id FROM macrocontrole.atividade AS ee
    INNER JOIN macrocontrole.etapa AS se ON se.id = ee.etapa_id
    WHERE ee.tipo_situacao_id in (1,2,3,4)
  ) 
  AS ee_ant ON ee_ant.unidade_trabalho_id = ee.unidade_trabalho_id AND ee_ant.subfase_id = se.subfase_id
  AND se.ordem > ee_ant.ordem
  WHERE ut.disponivel IS TRUE AND ppo.usuario_id = $1 AND ee.tipo_situacao_id = 1 AND fpg.perfil_producao_id = ppo.perfil_producao_id
  AND ee.id NOT IN
  (
    SELECT a.id FROM macrocontrole.atividade AS a
    INNER JOIN macrocontrole.perfil_producao_etapa AS ppe ON ppe.etapa_id = a.etapa_id
    INNER JOIN macrocontrole.perfil_producao_operador AS ppo ON ppo.perfil_producao_id = ppe.perfil_producao_id
    INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
    INNER JOIN macrocontrole.pre_requisito_subfase AS prs ON prs.subfase_posterior_id = ut.subfase_id
    INNER JOIN macrocontrole.unidade_trabalho AS ut_re ON ut_re.subfase_id = prs.subfase_anterior_id
    INNER JOIN macrocontrole.atividade AS a_re ON a_re.unidade_trabalho_id = ut_re.id
    WHERE ppo.usuario_id = $1 AND prs.tipo_pre_requisito_id = 1 AND 
    ut.geom && ut_re.geom AND
    st_relate(ut.geom, ut_re.geom, '2********') AND
    a_re.tipo_situacao_id IN (1, 2, 3)
  )
) AS sit
GROUP BY id, fpg_prioridade
HAVING MIN(situacao_ant) IS NULL OR every(situacao_ant IN (4)) 
ORDER BY fpg_prioridade
LIMIT 1