BEGIN;

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SCHEMA macrocontrole;

CREATE TABLE macrocontrole.projeto(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL UNIQUE,
	nome_abrev VARCHAR(255) NOT NULL UNIQUE,
	descricao TEXT,
	finalizado BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE macrocontrole.linha_producao(
	id INTEGER NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL UNIQUE,
	nome_abrev VARCHAR(255) NOT NULL UNIQUE,
	tipo_produto_id SMALLINT NOT NULL REFERENCES dominio.tipo_produto (code),
	descricao TEXT,
	UNIQUE(nome)
);

CREATE TABLE macrocontrole.lote(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) UNIQUE NOT NULL,
	nome_abrev VARCHAR(255) NOT NULL,
	denominador_escala INTEGER NOT NULL,
	linha_producao_id INTEGER NOT NULL REFERENCES macrocontrole.linha_producao (id),
	projeto_id INTEGER NOT NULL REFERENCES macrocontrole.projeto (id),
	descricao TEXT
);

CREATE OR REPLACE FUNCTION macrocontrole.chk_scale(integer, integer)
  RETURNS BOOLEAN AS
$$
	SELECT EXISTS (
		SELECT 1
		FROM macrocontrole.lote
		WHERE denominador_escala = $1
		AND id = $2
	);
$$
  LANGUAGE SQL;
ALTER FUNCTION macrocontrole.chk_scale(integer, integer)
  OWNER TO postgres;

CREATE TABLE macrocontrole.produto(
	id SERIAL NOT NULL PRIMARY KEY,
	uuid text NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
	nome VARCHAR(255),
	mi VARCHAR(255),
	inom VARCHAR(255),
	denominador_escala INTEGER NOT NULL,
	edicao VARCHAR(255),
	tipo_produto_id SMALLINT NOT NULL REFERENCES dominio.tipo_produto (code),
	lote_id INTEGER NOT NULL REFERENCES macrocontrole.lote (id),
	geom geometry(MULTIPOLYGON, 4326) NOT NULL,
	CONSTRAINT chk_product_scale CHECK (macrocontrole.chk_scale(denominador_escala, lote_id))
);

CREATE INDEX produto_geom
    ON macrocontrole.produto USING gist
    (geom);

CREATE TABLE macrocontrole.fase(
    id INTEGER NOT NULL PRIMARY KEY,
    tipo_fase_id SMALLINT NOT NULL REFERENCES dominio.tipo_fase (code),
    linha_producao_id INTEGER NOT NULL REFERENCES macrocontrole.linha_producao (id),
    ordem INTEGER NOT NULL,
    UNIQUE (linha_producao_id, tipo_fase_id)
);

CREATE TABLE macrocontrole.subfase(
	id INTEGER NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	fase_id INTEGER NOT NULL REFERENCES macrocontrole.fase (id),
	UNIQUE (nome, fase_id)
);

CREATE TABLE macrocontrole.pre_requisito_subfase(
	id SERIAL NOT NULL PRIMARY KEY,
	tipo_pre_requisito_id SMALLINT NOT NULL REFERENCES dominio.tipo_pre_requisito (code),
	subfase_anterior_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	subfase_posterior_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	UNIQUE(subfase_anterior_id, subfase_posterior_id)
);

CREATE TABLE macrocontrole.etapa(
	id SERIAL NOT NULL PRIMARY KEY,
	tipo_etapa_id SMALLINT NOT NULL REFERENCES dominio.tipo_etapa (code),
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	lote_id INTEGER NOT NULL REFERENCES macrocontrole.lote (id),
	ordem INTEGER NOT NULL,
	CHECK (
		tipo_etapa_id <> 1 or ordem = 1 -- Se tipo_etapa_id for 1 obrigatoriamente ordem tem que ser 1
	),
	UNIQUE (subfase_id, lote_id, ordem)
);

-- Constraint
CREATE OR REPLACE FUNCTION macrocontrole.etapa_verifica_rev_corr()
  RETURNS trigger AS
