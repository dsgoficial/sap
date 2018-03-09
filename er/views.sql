CREATE OR REPLACE VIEW macrocontrole.unidade_trabalho_transportes AS 
select ut.id, ut.nome, ut.banco_dados_id, ut.subfase_id, ut.prioridade, ut.geom,
ee1.operador_atual AS digit_operador_atual, t.nome as turno , ee1.data_inicio AS digit_data_inicio, ee1.data_fim AS digit_data_fim,
ee2.operador_atual AS rev1_operador_atual, ee2.data_inicio AS rev1_data_inicio, ee2.data_fim AS rev1_data_fim,
ee3.operador_atual AS cor1_operador_atual, ee3.data_inicio AS cor1_data_inicio, ee3.data_fim AS cor1_data_fim
from macrocontrole.unidade_trabalho as ut
INNER JOIN macrocontrole.execucao_etapa as ee1 ON ee1.unidade_trabalho_id = ut.id
INNER JOIN macrocontrole.execucao_etapa as ee2 ON ee2.unidade_trabalho_id = ut.id
INNER JOIN macrocontrole.execucao_etapa as ee3 ON ee3.unidade_trabalho_id = ut.id
LEFT JOIN sdt.usuario as u ON u.id = ee1.operador_atual
LEFT JOIN sdt.turno as t on t.code = u.turno
where ut.subfase_id = 1 and ee1.etapa_subfase_id = 1 and ee2.etapa_subfase_id = 2 and ee3.etapa_subfase_id = 3
ORDER BY ut.prioridade;

CREATE OR REPLACE FUNCTION macrocontrole.atualiza_view_ut_transportes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
   BEGIN
      IF TG_OP = 'INSERT' THEN
        RETURN NULL;
      ELSIF TG_OP = 'UPDATE' THEN
       UPDATE macrocontrole.execucao_etapa SET operador_atual = NEW.digit_operador_atual, data_inicio = NEW.digit_data_inicio, data_fim = NEW.digit_data_fim
       WHERE unidade_trabalho_id = OLD.id and etapa_subfase_id = 1;
       UPDATE macrocontrole.execucao_etapa SET operador_atual = NEW.rev1_operador_atual, data_inicio = NEW.rev1_data_inicio, data_fim = NEW.rev1_data_fim
       WHERE unidade_trabalho_id = OLD.id and etapa_subfase_id = 2;
       UPDATE macrocontrole.execucao_etapa SET operador_atual = NEW.cor1_operador_atual, data_inicio = NEW.cor1_data_inicio, data_fim = NEW.cor1_data_fim
       WHERE unidade_trabalho_id = OLD.id and etapa_subfase_id = 3;
       RETURN NEW;
      ELSIF TG_OP = 'DELETE' THEN
       RETURN NULL;
      END IF;
      RETURN NULL;
    END;
$function$;
GRANT EXECUTE ON FUNCTION macrocontrole.atualiza_view_ut_transportes() TO controle_app WITH GRANT OPTION;


CREATE TRIGGER atualiza_view_ut_transportes
    INSTEAD OF INSERT OR UPDATE OR DELETE ON
      macrocontrole.unidade_trabalho_transportes FOR EACH ROW EXECUTE PROCEDURE macrocontrole.atualiza_view_ut_transportes();

--##############################################################################################

CREATE OR REPLACE VIEW macrocontrole.unidade_trabalho_edificacoes AS 
select ut.id, ut.nome, ut.banco_dados_id, ut.subfase_id, ut.prioridade, ut.geom,
ee1.operador_atual AS digit_operador_atual, t.nome as turno , ee1.data_inicio AS digit_data_inicio, ee1.data_fim AS digit_data_fim,
ee2.operador_atual AS rev1_operador_atual, ee2.data_inicio AS rev1_data_inicio, ee2.data_fim AS rev1_data_fim,
ee3.operador_atual AS cor1_operador_atual, ee3.data_inicio AS cor1_data_inicio, ee3.data_fim AS cor1_data_fim
from macrocontrole.unidade_trabalho as ut
INNER JOIN macrocontrole.execucao_etapa as ee1 ON ee1.unidade_trabalho_id = ut.id
INNER JOIN macrocontrole.execucao_etapa as ee2 ON ee2.unidade_trabalho_id = ut.id
INNER JOIN macrocontrole.execucao_etapa as ee3 ON ee3.unidade_trabalho_id = ut.id
LEFT JOIN sdt.usuario as u ON u.id = ee1.operador_atual
LEFT JOIN sdt.turno as t on t.code = u.turno
where ut.subfase_id = 6 and ee1.etapa_subfase_id = 4 and ee2.etapa_subfase_id = 5 and ee3.etapa_subfase_id = 6
ORDER BY ut.prioridade;

