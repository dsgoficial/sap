/*
    Retorna oa dados de produção correspondentes a atividade
*/
SELECT a.unidade_trabalho_id, a.etapa_id, e.subfase_id, u.login, u.id as usuario_id, u.nome_guerra, s.id as subfase_id, s.nome as subfase_nome, ut.epsg, 
ST_ASEWKT(ST_Transform(ut.geom,ut.epsg::integer)) as unidade_trabalho_geom, ut.lote_id, l.nome AS lote, l.denominador_escala, s.fase_id, ut.dificuldade, 
dp.configuracao_producao, ut.id AS ut_id, dp.tipo_dado_producao_id, p.nome AS projeto, b.nome AS bloco, tpro.nome AS tipo_produto,
e.tipo_etapa_id, te.nome as etapa_nome, a.observacao as observacao_atividade, ut.observacao AS observacao_unidade_trabalho
FROM macrocontrole.atividade as a
INNER JOIN macrocontrole.etapa as e ON e.id = a.etapa_id
INNER JOIN dominio.tipo_etapa as te ON te.code = e.tipo_etapa_id
INNER JOIN macrocontrole.subfase as s ON s.id = e.subfase_id
INNER JOIN macrocontrole.unidade_trabalho as ut ON ut.id = a.unidade_trabalho_id
INNER JOIN macrocontrole.lote as l ON l.id = ut.lote_id
INNER JOIN macrocontrole.bloco as b ON b.id = ut.bloco_id
INNER JOIN macrocontrole.projeto as p ON p.id = l.projeto_id
INNER JOIN macrocontrole.produto AS pro ON pro.linha_producao_id = l.linha_producao_id
INNER JOIN dominio.tipo_produto AS tpro ON tpro.code = pro.tipo_produto_id
LEFT JOIN macrocontrole.dado_producao AS dp ON dp.id = ut.dado_producao_id
LEFT JOIN dgeo.usuario AS u ON u.id = a.usuario_id
WHERE a.id = $1
LIMIT 1