$BODY$
    DECLARE nr_erro integer;
    BEGIN

	WITH prev as (SELECT tipo_etapa_id, lag(tipo_etapa_id, 1) OVER(PARTITION BY subfase_id, lote_id ORDER BY ordem) as prev_tipo_etapa_id
	FROM macrocontrole.etapa),
	prox as (SELECT tipo_etapa_id, lead(tipo_etapa_id, 1) OVER(PARTITION BY subfase_id, lote_id ORDER BY ordem) as prox_tipo_etapa_id
	FROM macrocontrole.etapa)
	SELECT count(*) into nr_erro FROM (
		SELECT 1 FROM prev WHERE tipo_etapa_id = 3 and prev_tipo_etapa_id != 2 and prev_tipo_etapa_id != 5
	    UNION
		SELECT 1 FROM prox WHERE (tipo_etapa_id = 2 or tipo_etapa_id = 5 ) and (prox_tipo_etapa_id != 3 OR prox_tipo_etapa_id IS NULL)
	) as foo;

	IF nr_erro > 0 THEN
		RAISE EXCEPTION 'Etapa de Correção deve ser imediatamente após a uma etapa de Revisão.';
	END IF;

    RETURN NULL;

    END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION macrocontrole.etapa_verifica_rev_corr()
  OWNER TO postgres;

--CREATE TRIGGER etapa_verifica_rev_corr
--AFTER UPDATE OR INSERT OR DELETE ON macrocontrole.etapa
--FOR EACH STATEMENT EXECUTE PROCEDURE macrocontrole.etapa_verifica_rev_corr();

CREATE TABLE macrocontrole.perfil_requisito_finalizacao(
	id SERIAL NOT NULL PRIMARY KEY,
	descricao VARCHAR(255) NOT NULL,
    ordem INTEGER NOT NULL,
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	lote_id INTEGER NOT NULL REFERENCES macrocontrole.lote (id)
);

CREATE TABLE macrocontrole.perfil_fme(
	id SERIAL NOT NULL PRIMARY KEY,
	gerenciador_fme_id INTEGER NOT NULL REFERENCES dgeo.gerenciador_fme (id),
	rotina VARCHAR(255) NOT NULL,
	requisito_finalizacao BOOLEAN NOT NULL DEFAULT TRUE,
	tipo_rotina_id SMALLINT NOT NULL REFERENCES dominio.tipo_rotina (code),
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	lote_id INTEGER NOT NULL REFERENCES macrocontrole.lote (id),
	ordem INTEGER NOT NULL
);

CREATE TABLE macrocontrole.perfil_configuracao_qgis(
	id SERIAL NOT NULL PRIMARY KEY,
	tipo_configuracao_id SMALLINT NOT NULL REFERENCES dominio.tipo_configuracao (code),
	parametros TEXT,
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	lote_id INTEGER NOT NULL REFERENCES macrocontrole.lote (id),
	UNIQUE(tipo_configuracao_id,subfase_id,lote_id)
);

CREATE TABLE macrocontrole.perfil_estilo(
	id SERIAL NOT NULL PRIMARY KEY,
	grupo_estilo_id INTEGER NOT NULL REFERENCES dgeo.group_styles (id),
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	lote_id INTEGER NOT NULL REFERENCES macrocontrole.lote (id),
	UNIQUE(grupo_estilo_id,subfase_id,lote_id)
);

CREATE TABLE macrocontrole.perfil_regras(
	id SERIAL NOT NULL PRIMARY KEY,
	layer_rules_id INTEGER NOT NULL REFERENCES dgeo.layer_rules (id),
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	lote_id INTEGER NOT NULL REFERENCES macrocontrole.lote (id),
	UNIQUE(layer_rules_id,subfase_id,lote_id)
);

CREATE TABLE macrocontrole.perfil_menu(
	id SERIAL NOT NULL PRIMARY KEY,
	menu_id INTEGER NOT NULL REFERENCES dgeo.qgis_menus (id),
	menu_revisao BOOLEAN NOT NULL DEFAULT FALSE,
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	lote_id INTEGER NOT NULL REFERENCES macrocontrole.lote (id),
	UNIQUE(menu_id,subfase_id,lote_id)
);

