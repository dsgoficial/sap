BEGIN;

CREATE SCHEMA acompanhamento;

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

        view_txt := view_txt || ', CASE WHEN ee' || iterator || '.etapa_id IS NULL THEN ''-'' ELSE  ee' || iterator || '.operador_atual::text END AS ' || nome_fixed || '_operador_atual';
        view_txt := view_txt || ', CASE WHEN ee' || iterator || '.etapa_id IS NULL THEN ''-'' ELSE  u' || iterator || '.tipo_turno_id::text END AS ' || nome_fixed || '_turno';
        view_txt := view_txt || ', CASE WHEN ee' || iterator || '.etapa_id IS NULL THEN ''-'' ELSE  ee' || iterator || '.tipo_situacao_id::text END AS ' || nome_fixed || '_situacao';
        view_txt := view_txt || ', CASE WHEN ee' || iterator || '.etapa_id IS NULL THEN ''-'' ELSE  ee' || iterator || '.data_inicio::text END AS ' || nome_fixed || '_data_inicio';
        view_txt := view_txt || ', CASE WHEN ee' || iterator || '.etapa_id IS NULL THEN ''-'' ELSE  ee' || iterator || '.data_fim::text END AS ' || nome_fixed || '_data_fim';
        jointxt := jointxt || ' LEFT JOIN macrocontrole.execucao_etapa as ee' || iterator || ' ON ee' || iterator || '.unidade_trabalho_id = ut.id and ee' || iterator || '.etapa_id = ' || r.id;
        jointxt := jointxt || ' LEFT JOIN dgeo.usuario as u' || iterator || ' ON u' || iterator || '.id = ee' || iterator || '.operador_atual';
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