CREATE OR REPLACE FUNCTION macrocontrole.atualiza_view_ut_edificacoes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
   BEGIN
      IF TG_OP = 'INSERT' THEN
        RETURN NULL;
      ELSIF TG_OP = 'UPDATE' THEN
       UPDATE macrocontrole.execucao_etapa SET operador_atual = NEW.digit_operador_atual, data_inicio = NEW.digit_data_inicio, data_fim = NEW.digit_data_fim
       WHERE unidade_trabalho_id = OLD.id and etapa_subfase_id = 4;
       UPDATE macrocontrole.execucao_etapa SET operador_atual = NEW.rev1_operador_atual, data_inicio = NEW.rev1_data_inicio, data_fim = NEW.rev1_data_fim
       WHERE unidade_trabalho_id = OLD.id and etapa_subfase_id = 5;
       UPDATE macrocontrole.execucao_etapa SET operador_atual = NEW.cor1_operador_atual, data_inicio = NEW.cor1_data_inicio, data_fim = NEW.cor1_data_fim
       WHERE unidade_trabalho_id = OLD.id and etapa_subfase_id = 6;
       RETURN NEW;
      ELSIF TG_OP = 'DELETE' THEN
       RETURN NULL;
      END IF;
      RETURN NULL;
    END;
$function$;
GRANT EXECUTE ON FUNCTION macrocontrole.atualiza_view_ut_edificacoes() TO controle_app WITH GRANT OPTION;


CREATE TRIGGER atualiza_view_ut_edificacoes
    INSTEAD OF INSERT OR UPDATE OR DELETE ON
      macrocontrole.unidade_trabalho_edificacoes FOR EACH ROW EXECUTE PROCEDURE macrocontrole.atualiza_view_ut_edificacoes();



--##############################################################################################

CREATE OR REPLACE VIEW macrocontrole.unidade_trabalho_vegetacao AS 
select ut.id, ut.nome, ut.banco_dados_id, ut.subfase_id, ut.prioridade, ut.geom,
ee1.operador_atual AS delimitadores_operador_atual, t.nome as turno_op_delimitadores, ee1.data_inicio AS delimitadores_data_inicio, ee1.data_fim AS delimitadores_data_fim,
ee2.operador_atual AS rev1_operador_atual, ee2.data_inicio AS rev1_data_inicio, ee2.data_fim AS rev1_data_fim,
ee3.operador_atual AS cor1_operador_atual, ee3.data_inicio AS cor1_data_inicio, ee3.data_fim AS cor1_data_fim,
ee4.operador_atual AS centroides_operador_atual, t.nome as turno_op_centroides , ee4.data_inicio AS centroides_data_inicio, ee4.data_fim AS centroides_data_fim,
ee5.operador_atual AS rev2_operador_atual, ee5.data_inicio AS rev2_data_inicio, ee5.data_fim AS rev2_data_fim,
ee6.operador_atual AS cor2_operador_atual, ee6.data_inicio AS cor2_data_inicio, ee6.data_fim AS cor2_data_fim
from macrocontrole.unidade_trabalho as ut
INNER JOIN macrocontrole.execucao_etapa as ee1 ON ee1.unidade_trabalho_id = ut.id
INNER JOIN macrocontrole.execucao_etapa as ee2 ON ee2.unidade_trabalho_id = ut.id
INNER JOIN macrocontrole.execucao_etapa as ee3 ON ee3.unidade_trabalho_id = ut.id
INNER JOIN macrocontrole.execucao_etapa as ee4 ON ee4.unidade_trabalho_id = ut.id
INNER JOIN macrocontrole.execucao_etapa as ee5 ON ee5.unidade_trabalho_id = ut.id
INNER JOIN macrocontrole.execucao_etapa as ee6 ON ee6.unidade_trabalho_id = ut.id
LEFT JOIN sdt.usuario as u ON u.id = ee1.operador_atual
LEFT JOIN sdt.turno as t on t.code = u.turno
where ut.subfase_id = 7 and ee1.etapa_subfase_id = 7 and ee2.etapa_subfase_id = 8 and ee3.etapa_subfase_id = 9
and ee4.etapa_subfase_id = 24 and ee5.etapa_subfase_id = 25 and ee6.etapa_subfase_id = 26
ORDER BY ut.prioridade;