CREATE TABLE macrocontrole.perfil_model_qgis(
	id SERIAL NOT NULL PRIMARY KEY,
	qgis_model_id INTEGER NOT NULL REFERENCES dgeo.qgis_models (id),
	parametros TEXT, 
	requisito_finalizacao BOOLEAN NOT NULL DEFAULT TRUE,
	tipo_rotina_id SMALLINT NOT NULL REFERENCES dominio.tipo_rotina (code),
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	lote_id INTEGER NOT NULL REFERENCES macrocontrole.lote (id),
	ordem INTEGER NOT NULL,
	UNIQUE(qgis_model_id,subfase_id,lote_id)
);

CREATE TABLE macrocontrole.perfil_linhagem(
	id SERIAL NOT NULL PRIMARY KEY,
	tipo_exibicao_id SMALLINT NOT NULL REFERENCES dominio.tipo_exibicao (code),
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	lote_id INTEGER NOT NULL REFERENCES macrocontrole.lote (id),
	UNIQUE(subfase_id,lote_id)
);

CREATE TABLE macrocontrole.perfil_workflow_dsgtools(
	id SERIAL NOT NULL PRIMARY KEY,
	workflow_dsgtools_id INTEGER NOT NULL REFERENCES dgeo.workflow_dsgtools (id),
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	lote_id INTEGER NOT NULL REFERENCES macrocontrole.lote (id),
	UNIQUE(workflow_dsgtools_id,subfase_id,lote_id)
);

--CREATE TABLE macrocontrole.perfil_monitoramento(
--	id SERIAL NOT NULL PRIMARY KEY,
--	tipo_monitoramento_id SMALLINT NOT NULL REFERENCES dominio.tipo_monitoramento (code),
--	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
--	lote_id INTEGER NOT NULL REFERENCES macrocontrole.lote (id),
--	UNIQUE(tipo_monitoramento_id,subfase_id,lote_id)
--);

CREATE TABLE macrocontrole.camada(
	id INTEGER NOT NULL PRIMARY KEY,
	schema VARCHAR(255) NOT NULL,
	nome VARCHAR(255) NOT NULL,
	alias VARCHAR(255),
	documentacao VARCHAR(255),
	UNIQUE(schema,nome)
);

CREATE TABLE macrocontrole.atributo(
	id SERIAL NOT NULL PRIMARY KEY,
	camada_id INTEGER NOT NULL REFERENCES macrocontrole.camada (id),
	nome VARCHAR(255) NOT NULL,
	alias VARCHAR(255),
	UNIQUE(camada_id,nome)
);

CREATE TABLE macrocontrole.propriedades_camada(
	id SERIAL NOT NULL PRIMARY KEY,
	camada_id INTEGER NOT NULL REFERENCES macrocontrole.camada (id),
	atributo_filtro_subfase VARCHAR(255),
	camada_apontamento BOOLEAN NOT NULL DEFAULT FALSE,
	atributo_situacao_correcao VARCHAR(255),
	atributo_justificativa_apontamento VARCHAR(255),
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	CHECK (
		(camada_apontamento IS TRUE AND atributo_situacao_correcao IS NOT NULL AND atributo_justificativa_apontamento IS NOT NULL) OR
		(camada_apontamento IS FALSE AND atributo_situacao_correcao IS NULL AND atributo_justificativa_apontamento IS NULL)
	),
	UNIQUE(camada_id, subfase_id)
);

CREATE TABLE macrocontrole.dado_producao(
	id SERIAL NOT NULL PRIMARY KEY,
	tipo_dado_producao_id SMALLINT NOT NULL REFERENCES dominio.tipo_dado_producao (code),
	configuracao_producao VARCHAR(255)
);

CREATE TABLE macrocontrole.restricao_etapa(
	id SERIAL NOT NULL PRIMARY KEY,
	tipo_restricao_id SMALLINT NOT NULL REFERENCES dominio.tipo_restricao (code),
	etapa_anterior_id INTEGER NOT NULL REFERENCES macrocontrole.etapa (id),
	etapa_posterior_id INTEGER NOT NULL REFERENCES macrocontrole.etapa (id),
	UNIQUE(etapa_anterior_id, etapa_posterior_id)	
);

