/*
    Verifica se existe alguma atividade disponível para o usuário na fila prioritária de grupo
*/
SELECT id
FROM (
  SELECT a.id, a.etapa_id, a.unidade_trabalho_id, a_ant.tipo_situacao_id AS situacao_ant, fpg.prioridade AS fpg_prioridade
  FROM macrocontrole.atividade AS a
  INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
  INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
  INNER JOIN macrocontrole.fila_prioritaria_grupo AS fpg ON fpg.atividade_id = a.id
  INNER JOIN macrocontrole.perfil_producao_operador AS ppo ON ppo.perfil_producao_id = fpg.perfil_producao_id
  INNER JOIN macrocontrole.perfil_bloco_operador AS pbloco ON pbloco.bloco_id = ut.bloco_id AND pbloco.usuario_id = ppo.usuario_id
  LEFT JOIN
  (
    SELECT a.tipo_situacao_id, a.unidade_trabalho_id, e.ordem, e.subfase_id FROM macrocontrole.atividade AS a
    INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
    WHERE a.tipo_situacao_id in (1,2,3,4)
  ) 
  AS a_ant ON a_ant.unidade_trabalho_id = a.unidade_trabalho_id AND a_ant.subfase_id = e.subfase_id
  AND e.ordem > a_ant.ordem
  WHERE ut.disponivel IS TRUE AND ppo.usuario_id = $1 AND a.tipo_situacao_id = 1 AND fpg.perfil_producao_id = ppo.perfil_producao_id
  AND a.id NOT IN
  (
    SELECT a.id FROM macrocontrole.atividade AS a
    INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
    INNER JOIN macrocontrole.perfil_producao_etapa AS ppe ON ppe.subfase_id = e.subfase_id AND ppe.tipo_etapa_id = e.tipo_etapa_id
    INNER JOIN macrocontrole.perfil_producao_operador AS ppo ON ppo.perfil_producao_id = ppe.perfil_producao_id
    INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
    INNER JOIN macrocontrole.perfil_bloco_operador AS pbloco ON pbloco.bloco_id = ut.bloco_id AND pbloco.usuario_id = ppo.usuario_id
    INNER JOIN macrocontrole.pre_requisito_subfase AS prs ON prs.subfase_posterior_id = ut.subfase_id
    INNER JOIN macrocontrole.unidade_trabalho AS ut_re ON ut_re.subfase_id = prs.subfase_anterior_id
    INNER JOIN macrocontrole.atividade AS a_re ON a_re.unidade_trabalho_id = ut_re.id
    WHERE ppo.usuario_id = $1 AND prs.tipo_pre_requisito_id = 1 AND 
    ut.geom && ut_re.geom AND
    st_relate(ut.geom, ut_re.geom, '2********') AND
    a_re.tipo_situacao_id IN (1, 2, 3)
  )
  AND a.id NOT IN
  (
    SELECT a.id FROM macrocontrole.atividade AS a
    INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
    INNER JOIN macrocontrole.perfil_producao_etapa AS ppe ON ppe.subfase_id = e.subfase_id AND ppe.tipo_etapa_id = e.tipo_etapa_id
    INNER JOIN macrocontrole.perfil_producao_operador AS ppo ON ppo.perfil_producao_id = ppe.perfil_producao_id
    INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
    INNER JOIN macrocontrole.perfil_bloco_operador AS pbloco ON pbloco.bloco_id = ut.bloco_id AND pbloco.usuario_id = ppo.usuario_id
    INNER JOIN macrocontrole.pre_requisito_subfase AS prs ON prs.subfase_posterior_id = ut.subfase_id
    INNER JOIN macrocontrole.unidade_trabalho AS ut_re ON ut_re.subfase_id = prs.subfase_anterior_id
    INNER JOIN macrocontrole.atividade AS a_re ON a_re.unidade_trabalho_id = ut_re.id
    WHERE ppo.usuario_id = $1 AND prs.tipo_pre_requisito_id = 2 AND 
    ut.geom && ut_re.geom AND
    st_relate(ut.geom, ut_re.geom, '2********') AND
    a_re.tipo_situacao_id IN (2)
  )
) AS sit
GROUP BY id, fpg_prioridade
HAVING MIN(situacao_ant) IS NULL OR every(situacao_ant IN (4)) 
ORDER BY fpg_prioridade
LIMIT 1