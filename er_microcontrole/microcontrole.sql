BEGIN;
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE SCHEMA microcontrole;

CREATE TABLE microcontrole.tipo_operacao(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO microcontrole.tipo_operacao (code, nome) VALUES
(1, 'INSERT'),
(2, 'DELETE'),
(3, 'UPDATE ATRIBUTE'),
(4, 'UPDATE GEOM');

CREATE TABLE microcontrole.monitoramento_feicao(
  id SERIAL NOT NULL PRIMARY KEY,
  tipo_operacao_id SMALLINT NOT NULL REFERENCES microcontrole.tipo_operacao (code),
  camada varchar(255) NOT NULL,
  quantidade integer NOT NULL,
  comprimento real NOT NULL,
  vertices integer NOT NULL,
  data timestamp with time zone NOT NULL,
  atividade_id INTEGER NOT NULL,
  usuario_id INTEGER NOT NULL
);

CREATE INDEX monitoramento_feicao_idx
    ON microcontrole.monitoramento_feicao USING btree
    (data DESC)
    TABLESPACE pg_default;

CREATE TABLE microcontrole.monitoramento_tela(
  id SERIAL NOT NULL PRIMARY KEY,
  data timestamp with time zone NOT NULL,
  zoom REAL NOT NULL,
  atividade_id INTEGER NOT NULL,
  usuario_id INTEGER NOT NULL,
  geom geometry(POLYGON, 4326) NOT NULL
);

CREATE INDEX monitoramento_tela_geom
    ON microcontrole.monitoramento_tela USING gist
    (geom)
    TABLESPACE pg_default;

CREATE INDEX monitoramento_tela_idx
    ON microcontrole.monitoramento_tela USING btree
    (data DESC)
    TABLESPACE pg_default;

CREATE INDEX monitoramento_tela_data_idx ON microcontrole.monitoramento_tela USING BRIN (data) WITH (pages_per_range = 128);
CREATE INDEX monitoramento_tela_atividade_id_idx ON microcontrole.monitoramento_tela (atividade_id);

COMMIT;