CREATE TABLE macrocontrole.bloco(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	prioridade INTEGER NOT NULL,
	lote_id INTEGER NOT NULL REFERENCES macrocontrole.lote (id),
	UNIQUE(nome, lote_id)
);

CREATE TABLE macrocontrole.unidade_trabalho(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	epsg VARCHAR(5) NOT NULL,
	dado_producao_id INTEGER NOT NULL REFERENCES macrocontrole.dado_producao (id),
 	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	lote_id INTEGER NOT NULL REFERENCES macrocontrole.lote (id),
	bloco_id INTEGER NOT NULL REFERENCES macrocontrole.bloco (id),
	disponivel BOOLEAN NOT NULL DEFAULT FALSE,
	dificuldade INTEGER NOT NULL DEFAULT 0,
	prioridade INTEGER NOT NULL,
	observacao text,
    geom geometry(POLYGON, 4326) NOT NULL,
	CONSTRAINT dificuldade CHECK (dificuldade >= 0)
);

CREATE INDEX unidade_trabalho_subfase_id
    ON macrocontrole.unidade_trabalho
    (subfase_id);

CREATE INDEX unidade_trabalho_geom
    ON macrocontrole.unidade_trabalho USING gist
    (geom);

CREATE TABLE macrocontrole.grupo_insumo(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE macrocontrole.insumo(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	caminho VARCHAR(255) NOT NULL,
	epsg VARCHAR(5),
	tipo_insumo_id SMALLINT NOT NULL REFERENCES dominio.tipo_insumo (code),
	grupo_insumo_id INTEGER NOT NULL REFERENCES macrocontrole.grupo_insumo (id),
	geom geometry(POLYGON, 4326) --se for não espacial a geometria é nula
);

CREATE INDEX insumo_geom
    ON macrocontrole.insumo USING gist
    (geom);

CREATE TABLE macrocontrole.insumo_unidade_trabalho(
	id SERIAL NOT NULL PRIMARY KEY,
	unidade_trabalho_id INTEGER NOT NULL REFERENCES macrocontrole.unidade_trabalho (id),
	insumo_id INTEGER NOT NULL REFERENCES macrocontrole.insumo (id),
	caminho_padrao VARCHAR(255),
	UNIQUE(unidade_trabalho_id, insumo_id)
);

CREATE TABLE macrocontrole.atividade(
	id SERIAL NOT NULL PRIMARY KEY,
	etapa_id INTEGER NOT NULL REFERENCES macrocontrole.etapa (id),
 	unidade_trabalho_id INTEGER NOT NULL REFERENCES macrocontrole.unidade_trabalho (id),
	usuario_id INTEGER REFERENCES dgeo.usuario (id),
	tipo_situacao_id SMALLINT NOT NULL REFERENCES dominio.tipo_situacao (code),
	data_inicio timestamp with time zone,
	data_fim timestamp with time zone,
	observacao text
);

CREATE INDEX atividade_etapa_id
    ON macrocontrole.atividade
    (etapa_id);

-- (etapa_id, unidade_trabalho_id) deve ser unico para tipo_situacao !=5
CREATE UNIQUE INDEX atividade_unique_index
ON macrocontrole.atividade (etapa_id, unidade_trabalho_id) 
WHERE tipo_situacao_id in (1,2,3,4);

-- Constraint
CREATE OR REPLACE FUNCTION macrocontrole.atividade_verifica_subfase()
  RETURNS trigger AS
$BODY$
    DECLARE nr_erro integer;
    BEGIN
		SELECT count(*) into nr_erro AS ut_sufase_id from macrocontrole.atividade AS a
		INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
		INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
		WHERE e.subfase_id != ut.subfase_id OR e.lote_id != ut.lote_id;

		IF nr_erro > 0 THEN
			RAISE EXCEPTION 'Etapa e Unidade de Trabalho não devem possuir subfases ou lotes distintos.';
		END IF;
    RETURN NEW;


    END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION macrocontrole.atividade_verifica_subfase()
  OWNER TO postgres;

CREATE TRIGGER atividade_verifica_subfase
BEFORE UPDATE OR INSERT ON macrocontrole.atividade
FOR EACH STATEMENT EXECUTE PROCEDURE macrocontrole.atividade_verifica_subfase();

CREATE TABLE macrocontrole.perfil_producao(
	id SERIAL NOT NULL PRIMARY KEY,
  	nome VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE macrocontrole.perfil_producao_etapa(
	id SERIAL NOT NULL PRIMARY KEY,
  	perfil_producao_id INTEGER NOT NULL REFERENCES macrocontrole.perfil_producao (id),
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id), 
	tipo_etapa_id SMALLINT NOT NULL REFERENCES dominio.tipo_etapa (code),
	prioridade INTEGER NOT NULL,
	UNIQUE (perfil_producao_id, subfase_id, tipo_etapa_id)
);

CREATE TABLE macrocontrole.perfil_producao_operador(
	id SERIAL NOT NULL PRIMARY KEY,
  	usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
	perfil_producao_id INTEGER NOT NULL REFERENCES macrocontrole.perfil_producao (id),
	UNIQUE (usuario_id)
);

CREATE TABLE macrocontrole.perfil_projeto_operador(
	id SERIAL NOT NULL PRIMARY KEY,
  	usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id), 
	projeto_id INTEGER NOT NULL REFERENCES macrocontrole.projeto (id),
	prioridade INTEGER NOT NULL
);

