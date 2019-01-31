BEGIN;

CREATE SCHEMA simulacao;

CREATE TABLE simulacao.usuario(
  id SERIAL NOT NULL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  nome_guerra VARCHAR(255) NOT NULL,
  login VARCHAR(255) UNIQUE NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  tipo_turno_id INTEGER NOT NULL REFERENCES dgeo.tipo_turno (code),
  tipo_posto_grad_id INTEGER NOT NULL REFERENCES dgeo.tipo_posto_grad (code)
);

CREATE TABLE simulacao.projeto(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE simulacao.linha_producao(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	projeto_id INTEGER NOT NULL REFERENCES simulacao.projeto (id),
	tipo_produto_id INTEGER NOT NULL REFERENCES macrocontrole.tipo_produto (code)
);

CREATE TABLE simulacao.produto(
	id SERIAL NOT NULL PRIMARY KEY,
	uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
	nome VARCHAR(255) NOT NULL,
	mi VARCHAR(255),
	inom VARCHAR(255),
	escala VARCHAR(255) NOT NULL,
	linha_producao_id INTEGER NOT NULL REFERENCES simulacao.linha_producao (id),
	geom geometry(POLYGON, 4674) NOT NULL
);

CREATE INDEX produto_geom
    ON simulacao.produto USING gist
    (geom)
    TABLESPACE pg_default;

CREATE TABLE simulacao.fase(
    id SERIAL NOT NULL PRIMARY KEY,
    tipo_fase_id INTEGER NOT NULL REFERENCES macrocontrole.tipo_fase (code),
    linha_producao_id INTEGER NOT NULL REFERENCES simulacao.linha_producao (id),
    ordem INTEGER NOT NULL,
    UNIQUE (linha_producao_id, tipo_fase_id)
);

CREATE TABLE simulacao.subfase(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	fase_id INTEGER NOT NULL REFERENCES simulacao.fase (id),
	ordem INTEGER NOT NULL,
	UNIQUE (nome, fase_id)
);

CREATE TABLE simulacao.tipo_etapa(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	tipo_processo_id INTEGER NOT NULL REFERENCES macrocontrole.tipo_processo (code)
);

CREATE TABLE simulacao.etapa(
	id SERIAL NOT NULL PRIMARY KEY,
	tipo_etapa_id INTEGER NOT NULL REFERENCES simulacao.tipo_etapa (id),
	subfase_id INTEGER NOT NULL REFERENCES simulacao.subfase (id),
	ordem INTEGER NOT NULL
);

CREATE TABLE simulacao.restricao_etapa(
	id SERIAL NOT NULL PRIMARY KEY,
	tipo_restricao_id INTEGER NOT NULL REFERENCES macrocontrole.tipo_restricao (code),
	etapa_anterior_id INTEGER NOT NULL REFERENCES simulacao.etapa (id),
	etapa_posterior_id INTEGER NOT NULL REFERENCES simulacao.etapa (id)	
);

CREATE TABLE simulacao.lote(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	prioridade INTEGER NOT NULL
);

CREATE TABLE simulacao.unidade_trabalho(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255),
  	geom geometry(POLYGON, 4674) NOT NULL,
	epsg VARCHAR(5) NOT NULL,
	banco_dados_id INTEGER REFERENCES macrocontrole.banco_dados (id),
 	subfase_id INTEGER NOT NULL REFERENCES simulacao.subfase (id),
	lote_id INTEGER NOT NULL REFERENCES simulacao.lote (id),
	disponivel BOOLEAN NOT NULL DEFAULT FALSE,
	prioridade INTEGER NOT NULL,
	UNIQUE (nome, subfase_id)
);

CREATE INDEX unidade_trabalho_geom
    ON simulacao.unidade_trabalho USING gist
    (geom)
    TABLESPACE pg_default;

CREATE TABLE simulacao.atividade(
	id SERIAL NOT NULL PRIMARY KEY,
	etapa_id INTEGER REFERENCES simulacao.etapa (id),
 	unidade_trabalho_id INTEGER NOT NULL REFERENCES simulacao.unidade_trabalho (id),
	usuario_id INTEGER REFERENCES simulacao.usuario (id),
	tipo_situacao_id INTEGER REFERENCES macrocontrole.tipo_situacao (code),
	data_inicio timestamp with time zone,
	data_fim timestamp with time zone
);

CREATE UNIQUE INDEX atividade_unique_index
ON simulacao.atividade (etapa_id, unidade_trabalho_id) 
WHERE tipo_situacao_id != 6;

CREATE TABLE simulacao.perfil_producao(
	id SERIAL NOT NULL PRIMARY KEY,
  	nome VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE simulacao.perfil_producao_etapa(
	id SERIAL NOT NULL PRIMARY KEY,
  	perfil_producao_id INTEGER NOT NULL REFERENCES simulacao.perfil_producao (id),
	etapa_id INTEGER NOT NULL REFERENCES simulacao.etapa (id),
	prioridade INTEGER NOT NULL,
	UNIQUE (perfil_producao_id, etapa_id)
);

CREATE TABLE simulacao.perfil_producao_operador(
	id SERIAL NOT NULL PRIMARY KEY,
  	usuario_id INTEGER NOT NULL REFERENCES simulacao.usuario (id),
	perfil_producao_id INTEGER NOT NULL REFERENCES simulacao.perfil_producao (id),
	UNIQUE (usuario_id)
);

CREATE TABLE simulacao.fila_prioritaria(
	id SERIAL NOT NULL PRIMARY KEY,
 	atividade_id INTEGER NOT NULL REFERENCES simulacao.atividade (id),
 	usuario_id INTEGER NOT NULL REFERENCES simulacao.usuario (id),
	prioridade INTEGER NOT NULL
);

CREATE TABLE simulacao.fila_prioritaria_grupo(
	id SERIAL NOT NULL PRIMARY KEY,
 	atividade_id INTEGER NOT NULL REFERENCES simulacao.atividade (id),
 	perfil_producao_id INTEGER NOT NULL REFERENCES simulacao.perfil_producao (id),
	prioridade INTEGER NOT NULL
);

COMMIT;