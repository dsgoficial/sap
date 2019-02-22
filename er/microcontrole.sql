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

CREATE INDEX monitoramento_monitoramento_geom
    ON microcontrole.monitoramento_tela USING gist
    (geom)
    TABLESPACE pg_default;

CREATE INDEX monitoramento_monitoramento_idx
    ON microcontrole.monitoramento_tela USING btree
    (data DESC)
    TABLESPACE pg_default;

COMMIT;