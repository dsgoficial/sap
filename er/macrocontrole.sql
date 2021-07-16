BEGIN;

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SCHEMA macrocontrole;

CREATE TABLE macrocontrole.projeto(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL UNIQUE,
	descricao TEXT,
	finalizado BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE macrocontrole.linha_producao(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	projeto_id INTEGER NOT NULL REFERENCES macrocontrole.projeto (id),
	tipo_produto_id SMALLINT NOT NULL REFERENCES dominio.tipo_produto (code),
	UNIQUE(nome,projeto_id)
);

CREATE TABLE macrocontrole.produto(
	id SERIAL NOT NULL PRIMARY KEY,
	uuid text NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
	nome VARCHAR(255),
	mi VARCHAR(255),
	inom VARCHAR(255),
	escala VARCHAR(255) NOT NULL,
	linha_producao_id INTEGER NOT NULL REFERENCES macrocontrole.linha_producao (id),
	geom geometry(POLYGON, 4326) NOT NULL
);

CREATE INDEX produto_geom
    ON macrocontrole.produto USING gist
    (geom)
    TABLESPACE pg_default;

CREATE TABLE macrocontrole.fase(
    id SERIAL NOT NULL PRIMARY KEY,
    tipo_fase_id SMALLINT NOT NULL REFERENCES dominio.tipo_fase (code),
    linha_producao_id INTEGER NOT NULL REFERENCES macrocontrole.linha_producao (id),
    ordem INTEGER NOT NULL, -- as fases são ordenadas dentro de uma linha de produção de um projeto
    UNIQUE (linha_producao_id, tipo_fase_id) -- as combinações (tipo_fase, linha_producao_id) são unicos
);

--Meta anual estabelecida no PIT de uma fase
--CREATE TABLE macrocontrole.meta_anual(
--	id SERIAL NOT NULL PRIMARY KEY,
--	meta INTEGER NOT NULL,
--    ano INTEGER NOT NULL,
--    fase_id INTEGER NOT NULL REFERENCES macrocontrole.fase (id)
--);

CREATE TABLE macrocontrole.subfase(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	fase_id INTEGER NOT NULL REFERENCES macrocontrole.fase (id),
	ordem INTEGER NOT NULL, -- as subfases são ordenadas dentre de uma fase. Isso não impede o paralelismo de subfases. É uma ordenação para apresentação
	observacao text,
	UNIQUE (nome, fase_id) -- as combinações (nome,fase_id) são unicos
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
	ordem INTEGER NOT NULL, -- as etapas são ordenadas dentre de uma subfase. Não existe paralelismo
	observacao text,
	CHECK (
		tipo_etapa_id <> 1 or ordem = 1 -- Se tipo_etapa_id for 1 obrigatoriamente ordem tem que ser 1
	),
	UNIQUE (subfase_id, ordem)-- restrição para não ter ordem repetida para subfase
);

-- Constraint
CREATE OR REPLACE FUNCTION macrocontrole.etapa_verifica_rev_corr()
  RETURNS trigger AS
$BODY$
    DECLARE nr_erro integer;
    BEGIN

	WITH prev as (SELECT tipo_etapa_id, lag(tipo_etapa_id, 1) OVER(PARTITION BY subfase_id ORDER BY ordem) as prev_tipo_etapa_id
	FROM macrocontrole.etapa),
	prox as (SELECT tipo_etapa_id, lead(tipo_etapa_id, 1) OVER(PARTITION BY subfase_id ORDER BY ordem) as prox_tipo_etapa_id
	FROM macrocontrole.etapa)
	SELECT count(*) into nr_erro FROM (
		SELECT 1 FROM prev WHERE tipo_etapa_id = 3 and prev_tipo_etapa_id != 2
	    UNION
		SELECT 1 FROM prox WHERE tipo_etapa_id = 2 and (prox_tipo_etapa_id != 3 OR prox_tipo_etapa_id IS NULL)
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

CREATE TRIGGER etapa_verifica_rev_corr
AFTER UPDATE OR INSERT OR DELETE ON macrocontrole.etapa
FOR EACH STATEMENT EXECUTE PROCEDURE macrocontrole.etapa_verifica_rev_corr();

--

CREATE TABLE macrocontrole.requisito_finalizacao(
	id SERIAL NOT NULL PRIMARY KEY,
	descricao VARCHAR(255) NOT NULL,
    ordem INTEGER NOT NULL, -- os requisitos são ordenados dentro de uma subfase
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id)
);

CREATE TABLE macrocontrole.perfil_fme(
	id SERIAL NOT NULL PRIMARY KEY,
	gerenciador_fme_id INTEGER NOT NULL REFERENCES dgeo.gerenciador_fme (id),
	rotina VARCHAR(255) NOT NULL,
	requisito_finalizacao BOOLEAN NOT NULL DEFAULT TRUE,
	gera_falso_positivo BOOLEAN NOT NULL DEFAULT FALSE,
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	ordem INTEGER NOT NULL,
	UNIQUE(gerenciador_fme_id,rotina,subfase_id)
);

CREATE TABLE macrocontrole.perfil_configuracao_qgis(
	id SERIAL NOT NULL PRIMARY KEY,
	tipo_configuracao_id SMALLINT NOT NULL REFERENCES dominio.tipo_configuracao (code),
	parametros TEXT,
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	UNIQUE(tipo_configuracao_id,subfase_id)
);


CREATE TABLE macrocontrole.perfil_estilo(
	id SERIAL NOT NULL PRIMARY KEY,
	nome varchar(255) NOT NULL,
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	UNIQUE(nome,subfase_id)
);

CREATE TABLE macrocontrole.perfil_regras(
	id SERIAL NOT NULL PRIMARY KEY,
	grupo_regra_id INTEGER NOT NULL REFERENCES dgeo.group_rules (id),
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	UNIQUE(grupo_regra_id,subfase_id)
);

CREATE TABLE macrocontrole.perfil_menu(
	id SERIAL NOT NULL PRIMARY KEY,
	menu_id INTEGER NOT NULL REFERENCES dgeo.qgis_menus (id),
	menu_revisao BOOLEAN NOT NULL DEFAULT FALSE,
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	UNIQUE(menu_id,subfase_id)
);

CREATE TABLE macrocontrole.perfil_model_qgis(
	id SERIAL NOT NULL PRIMARY KEY,
	qgis_model_id INTEGER NOT NULL REFERENCES dgeo.qgis_models (id),
	parametros TEXT, 
	requisito_finalizacao BOOLEAN NOT NULL DEFAULT TRUE,
	gera_falso_positivo BOOLEAN NOT NULL DEFAULT FALSE,
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	ordem INTEGER NOT NULL,
	UNIQUE(qgis_model_id,subfase_id)
);

CREATE TABLE macrocontrole.perfil_linhagem(
	id SERIAL NOT NULL PRIMARY KEY,
	tipo_exibicao_id SMALLINT NOT NULL REFERENCES dominio.tipo_exibicao (code),
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	UNIQUE(subfase_id)
);

CREATE TABLE macrocontrole.camada(
	id SERIAL NOT NULL PRIMARY KEY,
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

CREATE TABLE macrocontrole.perfil_propriedades_camada(
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
	nome VARCHAR(255) NOT NULL,
	tipo_dado_producao_id SMALLINT NOT NULL REFERENCES dominio.tipo_dado_producao (code),
	configuracao_producao VARCHAR(255),
	tipo_dado_finalizacao_id SMALLINT NOT NULL REFERENCES dominio.tipo_dado_finalizacao (code),
	configuracao_finalizacao VARCHAR(255)
);

CREATE TABLE macrocontrole.perfil_monitoramento(
	id SERIAL NOT NULL PRIMARY KEY,
	tipo_monitoramento_id SMALLINT NOT NULL REFERENCES dominio.tipo_monitoramento (code),
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	UNIQUE(tipo_monitoramento_id, subfase_id)
);

CREATE TABLE macrocontrole.restricao_etapa(
	id SERIAL NOT NULL PRIMARY KEY,
	tipo_restricao_id SMALLINT NOT NULL REFERENCES dominio.tipo_restricao (code),
	etapa_anterior_id INTEGER NOT NULL REFERENCES macrocontrole.etapa (id),
	etapa_posterior_id INTEGER NOT NULL REFERENCES macrocontrole.etapa (id),
	UNIQUE(etapa_anterior_id, etapa_posterior_id)	
);

CREATE TABLE macrocontrole.lote(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) UNIQUE NOT NULL,
	prioridade INTEGER NOT NULL,
	observacao VARCHAR(255)
);

CREATE TABLE macrocontrole.unidade_trabalho(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	epsg VARCHAR(5) NOT NULL,
	dado_producao_id INTEGER NOT NULL REFERENCES macrocontrole.dado_producao (id),
 	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	lote_id INTEGER NOT NULL REFERENCES macrocontrole.lote (id),
	disponivel BOOLEAN NOT NULL DEFAULT FALSE,
	prioridade INTEGER NOT NULL,
	observacao text,
    geom geometry(POLYGON, 4326) NOT NULL,
	UNIQUE (nome, subfase_id)
);

CREATE INDEX unidade_trabalho_subfase_id
    ON macrocontrole.unidade_trabalho
    (subfase_id);

CREATE INDEX unidade_trabalho_geom
    ON macrocontrole.unidade_trabalho USING gist
    (geom)
    TABLESPACE pg_default;

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
    (geom)
    TABLESPACE pg_default;

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
		WHERE e.subfase_id != ut.subfase_id;

		IF nr_erro > 0 THEN
			RAISE EXCEPTION 'Etapa e Unidade de Trabalho não devem possuir subfases distintas.';
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

/* -- passar para serviço rh
CREATE TABLE macrocontrole.perda_recurso_humano(	
	id SERIAL NOT NULL PRIMARY KEY,	
 	usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),	
 	tipo_perda_recurso_humano_id SMALLINT NOT NULL REFERENCES dominio.tipo_perda_recurso_humano (code),	
	horas REAL,	
	data timestamp with time zone NOT NULL,	
	observacao TEXT	
);
-- passar para serviço rh
CREATE TABLE macrocontrole.funcao_especial(
	id SERIAL NOT NULL PRIMARY KEY,
 	usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
	funcao VARCHAR(255) NOT NULL
); */

CREATE TABLE macrocontrole.problema_atividade(
	id SERIAL NOT NULL PRIMARY KEY,
 	atividade_id INTEGER NOT NULL REFERENCES macrocontrole.atividade (id),
 	unidade_trabalho_id INTEGER NOT NULL REFERENCES macrocontrole.unidade_trabalho (id),
	tipo_problema_id SMALLINT NOT NULL REFERENCES dominio.tipo_problema (code),
	descricao TEXT NOT NULL,
	data  timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
	resolvido BOOLEAN NOT NULL DEFAULT FALSE,
	geom geometry(POLYGON, 4326) NOT NULL
);

CREATE INDEX problema_atividade_geom
    ON macrocontrole.problema_atividade USING gist
    (geom)
    TABLESPACE pg_default;


CREATE TABLE macrocontrole.alteracao_fluxo(
	id SERIAL NOT NULL PRIMARY KEY,
 	atividade_id INTEGER NOT NULL REFERENCES macrocontrole.atividade (id),
 	unidade_trabalho_id INTEGER NOT NULL REFERENCES macrocontrole.unidade_trabalho (id),
	descricao TEXT NOT NULL,
	data  timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
	resolvido BOOLEAN NOT NULL DEFAULT FALSE,
	geom geometry(POLYGON, 4326) NOT NULL
);

CREATE INDEX alteracao_fluxo_geom
    ON macrocontrole.alteracao_fluxo USING gist
    (geom)
    TABLESPACE pg_default;

COMMIT;