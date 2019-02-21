BEGIN;

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SCHEMA macrocontrole;

-- Tipo do perfil de acesso ao controle macro
CREATE TABLE macrocontrole.tipo_perfil_sistema(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO macrocontrole.tipo_perfil_sistema (code,nome) VALUES
(1, 'Visualizador'),
(2, 'Operador'),
(3, 'Gerente de Fluxo'),
(4, 'Chefe Seção'),
(5, 'Administrador'); 

-- Tabela que associa os usuarios ao perfil
CREATE TABLE macrocontrole.usuario_perfil_sistema(
  id SERIAL NOT NULL PRIMARY KEY,
  tipo_perfil_sistema_id INTEGER NOT NULL REFERENCES macrocontrole.tipo_perfil_sistema (code),
  usuario_id INTEGER NOT NULL UNIQUE REFERENCES dgeo.usuario (id)
);

CREATE TABLE macrocontrole.projeto(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL UNIQUE --conforme bdgex
);

-- Tipos de produtos previstos na PCDG
CREATE TABLE macrocontrole.tipo_produto(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO macrocontrole.tipo_produto (code, nome) VALUES
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

CREATE TABLE macrocontrole.linha_producao(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	projeto_id INTEGER NOT NULL REFERENCES macrocontrole.projeto (id),
	tipo_produto_id INTEGER NOT NULL REFERENCES macrocontrole.tipo_produto (code)
);

CREATE TABLE macrocontrole.produto(
	id SERIAL NOT NULL PRIMARY KEY,
	uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
	nome VARCHAR(255) NOT NULL,
	mi VARCHAR(255),
	inom VARCHAR(255),
	escala VARCHAR(255) NOT NULL,
	linha_producao_id INTEGER NOT NULL REFERENCES macrocontrole.linha_producao (id),
	geom geometry(POLYGON, 4674) NOT NULL
);

CREATE INDEX produto_geom
    ON macrocontrole.produto USING gist
    (geom)
    TABLESPACE pg_default;

-- Fase é somente para agrupar as Subfases
-- Deve ser correspondente as fases do RTM e a fases previstas no metadado do BDGEx
-- Adicionar outras fases do RTM
CREATE TABLE macrocontrole.tipo_fase(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO macrocontrole.tipo_fase (code, nome) VALUES
(1, 'Digitalização'),
(2, 'Reambulação'),
(3, 'Validação'),
(4, 'Edição'),
(5, 'Área Contínua'),
(6, 'Carregamento BDGEx'),
(7, 'Vetorização'),
(8, 'Avaliação imagens'),
(9, 'Avaliação ortoimagens'),
(10, 'Avaliação MDS'),
(11, 'Avaliação MDT'),
(12, 'Avaliação de dados vetoriais'),
(13, 'Avaliação de cartas topográficas'),
(14, 'Avaliação de aerotriangulação'),
(15, 'Generalização');

-- Associa uma fase prevista no BDGEx ao projeto
-- as combinações (tipo_fase, linha_producao_id) são unicos
CREATE TABLE macrocontrole.fase(
    id SERIAL NOT NULL PRIMARY KEY,
    tipo_fase_id INTEGER NOT NULL REFERENCES macrocontrole.tipo_fase (code),
    linha_producao_id INTEGER NOT NULL REFERENCES macrocontrole.linha_producao (id),
    ordem INTEGER NOT NULL, -- as fases são ordenadas dentro de uma linha de produção de um projeto
    UNIQUE (linha_producao_id, tipo_fase_id)
);

--Meta anual estabelecida no PIT de uma fase
CREATE TABLE macrocontrole.meta_anual(
	id SERIAL NOT NULL PRIMARY KEY,
	meta INTEGER NOT NULL,
    ano INTEGER NOT NULL,
    fase_id INTEGER NOT NULL REFERENCES macrocontrole.fase (id)
);

-- Unidade de produção do controle de produção
-- as combinações (nome,fase_id) são unicos
CREATE TABLE macrocontrole.subfase(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	fase_id INTEGER NOT NULL REFERENCES macrocontrole.fase (id),
	ordem INTEGER NOT NULL, -- as subfases são ordenadas dentre de uma fase. Isso não impede o paralelismo de subfases. É uma ordenação para apresentação
	UNIQUE (nome, fase_id)
);

CREATE TABLE macrocontrole.tipo_processo(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO macrocontrole.tipo_processo (code, nome) VALUES
(1, 'Execução'),
(2, 'Revisão'),
(3, 'Correção');

CREATE TABLE macrocontrole.tipo_etapa(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	tipo_processo_id INTEGER NOT NULL REFERENCES macrocontrole.tipo_processo (code)
);

INSERT INTO macrocontrole.tipo_etapa (nome, tipo_processo_id) VALUES
('Execução', 1),
('Revisão 1', 2),
('Correção 1', 3),
('Revisão 2', 2),
('Correção 2', 3),
('Revisão 3', 2),
('Correção 3', 3),
('Revisão por pares 1', 3),
('Revisão por pares 2', 3),
('Revisão por amostragem', 2),
('Revisão por pares 3', 3),
('Validação', 1),
('Ligação', 1),
('Execução Delimitador', 1),
('Execução Centroide', 1);

CREATE TABLE macrocontrole.etapa(
	id SERIAL NOT NULL PRIMARY KEY,
	tipo_etapa_id INTEGER NOT NULL REFERENCES macrocontrole.tipo_etapa (id),
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	ordem INTEGER NOT NULL -- as etapas são ordenadas dentre de uma subfase. Não existe paralelismo
);

CREATE TABLE macrocontrole.requisito_finalizacao(
	id SERIAL NOT NULL PRIMARY KEY,
	descricao VARCHAR(255) NOT NULL,
  ordem INTEGER NOT NULL, -- os requisitos são ordenados dentro de uma etapa
	etapa_id INTEGER NOT NULL REFERENCES macrocontrole.etapa (id)
);

CREATE TABLE macrocontrole.perfil_fme(
	id SERIAL NOT NULL PRIMARY KEY,
	servidor VARCHAR(255) NOT NULL,
	porta VARCHAR(255) NOT NULL,
	categoria VARCHAR(255) NOT NULL,
	etapa_id INTEGER NOT NULL REFERENCES macrocontrole.etapa (id)
);

--CREATE TABLE macrocontrole.perfil_workspace_dsgtools(
--	id SERIAL NOT NULL PRIMARY KEY,
--	nome VARCHAR(255) NOT NULL,
--	etapa_id INTEGER NOT NULL REFERENCES macrocontrole.etapa (id)
--);
--TODO: configurar outras opções do DSGTools

CREATE TABLE macrocontrole.menu_profile(
	id SERIAL NOT NULL PRIMARY KEY,
    nome_do_perfil text NOT NULL,
    descricao text,
    perfil json NOT NULL,
    ordem_menu json NOT NULL
);

CREATE TABLE macrocontrole.layer_styles(
	id SERIAL NOT NULL PRIMARY KEY,
	f_table_catalog character varying,
	f_table_schema character varying,
	f_table_name character varying,
	f_geometry_column character varying,
	stylename character varying(255),
	styleqml text,
	stylesld xml,
	useasdefault boolean,
	description text,
	owner character varying(30),
	ui xml,
	update_time timestamp without time zone DEFAULT now()
);

CREATE TABLE macrocontrole.layer_rules(
	id SERIAL NOT NULL PRIMARY KEY,
    camada TEXT NOT NULL,
    tipo_regra TEXT NOT NULL,
    nome TEXT NOT NULL,
    cor_rgb TEXT NOT NULL,
    regra TEXT NOT NULL,
    tipo_estilo TEXT NOT NULL,
    atributo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    ordem INTEGER NOT NULL
);

CREATE TABLE macrocontrole.perfil_estilo(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	etapa_id INTEGER NOT NULL REFERENCES macrocontrole.etapa (id)
);

CREATE TABLE macrocontrole.perfil_regras(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	etapa_id INTEGER NOT NULL REFERENCES macrocontrole.etapa (id)
);

CREATE TABLE macrocontrole.perfil_menu(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	etapa_id INTEGER NOT NULL REFERENCES macrocontrole.etapa (id)
);

CREATE TABLE macrocontrole.perfil_linhagem(
	id SERIAL NOT NULL PRIMARY KEY,
	exibir_linhagem BOOLEAN NOT NULL DEFAULT TRUE,
	etapa_id INTEGER NOT NULL REFERENCES macrocontrole.etapa (id)
);

CREATE TABLE macrocontrole.camada(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	alias VARCHAR(255),
	documentacao VARCHAR(255)
);

CREATE TABLE macrocontrole.atributo(
	id SERIAL NOT NULL PRIMARY KEY,
	camada_id INTEGER NOT NULL REFERENCES macrocontrole.camada (id),
	nome VARCHAR(255) NOT NULL,
	alias VARCHAR(255)
);

--TODO: outras configurações de camadas, como bloquear certos atributos, 
--filtros adicionais, ou bloquear a camada como um todo
CREATE TABLE macrocontrole.perfil_propriedades_camada(
	id SERIAL NOT NULL PRIMARY KEY,
	camada_id INTEGER NOT NULL REFERENCES macrocontrole.camada (id),
	etapa_id INTEGER NOT NULL REFERENCES macrocontrole.etapa (id)
);

CREATE TABLE macrocontrole.banco_dados(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	servidor VARCHAR(255) NOT NULL,
	porta VARCHAR(255) NOT NULL
);

CREATE TABLE macrocontrole.tipo_monitoramento(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO macrocontrole.tipo_monitoramento (code, nome) VALUES
(1, 'Monitoramento de tela'),
(2, 'Monitoramento de feição'),
(3, 'Monitoramento de apontamento');

CREATE TABLE macrocontrole.perfil_monitoramento(
	id SERIAL NOT NULL PRIMARY KEY,
	tipo_monitoramento_id INTEGER NOT NULL REFERENCES macrocontrole.tipo_monitoramento (code),
	camada_id INTEGER REFERENCES macrocontrole.camada (id),
	etapa_id INTEGER NOT NULL REFERENCES macrocontrole.etapa (id)
);

CREATE TABLE macrocontrole.tipo_restricao(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO macrocontrole.tipo_restricao (code, nome) VALUES
(1, 'Operadores distintos'),
(2, 'Operadores iguais'),
(3, 'Operadores no mesmo turno');

CREATE TABLE macrocontrole.restricao_etapa(
	id SERIAL NOT NULL PRIMARY KEY,
	tipo_restricao_id INTEGER NOT NULL REFERENCES macrocontrole.tipo_restricao (code),
	etapa_anterior_id INTEGER NOT NULL REFERENCES macrocontrole.etapa (id),
	etapa_posterior_id INTEGER NOT NULL REFERENCES macrocontrole.etapa (id)	
);

CREATE TABLE macrocontrole.lote(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	prioridade INTEGER NOT NULL
);

CREATE TABLE macrocontrole.unidade_trabalho(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255),
  	geom geometry(POLYGON, 4674) NOT NULL,
	epsg VARCHAR(5) NOT NULL,
	banco_dados_id INTEGER REFERENCES macrocontrole.banco_dados (id),
 	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	lote_id INTEGER NOT NULL REFERENCES macrocontrole.lote (id),
	disponivel BOOLEAN NOT NULL DEFAULT FALSE,
	prioridade INTEGER NOT NULL,
	UNIQUE (nome, subfase_id)
);

CREATE INDEX unidade_trabalho_geom
    ON macrocontrole.unidade_trabalho USING gist
    (geom)
    TABLESPACE pg_default;

CREATE TABLE macrocontrole.grupo_insumo(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

CREATE TABLE macrocontrole.tipo_insumo(
	code SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO macrocontrole.tipo_insumo (code, nome) VALUES
(1, 'Arquivo (download)'),
(2, 'Arquivo (via rede)'),
(3, 'Banco de dados PostGIS'),
(4, 'Insumo físico'),
(5, 'URL'),
(6, 'Serviço WMS'),
(7, 'Serviço WFS'),
(8, 'Projeto QGIS');

CREATE TABLE macrocontrole.insumo(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	caminho VARCHAR(255) NOT NULL,
	epsg VARCHAR(5),
	tipo_insumo_id INTEGER NOT NULL REFERENCES macrocontrole.tipo_insumo (code),
	grupo_insumo_id INTEGER NOT NULL REFERENCES macrocontrole.grupo_insumo (id),
	geom geometry(POLYGON, 4674) --se for não espacial a geometria é nula
);

CREATE INDEX insumo_geom
    ON macrocontrole.insumo USING gist
    (geom)
    TABLESPACE pg_default;

CREATE TABLE macrocontrole.insumo_unidade_trabalho(
	id SERIAL NOT NULL PRIMARY KEY,
	unidade_trabalho_id INTEGER NOT NULL REFERENCES macrocontrole.unidade_trabalho (id),
	insumo_id INTEGER NOT NULL REFERENCES macrocontrole.insumo (id)
);

CREATE TABLE macrocontrole.tipo_situacao(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255)
);

INSERT INTO macrocontrole.tipo_situacao (code, nome) VALUES
(1, 'Não iniciada'),
(2, 'Em execução'),
(3, 'Pausada'),
(4, 'Finalizada'),
(5, 'Não será executada'),
(6, 'Não finalizada');

CREATE TABLE macrocontrole.atividade(
	id SERIAL NOT NULL PRIMARY KEY,
	etapa_id INTEGER REFERENCES macrocontrole.etapa (id),
 	unidade_trabalho_id INTEGER NOT NULL REFERENCES macrocontrole.unidade_trabalho (id),
	usuario_id INTEGER REFERENCES dgeo.usuario (id),
	tipo_situacao_id INTEGER REFERENCES macrocontrole.tipo_situacao (code),
	data_inicio timestamp with time zone,
	data_fim timestamp with time zone,
	observacao text
);

-- (etapa_id, unidade_trabalho_id) deve ser unico para tipo_situacao !=6
CREATE UNIQUE INDEX atividade_unique_index
ON macrocontrole.atividade (etapa_id, unidade_trabalho_id) 
WHERE tipo_situacao_id != 6;


-- Tabela que associa um operador as operações que pode desempenhar
-- O numero da prioridade é unico por operador
-- Não pode associar um operador a mesma etapa duas vezes
CREATE TABLE macrocontrole.tipo_rotina(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO macrocontrole.tipo_rotina (code, nome) VALUES
(1, 'outOfBoundsAngles'),
(2, 'invalidGeometry'),
(3, 'notSimpleGeometry');

CREATE TABLE macrocontrole.perfil_rotina(
	id SERIAL NOT NULL PRIMARY KEY,
	tipo_rotina_id INTEGER NOT NULL REFERENCES macrocontrole.tipo_rotina (code),
	camada_id INTEGER NOT NULL REFERENCES macrocontrole.camada (id),
	camada_apontamento_id INTEGER NOT NULL REFERENCES macrocontrole.camada (id), 
	parametros VARCHAR(255),
	etapa_id INTEGER NOT NULL REFERENCES macrocontrole.etapa (id)
);

CREATE TABLE macrocontrole.perfil_producao(
	id SERIAL NOT NULL PRIMARY KEY,
  	nome VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE macrocontrole.perfil_producao_etapa(
	id SERIAL NOT NULL PRIMARY KEY,
  	perfil_producao_id INTEGER NOT NULL REFERENCES macrocontrole.perfil_producao (id),
	etapa_id INTEGER NOT NULL REFERENCES macrocontrole.etapa (id),
	prioridade INTEGER NOT NULL,
	UNIQUE (perfil_producao_id, etapa_id)
);

CREATE TABLE macrocontrole.perfil_producao_operador(
	id SERIAL NOT NULL PRIMARY KEY,
  	usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
	perfil_producao_id INTEGER NOT NULL REFERENCES macrocontrole.perfil_producao (id),
	UNIQUE (usuario_id)
);

CREATE TABLE macrocontrole.fila_prioritaria(
	id SERIAL NOT NULL PRIMARY KEY,
 	atividade_id INTEGER NOT NULL REFERENCES macrocontrole.atividade (id),
 	usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
	prioridade INTEGER NOT NULL
);

CREATE TABLE macrocontrole.fila_prioritaria_grupo(
	id SERIAL NOT NULL PRIMARY KEY,
 	atividade_id INTEGER NOT NULL REFERENCES macrocontrole.atividade (id),
 	perfil_producao_id INTEGER NOT NULL REFERENCES macrocontrole.perfil_producao (id),
	prioridade INTEGER NOT NULL
);

CREATE TABLE macrocontrole.tipo_perda_recurso_humano(
	code SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO macrocontrole.tipo_perda_recurso_humano (code, nome) VALUES
(1, 'Atividades extra PIT'),
(2, 'Atividades militares'),
(3, 'Atividades administrativas'),
(4, 'Problemas técnicos'),
(5, 'Feriado'),
(6, 'Férias'),
(7, 'Dispensa por motivo de saúde'),
(8, 'Dispensa como recompensa'),
(9, 'Dispensa por regresso de atividade de campo'),
(10, 'Designação para realizar curso / capacitação'),
(11, 'Designação para ministrar curso / capacitação'),
(12, 'Designação para participação em eventos');

CREATE TABLE macrocontrole.perda_recurso_humano(
	id SERIAL NOT NULL PRIMARY KEY,
 	usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
 	tipo_perda_recurso_humano_id INTEGER NOT NULL REFERENCES macrocontrole.tipo_perda_recurso_humano (code),
	horas REAL NOT NULL,
	data DATE NOT NULL
);

CREATE TABLE macrocontrole.tipo_problema(
	code SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO macrocontrole.tipo_problema (code, nome) VALUES
(1, 'Insumo não é suficiente para execução da atividade'),
(2, 'Problema em etapa anterior, necessita ser refeita'),
(3, 'Erro durante execução da atividade atual'),
(99, 'Outros');

CREATE TABLE macrocontrole.problema_atividade(
	id SERIAL NOT NULL PRIMARY KEY,
 	atividade_id INTEGER NOT NULL REFERENCES macrocontrole.atividade (id),
	tipo_problema_id INTEGER NOT NULL REFERENCES macrocontrole.tipo_problema (code),
	descricao TEXT NOT NULL,
	resolvido BOOLEAN NOT NULL DEFAULT FALSE
);

COMMIT;