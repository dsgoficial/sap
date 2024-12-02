BEGIN;

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SCHEMA macrocontrole;

CREATE TABLE macrocontrole.projeto(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL UNIQUE,
	nome_abrev VARCHAR(255) NOT NULL UNIQUE,
	descricao TEXT,
	status_id SMALLINT NOT NULL REFERENCES dominio.status (code)
);

CREATE TABLE macrocontrole.linha_producao(
	id SERIAL NOT NULL PRIMARY KEY,
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
	descricao TEXT,
	status_id SMALLINT NOT NULL REFERENCES dominio.status (code)
);

CREATE TABLE macrocontrole.produto(
	id SERIAL NOT NULL PRIMARY KEY,
	uuid text NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
	nome VARCHAR(255),
	mi VARCHAR(255),
	inom VARCHAR(255),
	denominador_escala INTEGER NOT NULL,
	edicao VARCHAR(255),
	latitude_centro REAL,
	longitude_centro REAL,
	tipo_produto_id SMALLINT NOT NULL REFERENCES dominio.tipo_produto (code),
	lote_id INTEGER NOT NULL REFERENCES macrocontrole.lote (id),
	geom geometry(MULTIPOLYGON, 4326) NOT NULL
);

CREATE OR REPLACE FUNCTION macrocontrole.chk_scale() RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM macrocontrole.lote
        WHERE denominador_escala = NEW.denominador_escala
        AND id = NEW.lote_id
    ) THEN
        RAISE EXCEPTION 'Scale inconsistency detected';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION macrocontrole.chk_scale()
  OWNER TO postgres;

CREATE TRIGGER chk_product_scale
BEFORE INSERT OR UPDATE ON macrocontrole.produto
FOR EACH ROW EXECUTE PROCEDURE macrocontrole.chk_scale();


CREATE INDEX produto_geom
    ON macrocontrole.produto USING gist
    (geom);

CREATE TABLE macrocontrole.fase(
    id SERIAL NOT NULL PRIMARY KEY,
    tipo_fase_id SMALLINT NOT NULL REFERENCES dominio.tipo_fase (code),
    linha_producao_id INTEGER NOT NULL REFERENCES macrocontrole.linha_producao (id),
    ordem INTEGER NOT NULL,
	UNIQUE (linha_producao_id, ordem)
);

CREATE TABLE macrocontrole.subfase(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	fase_id INTEGER NOT NULL REFERENCES macrocontrole.fase (id),
    ordem INTEGER NOT NULL,
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

CREATE OR REPLACE FUNCTION macrocontrole.chk_lote() RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM macrocontrole.subfase AS s
        INNER JOIN macrocontrole.fase AS f ON s.fase_id = f.id
        INNER JOIN macrocontrole.lote AS l ON l.linha_producao_id = f.linha_producao_id
        WHERE s.id = NEW.subfase_id AND l.id = NEW.lote_id 
    ) THEN
        RAISE EXCEPTION 'Lote inconsistency detected';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION macrocontrole.chk_lote()
  OWNER TO postgres;

CREATE TRIGGER chk_lote_consistency
BEFORE INSERT OR UPDATE ON macrocontrole.etapa
FOR EACH ROW EXECUTE PROCEDURE macrocontrole.chk_lote();

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

CREATE TABLE macrocontrole.perfil_tema(
	id SERIAL NOT NULL PRIMARY KEY,
	tema_id INTEGER NOT NULL REFERENCES dgeo.qgis_themes (id),
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	lote_id INTEGER NOT NULL REFERENCES macrocontrole.lote (id),
	UNIQUE(tema_id,subfase_id,lote_id)
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
	requisito_finalizacao BOOLEAN NOT NULL DEFAULT TRUE,
	UNIQUE(workflow_dsgtools_id,subfase_id,lote_id)
);

CREATE TABLE macrocontrole.camada(
	id SERIAL NOT NULL PRIMARY KEY,
	schema VARCHAR(255) NOT NULL,
	nome VARCHAR(255) NOT NULL,
	UNIQUE(schema,nome)
);

