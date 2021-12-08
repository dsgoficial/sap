BEGIN;

INSERT INTO macrocontrole.linha_producao (tipo_produto_id,nome,descricao) VALUES
(3, 'Carta ortoimagem', 'Linha de produção padrão para carta ortoimagem'); --1

INSERT INTO macrocontrole.fase (tipo_fase_id,linha_producao_id,ordem) VALUES
(11,1,1),--1 PDI
(1,1,2), --2 Digitalização
(3,1,3), --3 Validação
(4,1,4), --4 Edição
(5,1,5); --5 Disseminação

INSERT INTO macrocontrole.subfase (nome,fase_id) VALUES
('Preparo imagens', 1), --1
('Preparo altimetria', 1), --2
('Controle de Qualidade de insumos', 1), --3
('Coleta de insumos externos', 2), --4
('Digitalização da Hidrografia e Altimetria', 2), --5
('Digitalização de Ferrovias', 2), --6
('Digitalização de Vias de Deslocamento', 2), --7
('Digitalização de Topônimos', 2), --8
('Digitalização de Limites', 2), --9
('Digitalização de Planimetria', 2), --10
('Verificação final', 2), --11
('Validação nível produto', 3), --12
('Validação da ligação', 3), --13
('Edição', 4), --14
('Carregamento BDGEx', 5); --15

INSERT INTO macrocontrole.pre_requisito_subfase (tipo_pre_requisito_id,subfase_anterior_id,subfase_posterior_id) VALUES
(1, 1, 3),
(1, 2, 3),
(1, 3, 4),
(1, 4, 5),
(1, 4, 6),
(1, 4, 7),
(1, 4, 8),
(1, 5, 9),
(1, 6, 9),
(1, 7, 9),
(1, 4, 10),
(1, 8, 11),
(1, 9, 11),
(1, 10, 11),
(1, 11, 12),
(1, 12, 13),
(1, 13, 14),
(1, 14, 15);

INSERT INTO macrocontrole.etapa (tipo_etapa_id,subfase_id,ordem) VALUES
(1, 1, 1), --1
(1, 2, 1), --2
(1, 3, 1), --3
(1, 4, 1), --4
(1, 5, 1), --5
(1, 6, 1), --6
(1, 7, 1), --7
(1, 8, 1), --8
(1, 9, 1), --9
(1, 10, 1), --10
(4, 11, 1), --11
(1, 12, 1), --12
(1, 13, 1), --13
(1, 14, 1), --14
(2, 14, 2), --15
(3, 14, 3), --16
(1, 15, 1); --17

COMMIT;

