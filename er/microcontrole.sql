BEGIN;

-- Schema microcontrole DENTRO do banco do SAP: guarda o PERFIL de monitoramento
-- (qual subfase de qual lote e monitorada e como). Nao confundir com o banco de
-- microcontrole (er_microcontrole/), que guarda a TELEMETRIA capturada pelo plugin
-- (monitoramento_feicao, monitoramento_tela) e vive numa conexao separada.
--
-- Estas tabelas nasceram na migracao version_update/update_210_220.sql e nunca
-- foram trazidas para o er/, entao instalacoes novas (feitas a partir do er/)
-- ficavam sem elas, e microcontrole_ctrl.getPerfilMonitoramento, que consulta pelo
-- sapConn, respondia 500.

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