CREATE TABLE macrocontrole.propriedades_camada(
	id SERIAL NOT NULL PRIMARY KEY,
	camada_id INTEGER NOT NULL REFERENCES macrocontrole.camada (id),
	camada_incomum BOOLEAN NOT NULL DEFAULT FALSE,
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

CREATE TABLE macrocontrole.perfil_alias(
	id SERIAL NOT NULL PRIMARY KEY,
	alias_id INTEGER NOT NULL REFERENCES dgeo.layer_alias (id),
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	lote_id INTEGER NOT NULL REFERENCES macrocontrole.lote (id),
	UNIQUE(alias_id,subfase_id,lote_id)
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
	status_id SMALLINT NOT NULL REFERENCES dominio.status (code),
	lote_id INTEGER NOT NULL REFERENCES macrocontrole.lote (id),
	UNIQUE(nome, lote_id)
);

CREATE TABLE macrocontrole.unidade_trabalho(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255),
	epsg VARCHAR(5) NOT NULL,
	dado_producao_id INTEGER NOT NULL REFERENCES macrocontrole.dado_producao (id),
 	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	lote_id INTEGER NOT NULL REFERENCES macrocontrole.lote (id),
	bloco_id INTEGER NOT NULL REFERENCES macrocontrole.bloco (id),
	disponivel BOOLEAN NOT NULL DEFAULT FALSE,
	dificuldade INTEGER NOT NULL DEFAULT 0,
	tempo_estimado_minutos INTEGER NOT NULL DEFAULT 0,
	prioridade INTEGER NOT NULL,
	observacao text,
    geom geometry(POLYGON, 4326) NOT NULL,
	CONSTRAINT dificuldade CHECK (dificuldade >= 0),
	CONSTRAINT tempo_estimado CHECK (tempo_estimado_minutos >= 0)
);

CREATE INDEX unidade_trabalho_subfase_id
    ON macrocontrole.unidade_trabalho
    (subfase_id);

CREATE INDEX unidade_trabalho_geom
    ON macrocontrole.unidade_trabalho USING gist
    (geom);

CREATE OR REPLACE FUNCTION macrocontrole.chk_lote_ut() RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM macrocontrole.subfase AS s
        INNER JOIN macrocontrole.fase AS f ON s.fase_id = f.id
        INNER JOIN macrocontrole.lote AS l ON l.linha_producao_id = f.linha_producao_id
        WHERE s.id = NEW.subfase_id AND l.id = NEW.lote_id 
    ) THEN
        RAISE EXCEPTION 'Lote inconsistency detected';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION macrocontrole.chk_lote_ut()
  OWNER TO postgres;

CREATE TRIGGER chk_lote_consistency_ut
BEFORE INSERT OR UPDATE ON macrocontrole.unidade_trabalho
FOR EACH ROW EXECUTE PROCEDURE macrocontrole.chk_lote_ut();


CREATE TABLE macrocontrole.grupo_insumo(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) UNIQUE NOT NULL,
	disponivel BOOLEAN NOT NULL DEFAULT TRUE
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

CREATE INDEX atividade_tipo_situacao_id ON macrocontrole.atividade ( tipo_situacao_id );
CREATE INDEX atividade_usuario_id ON macrocontrole.atividade ( usuario_id );

CREATE OR REPLACE FUNCTION macrocontrole.atividade_verifica_subfase() RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM macrocontrole.etapa AS e
        INNER JOIN macrocontrole.unidade_trabalho AS ut ON NEW.etapa_id = e.id AND NEW.unidade_trabalho_id = ut.id
        WHERE e.subfase_id != ut.subfase_id OR e.lote_id != ut.lote_id
    ) THEN
        RETURN NEW;
    ELSE
        RAISE EXCEPTION 'Subfase or Lote inconsistency detected';
    END IF;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION macrocontrole.atividade_verifica_subfase()
  OWNER TO postgres;

CREATE TRIGGER chk_subfase_lote_consistency
BEFORE INSERT OR UPDATE ON macrocontrole.atividade
FOR EACH ROW EXECUTE PROCEDURE macrocontrole.atividade_verifica_subfase();

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