CREATE OR REPLACE FUNCTION macrocontrole.atualiza_view_ut_vegetacao()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
   BEGIN
      IF TG_OP = 'INSERT' THEN
        RETURN NULL;
      ELSIF TG_OP = 'UPDATE' THEN
       UPDATE macrocontrole.execucao_etapa SET operador_atual = NEW.delimitadores_operador_atual, data_inicio = NEW.delimitadores_data_inicio, data_fim = NEW.delimitadores_data_fim
       WHERE unidade_trabalho_id = OLD.id and etapa_subfase_id = 7;
       UPDATE macrocontrole.execucao_etapa SET operador_atual = NEW.rev1_operador_atual, data_inicio = NEW.rev1_data_inicio, data_fim = NEW.rev1_data_fim
       WHERE unidade_trabalho_id = OLD.id and etapa_subfase_id = 8;
       UPDATE macrocontrole.execucao_etapa SET operador_atual = NEW.cor1_operador_atual, data_inicio = NEW.cor1_data_inicio, data_fim = NEW.cor1_data_fim
       WHERE unidade_trabalho_id = OLD.id and etapa_subfase_id = 9;
       UPDATE macrocontrole.execucao_etapa SET operador_atual = NEW.centroides_operador_atual, data_inicio = NEW.centroides_data_inicio, data_fim = NEW.centroides_data_fim
       WHERE unidade_trabalho_id = OLD.id and etapa_subfase_id = 24;
       UPDATE macrocontrole.execucao_etapa SET operador_atual = NEW.rev2_operador_atual, data_inicio = NEW.rev2_data_inicio, data_fim = NEW.rev2_data_fim
       WHERE unidade_trabalho_id = OLD.id and etapa_subfase_id = 25;
       UPDATE macrocontrole.execucao_etapa SET operador_atual = NEW.cor2_operador_atual, data_inicio = NEW.cor2_data_inicio, data_fim = NEW.cor2_data_fim
       WHERE unidade_trabalho_id = OLD.id and etapa_subfase_id = 26;
       RETURN NEW;
      ELSIF TG_OP = 'DELETE' THEN
       RETURN NULL;
      END IF;
      RETURN NULL;
    END;
$function$;
GRANT EXECUTE ON FUNCTION macrocontrole.atualiza_view_ut_vegetacao() TO controle_app WITH GRANT OPTION;


CREATE TRIGGER atualiza_view_ut_vegetacao
    INSTEAD OF INSERT OR UPDATE OR DELETE ON
      macrocontrole.unidade_trabalho_vegetacao FOR EACH ROW EXECUTE PROCEDURE macrocontrole.atualiza_view_ut_vegetacao();

--##############################################################################################


CREATE OR REPLACE VIEW macrocontrole.unidade_trabalho_transportes_sd_2017 AS 
select ut.id, ut.nome, ut.banco_dados_id, ut.subfase_id, ut.prioridade, ut.geom,
ee1.operador_atual AS digit_operador_atual, t.nome as turno , ee1.data_inicio AS digit_data_inicio, ee1.data_fim AS digit_data_fim,
ee2.operador_atual AS rev1_operador_atual, ee2.data_inicio AS rev1_data_inicio, ee2.data_fim AS rev1_data_fim,
ee3.operador_atual AS cor1_operador_atual, ee3.data_inicio AS cor1_data_inicio, ee3.data_fim AS cor1_data_fim
from macrocontrole.unidade_trabalho as ut
INNER JOIN macrocontrole.execucao_etapa as ee1 ON ee1.unidade_trabalho_id = ut.id
INNER JOIN macrocontrole.execucao_etapa as ee2 ON ee2.unidade_trabalho_id = ut.id
INNER JOIN macrocontrole.execucao_etapa as ee3 ON ee3.unidade_trabalho_id = ut.id
LEFT JOIN sdt.usuario as u ON u.id = ee1.operador_atual
LEFT JOIN sdt.turno as t on t.code = u.turno
where ut.subfase_id = 8 and ee1.etapa_subfase_id = 10 and ee2.etapa_subfase_id = 11 and ee3.etapa_subfase_id = 12
ORDER BY ut.prioridade;

