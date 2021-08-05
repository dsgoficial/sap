BEGIN;

INSERT INTO macrocontrole.linha_producao (tipo_produto_id,descricao) VALUES
(1, 'Vetores anteriores ao SAP'),
(2, 'Cartas topográficas anteriores ao SAP'),
(7, 'Vetores EDGV 3.0 Pro'),
(12, 'Cartas Topográficas EDGV 3.0 Pro');
--(7, 'Vetores EDGV 3.0 Pro com reambulação'),
--(8, 'Vetores TRD 4.4');

INSERT INTO macrocontrole.fase (tipo_fase_id,linha_producao_id,ordem) VALUES
(5,1,1),
(5,2,1),
(11,3,1),
(1,3,2),
(3,3,3),
(5,3,4),
(4,4,1),
(5,4,2);

INSERT INTO macrocontrole.subfase (nome,fase_id) VALUES
('Carregamento BDGEx', 1),
('Carregamento BDGEx', 2),

('Carregamento BDGEx', 3),




INSERT INTO macrocontrole.pre_requisito_subfase (tipo_pre_requisito_id,subfase_anterior_id,subfase_posterior_id) VALUES
('Civil', 'Civ');

INSERT INTO macrocontrole.etapa (tipo_etapa_id,subfase_id,ordem) VALUES
('Civil', 'Civ');

INSERT INTO macrocontrole.camada (schema,nome,alias,documentacao) VALUES
('Civil', 'Civ');

INSERT INTO macrocontrole.atributo (camada_id,nome,alias) VALUES
('Civil', 'Civ');

INSERT INTO macrocontrole.propriedades_camada (camada_id,atributo_filtro_subfase,camada_apontamento,atributo_situacao_correcao,atributo_justificativa_apontamento,subfase_id) VALUES
('Civil', 'Civ');



COMMIT;

