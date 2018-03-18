CREATE OR REPLACE FUNCTION macrocontrole.cria_view_acompanhamento()
  RETURNS trigger AS
$BODY$
    DECLARE view text;
    DECLARE jointxt text := '';
    DECLARE wheretxt text := '';
    DECLARE subfase_nome text;
    DECLARE r record;
    DECLARE iterator float4 := 1;
    BEGIN

    SELECT nome INTO subfase_nome FROM macrocontrole.subfase WHERE id = NEW.subfase_id;

    EXECUTE 'DROP VIEW IF EXISTS macrocontrole.acompanhamento_'|| NEW.subfase_id || '_' || subfase_nome ||;

    view := 'CREATE VIEW macrocontrole.acompanhamento_' || NEW.subfase_id || '_' || subfase_nome || ' AS 
    SELECT ut.id, ut.nome, ut.banco_dados_id, ut.subfase_id, ut.prioridade, ut.geom,';

    FOR r IN SELECT se.id, e.nome FROM macrocontrole.etapa AS e 
    INNER JOIN macrocontrole.subfase_etapa AS se ON e.id = se.etapa_id
    WHERE se.subfase_id = NEW.subfase_id
    ORDER BY se.ordem
    LOOP
      view := view || ' ee' || iterator || '.operador_atual AS ' || r.nome || '_operador_atual, ee' || iterator || '.data_inicio AS ' || r.nome || '_data_inicio, ee' || iterator || '.data_fim AS ' || r.nome || '_data_fim';
      jointxt := jointxt || ' INNER JOIN macrocontrole.execucao_etapa as ee' || iterator || ' ON ee' || iterator || '.unidade_trabalho_id = ut.id';
      wheretxt : = wheretxt || ' AND ee' || iterator || '.etapa_subfase_id = ' || r.id;
      iterator := iterator + 1;
    END LOOP;

    view := view || ' FROM macrocontrole.unidade_trabalho AS ut';
    view := view || jointxt;
    view := view || ' WHERE ut.subfase_id = ' || new.subfase_id || wheretxt;
    view := view || ' ORDER BY ut.prioridade;';

    EXECUTE view;

    END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION public.cria_view_acompanhamento()
  OWNER TO postgres;


CREATE TRIGGER cria_view_acompanhamento
AFTER UPDATE, INSERT, DELETE ON macrocontrole.subfase_etapa
FOR EACH ROW EXECUTE PROCEDURE public.cria_view_acompanhamento()