CREATE OR REPLACE FUNCTION macrocontrole.atualiza_view_ut_transportes_sd_2017()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
   BEGIN
      IF TG_OP = 'INSERT' THEN
        RETURN NULL;
      ELSIF TG_OP = 'UPDATE' THEN
       UPDATE macrocontrole.execucao_etapa SET operador_atual = NEW.digit_operador_atual, data_inicio = NEW.digit_data_inicio, data_fim = NEW.digit_data_fim
       WHERE unidade_trabalho_id = OLD.id and etapa_subfase_id = 10;
       UPDATE macrocontrole.execucao_etapa SET operador_atual = NEW.rev1_operador_atual, data_inicio = NEW.rev1_data_inicio, data_fim = NEW.rev1_data_fim
       WHERE unidade_trabalho_id = OLD.id and etapa_subfase_id = 11;
       UPDATE macrocontrole.execucao_etapa SET operador_atual = NEW.cor1_operador_atual, data_inicio = NEW.cor1_data_inicio, data_fim = NEW.cor1_data_fim
       WHERE unidade_trabalho_id = OLD.id and etapa_subfase_id = 12;
       RETURN NEW;
      ELSIF TG_OP = 'DELETE' THEN
       RETURN NULL;
      END IF;
      RETURN NULL;
    END;
$function$;
GRANT EXECUTE ON FUNCTION macrocontrole.atualiza_view_ut_transportes_sd_2017() TO controle_app WITH GRANT OPTION;


CREATE TRIGGER atualiza_view_ut_transportes_sd_2017
    INSTEAD OF INSERT OR UPDATE OR DELETE ON
      macrocontrole.unidade_trabalho_transportes_sd_2017 FOR EACH ROW EXECUTE PROCEDURE macrocontrole.atualiza_view_ut_transportes_sd_2017();

--##############################################################################################



CREATE OR REPLACE VIEW macrocontrole.unidade_trabalho_area_edificada AS 
select ut.id, ut.nome, ut.banco_dados_id, ut.subfase_id, ut.prioridade, ut.geom,
ee1.operador_atual AS digit_operador_atual, t.nome as turno , ee1.data_inicio AS digit_data_inicio, ee1.data_fim AS digit_data_fim,
ee2.operador_atual AS rev_par_1_operador_atual, ee2.data_inicio AS rev_par_1_data_inicio, ee2.data_fim AS rev_par_1_data_fim
from macrocontrole.unidade_trabalho as ut
INNER JOIN macrocontrole.execucao_etapa as ee1 ON ee1.unidade_trabalho_id = ut.id
INNER JOIN macrocontrole.execucao_etapa as ee2 ON ee2.unidade_trabalho_id = ut.id
LEFT JOIN sdt.usuario as u ON u.id = ee1.operador_atual
LEFT JOIN sdt.turno as t on t.code = u.turno
where ut.subfase_id = 9 and ee1.etapa_subfase_id = 13 and ee2.etapa_subfase_id = 14
ORDER BY ut.prioridade;

CREATE OR REPLACE FUNCTION macrocontrole.atualiza_view_ut_area_edificada()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
   BEGIN
      IF TG_OP = 'INSERT' THEN
        RETURN NULL;
      ELSIF TG_OP = 'UPDATE' THEN
       UPDATE macrocontrole.execucao_etapa SET operador_atual = NEW.digit_operador_atual, data_inicio = NEW.digit_data_inicio, data_fim = NEW.digit_data_fim
       WHERE unidade_trabalho_id = OLD.id and etapa_subfase_id = 13;
       UPDATE macrocontrole.execucao_etapa SET operador_atual = NEW.rev_par_1_operador_atual, data_inicio = NEW.rev_par_1_data_inicio, data_fim = NEW.rev_par_1_data_fim
       WHERE unidade_trabalho_id = OLD.id and etapa_subfase_id = 14;
       RETURN NEW;
      ELSIF TG_OP = 'DELETE' THEN
       RETURN NULL;
      END IF;
      RETURN NULL;
    END;
$function$;
GRANT EXECUTE ON FUNCTION macrocontrole.atualiza_view_ut_area_edificada() TO controle_app WITH GRANT OPTION;


