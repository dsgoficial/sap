BEGIN;

CREATE SCHEMA dominio;

CREATE TABLE dominio.tipo_posto_grad(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	nome_abrev VARCHAR(255) NOT NULL
);

INSERT INTO dominio.tipo_posto_grad (code, nome,nome_abrev) VALUES
(1, 'Civil', 'Civ'),
(2, 'Mão de Obra Temporária', 'MOT'),
(3, 'Soldado EV', 'Sd EV'),
(4, 'Soldado EP', 'Sd EP'),
(5, 'Cabo', 'Cb'),
(6, 'Terceiro Sargento', '3º Sgt'),
(7, 'Segundo Sargento', '2º Sgt'),
(8, 'Primeiro Sargento', '1º Sgt'),
(9, 'Subtenente', 'ST'),
(10, 'Aspirante', 'Asp'),
(11, 'Segundo Tenente', '2º Ten'),
(12, 'Primeiro Tenente', '1º Ten'),
(13, 'Capitão', 'Cap'),
(14, 'Major', 'Maj'),
(15, 'Tenente Coronel', 'TC'),
(16, 'Coronel', 'Cel'),
(17, 'General de Brigada', 'Gen Bda'),
(18, 'General de Divisão', 'Gen Div'),
(19, 'General de Exército', 'Gen Ex');

