BEGIN;

INSERT INTO macrocontrole.linha_producao (tipo_produto_id,descricao) VALUES
(1, 'Vetores anteriores ao SAP'),
(2, 'Projetos anteriores ao SAP'),
(7, 'Vetores EDGV 3.0 Pro'),
(12, 'Cartas Topográficas EDGV 3.0 Pro'),
(8, 'Vetores TRD 4.4');


INSERT INTO macrocontrole.fase (tipo_fase_id,linha_producao_id,ordem) VALUES
('Civil', 'Civ');

INSERT INTO macrocontrole.fase (nome,fase_id) VALUES
('Civil', 'Civ');

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

