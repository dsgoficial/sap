CREATE OR REPLACE FUNCTION macrocontrole.cria_view_acompanhamento()
  RETURNS trigger AS
$BODY$
    DECLARE view text;
    DECLARE jointxt text := '';
    DECLARE wheretxt text := '';
    DECLARE subfase integer;
    DECLARE num integer;
    DECLARE subfase_nome text;
    DECLARE r record;
    DECLARE iterator integer := 1;
    BEGIN

    IF TG_OP = 'DELETE' THEN
      subfase := OLD.subfase_id;
    ELSE
      subfase := NEW.subfase_id;
    END IF;

    SELECT nome INTO subfase_nome FROM macrocontrole.subfase WHERE id = subfase;

    EXECUTE 'DROP VIEW IF EXISTS monitoramento.acompanhamento_'|| subfase || '_' || subfase_nome ||;

    SELECT count(*) INTO num FROM macrocontrole.subfase_etapa WHERE subfase_id = subfase;
    IF num > 0 THEN
      view := 'CREATE VIEW monitoramento.acompanhamento_' || subfase || '_' || subfase_nome || ' AS 
      SELECT ut.id, ut.nome, ut.banco_dados_id, ut.subfase_id, ut.prioridade, ut.geom';

      FOR r IN SELECT se.id, e.nome FROM macrocontrole.etapa AS e 
      INNER JOIN macrocontrole.subfase_etapa AS se ON e.id = se.etapa_id
      WHERE se.subfase_id = subfase
      ORDER BY se.ordem
      LOOP
        

        view := view || ', CASE WHEN ee' || iterator || '.etapa_subfase_id IS NULL THEN ''-'' ELSE  ee' || iterator || '.operador_atual END AS ' || r.nome || '_operador_atual';
        view := view || ', CASE WHEN ee' || iterator || '.etapa_subfase_id IS NULL THEN ''-'' ELSE  ee' || iterator || '.data_inicio END AS ' || r.nome || '_data_inicio';
        view := view || ', CASE WHEN ee' || iterator || '.etapa_subfase_id IS NULL THEN ''-'' ELSE  ee' || iterator || '.data_fim END AS ' || r.nome || 'data_fim';
        jointxt := jointxt || ' LEFT JOIN macrocontrole.execucao_etapa as ee' || iterator || ' ON ee' || iterator || '.unidade_trabalho_id = ut.id';
        wheretxt : = wheretxt || ' AND (ee' || iterator || '.etapa_subfase_id = ' || r.id || 'OR ee' || iterator || '.etapa_subfase_id IS NULL)';
        iterator := iterator + 1;
      END LOOP;

      view := view || ' FROM macrocontrole.unidade_trabalho AS ut';
      view := view || jointxt;
      view := view || ' WHERE ut.subfase_id = ' || subfase || wheretxt;
      view := view || ' ORDER BY ut.prioridade;';

      EXECUTE view;
    END IF;

    END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION public.cria_view_acompanhamento()
  OWNER TO postgres;


CREATE TRIGGER cria_view_acompanhamento
AFTER UPDATE, INSERT, DELETE ON macrocontrole.subfase_etapa
FOR EACH ROW EXECUTE PROCEDURE public.cria_view_acompanhamento()