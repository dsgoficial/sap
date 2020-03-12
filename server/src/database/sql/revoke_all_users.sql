/*
    Retorna SQL de revoke de todos os usuarios
*/
SELECT string_agg(query, ' ') AS revoke_query FROM (
	SELECT 'DROP POLICY ' || policyname || ' ON ' || schemaname || '.' || tablename || ';' AS query
	FROM pg_policies
	UNION ALL
	SELECT DISTINCT 'REVOKE ALL ON TABLE ' || table_schema || '.' || table_name || ' FROM ' || grantee || ';' AS query
	FROM information_schema.table_privileges
	WHERE table_schema NOT IN ('information_schema') AND table_schema !~ '^pg_'
	UNION ALL
	SELECT DISTINCT 'ALTER TABLE ' || table_schema || '.' || table_name || ' DISABLE ROW LEVEL SECURITY;' AS query
	FROM information_schema.table_privileges
	WHERE table_schema NOT IN ('information_schema', 'public') AND table_schema !~ '^pg_'
	UNION ALL
	SELECT DISTINCT 'REVOKE ALL ON FUNCTION ' || routine_schema || '.' || routine_name || '(' 
		||  pg_get_function_identity_arguments(
			(regexp_matches(specific_name, E'.*\_([0-9]+)'))[1]::oid) || ') FROM ' || grantee || ';'  AS query
	FROM information_schema.routine_privileges
	WHERE routine_schema NOT IN ('information_schema', 'public', 'PUBLIC') AND routine_schema !~ '^pg_'
	UNION ALL
	SELECT 'REVOKE ALL ON SEQUENCE ' || ss.sequence_schema || '.' || ss.sequence_name || ' FROM ' || rtg.grantee || ';'  AS query
	FROM information_schema.sequences AS ss CROSS JOIN (SELECT DISTINCT grantee FROM information_schema.role_table_grants) AS rtg
	UNION ALL
	SELECT 'REVOKE ALL ON SCHEMA ' || ss.schema_name || ' FROM ' || rtg.grantee || ';'  AS query
	FROM information_schema.schemata AS ss CROSS JOIN (SELECT DISTINCT grantee FROM information_schema.role_table_grants) AS rtg
	WHERE ss.schema_name NOT IN ('information_schema') AND ss.schema_name  !~ '^pg_'
	UNION ALL
	SELECT 'REVOKE CONNECT ON DATABASE ' || current_database() || ' FROM ' || rtg.grantee || ';' AS query
	FROM (SELECT DISTINCT grantee FROM information_schema.role_table_grants) AS rtg
) AS foo;