CREATE EXTENSION dblink;

GRANT ALL ON FUNCTION dblink_connect_u(text) TO public; --Verificar quem deve ter essa permissão
GRANT ALL ON FUNCTION dblink_connect_u(text,text) TO public;

CREATE OR REPLACE FUNCTION macrocontrole.modifica_permissao_atividade()
  RETURNS trigger AS
$BODY$
    DECLARE query text;
    DECLARE logintxt text;
    DECLARE layertxt text;
    DECLARE dbname text;
    DECLARE dbconnection text;

    BEGIN
		IF TG_OP = 'INSERT' AND NEW.tipo_situacao_id = 2 AND NEW.usuario_id THEN
    -- Da permissão para usuario NEW
      SELECT login INTO logintxt FROM dgeo.usuario WHERE id = NEW.usuario_id;

      SELECT string_agg (format('%I.%I', c.schema, c.nome), ',') INTO layertxt
        FROM macrocontrole.etapa AS e
        INNER JOIN   macrocontrole.perfil_propriedades_camada AS ppc ON ppc.subfase_id = e.subfase_id
        INNER JOIN macrocontrole.camada AS c ON ppc.camada_id = c.id
        WHERE  e.id = NEW.etapa_id;


      query := 'GRANT ALL ON TABLE ' || layertxt || ' TO ' || logintxt || ';';

      SELECT bd.nome, 'dbname=' || bd.nome ||' port=' || bd.porta ||' hostaddr=' || bd.servidor || ' user=USER password=PASSWORD' INTO dbname, dbconnection
      FROM macrocontrole.unidade_trabalho AS ut
      INNER JOIN macrocontrole.banco_dados AS bd ON bd.id = ut.banco_dados_id
      WHERE ut.id = NEW.unidade_trabalho_id

		END IF;

		IF TG_OP = 'UPDATE' AND NEW.etapa_id = OLD.etapa_id THEN
      -- FIXME testar se os bd relacionado as unidades de trabalho mudaram

      IF NEW.tipo_situacao_id = 2 AND OLD.tipo_situacao_id = 2 AND NEW.usuario_id != OLD.usuario_id THEN
      --Remove permissao old e da New

      SELECT login INTO logintxt FROM dgeo.usuario WHERE id = NEW.usuario_id;

      SELECT string_agg (format('%I.%I', c.schema, c.nome), ',') INTO layertxt
        FROM macrocontrole.etapa AS e
        INNER JOIN   macrocontrole.perfil_propriedades_camada AS ppc ON ppc.subfase_id = e.subfase_id
        INNER JOIN macrocontrole.camada AS c ON ppc.camada_id = c.id
        WHERE  e.id = NEW.etapa_id;


      query := 'GRANT ALL ON TABLE ' || layertxt || ' TO ' || logintxt || ';';

      SELECT login INTO logintxt FROM dgeo.usuario WHERE id = OLD.usuario_id;

      query := query || ' REVOKE ALL ON TABLE ' || layertxt || ' TO ' || logintxt || ';';

      END;

      IF NEW.tipo_situacao_id = 2 AND OLD.tipo_situacao_id != 2 THEN
      --Da permissao New
      SELECT login INTO logintxt FROM dgeo.usuario WHERE id = NEW.usuario_id;

      SELECT string_agg (format('%I.%I', c.schema, c.nome), ',') INTO layertxt
        FROM macrocontrole.etapa AS e
        INNER JOIN   macrocontrole.perfil_propriedades_camada AS ppc ON ppc.subfase_id = e.subfase_id
        INNER JOIN macrocontrole.camada AS c ON ppc.camada_id = c.id
        WHERE  e.id = NEW.etapa_id;


      query := 'GRANT ALL ON TABLE ' || layertxt || ' TO ' || logintxt || ';';

      END;

      IF NEW.tipo_situacao_id != 2 AND OLD.tipo_situacao_id = 2 THEN
      --Remove permissao Old
      SELECT login INTO logintxt FROM dgeo.usuario WHERE id = OLD.usuario_id;

      SELECT string_agg (format('%I.%I', c.schema, c.nome), ',') INTO layertxt
        FROM macrocontrole.etapa AS e
        INNER JOIN   macrocontrole.perfil_propriedades_camada AS ppc ON ppc.subfase_id = e.subfase_id
        INNER JOIN macrocontrole.camada AS c ON ppc.camada_id = c.id
        WHERE  e.id = OLD.etapa_id;


      query := 'REVOKE ALL ON TABLE ' || layertxt || ' TO ' || logintxt || ';';

      END;

		END IF;

		IF TG_OP = 'UPDATE' AND NEW.etapa_id != OLD.etapa_id THEN
      --FIXME o que ocorre quando muda a etapa






		END IF;

		IF TG_OP = 'DELETE' AND OLD.tipo_situacao_id = 2 AND OLD.usuario_id THEN
        --remove permissao OLD
        SELECT login INTO logintxt FROM dgeo.usuario WHERE id = OLD.usuario_id;

        SELECT string_agg (format('%I.%I', c.schema, c.nome), ',') INTO layertxt
          FROM macrocontrole.etapa AS e
          INNER JOIN   macrocontrole.perfil_propriedades_camada AS ppc ON ppc.subfase_id = e.subfase_id
          INNER JOIN macrocontrole.camada AS c ON ppc.camada_id = c.id
          WHERE  e.id = OLD.etapa_id;


        query := 'REVOKE ALL ON TABLE ' || layertxt || ' TO ' || logintxt || ';';

        SELECT bd.nome, 'dbname=' || bd.nome ||' port=' || bd.porta ||' hostaddr=' || bd.servidor || ' user=USER password=PASSWORD' INTO dbname, dbconnection
        FROM macrocontrole.unidade_trabalho AS ut
        INNER JOIN macrocontrole.banco_dados AS bd ON bd.id = ut.banco_dados_id
        WHERE ut.id = OLD.unidade_trabalho_id

		END IF;

		SELECT dbname = ANY (dblink_get_connections()) INTO test;
		IF test THEN
			PERFORM dblink(dbname,query);
		ELSE
			PERFORM dblink_connect_u(dbname, dbconnection);
			PERFORM dblink(dbname,query);
		END IF;

    END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION macrocontrole.modifica_permissao_atividade()
  OWNER TO postgres;