CREATE TRIGGER atualiza_view_ut_area_edificada
    INSTEAD OF INSERT OR UPDATE OR DELETE ON
      macrocontrole.unidade_trabalho_area_edificada FOR EACH ROW EXECUTE PROCEDURE macrocontrole.atualiza_view_ut_area_edificada();


--##############################################################################################


CREATE OR REPLACE VIEW macrocontrole.unidade_trabalho_validacao_sc AS 
select ut.id, ut.nome, bd.nome as banco_dados, bd.servidor, bd.porta, ut.subfase_id, ut.prioridade, ut.geom,
ee1.operador_atual AS valid_operador_atual, t.nome as turno , ee1.data_inicio AS valid_data_inicio, ee1.data_fim AS valid_data_fim
from macrocontrole.unidade_trabalho as ut
INNER JOIN macrocontrole.execucao_etapa as ee1 ON ee1.unidade_trabalho_id = ut.id
LEFT JOIN sdt.usuario as u ON u.id = ee1.operador_atual
LEFT JOIN sdt.turno as t on t.code = u.turno
LEFT JOIN macrocontrole.banco_dados as bd on bd.id = ut.banco_dados_id
where ut.subfase_id = 10 and ee1.etapa_subfase_id = 15
ORDER BY ut.prioridade;

CREATE OR REPLACE FUNCTION macrocontrole.atualiza_view_ut_validacao_sc()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
  DECLARE bd integer;
   BEGIN
      IF TG_OP = 'INSERT' THEN
        RETURN NULL;
      ELSIF TG_OP = 'UPDATE' THEN
       UPDATE macrocontrole.execucao_etapa SET operador_atual = NEW.valid_operador_atual, data_inicio = NEW.valid_data_inicio, data_fim = NEW.valid_data_fim
       WHERE unidade_trabalho_id = OLD.id and etapa_subfase_id = 15;
       IF NEW.banco_dados IS NOT NULL AND NEW.banco_dados != '' then
        SELECT id FROM macrocontrole.banco_dados WHERE nome = NEW.banco_dados into bd;
        IF bd IS NULL AND NEW.banco_dados IS NOT NULL AND NEW.servidor IS NOT NULL AND NEW.porta IS NOT NULL then
          INSERT INTO macrocontrole.banco_dados (nome, servidor, porta) VALUES (NEW.banco_dados,NEW.servidor,NEW.porta) RETURNING id INTO bd;
        END IF;
        UPDATE macrocontrole.unidade_trabalho SET banco_dados_id = bd WHERE id = OLD.id;
       ELSE
        UPDATE macrocontrole.unidade_trabalho SET banco_dados_id = null WHERE id = OLD.id;       
       end if;
       RETURN NEW;
      ELSIF TG_OP = 'DELETE' THEN
       RETURN NULL;
      END IF;
      RETURN NULL;
    END;
$function$;
GRANT EXECUTE ON FUNCTION macrocontrole.atualiza_view_ut_validacao_sc() TO controle_app WITH GRANT OPTION;


CREATE TRIGGER atualiza_view_ut_validacao_sc
    INSTEAD OF INSERT OR UPDATE OR DELETE ON
      macrocontrole.unidade_trabalho_validacao_sc FOR EACH ROW EXECUTE PROCEDURE macrocontrole.atualiza_view_ut_validacao_sc();


--##############################################################################################


CREATE OR REPLACE VIEW macrocontrole.unidade_trabalho_continuo_sc AS 
select ut.id, ut.nome, bd.nome as banco_dados, bd.servidor, bd.porta, ut.subfase_id, ut.prioridade, ut.geom,
ee1.operador_atual AS cont_operador_atual, t.nome as turno , ee1.data_inicio AS cont_data_inicio, ee1.data_fim AS cont_data_fim
from macrocontrole.unidade_trabalho as ut
INNER JOIN macrocontrole.execucao_etapa as ee1 ON ee1.unidade_trabalho_id = ut.id
LEFT JOIN sdt.usuario as u ON u.id = ee1.operador_atual
LEFT JOIN sdt.turno as t on t.code = u.turno
LEFT JOIN macrocontrole.banco_dados as bd on bd.id = ut.banco_dados_id
where ut.subfase_id = 12 and ee1.etapa_subfase_id = 23
ORDER BY ut.prioridade;

