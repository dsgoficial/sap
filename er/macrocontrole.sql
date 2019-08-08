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
	nome VARCHAR(255),
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
(8, 'Avaliação imagens'), -- rever diferentes avaliações com o relatório
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
	observacao text,
	UNIQUE (nome, fase_id)
);

CREATE TABLE macrocontrole.tipo_pre_requisito(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO macrocontrole.tipo_pre_requisito (code, nome) VALUES
(1, 'Região concluída');

--restrição para as subfases serem do mesmo projeto
CREATE TABLE macrocontrole.pre_requisito_subfase(
	id SERIAL NOT NULL PRIMARY KEY,
	tipo_pre_requisito_id INTEGER NOT NULL REFERENCES macrocontrole.tipo_pre_requisito (code),
	subfase_anterior_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	subfase_posterior_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id)	
);

CREATE TABLE macrocontrole.tipo_etapa(
	code SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO macrocontrole.tipo_etapa (code,nome) VALUES
(1,'Execução'),
(2,'Revisão'),
(3,'Correção'),
(4,'Revisão e Correção');

CREATE TABLE macrocontrole.etapa(
	id SERIAL NOT NULL PRIMARY KEY,
	tipo_etapa_id INTEGER NOT NULL REFERENCES macrocontrole.tipo_etapa (code),
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

    BEGIN

	
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;


    END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION macrocontrole.etapa_verifica_rev_corr()
  OWNER TO postgres;

CREATE TRIGGER etapa_verifica_rev_corr
BEFORE UPDATE OR INSERT OR DELETE ON macrocontrole.etapa
FOR EACH ROW EXECUTE PROCEDURE macrocontrole.etapa_verifica_rev_corr();

--

CREATE TABLE macrocontrole.requisito_finalizacao(
	id SERIAL NOT NULL PRIMARY KEY,
	descricao VARCHAR(255) NOT NULL,
    ordem INTEGER NOT NULL, -- os requisitos são ordenados dentro de uma etapa
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id)
);

CREATE TABLE macrocontrole.perfil_fme(
	id SERIAL NOT NULL PRIMARY KEY,
	servidor VARCHAR(255) NOT NULL,
	porta VARCHAR(255) NOT NULL,
	rotina VARCHAR(255) NOT NULL,
	gera_falso_positivo BOOLEAN NOT NULL DEFAULT FALSE,
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id)
);

--TODO: configurar outras opções do DSGTools

CREATE TABLE macrocontrole.perfil_estilo(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id)
);

CREATE TABLE macrocontrole.perfil_regras(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id)
);

CREATE TABLE macrocontrole.perfil_menu(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	menu_revisao BOOLEAN NOT NULL DEFAULT FALSE,
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id)
);

CREATE TABLE macrocontrole.tipo_exibicao(
	code SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO macrocontrole.tipo_exibicao (code,nome) VALUES
(1,'Não exibir linhagem'),
(2,'Exibir linhagem para revisores'),
(3,'Sempre exibir linhagem');

CREATE TABLE macrocontrole.perfil_linhagem(
	id SERIAL NOT NULL PRIMARY KEY,
	tipo_exibicao_id INTEGER NOT NULL REFERENCES macrocontrole.tipo_exibicao (code),
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id)
);

CREATE TABLE macrocontrole.camada(
	id SERIAL NOT NULL PRIMARY KEY,
	schema VARCHAR(255) NOT NULL,
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
	escala_trabalho INTEGER,
	atributo_filtro_subfase VARCHAR(255),
	camada_apontamento BOOLEAN NOT NULL DEFAULT FALSE,
	atributo_situacao_correcao VARCHAR(255),
	atributo_justificativa_apontamento VARCHAR(255),
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	CHECK (
		(camada_apontamento IS TRUE AND atributo_situacao_correcao IS NOT NULL AND atributo_justificativa_apontamento IS NOT NULL) OR
		(camada_apontamento IS FALSE AND atributo_situacao_correcao IS NULL AND atributo_justificativa_apontamento IS NULL)
	),
);

CREATE TABLE macrocontrole.perfil_rotina_dsgtools(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL, --nome da rotina do dsgtools
	parametros VARCHAR(255), --json de parametros conforme o padrão do dsgtools
	gera_falso_positivo BOOLEAN NOT NULL DEFAULT FALSE,
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id)
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
(1, 'Monitoramento de feição'),
(2, 'Monitoramento de tela'),
(3, 'Monitoramento de comportamento');

