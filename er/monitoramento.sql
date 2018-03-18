BEGIN;

CREATE SCHEMA monitoramento;

GRANT USAGE ON SCHEMA monitoramento TO public;
GRANT SELECT ON ALL TABLES IN SCHEMA monitoramento TO public;

COMMIT;