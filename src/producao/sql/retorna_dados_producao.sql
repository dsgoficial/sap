/*
    Retorna oa dados de produção correspondentes a atividade
*/
SELECT ee.unidade_trabalho_id, ee.etapa_id, u.id as usuario_id, u.nome_guerra, s.id as subfase_id, s.nome as subfase_nome, ut.epsg, 
ST_ASEWKT(ST_Transform(ut.geom,ut.epsg::integer)) as unidade_trabalho_geom,
ut.nome as unidade_trabalho_nome, bd.nome AS nome_bd, bd.servidor, bd.porta, se.tipo_etapa_id, e.nome as etapa_nome, ee.observacao as observacao_atividade,
se.observacao AS observacao_etapa, ut.observacao AS observacao_unidade_trabalho, s.observacao AS observacao_subfase
FROM macrocontrole.atividade as ee
INNER JOIN macrocontrole.etapa as se ON se.id = ee.etapa_id
INNER JOIN macrocontrole.subfase as s ON s.id = se.subfase_id
INNER JOIN macrocontrole.unidade_trabalho as ut ON ut.id = ee.unidade_trabalho_id
LEFT JOIN macrocontrole.banco_dados AS bd ON bd.id = ut.banco_dados_id
LEFT JOIN dgeo.usuario AS u ON u.id = ee.usuario_id
WHERE ee.id = $1