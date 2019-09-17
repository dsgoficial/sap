BEGIN;

CREATE SCHEMA microcontrole;

CREATE TABLE microcontrole.tipo_operacao(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO microcontrole.tipo_operacao (code, nome) VALUES
(1, 'INSERT'),
(2, 'DELETE'),
(3, 'UPDATE');

CREATE TABLE microcontrole.monitoramento_feicao(
  id SERIAL NOT NULL PRIMARY KEY,
  tipo_operacao_id INTEGER NOT NULL REFERENCES microcontrole.tipo_operacao (code),
  camada_id INTEGER NOT NULL REFERENCES macrocontrole.camada (id),
  quantidade integer NOT NULL,
  comprimento real,
  vertices integer,
  data timestamp with time zone NOT NULL,
  atividade_id INTEGER NOT NULL REFERENCES macrocontrole.atividade (id)
);

CREATE INDEX monitoramento_feicao_idx
    ON microcontrole.monitoramento_feicao USING btree
    (data DESC)
    TABLESPACE pg_default;

CREATE TABLE microcontrole.monitoramento_apontamento(
  id SERIAL NOT NULL PRIMARY KEY,
  quantidade integer NOT NULL,
  categoria VARCHAR(255) NOT NULL,
  data timestamp with time zone NOT NULL,
  atividade_id INTEGER NOT NULL REFERENCES macrocontrole.atividade (id)
);

CREATE INDEX monitoramento_apontamento_idx
    ON microcontrole.monitoramento_apontamento USING btree
    (data DESC)
    TABLESPACE pg_default;

CREATE TABLE microcontrole.monitoramento_tela(
  id SERIAL NOT NULL PRIMARY KEY,
  data timestamp with time zone NOT NULL,
  atividade_id INTEGER NOT NULL REFERENCES macrocontrole.atividade (id),
  geom geometry(POLYGON, 4674) NOT NULL
);

CREATE INDEX monitoramento_tela_geom
    ON microcontrole.monitoramento_tela USING gist
    (geom)
    TABLESPACE pg_default;

CREATE INDEX monitoramento_tela_idx
    ON microcontrole.monitoramento_tela USING btree
    (data DESC)
    TABLESPACE pg_default;


CREATE TABLE microcontrole.monitoramento_acao(
  id SERIAL NOT NULL PRIMARY KEY,
  data timestamp with time zone NOT NULL,
  atividade_id INTEGER NOT NULL REFERENCES macrocontrole.atividade (id)
);

CREATE INDEX monitoramento_acao_idx ON microcontrole.monitoramento_acao USING BRIN (data) WITH (pages_per_range = 32);

WITH dl AS (
SELECT data, LAG(data,1) OVER(ORDER BY data) AS previous_data
FROM microcontrole.monitoramento_acao
WHERE atividade_id = 1
)
SELECT 
SUM(CASE 
WHEN data::date = previous_data::date AND (60*DATE_PART('hour', data  - previous_data ) + DATE_PART('minute', data - previous_data )) < 10
THEN 60*DATE_PART('hour', data  - previous_data ) + DATE_PART('minute', data - previous_data )
ELSE 0
END) AS tempo
FROM dl WHERE data IS NOT NULL AND previous_data IS NOT NULL;

COMMIT;