CREATE TABLE macrocontrole.perfil_bloco_operador(
	id SERIAL NOT NULL PRIMARY KEY,
  	usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id), 
	bloco_id INTEGER NOT NULL REFERENCES macrocontrole.bloco (id)
);
CREATE INDEX perfil_bloco_operador_usuario_id ON macrocontrole.perfil_bloco_operador ( usuario_id );


CREATE TABLE macrocontrole.perfil_dificuldade_operador(
	id SERIAL NOT NULL PRIMARY KEY,
  	usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id), 
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	lote_id INTEGER NOT NULL REFERENCES macrocontrole.lote (id),
	tipo_perfil_dificuldade_id SMALLINT NOT NULL REFERENCES dominio.tipo_perfil_dificuldade (code),
	UNIQUE(usuario_id, subfase_id, lote_id)
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
 	usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
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
 	usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
	descricao TEXT NOT NULL,
	data timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
	resolvido BOOLEAN NOT NULL DEFAULT FALSE,
	geom geometry(POLYGON, 4326) NOT NULL
);

CREATE INDEX alteracao_fluxo_geom
    ON macrocontrole.alteracao_fluxo USING gist
    (geom);

CREATE TABLE macrocontrole.relacionamento_ut (
  ut_id INTEGER NOT NULL,
  ut_re_id INTEGER NOT NULL,
  tipo_pre_requisito_id INTEGER NOT NULL,
  PRIMARY KEY (ut_id, ut_re_id)
);

CREATE OR REPLACE FUNCTION macrocontrole.handle_relacionamento_ut_insert_update(ut_ids INTEGER[])
RETURNS VOID AS $$
BEGIN
  DELETE FROM macrocontrole.relacionamento_ut
  WHERE ut_id = ANY(ut_ids) OR ut_re_id = ANY(ut_ids);

  DELETE FROM macrocontrole.relacionamento_produto
  WHERE ut_id = ANY(ut_ids);

  INSERT INTO macrocontrole.relacionamento_ut (ut_id, ut_re_id, tipo_pre_requisito_id)
  SELECT ut.id AS ut_id, ut_re.id AS ut_re_id, prs.tipo_pre_requisito_id
  FROM macrocontrole.unidade_trabalho AS ut
  INNER JOIN macrocontrole.pre_requisito_subfase AS prs ON prs.subfase_posterior_id = ut.subfase_id
  INNER JOIN macrocontrole.unidade_trabalho AS ut_re ON ut_re.subfase_id = prs.subfase_anterior_id AND ut.lote_id = ut_re.lote_id
  WHERE (ut.id = ANY(ut_ids) OR ut_re.id = ANY(ut_ids)) AND ut.id != ut_re.id AND ut.geom && ut_re.geom AND st_relate(ut.geom, ut_re.geom, '2********');

  INSERT INTO macrocontrole.relacionamento_produto (p_id, ut_id)
  SELECT p.id AS p_id, ut.id AS ut_id
  FROM macrocontrole.produto AS p
  INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.lote_id = p.lote_id AND p.geom && ut.geom AND st_relate(p.geom, ut.geom, '2********')
  WHERE ut.id = ANY(ut_ids);
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION macrocontrole.handle_relacionamento_ut_insert_update(INTEGER[])
  OWNER TO postgres;

CREATE OR REPLACE FUNCTION macrocontrole.handle_relacionamento_ut_delete(ut_ids INTEGER[])
RETURNS VOID AS $$
BEGIN
  DELETE FROM macrocontrole.relacionamento_ut
  WHERE ut_id = ANY(ut_ids) OR ut_re_id = ANY(ut_ids);

  DELETE FROM macrocontrole.relacionamento_produto
  WHERE ut_id = ANY(ut_ids);
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION macrocontrole.handle_relacionamento_ut_delete(INTEGER[])
  OWNER TO postgres;