CREATE OR REPLACE FUNCTION macrocontrole.atualiza_view_ut_continuo_sc()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
  DECLARE bd integer;
   BEGIN
      IF TG_OP = 'INSERT' THEN
        RETURN NULL;
      ELSIF TG_OP = 'UPDATE' THEN
       UPDATE macrocontrole.execucao_etapa SET operador_atual = NEW.cont_operador_atual, data_inicio = NEW.cont_data_inicio, data_fim = NEW.cont_data_fim
       WHERE unidade_trabalho_id = OLD.id and etapa_subfase_id = 23;
       IF NEW.banco_dados IS NOT NULL AND NEW.banco_dados != '' then
        SELECT id FROM macrocontrole.banco_dados WHERE nome = NEW.banco_dados into bd;
        IF bd IS NULL AND NEW.banco_dados IS NOT NULL AND NEW.servidor IS NOT NULL AND NEW.porta IS NOT NULL then
          INSERT INTO macrocontrole.banco_dados (nome, servidor, porta) VALUES (NEW.banco_dados,NEW.servidor,NEW.porta) RETURNING id INTO bd;
        END IF;
        UPDATE macrocontrole.unidade_trabalho SET banco_dados_id = bd WHERE id = OLD.id;
       ELSE
        UPDATE macrocontrole.unidade_trabalho SET banco_dados_id = null WHERE id = OLD.id;       
       end if;
       RETURN NEW;
      ELSIF TG_OP = 'DELETE' THEN
       RETURN NULL;
      END IF;
      RETURN NULL;
    END;
$function$;
GRANT EXECUTE ON FUNCTION macrocontrole.atualiza_view_ut_continuo_sc() TO controle_app WITH GRANT OPTION;


CREATE TRIGGER atualiza_view_ut_continuo_sc
    INSTEAD OF INSERT OR UPDATE OR DELETE ON
      macrocontrole.unidade_trabalho_continuo_sc FOR EACH ROW EXECUTE PROCEDURE macrocontrole.atualiza_view_ut_continuo_sc();

--##############################################################################################

CREATE OR REPLACE VIEW macrocontrole.unidade_trabalho_edicao_sc AS 
select ut.id, ut.nome, bd.nome as banco_dados, bd.servidor, bd.porta, ut.subfase_id, ut.prioridade, ut.geom,
ee1.operador_atual AS prep_operador_atual, ee1.data_inicio AS prep_data_inicio, ee1.data_fim AS prep_data_fim,
ee2.operador_atual AS rev1_operador_atual, ee2.data_inicio AS rev1_data_inicio, ee2.data_fim AS rev1_data_fim,
ee3.operador_atual AS cor1_operador_atual, ee3.data_inicio AS cor1_data_inicio, ee3.data_fim AS cor1_data_fim,
ee4.operador_atual AS rev2_operador_atual, ee4.data_inicio AS rev2_data_inicio, ee4.data_fim AS rev2_data_fim,
ee5.operador_atual AS cor2_operador_atual, ee5.data_inicio AS cor2_data_inicio, ee5.data_fim AS cor2_data_fim,
ee6.operador_atual AS rev3_operador_atual, ee6.data_inicio AS rev3_data_inicio, ee6.data_fim AS rev3_data_fim,
ee7.operador_atual AS cor3_operador_atual, ee7.data_inicio AS cor3_data_inicio, ee7.data_fim AS cor3_data_fim
from macrocontrole.unidade_trabalho as ut
INNER JOIN macrocontrole.execucao_etapa as ee1 ON ee1.unidade_trabalho_id = ut.id
INNER JOIN macrocontrole.execucao_etapa as ee2 ON ee2.unidade_trabalho_id = ut.id
INNER JOIN macrocontrole.execucao_etapa as ee3 ON ee3.unidade_trabalho_id = ut.id
INNER JOIN macrocontrole.execucao_etapa as ee4 ON ee4.unidade_trabalho_id = ut.id
INNER JOIN macrocontrole.execucao_etapa as ee5 ON ee5.unidade_trabalho_id = ut.id
INNER JOIN macrocontrole.execucao_etapa as ee6 ON ee6.unidade_trabalho_id = ut.id
INNER JOIN macrocontrole.execucao_etapa as ee7 ON ee7.unidade_trabalho_id = ut.id
LEFT JOIN sdt.usuario as u ON u.id = ee1.operador_atual
LEFT JOIN sdt.turno as t on t.code = u.turno
LEFT JOIN macrocontrole.banco_dados as bd on bd.id = ut.banco_dados_id
where ut.subfase_id = 11 and ee1.etapa_subfase_id = 16 and ee2.etapa_subfase_id = 17 and ee3.etapa_subfase_id = 18
and ee4.etapa_subfase_id = 19 and ee5.etapa_subfase_id = 20 and ee6.etapa_subfase_id = 21 and ee7.etapa_subfase_id = 22
ORDER BY ut.prioridade;

