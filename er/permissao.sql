CREATE OR REPLACE FUNCTION macrocontrole.modifica_permissao_atividade()
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
ALTER FUNCTION macrocontrole.modifica_permissao_ut()
  OWNER TO postgres;


CREATE TRIGGER modifica_permissao_ut
AFTER UPDATE OR INSERT OR DELETE ON macrocontrole.unidade_trabalho
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
