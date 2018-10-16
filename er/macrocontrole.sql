BEGIN;

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE SCHEMA macrocontrole;

-- Tipo do perfil de acesso ao controle macro
CREATE TABLE macrocontrole.tipo_perfil(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO macrocontrole.tipo_perfil (code,nome) VALUES
(1, 'Visualizador'),
(2, 'Operador'),
(3, 'Gerente de Fluxo'),
(4, 'Supervisor de Célula'),
(5, 'Administrador'); 

-- Tabela que associa os usuarios ao perfil
CREATE TABLE macrocontrole.usuario_perfil(
  id SERIAL NOT NULL PRIMARY KEY,
  tipo_perfil_id INTEGER NOT NULL REFERENCES macrocontrole.tipo_perfil (code),
  usuario_id INTEGER NOT NULL UNIQUE REFERENCES dgeo.usuario (id)
);

INSERT INTO macrocontrole.usuario_perfil (tipo_perfil_id, usuario_id) VALUES
(5, 1);

-- Projeto armazena os metadados necessários para geração dos XML do BDGEx e informações gerais sobre as cartas produzidas
CREATE TABLE macrocontrole.projeto(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL UNIQUE,
	data_inicio timestamp with time zone,
	data_fim timestamp with time zone
);

CREATE TABLE macrocontrole.produto(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL UNIQUE,
	mi VARCHAR(255),
	inom VARCHAR(255),
	escala VARCHAR(255) NOT NULL,
	area_suprimento VARCHAR(255) NOT NULL,
	observacao VARCHAR(255) NOT NULL,
  geom geometry(POLYGON, 4674) NOT NULL, 
  projeto_id INTEGER NOT NULL REFERENCES macrocontrole.projeto (id)
);

CREATE INDEX produto_geom
    ON macrocontrole.produto USING gist
    (geom)
    TABLESPACE pg_default;

CREATE TABLE macrocontrole.tipo_bdgex(
	code SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL UNIQUE
);
INSERT INTO macrocontrole.tipo_bdgex (code, nome) VALUES
(1, 'BDGEx ostensivo'),
(2, 'BDGEx Operações');

CREATE TABLE macrocontrole.tipo_produto(
	code SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL UNIQUE
);

INSERT INTO macrocontrole.tipo_produto (code, nome) VALUES
(1, 'Carta topográfica matricial'),
(2, 'Carta topográfica vetorial'),
(3, 'Carta ortoimagem'),
(4, 'MDS'),
(5, 'MDT'),
(6, 'Ortoimagem');

CREATE TABLE macrocontrole.carregamento_bdgex(
	id SERIAL NOT NULL PRIMARY KEY,	
	data timestamp with time zone, 
	tipo_produto INTEGER NOT NULL REFERENCES macrocontrole.tipo_produto (code),
	tipo_bdgex INTEGER REFERENCES macrocontrole.tipo_bdgex (code),
	produto_id INTEGER NOT NULL REFERENCES macrocontrole.produto (id)
);

-- Tipos de palavra chave previstos na ISO19115 / PCDG
CREATE TABLE macrocontrole.tipo_palavra_chave(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO macrocontrole.tipo_palavra_chave (code, nome) VALUES
(1, 'disciplinar'),
(2, 'geologica'),
(3, 'tematica'),
(4, 'temporal'),
(5, 'toponimica');

-- Associa palavra chave a um produto. O produto pode ter multiplas palavras chaves de diferentes tipos.
CREATE TABLE macrocontrole.palavra_chave(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
 	tipo_palavra_chave INTEGER NOT NULL REFERENCES macrocontrole.tipo_palavra_chave (code),
 	produto_id INTEGER NOT NULL REFERENCES macrocontrole.produto (id)
);

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
(6, 'Carregamento BDGEx Matricial'),
(7, 'Carregamento BDGEx Vetorial'),
(8, 'Avaliação imagens brutas'),
(9, 'Avaliação ortoimagens'),
(10, 'Avaliação MDS'),
(11, 'Avaliação MDT');

-- Associa uma fase prevista no BDGEx ao projeto
-- as combinações (tipo_fase, projeto_id) são unicos
CREATE TABLE macrocontrole.fase(
	id SERIAL NOT NULL PRIMARY KEY,
	tipo_fase INTEGER NOT NULL REFERENCES macrocontrole.tipo_fase (code),
  projeto_id INTEGER NOT NULL REFERENCES macrocontrole.projeto (id),
  ordem INTEGER NOT NULL, -- as fases são ordenadas em um projeto
	UNIQUE (projeto_id, tipo_fase)
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
	celula_id INTEGER NOT NULL REFERENCES dgeo.celula (id), -- uma subfase é executada por uma célula
	UNIQUE (nome, fase_id)
);

-- Tabela que associa um gerente as subfases que ele pode gerenciar
-- Na versão atual não está em uso
CREATE TABLE macrocontrole.subfase_gerente(
	id SERIAL NOT NULL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	UNIQUE (usuario_id, subfase_id)
);

CREATE TABLE macrocontrole.etapa(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO macrocontrole.etapa (nome) VALUES
('Execução'),
('Revisão 1'),
('Correção 1'),
('Revisão 2'),
('Correção 2'),
('Revisão 3'),
('Correção 3'),
('Revisão por pares 1'),
('Revisão por pares 2'),
('Revisão por amostragem');

CREATE TABLE macrocontrole.subfase_etapa(
	id SERIAL NOT NULL PRIMARY KEY,
	etapa_id INTEGER NOT NULL REFERENCES macrocontrole.etapa (id),
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	ordem INTEGER NOT NULL -- as etapas são ordenadas dentre de uma subfase. Não existe paralelismo
);

CREATE TABLE macrocontrole.requisito(
	id SERIAL NOT NULL PRIMARY KEY,
	descricao VARCHAR(255) NOT NULL,
	subfase_etapa_id INTEGER NOT NULL REFERENCES macrocontrole.subfase_etapa (id)
);

CREATE TABLE macrocontrole.perfil_fme(
	id SERIAL NOT NULL PRIMARY KEY,
	servidor_fme VARCHAR(255),
	categoria_fme VARCHAR(255),
	subfase_etapa_id INTEGER NOT NULL REFERENCES macrocontrole.subfase_etapa (id)
);

CREATE TABLE macrocontrole.rotina(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

CREATE TABLE macrocontrole.camada(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

CREATE TABLE macrocontrole.perfil_rotina(
	id SERIAL NOT NULL PRIMARY KEY,
	rotina_id INTEGER NOT NULL REFERENCES macrocontrole.rotina (id),
	camada_id INTEGER NOT NULL REFERENCES macrocontrole.camada (id),
	camada_apontamento_id INTEGER NOT NULL REFERENCES macrocontrole.camada (id), 
	parametros VARCHAR(255),
	subfase_etapa_id INTEGER NOT NULL REFERENCES macrocontrole.subfase_etapa (id)
);

CREATE TABLE macrocontrole.perfil_estilo(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	subfase_etapa_id INTEGER NOT NULL REFERENCES macrocontrole.subfase_etapa (id)
);

CREATE TABLE macrocontrole.perfil_regras(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	subfase_etapa_id INTEGER NOT NULL REFERENCES macrocontrole.subfase_etapa (id)
);

CREATE TABLE macrocontrole.perfil_menu(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	subfase_etapa_id INTEGER NOT NULL REFERENCES macrocontrole.subfase_etapa (id)
);

CREATE TABLE macrocontrole.perfil_propriedades_camada(
	id SERIAL NOT NULL PRIMARY KEY,
	filtro TEXT,
	geometria_editavel BOOLEAN NOT NULL,
	restricao_atributos TEXT, --Atributos separados por ;
	camada_id INTEGER NOT NULL REFERENCES macrocontrole.camada (id),
	subfase_etapa_id INTEGER NOT NULL REFERENCES macrocontrole.subfase_etapa (id)
);

CREATE TABLE macrocontrole.banco_dados(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255),
	servidor VARCHAR(255),
	porta VARCHAR(255)
);

CREATE TABLE macrocontrole.tipo_monitoramento(
	code SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO macrocontrole.tipo_monitoramento (code, nome) VALUES
(1, 'Monitoramento de tela'),
(2, 'Monitoramento de feição'),
(3, 'Monitoramento de apontamento');

CREATE TABLE macrocontrole.perfil_monitoramento(
	id SERIAL NOT NULL PRIMARY KEY,
	tipo_monitoramento INTEGER NOT NULL REFERENCES macrocontrole.tipo_monitoramento (code),
	camada_id INTEGER REFERENCES macrocontrole.camada (id),
	subfase_etapa_id INTEGER NOT NULL REFERENCES macrocontrole.subfase_etapa (id),
	banco_dados_id INTEGER NOT NULL REFERENCES macrocontrole.banco_dados (id)
);

CREATE TABLE macrocontrole.tipo_restricao(
	code SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO macrocontrole.tipo_restricao (code, nome) VALUES
(1, 'Operadores distintos'),
(2, 'Operadores iguais'),
(3, 'Operadores no mesmo turno');

CREATE TABLE macrocontrole.restricao_etapa(
	id SERIAL NOT NULL PRIMARY KEY,
	tipo_restricao_id INTEGER NOT NULL REFERENCES macrocontrole.tipo_restricao (code),
	subfase_etapa_1_id INTEGER NOT NULL REFERENCES macrocontrole.subfase_etapa (id),
	subfase_etapa_2_id INTEGER NOT NULL REFERENCES macrocontrole.subfase_etapa (id)	
);

CREATE TABLE macrocontrole.unidade_trabalho(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255),
    geom geometry(POLYGON, 4674) NOT NULL,
	epsg VARCHAR(5) NOT NULL,
	banco_dados_id INTEGER REFERENCES macrocontrole.banco_dados (id),
 	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	disponivel BOOLEAN NOT NULL DEFAULT FALSE, --indica se a unidade de trabalho pode ser executada ou não
	prioridade INTEGER NOT NULL,
	UNIQUE (nome, subfase_id)
);

CREATE INDEX unidade_trabalho_geom
    ON macrocontrole.unidade_trabalho USING gist
    (geom)
    TABLESPACE pg_default;

CREATE TABLE macrocontrole.insumo(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	caminho VARCHAR(255) NOT NULL,
	epsg VARCHAR(5),
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

CREATE TABLE macrocontrole.situacao(
	code SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255)
);

INSERT INTO macrocontrole.situacao (code, nome) VALUES
(1, 'Não iniciada'),
(2, 'Em execução'),
(3, 'Pausada'),
(4, 'Finalizada');

CREATE TABLE macrocontrole.execucao_etapa(
	id SERIAL NOT NULL PRIMARY KEY,
	subfase_etapa_id INTEGER REFERENCES macrocontrole.subfase_etapa (id),
 	unidade_trabalho_id INTEGER NOT NULL REFERENCES macrocontrole.unidade_trabalho (id),
	operador_atual INTEGER REFERENCES dgeo.usuario (id),
	situacao INTEGER REFERENCES macrocontrole.situacao (code),
	data_inicio timestamp with time zone,
	data_fim timestamp with time zone
);

-- Tabela que associa um operador as operações que pode desempenhar
-- O numero da prioridade é unico por operador
-- Não pode associar um operador a mesma subfase_etapa duas vezes

CREATE TABLE macrocontrole.perfil_producao(
	id SERIAL NOT NULL PRIMARY KEY,
  	nome VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE macrocontrole.perfil_subfase_etapa(
	id SERIAL NOT NULL PRIMARY KEY,
  	perfil_producao_id INTEGER NOT NULL REFERENCES macrocontrole.perfil_producao (id),
	subfase_etapa_id INTEGER NOT NULL REFERENCES macrocontrole.subfase_etapa (id),
	prioridade INTEGER NOT NULL,
	UNIQUE (perfil_producao_id, subfase_etapa_id)
);

CREATE TABLE macrocontrole.perfil_producao_operador(
	id SERIAL NOT NULL PRIMARY KEY,
  	usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
	perfil_producao_id INTEGER NOT NULL REFERENCES macrocontrole.perfil_producao (id),
	UNIQUE (usuario_id, perfil_producao_id)
);

CREATE TABLE macrocontrole.fila_prioritaria(
	id SERIAL NOT NULL PRIMARY KEY,
 	execucao_etapa_id INTEGER NOT NULL REFERENCES macrocontrole.execucao_etapa (id),
 	usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
	prioridade INTEGER NOT NULL,
	UNIQUE (execucao_etapa_id, usuario_id),
	UNIQUE (usuario_id, prioridade)
);

-- Regime de trabalho de um determinado registro
CREATE TABLE macrocontrole.regime(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO macrocontrole.regime (code,nome) VALUES
(1,'Turno'),
(2,'Integral'),
(3,'Serviço'),
(4,'Saindo de serviço');

CREATE TABLE macrocontrole.registro_producao(
	id SERIAL NOT NULL PRIMARY KEY,
	data_inicio timestamp with time zone NOT NULL,
	data_fim timestamp with time zone,
	regime INTEGER NOT NULL REFERENCES macrocontrole.regime (code),
	execucao_etapa_id INTEGER NOT NULL REFERENCES macrocontrole.execucao_etapa (id),
  usuario_id INTEGER NOT NULL UNIQUE REFERENCES dgeo.usuario (id)
);

-- No caso de atividades especiais (atividades que não são da produção diretamente) é necessário especificar o tipo de atividade
CREATE TABLE macrocontrole.tipo_atividade(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO macrocontrole.tipo_atividade (nome) VALUES
('Exame pagamento'),
('Sindicância'),
('Recarregamento BDGEx'),
('Desenvolvimento'),
('Outras atividades administrativas');

-- Atividade (especial) é utilizado para outras atividades que não são diretas da produção.
CREATE TABLE macrocontrole.atividade(
	id SERIAL NOT NULL PRIMARY KEY,
	tipo_atividade_id INTEGER NOT NULL REFERENCES macrocontrole.tipo_atividade (id),
	atividade_tecnica BOOLEAN NOT NULL,
	observacao TEXT,
	usuario_id INTEGER NOT NULL UNIQUE REFERENCES dgeo.usuario (id)
);

CREATE TABLE macrocontrole.registro_atividade(
	id SERIAL NOT NULL PRIMARY KEY,
	data_inicio timestamp with time zone NOT NULL,
	data_fim timestamp with time zone,
	regime_id INTEGER NOT NULL REFERENCES macrocontrole.regime (code),
	atividade_id INTEGER NOT NULL REFERENCES macrocontrole.atividade (id)
);

COMMIT;