CREATE OR REPLACE FUNCTION macrocontrole.atualiza_view_ut_edicao_sc()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
  DECLARE bd integer;
   BEGIN
      IF TG_OP = 'INSERT' THEN
        RETURN NULL;
      ELSIF TG_OP = 'UPDATE' THEN
       UPDATE macrocontrole.execucao_etapa SET operador_atual = NEW.prep_operador_atual, data_inicio = NEW.prep_data_inicio, data_fim = NEW.prep_data_fim
       WHERE unidade_trabalho_id = OLD.id and etapa_subfase_id = 16;
       UPDATE macrocontrole.execucao_etapa SET operador_atual = NEW.rev1_operador_atual, data_inicio = NEW.rev1_data_inicio, data_fim = NEW.rev1_data_fim
       WHERE unidade_trabalho_id = OLD.id and etapa_subfase_id = 17;
       UPDATE macrocontrole.execucao_etapa SET operador_atual = NEW.cor1_operador_atual, data_inicio = NEW.cor1_data_inicio, data_fim = NEW.cor1_data_fim
       WHERE unidade_trabalho_id = OLD.id and etapa_subfase_id = 18;
       UPDATE macrocontrole.execucao_etapa SET operador_atual = NEW.rev2_operador_atual, data_inicio = NEW.rev2_data_inicio, data_fim = NEW.rev2_data_fim
       WHERE unidade_trabalho_id = OLD.id and etapa_subfase_id = 19;
       UPDATE macrocontrole.execucao_etapa SET operador_atual = NEW.cor2_operador_atual, data_inicio = NEW.cor2_data_inicio, data_fim = NEW.cor2_data_fim
       WHERE unidade_trabalho_id = OLD.id and etapa_subfase_id = 20;
       UPDATE macrocontrole.execucao_etapa SET operador_atual = NEW.rev3_operador_atual, data_inicio = NEW.rev3_data_inicio, data_fim = NEW.rev3_data_fim
       WHERE unidade_trabalho_id = OLD.id and etapa_subfase_id = 21;
       UPDATE macrocontrole.execucao_etapa SET operador_atual = NEW.cor3_operador_atual, data_inicio = NEW.cor3_data_inicio, data_fim = NEW.cor3_data_fim
       WHERE unidade_trabalho_id = OLD.id and etapa_subfase_id = 22;
       IF NEW.banco_dados IS NOT NULL AND NEW.banco_dados != '' then
        SELECT id FROM macrocontrole.banco_dados WHERE nome = NEW.banco_dados into bd;
        IF bd IS NULL AND NEW.banco_dados IS NOT NULL AND NEW.servidor IS NOT NULL AND NEW.porta IS NOT NULL then
          INSERT INTO macrocontrole.banco_dados (nome, servidor, porta) VALUES (NEW.banco_dados,NEW.servidor,NEW.porta) RETURNING id INTO bd;
        END IF;
        UPDATE macrocontrole.unidade_trabalho SET banco_dados_id = bd WHERE id = OLD.id;
       ELSE
        UPDATE macrocontrole.unidade_trabalho SET banco_dados_id = null WHERE id = OLD.id;       
       end if;

       RETURN NEW;
      ELSIF TG_OP = 'DELETE' THEN
       RETURN NULL;
      END IF;
      RETURN NULL;
    END;
$function$;
GRANT EXECUTE ON FUNCTION macrocontrole.atualiza_view_ut_edicao_sc() TO controle_app WITH GRANT OPTION;


CREATE TRIGGER atualiza_view_ut_edicao_sc
    INSTEAD OF INSERT OR UPDATE OR DELETE ON
      macrocontrole.unidade_trabalho_edicao_sc FOR EACH ROW EXECUTE PROCEDURE macrocontrole.atualiza_view_ut_edicao_sc();