BEGIN;

CREATE SCHEMA edicao;

CREATE TABLE edicao.informacao_edicao(
    id SERIAL NOT NULL PRIMARY KEY,
    pec_planimetrico VARCHAR(1) NOT NULL,
    pec_altimetrico VARCHAR(1) NOT NULL,
    datum_vertical VARCHAR(255) NOT NULL,
    origem_dados_altimetricos VARCHAR(255) NOT NULL,
    territorio_internacional BOOLEAN NOT NULL,
    acesso_restrito BOOLEAN NOT NULL,
    lote_id INTEGER NOT NULL REFERENCES macrocontrole.lote (id)
);
--quadro de fases
--dados de terceiro
--outras chaves do json

COMMIT;