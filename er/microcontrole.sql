BEGIN;

CREATE SCHEMA microcontrole;

GRANT USAGE ON SCHEMA microcontrole TO controle_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA microcontrole TO controle_app;
GRANT ALL ON ALL SEQUENCES IN SCHEMA microcontrole TO controle_app;

COMMIT;