CREATE TABLE macrocontrole.perfil_monitoramento(
	id SERIAL NOT NULL PRIMARY KEY,
	tipo_monitoramento_id INTEGER NOT NULL REFERENCES macrocontrole.tipo_monitoramento (code),
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id)
);

CREATE TABLE macrocontrole.tipo_restricao(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO macrocontrole.tipo_restricao (code, nome) VALUES
(1, 'Operadores distintos'),
(2, 'Operadores iguais'),
(3, 'Operadores no mesmo turno');

--restrição para as etapas serem da mesma linha de produção (trigger?)
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
	nome VARCHAR(255) NOT NULL,
    geom geometry(POLYGON, 4674) NOT NULL,
	epsg VARCHAR(5) NOT NULL,
	banco_dados_id INTEGER REFERENCES macrocontrole.banco_dados (id),
 	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	lote_id INTEGER NOT NULL REFERENCES macrocontrole.lote (id),
	disponivel BOOLEAN NOT NULL DEFAULT FALSE,
	prioridade INTEGER NOT NULL,
	observacao text,
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
	insumo_id INTEGER NOT NULL REFERENCES macrocontrole.insumo (id),
	caminho_padrao VARCHAR(255)
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

--FIXME restrição que etapa_id e unidade_trabalho_id sejam da mesma subfase
CREATE TABLE macrocontrole.atividade(
	id SERIAL NOT NULL PRIMARY KEY,
	etapa_id INTEGER NOT NULL REFERENCES macrocontrole.etapa (id),
 	unidade_trabalho_id INTEGER NOT NULL REFERENCES macrocontrole.unidade_trabalho (id),
	usuario_id INTEGER REFERENCES dgeo.usuario (id),
	tipo_situacao_id INTEGER NOT NULL REFERENCES macrocontrole.tipo_situacao (code),
	data_inicio timestamp with time zone,
	data_fim timestamp with time zone,
	observacao text
);

CREATE INDEX atividade_etapa_id
    ON macrocontrole.atividade
    (etapa_id);

-- (etapa_id, unidade_trabalho_id) deve ser unico para tipo_situacao !=6
CREATE UNIQUE INDEX atividade_unique_index
ON macrocontrole.atividade (etapa_id, unidade_trabalho_id) 
WHERE tipo_situacao_id != 6;

-- Constraint
CREATE OR REPLACE FUNCTION macrocontrole.atividade_verifica_subfase()
  RETURNS trigger AS
$BODY$
    DECLARE nr_erro integer;
    BEGIN
		SELECT count(*) into nr_erro AS ut_sufase_id from macrocontrole.atividade AS a
		INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
		INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
		WHERE a.id = NEW.id AND e.subfase_id != ut.subfase_id;

		IF nr_erro > 0 THEN
			RAISE EXCEPTION 'Etapa e Unidade de Trabalho com Subfases distintas.';
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
FOR EACH ROW EXECUTE PROCEDURE macrocontrole.atividade_verifica_subfase();

--

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
(4, 'Grande quantidade de objetos na unidade de trabalho, necessita ser dividida')
(99, 'Outros');

CREATE TABLE macrocontrole.problema_atividade(
	id SERIAL NOT NULL PRIMARY KEY,
 	atividade_id INTEGER NOT NULL REFERENCES macrocontrole.atividade (id),
	tipo_problema_id INTEGER NOT NULL REFERENCES macrocontrole.tipo_problema (code),
	descricao TEXT NOT NULL,
	resolvido BOOLEAN NOT NULL DEFAULT FALSE
);

-- Constraint
CREATE OR REPLACE FUNCTION macrocontrole.libera_problema_atividade()
  RETURNS trigger AS
$BODY$
    DECLARE ut_id integer;
    BEGIN
		SELECT unidade_trabalho_id into ut_id 
		FROM macrocontrole.atividade
		WHERE id = NEW.atividade_id;

		IF NEW.resolvido THEN
			UPDATE macrocontrole.unidade_trabalho
			SET disponivel = TRUE
			WHERE id = ut_id;
		ELSE
			UPDATE macrocontrole.unidade_trabalho
			SET disponivel = FALSE
			WHERE id = ut_id;
		END IF;


    RETURN NEW;

    END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION macrocontrole.libera_problema_atividade()
  OWNER TO postgres;

CREATE TRIGGER libera_problema_atividade
AFTER UPDATE ON macrocontrole.problema_atividade
FOR EACH ROW EXECUTE PROCEDURE macrocontrole.libera_problema_atividade();

--

COMMIT;