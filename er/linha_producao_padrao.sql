BEGIN;

INSERT INTO macrocontrole.linha_producao (tipo_produto_id,descricao) VALUES
(1, 'Vetores anteriores ao SAP'),
(2, 'Cartas topográficas anteriores ao SAP'),
(7, 'Vetores EDGV 3.0 Pro'),
(12, 'Cartas Topográficas EDGV 3.0 Pro');
--(7, 'Vetores EDGV 3.0 Pro com reambulação'),
--(8, 'Vetores TRD 4.4');

INSERT INTO macrocontrole.fase (tipo_fase_id,linha_producao_id,ordem) VALUES
(5,1,1), --1 Disseminação - Vetores anteriores ao SAP
(5,2,1), --2 Disseminação - Cartas topográficas anteriores ao SAP
(11,3,1),--3 Preparo - Vetores EDGV 3.0 Pro
(1,3,2), --4 Digitalização - Vetores EDGV 3.0 Pro
(3,3,3), --5 Validação - Vetores EDGV 3.0 Pro
(5,3,4), --6 Disseminação - Vetores EDGV 3.0 Pro
(4,4,1), --7 Edição - Cartas Topográficas EDGV 3.0 Pro
(5,4,2); --8 Disseminação - Cartas Topográficas EDGV 3.0 Pro

INSERT INTO macrocontrole.subfase (nome,fase_id) VALUES
('Carregamento BDGEx', 1), --1
('Carregamento BDGEx', 2), --2
('Controle de Qualidade de insumos', 3), --3
('Equalização e mosaico de imagens', 3), --5
('Geração de curvas de nível', 3), --6
('Digitalização da Hidrografia e Altimetria', 4), --7
('Digitalização de Ferrovias', 4), --8
('Digitalização de Vias de Deslocamento', 4), --9
('Digitalização de Elementos Viários', 4), --10
('Digitalização de Delimitação Física', 4), --11
('Digitalização de Topônimos', 4), --12
('Digitalização de Limites', 4), --13
('Digitalização de Áreas Densamente Edificadas', 4), --14
('Digitalização de Vegetação', 4), --15
('Coleta de insumos externos', 4), --4
('Digitalização de Planimetria', 4), --16
('Verificação final da digitalização', 4), --17
('Validação nível produto', 5), --18
('Validação da ligação', 5), --19
('Geração de automáticas', 5), --20
('Carregamento BDGEx', 6), --21
('Edição', 7), --22
('Carregamento BDGEx', 8); --23

INSERT INTO macrocontrole.pre_requisito_subfase (tipo_pre_requisito_id,subfase_anterior_id,subfase_posterior_id) VALUES
(2, 7, 7),
(2, 8, 8),
(2, 9, 9),
(1, 8, 9),
(2, 10, 10),
(1, 9, 10),
(1, 7, 10),
(2, 11, 11),
(1, 9, 11),
(1, 7, 11),
(2, 12, 12),
(1, 7, 12),
(2, 13, 13),
(1, 9, 13),
(1, 7, 13),
(2, 14, 14),
(1, 11, 14),
(1, 9, 14),
(1, 7, 14),
(2, 15, 15),
(1, 14, 15),
(2, 4, 4),
(2, 16, 16),
(1, 4, 16),
(1, 14, 16),
(2, 17, 17),
(1, 16, 17),
(1, 15, 17),
(1, 13, 17),
(1, 12, 17),
(1, 10, 17),
(2, 18, 18),
(1, 17, 18),
(2, 19, 19),
(1, 18, 19),
(1, 19, 20),
(1, 20, 21),
(1, 20, 22),
(1, 22, 23);

INSERT INTO macrocontrole.etapa (tipo_etapa_id,subfase_id,ordem) VALUES
(1, 1, 1), --1
(1, 2, 1), --2
(1, 3, 1), --3
(1, 4, 1), --4
(1, 5, 1), --5
(1, 6, 1), --6
(1, 7, 1), --7

INSERT INTO macrocontrole.restricao_etapa (tipo_restricao_id,etapa_anterior_id,etapa_posterior_id) VALUES

	



INSERT INTO macrocontrole.camada (schema,nome,alias) VALUES
('Civil', 'Civ');

INSERT INTO macrocontrole.atributo (camada_id,nome,alias) VALUES
('Civil', 'Civ');

INSERT INTO macrocontrole.propriedades_camada (camada_id,atributo_filtro_subfase,camada_apontamento,atributo_situacao_correcao,atributo_justificativa_apontamento,subfase_id) VALUES
('Civil', 'Civ');



COMMIT;

