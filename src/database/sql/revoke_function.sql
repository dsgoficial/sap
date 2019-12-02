/*
    Cria função que revoga todas as permissões de um usuário no banco
*/
CREATE OR REPLACE FUNCTION sap.sap_revoke_all(username text) RETURNS boolean AS $$
 DECLARE sql1 text;
 DECLARE sql2 text;
 DECLARE sql3 text;
 DECLARE sql4 text;

BEGIN
	WITH r AS (SELECT username As param_role_name)
	SELECT DISTINCT string_agg('REVOKE ALL ON TABLE ' || table_schema || '.' || table_name || ' FROM ' || r.param_role_name || ';', ' ') INTO sql1
	FROM information_schema.table_privileges CROSS JOIN r
	WHERE grantee ~* r.param_role_name;
	
	WITH r AS (SELECT username As param_role_name)
	SELECT string_agg(sql, ' ') INTO sql2 FROM
	(SELECT DISTINCT 'REVOKE ALL ON FUNCTION ' || routine_schema || '.' || routine_name || '(' 
		||  pg_get_function_identity_arguments(
			(regexp_matches(specific_name, E'.*\_([0-9]+)'))[1]::oid) || ') FROM ' || r.param_role_name || ';' AS sql 
	FROM information_schema.routine_privileges CROSS JOIN r
	WHERE grantee ~* r.param_role_name) AS foo;

	WITH r AS (SELECT username As param_role_name)
	SELECT string_agg('REVOKE ALL ON SEQUENCE ' || sequence_schema || '.' || sequence_name || ' FROM ' || r.param_role_name || ';', ' ') INTO sql3
	FROM information_schema.sequences CROSS JOIN r;
	
	WITH r AS (SELECT username As param_role_name)
	SELECT string_agg('REVOKE ALL ON SCHEMA ' || schema_name || ' FROM ' || r.param_role_name || ';', ' ') INTO sql4
	FROM information_schema.schemata CROSS JOIN r;

	IF sql1 IS NOT NULL THEN
	EXECUTE sql1;
	END IF;
	
	IF sql2 IS NOT NULL THEN
	EXECUTE sql2;
	END IF;
	
	IF sql3 IS NOT NULL THEN
	EXECUTE sql3;
	END IF;

	IF sql4 IS NOT NULL THEN
	EXECUTE sql4;
	END IF;

	RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
ALTER FUNCTION public.sap_revoke_all(text)
  OWNER TO postgres;