CREATE TRIGGER modifica_permissao_atividade
AFTER UPDATE OR INSERT OR DELETE ON macrocontrole.atividade
FOR EACH ROW EXECUTE PROCEDURE macrocontrole.modifica_permissao_atividade();


CREATE OR REPLACE FUNCTION macrocontrole.modifica_permissao_propriedades_camada()
  RETURNS trigger AS
$BODY$
    DECLARE ppc_ident integer;
    DECLARE query_text text;
    DECLARE r record;
    BEGIN
      FOR r in SELECT bd.nome AS bd_nome, bd.servidor AS bd_servidor, bd.porta AS bd_porta, c.schema, c.nome AS camada, u.login FROM macrocontrole.atividade AS a
      INNER JOIN dgeo.usuario AS u ON u.id = a.usuario_id
      INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
      INNER JOIN macrocontrole.perfil_propriedades_camada AS ppc ON ppc.etapa_id = e.id
      INNER JOIN macrocontrole.camada AS c ON c.id = ppc.camada_id
      INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
      INNER JOIN macrocontrole.banco_dados AS bd ON bd.id = ut.banco_dados_id
      WHERE ppc.id = ppc_ident AND a.situacao_id = 2
      ORDER BY f.ordem
      LOOP
        query_text := 'GRANT '
      END LOOP;

    END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION macrocontrole.modifica_permissao_propriedades_camada()
  OWNER TO postgres;

CREATE TRIGGER modifica_permissao_propriedades_camada
AFTER UPDATE OR INSERT OR DELETE ON macrocontrole.perfil_propriedades_camada
FOR EACH ROW EXECUTE PROCEDURE macrocontrole.modifica_permissao_propriedades_camada();

CREATE OR REPLACE FUNCTION macrocontrole.modifica_permissao_banco_dados()
  RETURNS trigger AS
$BODY$
    DECLARE view_txt text;
    DECLARE jointxt text := '';
    DECLARE linhaproducao_ident integer;
    DECLARE num integer;
    DECLARE linhaproducao_nome text;
    DECLARE nome_fixed text;
    DECLARE r record;
    DECLARE iterator integer := 1;
    BEGIN


    END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION macrocontrole.modifica_permissao_banco_dados()
  OWNER TO postgres;


CREATE TRIGGER modifica_permissao_banco_dados
AFTER UPDATE OR INSERT OR DELETE ON macrocontrole.banco_dados
FOR EACH ROW EXECUTE PROCEDURE macrocontrole.modifica_permissao_banco_dados();

CREATE OR REPLACE FUNCTION macrocontrole.modifica_permissao_ut()
  RETURNS trigger AS
$BODY$
    DECLARE query text;
    BEGIN
      IF NEW.banco_dados_id != OLD.banco_dados_id THEN
      -- FIXME e se mudou o ID da UT?
        SELECT * FROM macrocontrole.atividade AS a
        WHERE a.unidade_trabalho_id = NEW.unidade_trabalho_id AND a.tipo_situacao_id = 2

      END IF;

    END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION macrocontrole.modifica_permissao_ut()
  OWNER TO postgres;


CREATE TRIGGER modifica_permissao_ut
AFTER UPDATE ON macrocontrole.unidade_trabalho
FOR EACH ROW EXECUTE PROCEDURE macrocontrole.modifica_permissao_ut();

CREATE OR REPLACE FUNCTION macrocontrole.modifica_permissao_camada()
  RETURNS trigger AS
$BODY$
    DECLARE view_txt text;
    DECLARE jointxt text := '';
    DECLARE linhaproducao_ident integer;
    DECLARE num integer;
    DECLARE linhaproducao_nome text;
    DECLARE nome_fixed text;
    DECLARE r record;
    DECLARE iterator integer := 1;
    BEGIN


    END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION macrocontrole.modifica_permissao_camada()
  OWNER TO postgres;


CREATE TRIGGER modifica_permissao_camada
AFTER UPDATE OR INSERT OR DELETE ON macrocontrole.camada
FOR EACH ROW EXECUTE PROCEDURE macrocontrole.modifica_permissao_camada();

--FIXME trigger em mudanca de login do usuario 