BEGIN;

CREATE SCHEMA acompanhamento;

CREATE VIEW acompanhamento.usuarios_sem_atividades AS
SELECT u.id AS usuario_id, u.nome_guerra, u.posto_grad, u.turno
FROM dgeo.usuario AS u
LEFT JOIN 
(SELECT id, usuario_id FROM macrocontrole.atividade AS ee WHERE ee.situacao = 2) AS ee
ON ee.usuario_id = u.id
WHERE ee.id IS NULL AND u.ativo IS TRUE
ORDER BY u.nome_guerra;

CREATE VIEW acompanhamento.ultimo_login AS
SELECT u.id AS usuario_id, u.nome_guerra, u.posto_grad, u.turno, l.data_login
FROM dgeo.usuario AS u
INNER JOIN
(SELECT usuario_id, max(data_login) as data_login FROM dgeo.login GROUP BY usuario_id) AS l
ON l.usuario_id = u.id
WHERE u.ativo IS TRUE
ORDER BY l.data_login DESC;

CREATE VIEW acompanhamento.usuarios_logados AS
SELECT u.id AS usuario_id, u.nome_guerra, u.posto_grad, u.turno, l.data_login
FROM dgeo.usuario AS u
INNER JOIN
(SELECT usuario_id, max(data_login) as data_login FROM dgeo.login GROUP BY usuario_id) AS l
ON l.usuario_id = u.id
WHERE l.data_login::date = now()::date

CREATE VIEW acompanhamento.atividades_em_execucao AS
SELECT ee.unidade_trabalho_id, ee.etapa_id, ee.usuario_id, ee.data_inicio 
FROM macrocontrole.atividade AS ee 
WHERE ee.situacao = 2
ORDER BY ee.data_inicio ASC

CREATE VIEW acompanhamento.atividades_finalizadas AS
SELECT ee.unidade_trabalho_id, ee.etapa_id, ee.usuario_id, ee.data_inicio, ee.data_fim
FROM macrocontrole.atividade AS ee 
WHERE ee.situacao = 4
ORDER BY ee.data_fim DESC
LIMIT 100

CREATE OR REPLACE FUNCTION macrocontrole.cria_view_acompanhamento()
  RETURNS trigger AS
$BODY$
    DECLARE view_txt text;
    DECLARE jointxt text := '';
    DECLARE subfase_ident integer;
    DECLARE num integer;
    DECLARE subfase_nome text;
    DECLARE nome_fixed text;
    DECLARE r record;
    DECLARE iterator integer := 1;
    BEGIN

    IF TG_OP = 'DELETE' THEN
      subfase_ident := OLD.subfase_id;
    ELSE
      subfase_ident := NEW.subfase_id;
    END IF;

    SELECT translate(replace(lower(nome),' ', '_'),  
          'áàâãäåaaaéèêëeeeeeìíîïìiiióôõöoooòùúûüuuuuçñý',  
          'aaaaaaaaaeeeeeeeeeiiiiiiiioooooooouuuuuuuucny')
          INTO subfase_nome FROM macrocontrole.subfase WHERE id = subfase_ident;

    EXECUTE 'DROP VIEW IF EXISTS acompanhamento.acompanhamento_'|| subfase_ident || '_' || subfase_nome;

    SELECT count(*) INTO num FROM macrocontrole.etapa WHERE subfase_id = subfase_ident;
    IF num > 0 THEN
      view_txt := 'CREATE VIEW acompanhamento.acompanhamento_' || subfase_ident || '_'  || subfase_nome || ' AS 
      SELECT ut.id, ut.disponivel, ut.lote_id, ut.nome, ut.banco_dados_id, ut.prioridade, ut.geom';

      FOR r IN SELECT se.id, e.nome FROM macrocontrole.tipo_etapa AS e 
      INNER JOIN macrocontrole.etapa AS se ON e.id = se.tipo_etapa_id
      WHERE se.subfase_id = subfase_ident
      ORDER BY se.ordem
      LOOP
        SELECT translate(replace(lower(r.nome),' ', '_'),  
          'áàâãäåaaaéèêëeeeeeìíîïìiiióôõöoooòùúûüuuuuçñý',  
          'aaaaaaaaaeeeeeeeeeiiiiiiiioooooooouuuuuuuucny')
          INTO nome_fixed;

        view_txt := view_txt || ', CASE WHEN ee' || iterator || '.etapa_id IS NULL THEN ''-'' ELSE  ee' || iterator || '.usuario_id::text END AS ' || nome_fixed || '_usuario_id';
        view_txt := view_txt || ', CASE WHEN ee' || iterator || '.etapa_id IS NULL THEN ''-'' ELSE  u' || iterator || '.tipo_turno_id::text END AS ' || nome_fixed || '_turno';
        view_txt := view_txt || ', CASE WHEN ee' || iterator || '.etapa_id IS NULL THEN ''-'' ELSE  ee' || iterator || '.tipo_situacao_id::text END AS ' || nome_fixed || '_situacao';
        view_txt := view_txt || ', CASE WHEN ee' || iterator || '.etapa_id IS NULL THEN ''-'' ELSE  ee' || iterator || '.data_inicio::text END AS ' || nome_fixed || '_data_inicio';
        view_txt := view_txt || ', CASE WHEN ee' || iterator || '.etapa_id IS NULL THEN ''-'' ELSE  ee' || iterator || '.data_fim::text END AS ' || nome_fixed || '_data_fim';
        jointxt := jointxt || ' LEFT JOIN macrocontrole.atividade as ee' || iterator || ' ON ee' || iterator || '.unidade_trabalho_id = ut.id and ee' || iterator || '.etapa_id = ' || r.id;
        jointxt := jointxt || ' LEFT JOIN dgeo.usuario as u' || iterator || ' ON u' || iterator || '.id = ee' || iterator || '.usuario_id';
        iterator := iterator + 1;
      END LOOP;

      view_txt := view_txt || ' FROM macrocontrole.unidade_trabalho AS ut';
      view_txt := view_txt || jointxt;
      view_txt := view_txt || ' WHERE ut.subfase_id = ' || subfase_ident;
      view_txt := view_txt || ' ORDER BY ut.prioridade;';

      EXECUTE view_txt;

    END IF;

    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;

    END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION macrocontrole.cria_view_acompanhamento()
  OWNER TO postgres;


CREATE TRIGGER cria_view_acompanhamento
AFTER UPDATE OR INSERT OR DELETE ON macrocontrole.etapa
FOR EACH ROW EXECUTE PROCEDURE macrocontrole.cria_view_acompanhamento();

COMMIT;