CREATE TABLE macrocontrole.perfil_dificuldade_operador(
	id SERIAL NOT NULL PRIMARY KEY,
  	usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id), 
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	projeto_id INTEGER NOT NULL REFERENCES macrocontrole.projeto (id),
	tipo_perfil_dificuldade_id SMALLINT NOT NULL REFERENCES dominio.tipo_perfil_dificuldade (code),
	UNIQUE(usuario_id, subfase_id, projeto_id)
);

CREATE TABLE macrocontrole.fila_prioritaria(
	id SERIAL NOT NULL PRIMARY KEY,
 	atividade_id INTEGER NOT NULL REFERENCES macrocontrole.atividade (id),
 	usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
	prioridade INTEGER NOT NULL,
	UNIQUE(atividade_id, usuario_id)
);

CREATE TABLE macrocontrole.fila_prioritaria_grupo(
	id SERIAL NOT NULL PRIMARY KEY,
 	atividade_id INTEGER NOT NULL REFERENCES macrocontrole.atividade (id),
 	perfil_producao_id INTEGER NOT NULL REFERENCES macrocontrole.perfil_producao (id),
	prioridade INTEGER NOT NULL,
	UNIQUE(atividade_id, perfil_producao_id)
);

CREATE TABLE macrocontrole.problema_atividade(
	id SERIAL NOT NULL PRIMARY KEY,
 	atividade_id INTEGER NOT NULL REFERENCES macrocontrole.atividade (id),
	tipo_problema_id SMALLINT NOT NULL REFERENCES dominio.tipo_problema (code),
	descricao TEXT NOT NULL,
	data timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
	resolvido BOOLEAN NOT NULL DEFAULT FALSE,
	geom geometry(POLYGON, 4326) NOT NULL
);

CREATE INDEX problema_atividade_geom
    ON macrocontrole.problema_atividade USING gist
    (geom);


CREATE TABLE macrocontrole.alteracao_fluxo(
	id SERIAL NOT NULL PRIMARY KEY,
 	atividade_id INTEGER NOT NULL REFERENCES macrocontrole.atividade (id),
	descricao TEXT NOT NULL,
	data timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
	resolvido BOOLEAN NOT NULL DEFAULT FALSE,
	geom geometry(POLYGON, 4326) NOT NULL
);

CREATE INDEX alteracao_fluxo_geom
    ON macrocontrole.alteracao_fluxo USING gist
    (geom);

COMMIT;