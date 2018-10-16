BEGIN;

CREATE SCHEMA microcontrole;

CREATE TABLE microcontrole.monitoramento_feicao(
  id SERIAL NOT NULL PRIMARY KEY,
  operacao VARCHAR(255) NOT NULL,
  usuario VARCHAR(255) NOT NULL,
  quantidade integer NOT NULL,
  comprimento real,
  vertices integer,
  data timestamp with time zone NOT NULL,
  etapa INTEGER NOT NULL REFERENCES macrocontrole.etapa (id),
  unidade_trabalho INTEGER NOT NULL REFERENCES macrocontrole.unidade_trabalho (id)
);

CREATE INDEX monitoramento_feicao_idx
    ON microcontrole.monitoramento_feicao USING btree
    (data DESC)
    TABLESPACE pg_default;

CREATE TABLE microcontrole.monitoramento_apontamento(
  id SERIAL NOT NULL PRIMARY KEY,
  operacao VARCHAR(255) NOT NULL,
  usuario VARCHAR(255) NOT NULL,
  quantidade integer NOT NULL,
  data timestamp with time zone NOT NULL,
  etapa INTEGER NOT NULL REFERENCES macrocontrole.etapa (id),
  unidade_trabalho INTEGER NOT NULL REFERENCES macrocontrole.unidade_trabalho (id)
);

CREATE INDEX monitoramento_apontamento_idx
    ON microcontrole.monitoramento_apontamento USING btree
    (data DESC)
    TABLESPACE pg_default;

CREATE TABLE microcontrole.monitoramento_tela(
  id SERIAL NOT NULL PRIMARY KEY,
  usuario VARCHAR(255) NOT NULL,
  data timestamp with time zone NOT NULL,
  etapa INTEGER NOT NULL REFERENCES macrocontrole.etapa (id),
  unidade_trabalho INTEGER NOT NULL REFERENCES macrocontrole.unidade_trabalho (id),
  geom geometry(POLYGON, 4674) NOT NULL, 
);

CREATE INDEX monitoramento_apontamento_idx
    ON microcontrole.monitoramento_apontamento USING btree
    (data DESC)
    TABLESPACE pg_default;


GRANT USAGE ON SCHEMA microcontrole TO controle_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA microcontrole TO controle_app;
GRANT ALL ON ALL SEQUENCES IN SCHEMA microcontrole TO controle_app;

COMMIT;