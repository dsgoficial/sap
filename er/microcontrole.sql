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
  atividade_id INTEGER NOT NULL REFERENCES macrocontrole.atividade (id),
  usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id)
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
  atividade_id INTEGER NOT NULL REFERENCES macrocontrole.atividade (id),
  usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id)
);

CREATE INDEX monitoramento_apontamento_idx
    ON microcontrole.monitoramento_apontamento USING btree
    (data DESC)
    TABLESPACE pg_default;

CREATE TABLE microcontrole.monitoramento_tela(
  id SERIAL NOT NULL PRIMARY KEY,
  data timestamp with time zone NOT NULL,
  zoom REAL NOT NULL,
  atividade_id INTEGER NOT NULL REFERENCES macrocontrole.atividade (id),
  usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
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

CREATE INDEX monitoramento_comportamento_data_idx ON microcontrole.monitoramento_comportamento USING BRIN (data) WITH (pages_per_range = 128);
CREATE INDEX monitoramento_comportamento_atividade_id_idx ON microcontrole.monitoramento_comportamento (atividade_id);

CREATE TABLE microcontrole.monitoramento_comportamento(
  id SERIAL NOT NULL PRIMARY KEY,
  data timestamp with time zone NOT NULL,
  atividade_id INTEGER NOT NULL REFERENCES macrocontrole.atividade (id),
  usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
  propriedade VARCHAR(255) NOT NULL,
  valor VARCHAR(255) NOT NULL
);

CREATE INDEX monitoramento_comportamento_data_idx ON microcontrole.monitoramento_comportamento USING BRIN (data) WITH (pages_per_range = 128);
CREATE INDEX monitoramento_comportamento_atividade_id_idx ON microcontrole.monitoramento_comportamento (atividade_id);

COMMIT;