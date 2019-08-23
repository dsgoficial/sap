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
(1, 'Conjunto de dados geoespaciais vetoriais'),
(2, 'Carta Topográfica'),
(3, 'Carta Ortoimagem'),
(4, 'Ortoimagem'),
(5, 'Modelo Digital de Superfície'),
(6, 'Modelo Digital de Terreno'),
(7, 'Carta Temática'),
(8, 'Conjunto de dados geoespaciais vetoriais - MGCP'),
(9, 'Fototriangulação'),
(10, 'Imagem aérea/satélite'),
(11, 'Ponto de controle');

-- Fase é somente para agrupar as Subfases
-- Deve ser correspondente as fases do RTM e a fases previstas no metadado do BDGEx
-- Adicionar outras fases do RTM
CREATE TABLE dominio.tipo_fase(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO dominio.tipo_fase (code, nome) VALUES
(1, 'Digitalização'),
(2, 'Reambulação'),
(3, 'Validação'),
(4, 'Edição'),
(5, 'Área Contínua'),
(6, 'Carregamento BDGEx'),
(7, 'Vetorização'),
(8, 'Avaliação imagens'), -- rever diferentes avaliações com o relatório
(9, 'Avaliação ortoimagens'),
(10, 'Avaliação MDS'),
(11, 'Avaliação MDT'),
(12, 'Avaliação de dados vetoriais'),
(13, 'Avaliação de cartas topográficas'),
(14, 'Avaliação de aerotriangulação'),
(15, 'Generalização');

CREATE TABLE dominio.tipo_pre_requisito(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO dominio.tipo_pre_requisito (code, nome) VALUES
(1, 'Região concluída');

CREATE TABLE dominio.tipo_etapa(
	code SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO dominio.tipo_etapa (code,nome) VALUES
(1,'Execução'),
(2,'Revisão'),
(3,'Correção'),
(4,'Revisão e Correção');

CREATE TABLE dominio.tipo_exibicao(
	code SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO dominio.tipo_exibicao (code,nome) VALUES
(1,'Não exibir linhagem'),
(2,'Exibir linhagem para revisores'),
(3,'Sempre exibir linhagem');

CREATE TABLE dominio.tipo_monitoramento(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO dominio.tipo_monitoramento (code, nome) VALUES
(1, 'Monitoramento de feição'),
(2, 'Monitoramento de tela'),
(3, 'Monitoramento de comportamento');

CREATE TABLE dominio.tipo_restricao(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO dominio.tipo_restricao (code, nome) VALUES
(1, 'Operadores distintos'),
(2, 'Operadores iguais'),
(3, 'Operadores no mesmo turno');

CREATE TABLE dominio.tipo_insumo(
	code SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO dominio.tipo_insumo (code, nome) VALUES
(1, 'Arquivo (download)'),
(2, 'Arquivo (via rede)'),
(3, 'Banco de dados PostGIS'),
(4, 'Insumo físico'),
(5, 'URL'),
(6, 'Serviço WMS'),
(7, 'Serviço WFS'),
(8, 'Projeto QGIS');

CREATE TABLE dominio.tipo_situacao(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255)
);

INSERT INTO dominio.tipo_situacao (code, nome) VALUES
(1, 'Não iniciada'),
(2, 'Em execução'),
(3, 'Pausada'),
(4, 'Finalizada'),
(5, 'Não será executada'),
(6, 'Não finalizada');

CREATE TABLE dominio.tipo_problema(
	code SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO dominio.tipo_problema (code, nome) VALUES
(1, 'Insumo não é suficiente para execução da atividade'),
(2, 'Problema em etapa anterior, necessita ser refeita'),
(3, 'Erro durante execução da atividade atual'),
(4, 'Grande quantidade de objetos na unidade de trabalho, necessita ser dividida'),
(99, 'Outros');

--CREATE TABLE dominio.tipo_perda_recurso_humano(
--	code SERIAL NOT NULL PRIMARY KEY,
--	nome VARCHAR(255) NOT NULL
--);

--INSERT INTO dominio.tipo_perda_recurso_humano (code, nome) VALUES
--(1, 'Atividades extra PIT'),
--(2, 'Atividades militares'),
--(3, 'Atividades administrativas'),
--(4, 'Problemas técnicos'),
--(5, 'Feriado'),
--(6, 'Férias'),
--(7, 'Dispensa por motivo de saúde'),
--(8, 'Dispensa como recompensa'),
--(9, 'Dispensa por regresso de atividade de campo'),
--(10, 'Designação para realizar curso / capacitação'),
--(11, 'Designação para ministrar curso / capacitação'),
--(12, 'Designação para participação em eventos');

COMMIT;