CREATE OR REPLACE FUNCTION macrocontrole.update_relacionamento_ut()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM macrocontrole.handle_relacionamento_ut_insert_update(ARRAY[NEW.id]);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM macrocontrole.handle_relacionamento_ut_delete(ARRAY[OLD.id]);
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION macrocontrole.update_relacionamento_ut()
  OWNER TO postgres;

CREATE TRIGGER a_relacionamento_unidade_trabalho
AFTER INSERT OR UPDATE OR DELETE ON macrocontrole.unidade_trabalho
FOR EACH ROW
EXECUTE PROCEDURE macrocontrole.update_relacionamento_ut();

CREATE OR REPLACE FUNCTION macrocontrole.update_relacionamento_ut_prs()
RETURNS TRIGGER AS $$
BEGIN

  IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    DELETE FROM macrocontrole.relacionamento_ut AS ru
	WHERE EXISTS (
		SELECT 1
		FROM macrocontrole.unidade_trabalho AS ut
		INNER JOIN macrocontrole.pre_requisito_subfase AS prs ON prs.subfase_posterior_id = ut.subfase_id
		INNER JOIN macrocontrole.unidade_trabalho AS ut_re ON ut_re.subfase_id = prs.subfase_anterior_id AND ut.lote_id = ut_re.lote_id
		WHERE prs.subfase_anterior_id = OLD.subfase_anterior_id AND prs.subfase_posterior_id = OLD.subfase_posterior_id AND ut.geom && ut_re.geom AND st_relate(ut.geom, ut_re.geom, '2********')
		AND ru.ut_id = ut.id AND ru.ut_re_id = ut_re.id
	);
  END IF;

  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    INSERT INTO macrocontrole.relacionamento_ut (ut_id, ut_re_id, tipo_pre_requisito_id)
    SELECT ut.id AS ut_id, ut_re.id AS ut_re_id, prs.tipo_pre_requisito_id
    FROM macrocontrole.unidade_trabalho AS ut
    INNER JOIN macrocontrole.pre_requisito_subfase AS prs ON prs.subfase_posterior_id = ut.subfase_id
    INNER JOIN macrocontrole.unidade_trabalho AS ut_re ON ut_re.subfase_id = prs.subfase_anterior_id AND ut.lote_id = ut_re.lote_id
    WHERE prs.subfase_anterior_id = NEW.subfase_anterior_id AND prs.subfase_posterior_id = NEW.subfase_posterior_id AND ut.geom && ut_re.geom AND st_relate(ut.geom, ut_re.geom, '2********');

    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION macrocontrole.update_relacionamento_ut_prs()
  OWNER TO postgres;

CREATE TRIGGER a_relacionamento_pre_requisito_subfase
AFTER INSERT OR UPDATE OR DELETE ON macrocontrole.pre_requisito_subfase
FOR EACH ROW
EXECUTE PROCEDURE macrocontrole.update_relacionamento_ut_prs();

CREATE TABLE macrocontrole.relacionamento_produto (
  p_id INTEGER NOT NULL,
  ut_id INTEGER NOT NULL,
  PRIMARY KEY (p_id, ut_id)
);

CREATE OR REPLACE FUNCTION macrocontrole.handle_relacionamento_produto_insert_update(p_ids INTEGER[])
RETURNS VOID AS $$
BEGIN
  DELETE FROM macrocontrole.relacionamento_produto
  WHERE p_id = ANY(p_ids);

  INSERT INTO macrocontrole.relacionamento_produto (p_id, ut_id)
  SELECT p.id AS p_id, ut.id AS ut_id
  FROM macrocontrole.produto AS p
  INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.lote_id = p.lote_id AND p.geom && ut.geom AND st_relate(p.geom, ut.geom, '2********')
  WHERE p.id = ANY(p_ids);
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION macrocontrole.handle_relacionamento_produto_insert_update(INTEGER[])
  OWNER TO postgres;

CREATE OR REPLACE FUNCTION macrocontrole.handle_relacionamento_produto_delete(p_ids INTEGER[])
RETURNS VOID AS $$
BEGIN
  DELETE FROM macrocontrole.relacionamento_produto
  WHERE p_id = ANY(p_ids);
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION macrocontrole.handle_relacionamento_produto_delete(INTEGER[])
  OWNER TO postgres;

