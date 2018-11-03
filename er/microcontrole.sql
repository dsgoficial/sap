BEGIN;

CREATE SCHEMA microcontrole;

CREATE TABLE microcontrole.monitoramento_feicao(
  id SERIAL NOT NULL PRIMARY KEY,
  operacao VARCHAR(255) NOT NULL,
  camada VARCHAR(255) NOT NULL,
  usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
  quantidade integer NOT NULL,
  comprimento real,
  vertices integer,
  data timestamp with time zone NOT NULL,
  etapa_id INTEGER NOT NULL REFERENCES macrocontrole.etapa (id),
  unidade_trabalho_id INTEGER NOT NULL REFERENCES macrocontrole.unidade_trabalho (id)
);

CREATE INDEX monitoramento_feicao_idx
    ON microcontrole.monitoramento_feicao USING btree
    (data DESC)
    TABLESPACE pg_default;

CREATE TABLE microcontrole.monitoramento_apontamento(
  id SERIAL NOT NULL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
  quantidade integer NOT NULL,
  categoria VARCHAR(255) NOT NULL,
  data timestamp with time zone NOT NULL,
  etapa_id INTEGER NOT NULL REFERENCES macrocontrole.etapa (id),
  unidade_trabalho_id INTEGER NOT NULL REFERENCES macrocontrole.unidade_trabalho (id)
);

CREATE INDEX monitoramento_apontamento_idx
    ON microcontrole.monitoramento_apontamento USING btree
    (data DESC)
    TABLESPACE pg_default;

CREATE TABLE microcontrole.monitoramento_tela(
  id SERIAL NOT NULL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
  data timestamp with time zone NOT NULL,
  etapa_id INTEGER NOT NULL REFERENCES macrocontrole.etapa (id),
  unidade_trabalho_id INTEGER NOT NULL REFERENCES macrocontrole.unidade_trabalho (id),
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