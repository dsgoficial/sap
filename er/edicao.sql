BEGIN;

CREATE SCHEMA edicao;

CREATE TABLE edicao.quadro_fase(
    id SERIAL NOT NULL PRIMARY KEY
);

COMMIT;