--Valores padrão para turno de trabalho
CREATE TABLE dominio.tipo_turno(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO dominio.tipo_turno (code, nome) VALUES
(1, 'Manhã'),
(2, 'Tarde'),
(3, 'Integral');

-- Tipos de produtos previstos na PCDG
CREATE TABLE dominio.tipo_produto(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO dominio.tipo_produto (code, nome) VALUES
(1, 'Conjunto de dados geoespaciais vetoriais - ET-EDGV 2.1.3'),
(2, 'Carta Topográfica - T34-700'),
(3, 'Carta Ortoimagem'),
(4, 'Ortoimagem'),
(5, 'Modelo Digital de Superfície'),
(6, 'Modelo Digital de Terreno'),
(7, 'Conjunto de dados geoespaciais vetoriais - ET-EDGV 3.0'),
(8, 'Conjunto de dados geoespaciais vetoriais - MGCP'),
(9, 'Fototriangulação'),
(10, 'Imagem aérea/satélite'),
(11, 'Ponto de controle'),
(12, 'Carta Topográfica - ET-RDG'),
(13, 'Carta Temática'),
(14, 'Mapa de unidades'),
(15, 'Carta de trafegabilidade'),
(16, 'Rede de transporte'),
(17, 'Mapa de geografia humana'),
(18, 'Levantamento topográfico'),
(19, 'Carta ortoimagem de OM'),
(20, 'Conjunto de dados geoespaciais vetoriais - MUVD'),
(21, 'Modelo Digital de Superfície - TREx'),
(22, 'Conjunto de dados geoespaciais vetoriais para Ortoimagem - ET-EDGV 3.0');


-- Fase é somente para agrupar as Subfases
-- Deve ser correspondente as fases do RTM e a fases previstas no metadado do BDGEx
-- Adicionar outras fases do RTM
CREATE TABLE dominio.tipo_fase(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	cor VARCHAR(255) NOT NULL
);

INSERT INTO dominio.tipo_fase (code, nome, cor) VALUES
(1, 'Extração', '252,141,89'),
(2, 'Reambulação', '254,224,139'),
(3, 'Validação', '255,255,191'),
(4, 'Edição', '217,239,139'),
(5, 'Disseminação', '145,207,96'),
(6, 'Vetorização', '222,119,174'),
(7, 'Avaliação', '175,141,195'),
(8, 'Generalização', '224,243,248'),
(9, 'Fototriangulação', '44,127,184'),
(10, 'Restituição', '186,186,186'),
(11, 'Processamento Digital de Imagens', '215,48,39'),
(12, 'Medição de pontos de controle', '0,0,0'),
(13, 'Geração de ortoimagem', '128,205,193'),
(14, 'Geração de MDE', '191,129,45'),
(15, 'Levantamento topográfico', '37,52,148'),
(16, 'Preparo', '175,141,195');

CREATE TABLE dominio.tipo_pre_requisito(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO dominio.tipo_pre_requisito (code, nome) VALUES
(1, 'Região concluída'),
(2, 'Região não estar em execução');

CREATE TABLE dominio.tipo_etapa(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO dominio.tipo_etapa (code,nome) VALUES
(1,'Execução'),
(2,'Revisão'),
(3,'Correção'),
(4,'Revisão/Correção'),
(5,'Revisão final');

CREATE TABLE dominio.tipo_exibicao(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO dominio.tipo_exibicao (code,nome) VALUES
(1,'Não exibir usuários na linhagem'),
(2,'Exibir usuários na linhagem somente para revisores'),
(3,'Sempre exibir usuários na linhagem');

CREATE TABLE dominio.tipo_restricao(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO dominio.tipo_restricao (code, nome) VALUES
(1, 'Operadores distintos'),
(2, 'Operadores iguais'),
(3, 'Operadores no mesmo turno');

CREATE TABLE dominio.tipo_insumo(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO dominio.tipo_insumo (code, nome) VALUES
(1, 'Arquivo (cópia via rede)'),
(2, 'Arquivo (aberto via rede)'),
(3, 'Banco de dados PostGIS'),
(4, 'Insumo físico'),
(5, 'URL'),
(6, 'Serviço WMS'),
(7, 'Serviço WFS'),
(8, 'XYZ Tiles'),
(9, 'Download via HTTP');

CREATE TABLE dominio.tipo_dado_producao(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO dominio.tipo_dado_producao (code, nome) VALUES
(1, 'Dado não controlado pelo SAP'),
(2, 'Banco de dados PostGIS com controle de permissões'),
(3, 'Banco de dados PostGIS');

CREATE TABLE dominio.tipo_situacao(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255)
);

INSERT INTO dominio.tipo_situacao (code, nome) VALUES
(1, 'Não iniciada'),
(2, 'Em execução'),
(3, 'Pausada'),
(4, 'Finalizada'),
(5, 'Não finalizada');

CREATE TABLE dominio.tipo_configuracao(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255)
);

INSERT INTO dominio.tipo_configuracao (code, nome) VALUES
(1, 'Grid'),
(2, 'DSGTools - Mão livre'),
(3, 'DSGTools - Seletor Genérico'),
(4, 'DSGTools - Ângulo Reto');

CREATE TABLE dominio.tipo_perfil_dificuldade(	
	code SMALLINT NOT NULL PRIMARY KEY,	
	nome VARCHAR(255) NOT NULL	
);	

INSERT INTO dominio.tipo_perfil_dificuldade (code, nome) VALUES
(1, 'Distribuir atividades mais fáceis'),
(2, 'Distribuir atividades mais difíceis'),
(3, 'Distribuir de forma balanceada');

CREATE TABLE dominio.tipo_controle_qualidade(	
	code SMALLINT NOT NULL PRIMARY KEY,	
	nome VARCHAR(255) NOT NULL	
);	

INSERT INTO dominio.tipo_controle_qualidade (code, nome) VALUES
(1, 'Sem controle de qualidade nas subfases'),
(2, 'Uma Revisão/Correção em todas as subfases'),
(3, 'Uma Revisão em todas as subfases');

CREATE TABLE dominio.tipo_criacao_unidade_trabalho(	
	code SMALLINT NOT NULL PRIMARY KEY,	
	nome VARCHAR(255) NOT NULL	
);	

INSERT INTO dominio.tipo_criacao_unidade_trabalho (code, nome) VALUES
(1, 'Produto'),
(2, '1/4 de produto'),
(3, '1/9 de produto'),
(4, 'Bloco'),
(5, '1/4 de bloco'),
(6, '1/9 de bloco');

CREATE TABLE dominio.tipo_problema(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO dominio.tipo_problema (code, nome) VALUES
(1, 'Insumo não é suficiente para execução da atividade'),
(2, 'Problema em etapa anterior, necessita ser refeita'),
(3, 'Erro durante execução da atividade atual'),
(4, 'Problema em unidade de trabalho vizinha'),
(5, 'Grande quantidade de objetos na unidade de trabalho, necessita ser dividida'),
(6, 'Problema nas rotinas'),
(99, 'Outros');

CREATE TABLE dominio.tipo_estrategia_associacao(	
	code SMALLINT NOT NULL PRIMARY KEY,	
	nome VARCHAR(255) NOT NULL	
);	

INSERT INTO dominio.tipo_estrategia_associacao (code, nome) VALUES	
(1, 'Centroide da unidade de trabalho contido no insumo'),	
(2, 'Centroide do insumo contido na unidade de trabalho'),	
(3, 'Interseção entre insumo e unidade de trabalho'),
(4, 'Sobreposição entre insumo e unidade de trabalho'),
(5, 'Associar insumo a todas as unidades de trabalho');


CREATE TABLE dominio.tipo_rotina(	
	code SMALLINT NOT NULL PRIMARY KEY,	
	nome VARCHAR(255) NOT NULL	
);	

INSERT INTO dominio.tipo_rotina (code, nome) VALUES	
(1, 'Controle de qualidade sem falso positivo'),	
(2, 'Controle de qualidade com falso positivo'),	
(3, 'Auxiliar');

COMMIT;