CREATE OR REPLACE FUNCTION macrocontrole.update_relacionamento_produto()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM macrocontrole.handle_relacionamento_produto_insert_update(ARRAY[NEW.id]);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM macrocontrole.handle_relacionamento_produto_delete(ARRAY[OLD.id]);
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION macrocontrole.update_relacionamento_produto()
  OWNER TO postgres;

CREATE TRIGGER a_relacionamento_produto
AFTER INSERT OR UPDATE OR DELETE ON macrocontrole.produto
FOR EACH ROW
EXECUTE PROCEDURE macrocontrole.update_relacionamento_produto();

CREATE TABLE macrocontrole.pit(
	id SERIAL NOT NULL PRIMARY KEY,
	lote_id INTEGER NOT NULL REFERENCES macrocontrole.lote (id),
	meta INTEGER NOT NULL,
	ano INTEGER NOT NULL,
	UNIQUE(lote_id, ano)
);

CREATE TABLE macrocontrole.relatorio_alteracao(
	id SERIAL NOT NULL PRIMARY KEY,
	data timestamp with time zone NOT NULL,
	descricao TEXT NOT NULL
);

-- Trigger para verificar se um lote pode ser finalizado com base no status dos blocos
CREATE OR REPLACE FUNCTION macrocontrole.chk_lote_status() RETURNS TRIGGER AS $$
BEGIN
    -- Se o lote está sendo finalizado (status_id != 1)
    IF NEW.status_id != 1 THEN
        -- Verifica se existem blocos em andamento
        IF EXISTS (
            SELECT 1
            FROM macrocontrole.bloco
            WHERE lote_id = NEW.id
            AND status_id = 1
        ) THEN
            RAISE EXCEPTION 'Cannot finalize lot while blocks are still in progress';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION macrocontrole.chk_lote_status()
    OWNER TO postgres;

CREATE TRIGGER chk_lote_status_consistency
    BEFORE INSERT OR UPDATE ON macrocontrole.lote
    FOR EACH ROW
    EXECUTE PROCEDURE macrocontrole.chk_lote_status();

-- Trigger para verificar se um projeto pode ser finalizado com base no status dos lotes
CREATE OR REPLACE FUNCTION macrocontrole.chk_projeto_status() RETURNS TRIGGER AS $$
BEGIN
    -- Se o projeto está sendo finalizado (status_id != 1)
    IF NEW.status_id != 1 THEN
        -- Verifica se existem lotes em andamento
        IF EXISTS (
            SELECT 1
            FROM macrocontrole.lote
            WHERE projeto_id = NEW.id
            AND status_id = 1
        ) THEN
            RAISE EXCEPTION 'Cannot finalize project while lots are still in progress';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION macrocontrole.chk_projeto_status()
    OWNER TO postgres;

CREATE TRIGGER chk_projeto_status_consistency
    BEFORE INSERT OR UPDATE ON macrocontrole.projeto
    FOR EACH ROW
    EXECUTE PROCEDURE macrocontrole.chk_projeto_status();

CREATE OR REPLACE FUNCTION macrocontrole.chk_bloco_status() RETURNS TRIGGER AS $$
BEGIN
    -- Verifica status do lote relacionado
    IF EXISTS (
        SELECT 1
        FROM macrocontrole.lote
        WHERE id = NEW.lote_id
        AND status_id != 1
    ) THEN
        -- Se o lote está finalizado, não permite blocos em execução ou alteração de status
        IF NEW.status_id = 1 THEN
            RAISE EXCEPTION 'Cannot create or update block in progress for finalized or abandoned lot';
        ELSE
            RAISE EXCEPTION 'Cannot modify block status for finalized or abandoned lot';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION macrocontrole.chk_bloco_status()
    OWNER TO postgres;

CREATE TRIGGER chk_bloco_status_consistency
    BEFORE INSERT OR UPDATE ON macrocontrole.bloco
    FOR EACH ROW
    EXECUTE PROCEDURE macrocontrole.chk_bloco_status();

COMMIT;