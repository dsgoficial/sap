BEGIN;

CREATE SCHEMA microcontrole;

CREATE TABLE microcontrole.tipo_monitoramento(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO microcontrole.tipo_monitoramento (code, nome) VALUES
(1, 'Monitoramento de feição'),
(2, 'Monitoramento de tela');

CREATE TABLE microcontrole.perfil_monitoramento(
	id SERIAL NOT NULL PRIMARY KEY,
	tipo_monitoramento_id SMALLINT NOT NULL REFERENCES microcontrole.tipo_monitoramento (code),
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	lote_id INTEGER NOT NULL REFERENCES macrocontrole.lote (id),
	UNIQUE(tipo_monitoramento_id,subfase_id,lote_id)
);

COMMIT;