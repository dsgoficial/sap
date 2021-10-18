/*
    Retorna SQL de revoke
*/
SELECT string_agg(query, ' ') AS revoke_query FROM (
	SELECT DISTINCT 'REVOKE ALL ON TABLE ' || table_schema || '.' || table_name || ' FROM ' || $1 || ';' AS query
	FROM information_schema.table_privileges
	WHERE grantee ~* $1 AND table_schema NOT IN ('information_schema') AND table_schema !~ '^pg_'
	UNION ALL
	SELECT DISTINCT 'REVOKE ALL ON FUNCTION ' || routine_schema || '.' || routine_name || '(' 
		||  pg_get_function_identity_arguments(
			(regexp_matches(specific_name, E'.*\_([0-9]+)'))[1]::oid) || ') FROM ' || $1 || ';'  AS query
	FROM information_schema.routine_privileges
	WHERE grantee ~* $1 AND routine_schema != 'pg_catalog'
	UNION ALL
	SELECT 'REVOKE ALL ON SEQUENCE ' || sequence_schema || '.' || sequence_name || ' FROM ' || $1 || ';'  AS query
	FROM information_schema.sequences
	UNION ALL
	SELECT 'REVOKE ALL ON SCHEMA ' || schema_name || ' FROM ' || $1 || ';'  AS query
	FROM information_schema.schemata
	WHERE schema_name NOT IN ('information_schema') AND schema_name !~ '^pg_'
	UNION ALL
	SELECT 'REVOKE CONNECT ON DATABASE ' || current_database() || ' FROM ' || $1 || ';' AS query
	UNION ALL
	SELECT 'DROP POLICY ' || policyname || ' ON ' || schemaname || '.' || tablename || ';' AS query
	FROM pg_policies
	WHERE $1 = ANY(roles)
) AS foo;