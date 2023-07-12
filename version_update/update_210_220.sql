BEGIN;

INSERT INTO dominio.tipo_produto (code, nome) VALUES
(23, 'Conjunto de dados geoespaciais vetoriais para Trafegabilidade');

ALTER TABLE macrocontrole.produto	
DROP CONSTRAINT chk_product_scale;

DROP FUNCTION IF EXISTS macrocontrole.chk_scale(integer, integer);

CREATE OR REPLACE FUNCTION macrocontrole.chk_scale() RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM macrocontrole.lote
        WHERE denominador_escala = NEW.denominador_escala
        AND id = NEW.lote_id
    ) THEN
        RAISE EXCEPTION 'Scale inconsistency detected';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
ALTER FUNCTION macrocontrole.chk_scale()
  OWNER TO postgres;

CREATE TRIGGER chk_product_scale
BEFORE INSERT OR UPDATE ON macrocontrole.produto
FOR EACH ROW EXECUTE PROCEDURE macrocontrole.chk_scale();

DROP TRIGGER IF EXISTS etapa_verifica_rev_corr ON macrocontrole.etapa;

DROP FUNCTION IF EXISTS macrocontrole.etapa_verifica_rev_corr();

CREATE OR REPLACE FUNCTION macrocontrole.chk_lote() RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM macrocontrole.subfase AS s
        INNER JOIN macrocontrole.fase AS f ON s.fase_id = f.id
        INNER JOIN macrocontrole.lote AS l ON l.linha_producao_id = f.linha_producao_id
        WHERE s.id = NEW.subfase_id AND l.id = NEW.lote_id 
    ) THEN
        RAISE EXCEPTION 'Lote inconsistency detected';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chk_lote_consistency
BEFORE INSERT OR UPDATE ON macrocontrole.etapa
FOR EACH ROW EXECUTE PROCEDURE macrocontrole.chk_lote();

ALTER TABLE macrocontrole.unidade_trabalho	
DROP CONSTRAINT chk_lote_consistency_ut;

DROP FUNCTION IF EXISTS macrocontrole.chk_lote_ut(integer, integer);

CREATE OR REPLACE FUNCTION macrocontrole.chk_lote_ut() RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM macrocontrole.subfase AS s
        INNER JOIN macrocontrole.fase AS f ON s.fase_id = f.id
        INNER JOIN macrocontrole.lote AS l ON l.linha_producao_id = f.linha_producao_id
        WHERE s.id = NEW.subfase_id AND l.id = NEW.lote_id 
    ) THEN
        RAISE EXCEPTION 'Lote inconsistency detected';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
ALTER FUNCTION macrocontrole.chk_lote_ut()
  OWNER TO postgres;
CREATE TRIGGER chk_lote_consistency_ut
BEFORE INSERT OR UPDATE ON macrocontrole.unidade_trabalho
FOR EACH ROW EXECUTE PROCEDURE macrocontrole.chk_lote_ut();

DROP TRIGGER IF EXISTS atividade_verifica_subfase ON macrocontrole.atividade;
DROP FUNCTION IF EXISTS macrocontrole.atividade_verifica_subfase();

CREATE OR REPLACE FUNCTION macrocontrole.atividade_verifica_subfase() RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM macrocontrole.etapa AS e
        INNER JOIN macrocontrole.unidade_trabalho AS ut ON NEW.etapa_id = e.id AND NEW.unidade_trabalho_id = ut.id
        WHERE e.subfase_id != ut.subfase_id OR e.lote_id != ut.lote_id
    ) THEN
        RETURN NEW;
    ELSE
        RAISE EXCEPTION 'Subfase or Lote inconsistency detected';
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chk_subfase_lote_consistency
BEFORE INSERT OR UPDATE ON macrocontrole.atividade
FOR EACH ROW EXECUTE PROCEDURE macrocontrole.atividade_verifica_subfase();

CREATE INDEX perfil_bloco_operador_usuario_id ON macrocontrole.perfil_bloco_operador ( usuario_id );

CREATE TABLE macrocontrole.relacionamento_ut (
  ut_id INTEGER NOT NULL,
  ut_re_id INTEGER NOT NULL,
  tipo_pre_requisito_id INTEGER NOT NULL,
  PRIMARY KEY (ut_id, ut_re_id)
);
CREATE OR REPLACE FUNCTION macrocontrole.handle_relacionamento_ut_insert_update(ut_ids INTEGER[])
RETURNS VOID AS $$
BEGIN
  DELETE FROM macrocontrole.relacionamento_ut
  WHERE ut_id = ANY(ut_ids) OR ut_re_id = ANY(ut_ids);
  DELETE FROM macrocontrole.relacionamento_produto
  WHERE ut_id = ANY(ut_ids);
  INSERT INTO macrocontrole.relacionamento_ut (ut_id, ut_re_id, tipo_pre_requisito_id)
  SELECT ut.id AS ut_id, ut_re.id AS ut_re_id, prs.tipo_pre_requisito_id
  FROM macrocontrole.unidade_trabalho AS ut
  INNER JOIN macrocontrole.pre_requisito_subfase AS prs ON prs.subfase_posterior_id = ut.subfase_id
  INNER JOIN macrocontrole.unidade_trabalho AS ut_re ON ut_re.subfase_id = prs.subfase_anterior_id AND ut.lote_id = ut_re.lote_id
  WHERE (ut.id = ANY(ut_ids) OR ut_re.id = ANY(ut_ids)) AND ut.geom && ut_re.geom AND st_relate(ut.geom, ut_re.geom, '2********');
  INSERT INTO macrocontrole.relacionamento_produto (p_id, ut_id)
  SELECT p.id AS p_id, ut.id AS ut_id
  FROM macrocontrole.produto AS p
  INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.lote_id = p.lote_id AND p.geom && ut.geom AND st_relate(p.geom, ut.geom, '2********')
  WHERE ut.id = ANY(ut_ids);
END;
$$ LANGUAGE plpgsql;
ALTER FUNCTION macrocontrole.handle_relacionamento_ut_insert_update(INTEGER[])
  OWNER TO postgres;
CREATE OR REPLACE FUNCTION macrocontrole.handle_relacionamento_ut_delete(ut_ids INTEGER[])
RETURNS VOID AS $$
BEGIN
  DELETE FROM macrocontrole.relacionamento_ut
  WHERE ut_id = ANY(ut_ids) OR ut_re_id = ANY(ut_ids);
  DELETE FROM macrocontrole.relacionamento_produto
  WHERE ut_id = ANY(ut_ids);
END;
$$ LANGUAGE plpgsql;
ALTER FUNCTION macrocontrole.handle_relacionamento_ut_delete(INTEGER[])
  OWNER TO postgres;
CREATE OR REPLACE FUNCTION macrocontrole.update_relacionamento_ut()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM macrocontrole.handle_relacionamento_ut_insert_update(ARRAY[NEW.id]);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM macrocontrole.handle_relacionamento_ut_delete(ARRAY[OLD.id]);
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;
ALTER FUNCTION macrocontrole.update_relacionamento_ut()
  OWNER TO postgres;
CREATE TRIGGER a_relacionamento_unidade_trabalho
AFTER INSERT OR UPDATE OR DELETE ON macrocontrole.unidade_trabalho
FOR EACH ROW
EXECUTE FUNCTION macrocontrole.update_relacionamento_ut();
CREATE OR REPLACE FUNCTION macrocontrole.update_relacionamento_ut_prs()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    DELETE FROM macrocontrole.relacionamento_ut AS ru
	WHERE EXISTS (
		SELECT 1
		FROM macrocontrole.unidade_trabalho AS ut
		INNER JOIN macrocontrole.pre_requisito_subfase AS prs ON prs.subfase_posterior_id = ut.subfase_id
		INNER JOIN macrocontrole.unidade_trabalho AS ut_re ON ut_re.subfase_id = prs.subfase_anterior_id AND ut.lote_id = ut_re.lote_id
		WHERE prs.subfase_anterior_id = OLD.subfase_anterior_id AND prs.subfase_posterior_id = OLD.subfase_posterior_id AND ut.geom && ut_re.geom AND st_relate(ut.geom, ut_re.geom, '2********')
		AND ru.ut_id = ut.id AND ru.ut_re_id = ut_re.id
	);
  END IF;
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    INSERT INTO macrocontrole.relacionamento_ut (ut_id, ut_re_id, tipo_pre_requisito_id)
    SELECT ut.id AS ut_id, ut_re.id AS ut_re_id, prs.tipo_pre_requisito_id
    FROM macrocontrole.unidade_trabalho AS ut
    INNER JOIN macrocontrole.pre_requisito_subfase AS prs ON prs.subfase_posterior_id = ut.subfase_id
    INNER JOIN macrocontrole.unidade_trabalho AS ut_re ON ut_re.subfase_id = prs.subfase_anterior_id AND ut.lote_id = ut_re.lote_id
    WHERE prs.subfase_anterior_id = NEW.subfase_anterior_id AND prs.subfase_posterior_id = NEW.subfase_posterior_id AND ut.geom && ut_re.geom AND st_relate(ut.geom, ut_re.geom, '2********');
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
ALTER FUNCTION macrocontrole.update_relacionamento_ut_prs()
  OWNER TO postgres;
CREATE TRIGGER a_relacionamento_pre_requisito_subfase
AFTER INSERT OR UPDATE OR DELETE ON macrocontrole.pre_requisito_subfase
FOR EACH ROW
EXECUTE FUNCTION macrocontrole.update_relacionamento_ut_prs();
CREATE TABLE macrocontrole.relacionamento_produto (
  p_id INTEGER NOT NULL,
  ut_id INTEGER NOT NULL,
  PRIMARY KEY (p_id, ut_id)
);
CREATE OR REPLACE FUNCTION macrocontrole.handle_relacionamento_produto_insert_update(p_ids INTEGER[])
RETURNS VOID AS $$
BEGIN
  DELETE FROM macrocontrole.relacionamento_produto
  WHERE p_id = ANY(p_ids);
  INSERT INTO macrocontrole.relacionamento_produto (p_id, ut_id)
  SELECT p.id AS p_id, ut.id AS ut_id
  FROM macrocontrole.produto AS p
  INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.lote_id = p.lote_id AND p.geom && ut.geom AND st_relate(p.geom, ut.geom, '2********')
  WHERE p.id = ANY(p_ids);
END;
$$ LANGUAGE plpgsql;
ALTER FUNCTION macrocontrole.handle_relacionamento_produto_insert_update(INTEGER[])
  OWNER TO postgres;
CREATE OR REPLACE FUNCTION macrocontrole.handle_relacionamento_produto_delete(p_ids INTEGER[])
RETURNS VOID AS $$
BEGIN
  DELETE FROM macrocontrole.relacionamento_produto
  WHERE p_id = ANY(p_ids);
END;
$$ LANGUAGE plpgsql;
ALTER FUNCTION macrocontrole.handle_relacionamento_produto_delete(INTEGER[])
  OWNER TO postgres;
CREATE OR REPLACE FUNCTION macrocontrole.update_relacionamento_produto()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM handle_relacionamento_produto_insert_update(ARRAY[NEW.id]);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM handle_relacionamento_produto_delete(ARRAY[OLD.id]);
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;
ALTER FUNCTION macrocontrole.update_relacionamento_produto()
  OWNER TO postgres;
CREATE TRIGGER a_relacionamento_produto
AFTER INSERT OR UPDATE OR DELETE ON macrocontrole.produto
FOR EACH ROW
EXECUTE FUNCTION macrocontrole.update_relacionamento_produto();

CREATE OR REPLACE FUNCTION acompanhamento.cria_view_acompanhamento_subfase(subfase_ident integer, lote_ident integer)
  RETURNS void AS
$$
    DECLARE view_txt text := '';
    DECLARE jointxt text := '';
    DECLARE wheretxt text := '';
    DECLARE num integer;
    DECLARE nome_fixed text;
    DECLARE r record;
    DECLARE iterator integer := 1;
    DECLARE estilo_txt text;
    DECLARE rules_txt text := '';
    DECLARE symbols_txt text := '';
    DECLARE tipo_txt text;
    DECLARE tipo_andamento_txt text;
    DECLARE tipo_pausada_txt text;
    DECLARE etapas_concluidas_txt text := '';
    DECLARE etapas_nome text := '';
    DECLARE exec_andamento_txt text;
    DECLARE exec_pausada_txt text;
    DECLARE rev_pausada_txt text;
    DECLARE revcor_pausada_txt text;
    DECLARE cor_pausada_txt text;
    DECLARE exec_txt text;
    DECLARE rev_txt text;
    DECLARE rev_andamento_txt text;
    DECLARE cor_txt text;
    DECLARE cor_andamento_txt text;
    DECLARE revcor_andamento_txt text;
    DECLARE revcor_txt text;
  BEGIN
    SELECT count(*) INTO num FROM macrocontrole.etapa WHERE subfase_id = subfase_ident AND lote_id = lote_ident;
    IF num > 0 THEN
      view_txt := 'CREATE MATERIALIZED VIEW acompanhamento.lote_' || lote_ident || '_subfase_' || subfase_ident || '  AS 
      SELECT ut.id, ut.lote_id, ut.subfase_id, ut.disponivel, rest_pre.id IS NOT NULL AS restrito_pre, rest_exec.id IS NOT NULL AS restrito_exec, l.nome AS bloco, ut.nome, ut.dificuldade, dp.configuracao_producao AS dado_producao, dp.configuracao_producao, tdp.nome AS tipo_dado_producao, ut.prioridade, ut.geom';

      exec_txt := '<symbol force_rhr="0" name="{{NUMERACAO}}" type="fill" clip_to_extent="1" alpha="1"> <layer class="SimpleFill" locked="0" enabled="1" pass="0"> <prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/> <prop k="color" v="215,25,28,128"/> <prop k="joinstyle" v="bevel"/> <prop k="offset" v="0,0"/> <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/> <prop k="offset_unit" v="MM"/> <prop k="outline_color" v="0,0,0,255"/> <prop k="outline_style" v="solid"/> <prop k="outline_width" v="0.26"/> <prop k="outline_width_unit" v="MM"/> <prop k="style" v="solid"/> <data_defined_properties> <Option type="Map"> <Option name="name" type="QString" value=""/> <Option name="properties"/> <Option name="type" type="QString" value="collection"/> </Option> </data_defined_properties> </layer> </symbol>';
      exec_andamento_txt := '<symbol force_rhr="0" name="{{NUMERACAO}}" type="fill" clip_to_extent="1" alpha="1"> <layer class="SimpleFill" locked="0" enabled="1" pass="0"> <prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/> <prop k="color" v="215,25,28,128"/> <prop k="joinstyle" v="bevel"/> <prop k="offset" v="0,0"/> <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/> <prop k="offset_unit" v="MM"/> <prop k="outline_color" v="0,0,0,255"/> <prop k="outline_style" v="solid"/> <prop k="outline_width" v="0.26"/> <prop k="outline_width_unit" v="MM"/> <prop k="style" v="solid"/> <data_defined_properties> <Option type="Map"> <Option name="name" type="QString" value=""/> <Option name="properties"/> <Option name="type" type="QString" value="collection"/> </Option> </data_defined_properties> </layer> <layer class="LinePatternFill" locked="0" enabled="1" pass="0"> <prop k="angle" v="45"/> <prop k="color" v="0,0,255,255"/> <prop k="distance" v="1"/> <prop k="distance_map_unit_scale" v="3x:0,0,0,0,0,0"/> <prop k="distance_unit" v="MM"/> <prop k="line_width" v="0.26"/> <prop k="line_width_map_unit_scale" v="3x:0,0,0,0,0,0"/> <prop k="line_width_unit" v="MM"/> <prop k="offset" v="0"/> <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/> <prop k="offset_unit" v="MM"/> <prop k="outline_width_map_unit_scale" v="3x:0,0,0,0,0,0"/> <prop k="outline_width_unit" v="MM"/> <data_defined_properties> <Option type="Map"> <Option name="name" type="QString" value=""/> <Option name="properties"/> <Option name="type" type="QString" value="collection"/> </Option> </data_defined_properties> <symbol force_rhr="0" name="@{{NUMERACAO}}@1" type="line" clip_to_extent="1" alpha="1"> <layer class="SimpleLine" locked="0" enabled="1" pass="0"> <prop k="capstyle" v="square"/> <prop k="customdash" v="5;2"/> <prop k="customdash_map_unit_scale" v="3x:0,0,0,0,0,0"/> <prop k="customdash_unit" v="MM"/> <prop k="draw_inside_polygon" v="0"/> <prop k="joinstyle" v="bevel"/> <prop k="line_color" v="0,0,0,255"/> <prop k="line_style" v="solid"/> <prop k="line_width" v="0.26"/> <prop k="line_width_unit" v="MM"/> <prop k="offset" v="0"/> <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/> <prop k="offset_unit" v="MM"/> <prop k="ring_filter" v="0"/> <prop k="use_custom_dash" v="0"/> <prop k="width_map_unit_scale" v="3x:0,0,0,0,0,0"/> <data_defined_properties> <Option type="Map"> <Option name="name" type="QString" value=""/> <Option name="properties"/> <Option name="type" type="QString" value="collection"/> </Option> </data_defined_properties> </layer> </symbol> </layer> </symbol>';
      exec_pausada_txt := '<symbol force_rhr="0" name="{{NUMERACAO}}" clip_to_extent="1" alpha="1" type="fill"><layer locked="0" enabled="1" pass="0" class="SimpleFill"><prop v="3x:0,0,0,0,0,0" k="border_width_map_unit_scale"/><prop v="215,25,28,128" k="color"/><prop v="bevel" k="joinstyle"/><prop v="0,0" k="offset"/><prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/><prop v="MM" k="offset_unit"/><prop v="0,0,0,255" k="outline_color"/><prop v="solid" k="outline_style"/><prop v="0.26" k="outline_width"/><prop v="MM" k="outline_width_unit"/><prop v="solid" k="style"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties></layer><layer locked="0" enabled="1" pass="0" class="GeometryGenerator"><prop v="Line" k="SymbolType"/><prop v=" intersection( &#xd;&#xa;&#x9;make_line(&#xd;&#xa;&#x9;&#x9;make_point(&#xd;&#xa;&#x9;&#x9;&#x9;x_max(bounds($geometry )),&#xd;&#xa;&#x9;&#x9;&#x9;(y_max(bounds($geometry )) + y_min( bounds( $geometry )))/2&#xd;&#xa;&#x9;&#x9;),&#xd;&#xa;&#x9;&#x9;make_point(&#xd;&#xa;&#x9;&#x9;&#x9;x_min(bounds($geometry )),&#xd;&#xa;&#x9;&#x9;&#x9;( y_max( bounds( $geometry )) + y_min( bounds( $geometry )))/2&#xd;&#xa;&#x9;&#x9;)&#xd;&#xa;&#x9;)&#xd;&#xa;, $geometry )&#xd;&#xa; " k="geometryModifier"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties><symbol force_rhr="0" name="@{{NUMERACAO}}@1" clip_to_extent="1" alpha="1" type="line"><layer locked="0" enabled="1" pass="0" class="SimpleLine"><prop v="square" k="capstyle"/><prop v="5;2" k="customdash"/><prop v="3x:0,0,0,0,0,0" k="customdash_map_unit_scale"/><prop v="MM" k="customdash_unit"/><prop v="0" k="draw_inside_polygon"/><prop v="bevel" k="joinstyle"/><prop v="255,255,255,255" k="line_color"/><prop v="solid" k="line_style"/><prop v="2" k="line_width"/><prop v="MM" k="line_width_unit"/><prop v="0" k="offset"/><prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/><prop v="MM" k="offset_unit"/><prop v="0" k="ring_filter"/><prop v="0" k="use_custom_dash"/><prop v="3x:0,0,0,0,0,0" k="width_map_unit_scale"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties></layer></symbol></layer><layer locked="0" enabled="1" pass="0" class="GeometryGenerator"><prop v="Line" k="SymbolType"/><prop v=" intersection( make_line(make_point((x_max( bounds( $geometry )) + x_min( bounds( $geometry )))/2, y_max( bounds( $geometry ))) ,make_point((x_max( bounds( $geometry )) + x_min( bounds( $geometry )))/2, y_min( bounds( $geometry )))), $geometry )" k="geometryModifier"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties><symbol force_rhr="0" name="@{{NUMERACAO}}@2" clip_to_extent="1" alpha="1" type="line"><layer locked="0" enabled="1" pass="0" class="SimpleLine"><prop v="square" k="capstyle"/><prop v="5;2" k="customdash"/><prop v="3x:0,0,0,0,0,0" k="customdash_map_unit_scale"/><prop v="MM" k="customdash_unit"/><prop v="0" k="draw_inside_polygon"/><prop v="bevel" k="joinstyle"/><prop v="255,255,255,255" k="line_color"/><prop v="solid" k="line_style"/><prop v="2" k="line_width"/><prop v="MM" k="line_width_unit"/><prop v="0" k="offset"/><prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/><prop v="MM" k="offset_unit"/><prop v="0" k="ring_filter"/><prop v="0" k="use_custom_dash"/><prop v="3x:0,0,0,0,0,0" k="width_map_unit_scale"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties></layer></symbol></layer><layer locked="0" enabled="1" pass="0" class="GeometryGenerator"><prop v="Line" k="SymbolType"/><prop v=" intersection( &#xd;&#xa;&#x9;make_line(&#xd;&#xa;&#x9;&#x9;make_point(&#xd;&#xa;&#x9;&#x9;&#x9;x_max(bounds($geometry )),&#xd;&#xa;&#x9;&#x9;&#x9;(y_max(bounds($geometry )) + y_min( bounds( $geometry )))/2&#xd;&#xa;&#x9;&#x9;),&#xd;&#xa;&#x9;&#x9;make_point(&#xd;&#xa;&#x9;&#x9;&#x9;x_min(bounds($geometry )),&#xd;&#xa;&#x9;&#x9;&#x9;( y_max( bounds( $geometry )) + y_min( bounds( $geometry )))/2&#xd;&#xa;&#x9;&#x9;)&#xd;&#xa;&#x9;)&#xd;&#xa;, $geometry )&#xd;&#xa; " k="geometryModifier"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties><symbol force_rhr="0" name="@{{NUMERACAO}}@3" clip_to_extent="1" alpha="1" type="line"><layer locked="0" enabled="1" pass="0" class="SimpleLine"><prop v="square" k="capstyle"/><prop v="5;2" k="customdash"/><prop v="3x:0,0,0,0,0,0" k="customdash_map_unit_scale"/><prop v="MM" k="customdash_unit"/><prop v="0" k="draw_inside_polygon"/><prop v="bevel" k="joinstyle"/><prop v="0,0,0,128" k="line_color"/><prop v="solid" k="line_style"/><prop v="1" k="line_width"/><prop v="MM" k="line_width_unit"/><prop v="0" k="offset"/><prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/><prop v="MM" k="offset_unit"/><prop v="0" k="ring_filter"/><prop v="0" k="use_custom_dash"/><prop v="3x:0,0,0,0,0,0" k="width_map_unit_scale"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties></layer></symbol></layer><layer locked="0" enabled="1" pass="0" class="GeometryGenerator"><prop v="Line" k="SymbolType"/><prop v=" intersection( make_line(make_point((x_max( bounds( $geometry )) + x_min( bounds( $geometry )))/2, y_max( bounds( $geometry ))) ,make_point((x_max( bounds( $geometry )) + x_min( bounds( $geometry )))/2, y_min( bounds( $geometry )))), $geometry )" k="geometryModifier"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties><symbol force_rhr="0" name="@{{NUMERACAO}}@4" clip_to_extent="1" alpha="1" type="line"><layer locked="0" enabled="1" pass="0" class="SimpleLine"><prop v="square" k="capstyle"/><prop v="5;2" k="customdash"/><prop v="3x:0,0,0,0,0,0" k="customdash_map_unit_scale"/><prop v="MM" k="customdash_unit"/><prop v="0" k="draw_inside_polygon"/><prop v="bevel" k="joinstyle"/><prop v="0,0,0,128" k="line_color"/><prop v="solid" k="line_style"/><prop v="1" k="line_width"/><prop v="MM" k="line_width_unit"/><prop v="0" k="offset"/><prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/><prop v="MM" k="offset_unit"/><prop v="0" k="ring_filter"/><prop v="0" k="use_custom_dash"/><prop v="3x:0,0,0,0,0,0" k="width_map_unit_scale"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties></layer></symbol></layer></symbol>';
      rev_txt := '<symbol force_rhr="0" name="{{NUMERACAO}}" type="fill" clip_to_extent="1" alpha="1"><layer class="SimpleFill" locked="0" enabled="1" pass="0"><prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="color" v="253,192,134,128"/><prop k="joinstyle" v="bevel"/><prop k="offset" v="0,0"/><prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="offset_unit" v="MM"/><prop k="outline_color" v="0,0,0,255"/><prop k="outline_style" v="solid"/><prop k="outline_width" v="0.26"/><prop k="outline_width_unit" v="MM"/><prop k="style" v="solid"/><data_defined_properties><Option type="Map"><Option name="name" type="QString" value=""/><Option name="properties"/><Option name="type" type="QString" value="collection"/></Option></data_defined_properties></layer><layer class="CentroidFill" locked="0" enabled="1" pass="0"><prop k="point_on_all_parts" v="1"/><prop k="point_on_surface" v="0"/><data_defined_properties><Option type="Map"><Option name="name" type="QString" value=""/><Option name="properties"/><Option name="type" type="QString" value="collection"/></Option></data_defined_properties><symbol force_rhr="0" name="@{{NUMERACAO}}@1" type="marker" clip_to_extent="1" alpha="1"><layer class="FontMarker" locked="0" enabled="1" pass="0"><prop k="angle" v="0"/><prop k="chr" v="{{ORDEM}}"/><prop k="color" v="0,0,0,255"/><prop k="font" v="Arial Black"/><prop k="horizontal_anchor_point" v="1"/><prop k="joinstyle" v="bevel"/><prop k="offset" v="0,-0.005"/><prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="offset_unit" v="MapUnit"/><prop k="outline_color" v="255,255,255,255"/><prop k="outline_width" v="0.0035"/><prop k="outline_width_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="outline_width_unit" v="MapUnit"/><prop k="size" v="0.045"/><prop k="size_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="size_unit" v="MapUnit"/><prop k="vertical_anchor_point" v="1"/><data_defined_properties><Option type="Map"><Option name="name" type="QString" value=""/><Option name="properties"/><Option name="type" type="QString" value="collection"/></Option></data_defined_properties></layer></symbol></layer></symbol>';
      rev_andamento_txt := '<symbol force_rhr="0" name="{{NUMERACAO}}" type="fill" clip_to_extent="1" alpha="1"><layer class="SimpleFill" locked="0" enabled="1" pass="0"><prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="color" v="253,192,134,128"/><prop k="joinstyle" v="bevel"/><prop k="offset" v="0,0"/><prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="offset_unit" v="MM"/><prop k="outline_color" v="0,0,0,255"/><prop k="outline_style" v="solid"/><prop k="outline_width" v="0.26"/><prop k="outline_width_unit" v="MM"/><prop k="style" v="solid"/><data_defined_properties><Option type="Map"><Option name="name" type="QString" value=""/><Option name="properties"/><Option name="type" type="QString" value="collection"/></Option></data_defined_properties></layer><layer class="LinePatternFill" locked="0" enabled="1" pass="0"><prop k="angle" v="45"/><prop k="color" v="0,0,255,255"/><prop k="distance" v="1"/><prop k="distance_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="distance_unit" v="MM"/><prop k="line_width" v="0.26"/><prop k="line_width_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="line_width_unit" v="MM"/><prop k="offset" v="0"/><prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="offset_unit" v="MM"/><prop k="outline_width_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="outline_width_unit" v="MM"/><data_defined_properties><Option type="Map"><Option name="name" type="QString" value=""/><Option name="properties"/><Option name="type" type="QString" value="collection"/></Option></data_defined_properties><symbol force_rhr="0" name="@{{NUMERACAO}}@1" type="line" clip_to_extent="1" alpha="1"><layer class="SimpleLine" locked="0" enabled="1" pass="0"><prop k="capstyle" v="square"/><prop k="customdash" v="5;2"/><prop k="customdash_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="customdash_unit" v="MM"/><prop k="draw_inside_polygon" v="0"/><prop k="joinstyle" v="bevel"/><prop k="line_color" v="0,0,0,255"/><prop k="line_style" v="solid"/><prop k="line_width" v="0.26"/><prop k="line_width_unit" v="MM"/><prop k="offset" v="0"/><prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="offset_unit" v="MM"/><prop k="ring_filter" v="0"/><prop k="use_custom_dash" v="0"/><prop k="width_map_unit_scale" v="3x:0,0,0,0,0,0"/><data_defined_properties><Option type="Map"><Option name="name" type="QString" value=""/><Option name="properties"/><Option name="type" type="QString" value="collection"/></Option></data_defined_properties></layer></symbol></layer><layer class="CentroidFill" locked="0" enabled="1" pass="0"><prop k="point_on_all_parts" v="1"/><prop k="point_on_surface" v="0"/><data_defined_properties><Option type="Map"><Option name="name" type="QString" value=""/><Option name="properties"/><Option name="type" type="QString" value="collection"/></Option></data_defined_properties><symbol force_rhr="0" name="@{{NUMERACAO}}@2" type="marker" clip_to_extent="1" alpha="1"><layer class="FontMarker" locked="0" enabled="1" pass="0"><prop k="angle" v="0"/><prop k="chr" v="{{ORDEM}}"/><prop k="color" v="0,0,0,255"/><prop k="font" v="Arial Black"/><prop k="horizontal_anchor_point" v="1"/><prop k="joinstyle" v="bevel"/><prop k="offset" v="0,-0.005"/><prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="offset_unit" v="MapUnit"/><prop k="outline_color" v="255,255,255,255"/><prop k="outline_width" v="0.0035"/><prop k="outline_width_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="outline_width_unit" v="MapUnit"/><prop k="size" v="0.045"/><prop k="size_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="size_unit" v="MapUnit"/><prop k="vertical_anchor_point" v="1"/><data_defined_properties><Option type="Map"><Option name="name" type="QString" value=""/><Option name="properties"/><Option name="type" type="QString" value="collection"/></Option></data_defined_properties></layer></symbol></layer></symbol>';
      rev_pausada_txt := '<symbol force_rhr="0" name="{{NUMERACAO}}" clip_to_extent="1" alpha="1" type="fill"><layer locked="0" enabled="1" pass="0" class="SimpleFill"><prop v="3x:0,0,0,0,0,0" k="border_width_map_unit_scale"/><prop v="253,192,134,128" k="color"/><prop v="bevel" k="joinstyle"/><prop v="0,0" k="offset"/><prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/><prop v="MM" k="offset_unit"/><prop v="0,0,0,255" k="outline_color"/><prop v="solid" k="outline_style"/><prop v="0.26" k="outline_width"/><prop v="MM" k="outline_width_unit"/><prop v="solid" k="style"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties></layer><layer locked="0" enabled="1" pass="0" class="GeometryGenerator"><prop v="Line" k="SymbolType"/><prop v=" intersection( &#xd;&#xa;&#x9;make_line(&#xd;&#xa;&#x9;&#x9;make_point(&#xd;&#xa;&#x9;&#x9;&#x9;x_max(bounds($geometry )),&#xd;&#xa;&#x9;&#x9;&#x9;(y_max(bounds($geometry )) + y_min( bounds( $geometry )))/2&#xd;&#xa;&#x9;&#x9;),&#xd;&#xa;&#x9;&#x9;make_point(&#xd;&#xa;&#x9;&#x9;&#x9;x_min(bounds($geometry )),&#xd;&#xa;&#x9;&#x9;&#x9;( y_max( bounds( $geometry )) + y_min( bounds( $geometry )))/2&#xd;&#xa;&#x9;&#x9;)&#xd;&#xa;&#x9;)&#xd;&#xa;, $geometry )" k="geometryModifier"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties><symbol force_rhr="0" name="@{{NUMERACAO}}@1" clip_to_extent="1" alpha="1" type="line"><layer locked="0" enabled="1" pass="0" class="SimpleLine"><prop v="square" k="capstyle"/><prop v="5;2" k="customdash"/><prop v="3x:0,0,0,0,0,0" k="customdash_map_unit_scale"/><prop v="MM" k="customdash_unit"/><prop v="0" k="draw_inside_polygon"/><prop v="bevel" k="joinstyle"/><prop v="255,255,255,255" k="line_color"/><prop v="solid" k="line_style"/><prop v="2" k="line_width"/><prop v="MM" k="line_width_unit"/><prop v="0" k="offset"/><prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/><prop v="MM" k="offset_unit"/><prop v="0" k="ring_filter"/><prop v="0" k="use_custom_dash"/><prop v="3x:0,0,0,0,0,0" k="width_map_unit_scale"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties></layer></symbol></layer><layer locked="0" enabled="1" pass="0" class="GeometryGenerator"><prop v="Line" k="SymbolType"/><prop v="intersection( make_line(make_point((x_max( bounds( $geometry )) + x_min( bounds( $geometry )))/2, y_max( bounds( $geometry ))) ,make_point((x_max( bounds( $geometry )) + x_min( bounds( $geometry )))/2, y_min( bounds( $geometry )))), $geometry )" k="geometryModifier"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties><symbol force_rhr="0" name="@{{NUMERACAO}}@2" clip_to_extent="1" alpha="1" type="line"><layer locked="0" enabled="1" pass="0" class="SimpleLine"><prop v="square" k="capstyle"/><prop v="5;2" k="customdash"/><prop v="3x:0,0,0,0,0,0" k="customdash_map_unit_scale"/><prop v="MM" k="customdash_unit"/><prop v="0" k="draw_inside_polygon"/><prop v="bevel" k="joinstyle"/><prop v="255,255,255,255" k="line_color"/><prop v="solid" k="line_style"/><prop v="1" k="line_width"/><prop v="MM" k="line_width_unit"/><prop v="0" k="offset"/><prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/><prop v="MM" k="offset_unit"/><prop v="0" k="ring_filter"/><prop v="0" k="use_custom_dash"/><prop v="3x:0,0,0,0,0,0" k="width_map_unit_scale"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties></layer></symbol></layer><layer locked="0" enabled="1" pass="0" class="GeometryGenerator"><prop v="Line" k="SymbolType"/><prop v=" intersection( &#xd;&#xa;&#x9;make_line(&#xd;&#xa;&#x9;&#x9;make_point(&#xd;&#xa;&#x9;&#x9;&#x9;x_max(bounds($geometry )),&#xd;&#xa;&#x9;&#x9;&#x9;(y_max(bounds($geometry )) + y_min( bounds( $geometry )))/2&#xd;&#xa;&#x9;&#x9;),&#xd;&#xa;&#x9;&#x9;make_point(&#xd;&#xa;&#x9;&#x9;&#x9;x_min(bounds($geometry )),&#xd;&#xa;&#x9;&#x9;&#x9;( y_max( bounds( $geometry )) + y_min( bounds( $geometry )))/2&#xd;&#xa;&#x9;&#x9;)&#xd;&#xa;&#x9;)&#xd;&#xa;, $geometry )" k="geometryModifier"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties><symbol force_rhr="0" name="@{{NUMERACAO}}@3" clip_to_extent="1" alpha="1" type="line"><layer locked="0" enabled="1" pass="0" class="SimpleLine"><prop v="square" k="capstyle"/><prop v="5;2" k="customdash"/><prop v="3x:0,0,0,0,0,0" k="customdash_map_unit_scale"/><prop v="MM" k="customdash_unit"/><prop v="0" k="draw_inside_polygon"/><prop v="bevel" k="joinstyle"/><prop v="0,0,0,128" k="line_color"/><prop v="solid" k="line_style"/><prop v="1" k="line_width"/><prop v="MM" k="line_width_unit"/><prop v="0" k="offset"/><prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/><prop v="MM" k="offset_unit"/><prop v="0" k="ring_filter"/><prop v="0" k="use_custom_dash"/><prop v="3x:0,0,0,0,0,0" k="width_map_unit_scale"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties></layer></symbol></layer><layer locked="0" enabled="1" pass="0" class="GeometryGenerator"><prop v="Line" k="SymbolType"/><prop v="intersection( make_line(make_point((x_max( bounds( $geometry )) + x_min( bounds( $geometry )))/2, y_max( bounds( $geometry ))) ,make_point((x_max( bounds( $geometry )) + x_min( bounds( $geometry )))/2, y_min( bounds( $geometry )))), $geometry )" k="geometryModifier"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties><symbol force_rhr="0" name="@{{NUMERACAO}}@4" clip_to_extent="1" alpha="1" type="line"><layer locked="0" enabled="1" pass="0" class="SimpleLine"><prop v="square" k="capstyle"/><prop v="5;2" k="customdash"/><prop v="3x:0,0,0,0,0,0" k="customdash_map_unit_scale"/><prop v="MM" k="customdash_unit"/><prop v="0" k="draw_inside_polygon"/><prop v="bevel" k="joinstyle"/><prop v="0,0,0,128" k="line_color"/><prop v="solid" k="line_style"/><prop v="1" k="line_width"/><prop v="MM" k="line_width_unit"/><prop v="0" k="offset"/><prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/><prop v="MM" k="offset_unit"/><prop v="0" k="ring_filter"/><prop v="0" k="use_custom_dash"/><prop v="3x:0,0,0,0,0,0" k="width_map_unit_scale"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties></layer></symbol></layer><layer locked="0" enabled="1" pass="0" class="CentroidFill"><prop v="1" k="point_on_all_parts"/><prop v="0" k="point_on_surface"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties><symbol force_rhr="0" name="@{{NUMERACAO}}@5" clip_to_extent="1" alpha="1" type="marker"><layer locked="0" enabled="1" pass="0" class="FontMarker"><prop v="0" k="angle"/><prop v="1" k="chr"/><prop v="0,0,0,255" k="color"/><prop v="Arial Black" k="font"/><prop v="1" k="horizontal_anchor_point"/><prop v="bevel" k="joinstyle"/><prop v="0,-0.005" k="offset"/><prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/><prop v="MapUnit" k="offset_unit"/><prop v="255,255,255,255" k="outline_color"/><prop v="0.0035" k="outline_width"/><prop v="3x:0,0,0,0,0,0" k="outline_width_map_unit_scale"/><prop v="MapUnit" k="outline_width_unit"/><prop v="0.045" k="size"/><prop v="3x:0,0,0,0,0,0" k="size_map_unit_scale"/><prop v="MapUnit" k="size_unit"/><prop v="1" k="vertical_anchor_point"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties></layer></symbol></layer></symbol>';
      cor_txt := '<symbol force_rhr="0" name="{{NUMERACAO}}" type="fill" clip_to_extent="1" alpha="1"><layer class="SimpleFill" locked="0" enabled="1" pass="0"><prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="color" v="255,255,153,128"/><prop k="joinstyle" v="bevel"/><prop k="offset" v="0,0"/><prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="offset_unit" v="MM"/><prop k="outline_color" v="0,0,0,255"/><prop k="outline_style" v="solid"/><prop k="outline_width" v="0.26"/><prop k="outline_width_unit" v="MM"/><prop k="style" v="solid"/><data_defined_properties><Option type="Map"><Option name="name" type="QString" value=""/><Option name="properties"/><Option name="type" type="QString" value="collection"/></Option></data_defined_properties></layer><layer class="CentroidFill" locked="0" enabled="1" pass="0"><prop k="point_on_all_parts" v="1"/><prop k="point_on_surface" v="0"/><data_defined_properties><Option type="Map"><Option name="name" type="QString" value=""/><Option name="properties"/><Option name="type" type="QString" value="collection"/></Option></data_defined_properties><symbol force_rhr="0" name="@{{NUMERACAO}}@1" type="marker" clip_to_extent="1" alpha="1"><layer class="FontMarker" locked="0" enabled="1" pass="0"><prop k="angle" v="0"/><prop k="chr" v="{{ORDEM}}"/><prop k="color" v="0,0,0,255"/><prop k="font" v="Arial Black"/><prop k="horizontal_anchor_point" v="1"/><prop k="joinstyle" v="bevel"/><prop k="offset" v="0,-0.005"/><prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="offset_unit" v="MapUnit"/><prop k="outline_color" v="255,255,255,255"/><prop k="outline_width" v="0.0035"/><prop k="outline_width_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="outline_width_unit" v="MapUnit"/><prop k="size" v="0.045"/><prop k="size_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="size_unit" v="MapUnit"/><prop k="vertical_anchor_point" v="1"/><data_defined_properties><Option type="Map"><Option name="name" type="QString" value=""/><Option name="properties"/><Option name="type" type="QString" value="collection"/></Option></data_defined_properties></layer></symbol></layer></symbol>';
      cor_andamento_txt := '<symbol force_rhr="0" name="{{NUMERACAO}}" type="fill" clip_to_extent="1" alpha="1"><layer class="SimpleFill" locked="0" enabled="1" pass="0"><prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="color" v="255,255,153,128"/><prop k="joinstyle" v="bevel"/><prop k="offset" v="0,0"/><prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="offset_unit" v="MM"/><prop k="outline_color" v="0,0,0,255"/><prop k="outline_style" v="solid"/><prop k="outline_width" v="0.26"/><prop k="outline_width_unit" v="MM"/><prop k="style" v="solid"/><data_defined_properties><Option type="Map"><Option name="name" type="QString" value=""/><Option name="properties"/><Option name="type" type="QString" value="collection"/></Option></data_defined_properties></layer><layer class="LinePatternFill" locked="0" enabled="1" pass="0"><prop k="angle" v="45"/><prop k="color" v="0,0,255,255"/><prop k="distance" v="1"/><prop k="distance_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="distance_unit" v="MM"/><prop k="line_width" v="0.26"/><prop k="line_width_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="line_width_unit" v="MM"/><prop k="offset" v="0"/><prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="offset_unit" v="MM"/><prop k="outline_width_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="outline_width_unit" v="MM"/><data_defined_properties><Option type="Map"><Option name="name" type="QString" value=""/><Option name="properties"/><Option name="type" type="QString" value="collection"/></Option></data_defined_properties><symbol force_rhr="0" name="@{{NUMERACAO}}@1" type="line" clip_to_extent="1" alpha="1"><layer class="SimpleLine" locked="0" enabled="1" pass="0"><prop k="capstyle" v="square"/><prop k="customdash" v="5;2"/><prop k="customdash_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="customdash_unit" v="MM"/><prop k="draw_inside_polygon" v="0"/><prop k="joinstyle" v="bevel"/><prop k="line_color" v="0,0,0,255"/><prop k="line_style" v="solid"/><prop k="line_width" v="0.26"/><prop k="line_width_unit" v="MM"/><prop k="offset" v="0"/><prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="offset_unit" v="MM"/><prop k="ring_filter" v="0"/><prop k="use_custom_dash" v="0"/><prop k="width_map_unit_scale" v="3x:0,0,0,0,0,0"/><data_defined_properties><Option type="Map"><Option name="name" type="QString" value=""/><Option name="properties"/><Option name="type" type="QString" value="collection"/></Option></data_defined_properties></layer></symbol></layer><layer class="CentroidFill" locked="0" enabled="1" pass="0"><prop k="point_on_all_parts" v="1"/><prop k="point_on_surface" v="0"/><data_defined_properties><Option type="Map"><Option name="name" type="QString" value=""/><Option name="properties"/><Option name="type" type="QString" value="collection"/></Option></data_defined_properties><symbol force_rhr="0" name="@{{NUMERACAO}}@2" type="marker" clip_to_extent="1" alpha="1"><layer class="FontMarker" locked="0" enabled="1" pass="0"><prop k="angle" v="0"/><prop k="chr" v="{{ORDEM}}"/><prop k="color" v="0,0,0,255"/><prop k="font" v="Arial Black"/><prop k="horizontal_anchor_point" v="1"/><prop k="joinstyle" v="bevel"/><prop k="offset" v="0,-0.005"/><prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="offset_unit" v="MapUnit"/><prop k="outline_color" v="255,255,255,255"/><prop k="outline_width" v="0.0035"/><prop k="outline_width_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="outline_width_unit" v="MapUnit"/><prop k="size" v="0.045"/><prop k="size_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="size_unit" v="MapUnit"/><prop k="vertical_anchor_point" v="1"/><data_defined_properties><Option type="Map"><Option name="name" type="QString" value=""/><Option name="properties"/><Option name="type" type="QString" value="collection"/></Option></data_defined_properties></layer></symbol></layer></symbol>';
      cor_pausada_txt := '<symbol force_rhr="0" name="{{NUMERACAO}}" clip_to_extent="1" alpha="1" type="fill"><layer locked="0" enabled="1" pass="0" class="SimpleFill"><prop v="3x:0,0,0,0,0,0" k="border_width_map_unit_scale"/><prop v="255,255,153,128" k="color"/><prop v="bevel" k="joinstyle"/><prop v="0,0" k="offset"/><prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/><prop v="MM" k="offset_unit"/><prop v="0,0,0,255" k="outline_color"/><prop v="solid" k="outline_style"/><prop v="0.26" k="outline_width"/><prop v="MM" k="outline_width_unit"/><prop v="solid" k="style"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties></layer><layer locked="0" enabled="1" pass="0" class="GeometryGenerator"><prop v="Line" k="SymbolType"/><prop v=" intersection( &#xd;&#xa;&#x9;make_line(&#xd;&#xa;&#x9;&#x9;make_point(&#xd;&#xa;&#x9;&#x9;&#x9;x_max(bounds($geometry )),&#xd;&#xa;&#x9;&#x9;&#x9;(y_max(bounds($geometry )) + y_min( bounds( $geometry )))/2&#xd;&#xa;&#x9;&#x9;),&#xd;&#xa;&#x9;&#x9;make_point(&#xd;&#xa;&#x9;&#x9;&#x9;x_min(bounds($geometry )),&#xd;&#xa;&#x9;&#x9;&#x9;( y_max( bounds( $geometry )) + y_min( bounds( $geometry )))/2&#xd;&#xa;&#x9;&#x9;)&#xd;&#xa;&#x9;)&#xd;&#xa;, $geometry )" k="geometryModifier"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties><symbol force_rhr="0" name="@{{NUMERACAO}}@1" clip_to_extent="1" alpha="1" type="line"><layer locked="0" enabled="1" pass="0" class="SimpleLine"><prop v="square" k="capstyle"/><prop v="5;2" k="customdash"/><prop v="3x:0,0,0,0,0,0" k="customdash_map_unit_scale"/><prop v="MM" k="customdash_unit"/><prop v="0" k="draw_inside_polygon"/><prop v="bevel" k="joinstyle"/><prop v="255,255,255,255" k="line_color"/><prop v="solid" k="line_style"/><prop v="2" k="line_width"/><prop v="MM" k="line_width_unit"/><prop v="0" k="offset"/><prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/><prop v="MM" k="offset_unit"/><prop v="0" k="ring_filter"/><prop v="0" k="use_custom_dash"/><prop v="3x:0,0,0,0,0,0" k="width_map_unit_scale"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties></layer></symbol></layer><layer locked="0" enabled="1" pass="0" class="GeometryGenerator"><prop v="Line" k="SymbolType"/><prop v="intersection( make_line(make_point((x_max( bounds( $geometry )) + x_min( bounds( $geometry )))/2, y_max( bounds( $geometry ))) ,make_point((x_max( bounds( $geometry )) + x_min( bounds( $geometry )))/2, y_min( bounds( $geometry )))), $geometry )" k="geometryModifier"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties><symbol force_rhr="0" name="@{{NUMERACAO}}@2" clip_to_extent="1" alpha="1" type="line"><layer locked="0" enabled="1" pass="0" class="SimpleLine"><prop v="square" k="capstyle"/><prop v="5;2" k="customdash"/><prop v="3x:0,0,0,0,0,0" k="customdash_map_unit_scale"/><prop v="MM" k="customdash_unit"/><prop v="0" k="draw_inside_polygon"/><prop v="bevel" k="joinstyle"/><prop v="255,255,255,255" k="line_color"/><prop v="solid" k="line_style"/><prop v="2" k="line_width"/><prop v="MM" k="line_width_unit"/><prop v="0" k="offset"/><prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/><prop v="MM" k="offset_unit"/><prop v="0" k="ring_filter"/><prop v="0" k="use_custom_dash"/><prop v="3x:0,0,0,0,0,0" k="width_map_unit_scale"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties></layer></symbol></layer><layer locked="0" enabled="1" pass="0" class="GeometryGenerator"><prop v="Line" k="SymbolType"/><prop v=" intersection( &#xd;&#xa;&#x9;make_line(&#xd;&#xa;&#x9;&#x9;make_point(&#xd;&#xa;&#x9;&#x9;&#x9;x_max(bounds($geometry )),&#xd;&#xa;&#x9;&#x9;&#x9;(y_max(bounds($geometry )) + y_min( bounds( $geometry )))/2&#xd;&#xa;&#x9;&#x9;),&#xd;&#xa;&#x9;&#x9;make_point(&#xd;&#xa;&#x9;&#x9;&#x9;x_min(bounds($geometry )),&#xd;&#xa;&#x9;&#x9;&#x9;( y_max( bounds( $geometry )) + y_min( bounds( $geometry )))/2&#xd;&#xa;&#x9;&#x9;)&#xd;&#xa;&#x9;)&#xd;&#xa;, $geometry )" k="geometryModifier"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties><symbol force_rhr="0" name="@{{NUMERACAO}}@3" clip_to_extent="1" alpha="1" type="line"><layer locked="0" enabled="1" pass="0" class="SimpleLine"><prop v="square" k="capstyle"/><prop v="5;2" k="customdash"/><prop v="3x:0,0,0,0,0,0" k="customdash_map_unit_scale"/><prop v="MM" k="customdash_unit"/><prop v="0" k="draw_inside_polygon"/><prop v="bevel" k="joinstyle"/><prop v="35,35,35,128" k="line_color"/><prop v="solid" k="line_style"/><prop v="1" k="line_width"/><prop v="MM" k="line_width_unit"/><prop v="0" k="offset"/><prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/><prop v="MM" k="offset_unit"/><prop v="0" k="ring_filter"/><prop v="0" k="use_custom_dash"/><prop v="3x:0,0,0,0,0,0" k="width_map_unit_scale"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties></layer></symbol></layer><layer locked="0" enabled="1" pass="0" class="GeometryGenerator"><prop v="Line" k="SymbolType"/><prop v="intersection( make_line(make_point((x_max( bounds( $geometry )) + x_min( bounds( $geometry )))/2, y_max( bounds( $geometry ))) ,make_point((x_max( bounds( $geometry )) + x_min( bounds( $geometry )))/2, y_min( bounds( $geometry )))), $geometry )" k="geometryModifier"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties><symbol force_rhr="0" name="@{{NUMERACAO}}@4" clip_to_extent="1" alpha="1" type="line"><layer locked="0" enabled="1" pass="0" class="SimpleLine"><prop v="square" k="capstyle"/><prop v="5;2" k="customdash"/><prop v="3x:0,0,0,0,0,0" k="customdash_map_unit_scale"/><prop v="MM" k="customdash_unit"/><prop v="0" k="draw_inside_polygon"/><prop v="bevel" k="joinstyle"/><prop v="35,35,35,128" k="line_color"/><prop v="solid" k="line_style"/><prop v="1" k="line_width"/><prop v="MM" k="line_width_unit"/><prop v="0" k="offset"/><prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/><prop v="MM" k="offset_unit"/><prop v="0" k="ring_filter"/><prop v="0" k="use_custom_dash"/><prop v="3x:0,0,0,0,0,0" k="width_map_unit_scale"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties></layer></symbol></layer><layer locked="0" enabled="1" pass="0" class="CentroidFill"><prop v="1" k="point_on_all_parts"/><prop v="0" k="point_on_surface"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties><symbol force_rhr="0" name="@{{NUMERACAO}}@5" clip_to_extent="1" alpha="1" type="marker"><layer locked="0" enabled="1" pass="0" class="FontMarker"><prop v="0" k="angle"/><prop v="1" k="chr"/><prop v="0,0,0,255" k="color"/><prop v="Arial Black" k="font"/><prop v="1" k="horizontal_anchor_point"/><prop v="bevel" k="joinstyle"/><prop v="0,-0.005" k="offset"/><prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/><prop v="MapUnit" k="offset_unit"/><prop v="255,255,255,255" k="outline_color"/><prop v="0.0035" k="outline_width"/><prop v="3x:0,0,0,0,0,0" k="outline_width_map_unit_scale"/><prop v="MapUnit" k="outline_width_unit"/><prop v="0.045" k="size"/><prop v="3x:0,0,0,0,0,0" k="size_map_unit_scale"/><prop v="MapUnit" k="size_unit"/><prop v="1" k="vertical_anchor_point"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties></layer></symbol></layer></symbol>';
      revcor_txt := '<symbol force_rhr="0" name="{{NUMERACAO}}" type="fill" clip_to_extent="1" alpha="1"><layer class="SimpleFill" locked="0" enabled="1" pass="0"><prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="color" v="190,174,212,128"/><prop k="joinstyle" v="bevel"/><prop k="offset" v="0,0"/><prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="offset_unit" v="MM"/><prop k="outline_color" v="0,0,0,255"/><prop k="outline_style" v="solid"/><prop k="outline_width" v="0.26"/><prop k="outline_width_unit" v="MM"/><prop k="style" v="solid"/><data_defined_properties><Option type="Map"><Option name="name" type="QString" value=""/><Option name="properties"/><Option name="type" type="QString" value="collection"/></Option></data_defined_properties></layer><layer class="CentroidFill" locked="0" enabled="1" pass="0"><prop k="point_on_all_parts" v="1"/><prop k="point_on_surface" v="0"/><data_defined_properties><Option type="Map"><Option name="name" type="QString" value=""/><Option name="properties"/><Option name="type" type="QString" value="collection"/></Option></data_defined_properties><symbol force_rhr="0" name="@{{NUMERACAO}}@1" type="marker" clip_to_extent="1" alpha="1"><layer class="FontMarker" locked="0" enabled="1" pass="0"><prop k="angle" v="0"/><prop k="chr" v="{{ORDEM}}"/><prop k="color" v="0,0,0,255"/><prop k="font" v="Arial Black"/><prop k="horizontal_anchor_point" v="1"/><prop k="joinstyle" v="bevel"/><prop k="offset" v="0,-0.005"/><prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="offset_unit" v="MapUnit"/><prop k="outline_color" v="255,255,255,255"/><prop k="outline_width" v="0.0035"/><prop k="outline_width_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="outline_width_unit" v="MapUnit"/><prop k="size" v="0.045"/><prop k="size_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="size_unit" v="MapUnit"/><prop k="vertical_anchor_point" v="1"/><data_defined_properties><Option type="Map"><Option name="name" type="QString" value=""/><Option name="properties"/><Option name="type" type="QString" value="collection"/></Option></data_defined_properties></layer></symbol></layer></symbol>';
      revcor_andamento_txt := '<symbol force_rhr="0" name="{{NUMERACAO}}" type="fill" clip_to_extent="1" alpha="1"><layer class="SimpleFill" locked="0" enabled="1" pass="0"><prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="color" v="190,174,212,128"/><prop k="joinstyle" v="bevel"/><prop k="offset" v="0,0"/><prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="offset_unit" v="MM"/><prop k="outline_color" v="0,0,0,255"/><prop k="outline_style" v="solid"/><prop k="outline_width" v="0.26"/><prop k="outline_width_unit" v="MM"/><prop k="style" v="solid"/><data_defined_properties><Option type="Map"><Option name="name" type="QString" value=""/><Option name="properties"/><Option name="type" type="QString" value="collection"/></Option></data_defined_properties></layer><layer class="LinePatternFill" locked="0" enabled="1" pass="0"><prop k="angle" v="45"/><prop k="color" v="0,0,255,255"/><prop k="distance" v="1"/><prop k="distance_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="distance_unit" v="MM"/><prop k="line_width" v="0.26"/><prop k="line_width_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="line_width_unit" v="MM"/><prop k="offset" v="0"/><prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="offset_unit" v="MM"/><prop k="outline_width_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="outline_width_unit" v="MM"/><data_defined_properties><Option type="Map"><Option name="name" type="QString" value=""/><Option name="properties"/><Option name="type" type="QString" value="collection"/></Option></data_defined_properties><symbol force_rhr="0" name="@{{NUMERACAO}}@1" type="line" clip_to_extent="1" alpha="1"><layer class="SimpleLine" locked="0" enabled="1" pass="0"><prop k="capstyle" v="square"/><prop k="customdash" v="5;2"/><prop k="customdash_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="customdash_unit" v="MM"/><prop k="draw_inside_polygon" v="0"/><prop k="joinstyle" v="bevel"/><prop k="line_color" v="0,0,0,255"/><prop k="line_style" v="solid"/><prop k="line_width" v="0.26"/><prop k="line_width_unit" v="MM"/><prop k="offset" v="0"/><prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="offset_unit" v="MM"/><prop k="ring_filter" v="0"/><prop k="use_custom_dash" v="0"/><prop k="width_map_unit_scale" v="3x:0,0,0,0,0,0"/><data_defined_properties><Option type="Map"><Option name="name" type="QString" value=""/><Option name="properties"/><Option name="type" type="QString" value="collection"/></Option></data_defined_properties></layer></symbol></layer><layer class="CentroidFill" locked="0" enabled="1" pass="0"><prop k="point_on_all_parts" v="1"/><prop k="point_on_surface" v="0"/><data_defined_properties><Option type="Map"><Option name="name" type="QString" value=""/><Option name="properties"/><Option name="type" type="QString" value="collection"/></Option></data_defined_properties><symbol force_rhr="0" name="@{{NUMERACAO}}@2" type="marker" clip_to_extent="1" alpha="1"><layer class="FontMarker" locked="0" enabled="1" pass="0"><prop k="angle" v="0"/><prop k="chr" v="{{ORDEM}}"/><prop k="color" v="0,0,0,255"/><prop k="font" v="Arial Black"/><prop k="horizontal_anchor_point" v="1"/><prop k="joinstyle" v="bevel"/><prop k="offset" v="0,-0.005"/><prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="offset_unit" v="MapUnit"/><prop k="outline_color" v="255,255,255,255"/><prop k="outline_width" v="0.0035"/><prop k="outline_width_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="outline_width_unit" v="MapUnit"/><prop k="size" v="0.045"/><prop k="size_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="size_unit" v="MapUnit"/><prop k="vertical_anchor_point" v="1"/><data_defined_properties><Option type="Map"><Option name="name" type="QString" value=""/><Option name="properties"/><Option name="type" type="QString" value="collection"/></Option></data_defined_properties></layer></symbol></layer></symbol>';
      revcor_pausada_txt := '<symbol force_rhr="0" name="{{NUMERACAO}}" clip_to_extent="1" alpha="1" type="fill"><layer locked="0" enabled="1" pass="0" class="SimpleFill"><prop v="3x:0,0,0,0,0,0" k="border_width_map_unit_scale"/><prop v="190,174,212,128" k="color"/><prop v="bevel" k="joinstyle"/><prop v="0,0" k="offset"/><prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/><prop v="MM" k="offset_unit"/><prop v="0,0,0,255" k="outline_color"/><prop v="solid" k="outline_style"/><prop v="0.26" k="outline_width"/><prop v="MM" k="outline_width_unit"/><prop v="solid" k="style"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties></layer><layer locked="0" enabled="1" pass="0" class="GeometryGenerator"><prop v="Line" k="SymbolType"/><prop v=" intersection( &#xd;&#xa;&#x9;make_line(&#xd;&#xa;&#x9;&#x9;make_point(&#xd;&#xa;&#x9;&#x9;&#x9;x_max(bounds($geometry )),&#xd;&#xa;&#x9;&#x9;&#x9;(y_max(bounds($geometry )) + y_min( bounds( $geometry )))/2&#xd;&#xa;&#x9;&#x9;),&#xd;&#xa;&#x9;&#x9;make_point(&#xd;&#xa;&#x9;&#x9;&#x9;x_min(bounds($geometry )),&#xd;&#xa;&#x9;&#x9;&#x9;( y_max( bounds( $geometry )) + y_min( bounds( $geometry )))/2&#xd;&#xa;&#x9;&#x9;)&#xd;&#xa;&#x9;)&#xd;&#xa;, $geometry )" k="geometryModifier"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties><symbol force_rhr="0" name="@{{NUMERACAO}}@1" clip_to_extent="1" alpha="1" type="line"><layer locked="0" enabled="1" pass="0" class="SimpleLine"><prop v="square" k="capstyle"/><prop v="5;2" k="customdash"/><prop v="3x:0,0,0,0,0,0" k="customdash_map_unit_scale"/><prop v="MM" k="customdash_unit"/><prop v="0" k="draw_inside_polygon"/><prop v="bevel" k="joinstyle"/><prop v="255,255,255,255" k="line_color"/><prop v="solid" k="line_style"/><prop v="2" k="line_width"/><prop v="MM" k="line_width_unit"/><prop v="0" k="offset"/><prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/><prop v="MM" k="offset_unit"/><prop v="0" k="ring_filter"/><prop v="0" k="use_custom_dash"/><prop v="3x:0,0,0,0,0,0" k="width_map_unit_scale"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties></layer></symbol></layer><layer locked="0" enabled="1" pass="0" class="GeometryGenerator"><prop v="Line" k="SymbolType"/><prop v="intersection( make_line(make_point((x_max( bounds( $geometry )) + x_min( bounds( $geometry )))/2, y_max( bounds( $geometry ))) ,make_point((x_max( bounds( $geometry )) + x_min( bounds( $geometry )))/2, y_min( bounds( $geometry )))), $geometry )" k="geometryModifier"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties><symbol force_rhr="0" name="@{{NUMERACAO}}@2" clip_to_extent="1" alpha="1" type="line"><layer locked="0" enabled="1" pass="0" class="SimpleLine"><prop v="square" k="capstyle"/><prop v="5;2" k="customdash"/><prop v="3x:0,0,0,0,0,0" k="customdash_map_unit_scale"/><prop v="MM" k="customdash_unit"/><prop v="0" k="draw_inside_polygon"/><prop v="bevel" k="joinstyle"/><prop v="255,255,255,255" k="line_color"/><prop v="solid" k="line_style"/><prop v="2" k="line_width"/><prop v="MM" k="line_width_unit"/><prop v="0" k="offset"/><prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/><prop v="MM" k="offset_unit"/><prop v="0" k="ring_filter"/><prop v="0" k="use_custom_dash"/><prop v="3x:0,0,0,0,0,0" k="width_map_unit_scale"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties></layer></symbol></layer><layer locked="0" enabled="1" pass="0" class="GeometryGenerator"><prop v="Line" k="SymbolType"/><prop v=" intersection( &#xd;&#xa;&#x9;make_line(&#xd;&#xa;&#x9;&#x9;make_point(&#xd;&#xa;&#x9;&#x9;&#x9;x_max(bounds($geometry )),&#xd;&#xa;&#x9;&#x9;&#x9;(y_max(bounds($geometry )) + y_min( bounds( $geometry )))/2&#xd;&#xa;&#x9;&#x9;),&#xd;&#xa;&#x9;&#x9;make_point(&#xd;&#xa;&#x9;&#x9;&#x9;x_min(bounds($geometry )),&#xd;&#xa;&#x9;&#x9;&#x9;( y_max( bounds( $geometry )) + y_min( bounds( $geometry )))/2&#xd;&#xa;&#x9;&#x9;)&#xd;&#xa;&#x9;)&#xd;&#xa;, $geometry )" k="geometryModifier"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties><symbol force_rhr="0" name="@{{NUMERACAO}}@3" clip_to_extent="1" alpha="1" type="line"><layer locked="0" enabled="1" pass="0" class="SimpleLine"><prop v="square" k="capstyle"/><prop v="5;2" k="customdash"/><prop v="3x:0,0,0,0,0,0" k="customdash_map_unit_scale"/><prop v="MM" k="customdash_unit"/><prop v="0" k="draw_inside_polygon"/><prop v="bevel" k="joinstyle"/><prop v="0,0,0,128" k="line_color"/><prop v="solid" k="line_style"/><prop v="1" k="line_width"/><prop v="MM" k="line_width_unit"/><prop v="0" k="offset"/><prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/><prop v="MM" k="offset_unit"/><prop v="0" k="ring_filter"/><prop v="0" k="use_custom_dash"/><prop v="3x:0,0,0,0,0,0" k="width_map_unit_scale"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties></layer></symbol></layer><layer locked="0" enabled="1" pass="0" class="GeometryGenerator"><prop v="Line" k="SymbolType"/><prop v="intersection( make_line(make_point((x_max( bounds( $geometry )) + x_min( bounds( $geometry )))/2, y_max( bounds( $geometry ))) ,make_point((x_max( bounds( $geometry )) + x_min( bounds( $geometry )))/2, y_min( bounds( $geometry )))), $geometry )" k="geometryModifier"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties><symbol force_rhr="0" name="@{{NUMERACAO}}@4" clip_to_extent="1" alpha="1" type="line"><layer locked="0" enabled="1" pass="0" class="SimpleLine"><prop v="square" k="capstyle"/><prop v="5;2" k="customdash"/><prop v="3x:0,0,0,0,0,0" k="customdash_map_unit_scale"/><prop v="MM" k="customdash_unit"/><prop v="0" k="draw_inside_polygon"/><prop v="bevel" k="joinstyle"/><prop v="0,0,0,128" k="line_color"/><prop v="solid" k="line_style"/><prop v="1" k="line_width"/><prop v="MM" k="line_width_unit"/><prop v="0" k="offset"/><prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/><prop v="MM" k="offset_unit"/><prop v="0" k="ring_filter"/><prop v="0" k="use_custom_dash"/><prop v="3x:0,0,0,0,0,0" k="width_map_unit_scale"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties></layer></symbol></layer><layer locked="0" enabled="1" pass="0" class="CentroidFill"><prop v="1" k="point_on_all_parts"/><prop v="0" k="point_on_surface"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties><symbol force_rhr="0" name="@{{NUMERACAO}}@5" clip_to_extent="1" alpha="1" type="marker"><layer locked="0" enabled="1" pass="0" class="FontMarker"><prop v="0" k="angle"/><prop v="1" k="chr"/><prop v="0,0,0,255" k="color"/><prop v="Arial Black" k="font"/><prop v="1" k="horizontal_anchor_point"/><prop v="bevel" k="joinstyle"/><prop v="0,-0.005" k="offset"/><prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/><prop v="MapUnit" k="offset_unit"/><prop v="255,255,255,255" k="outline_color"/><prop v="0.0035" k="outline_width"/><prop v="3x:0,0,0,0,0,0" k="outline_width_map_unit_scale"/><prop v="MapUnit" k="outline_width_unit"/><prop v="0.045" k="size"/><prop v="3x:0,0,0,0,0,0" k="size_map_unit_scale"/><prop v="MapUnit" k="size_unit"/><prop v="1" k="vertical_anchor_point"/><data_defined_properties><Option type="Map"><Option name="name" value="" type="QString"/><Option name="properties"/><Option name="type" value="collection" type="QString"/></Option></data_defined_properties></layer></symbol></layer></symbol>';

      rules_txt := rules_txt || '<rule symbol="' ||  iterator || '" key="{' || uuid_generate_v4() ||'}" label="restrição pre" filter="restrito_pre IS TRUE"/>';
      symbols_txt := symbols_txt || replace('<symbol clip_to_extent="1" name="{{NUMERACAO}}" alpha="1" force_rhr="0" type="fill"><data_defined_properties><Option type="Map"><Option value="" name="name" type="QString"/><Option name="properties"/><Option value="collection" name="type" type="QString"/></Option></data_defined_properties><layer locked="0" pass="0" class="PointPatternFill" enabled="1"><Option type="Map"><Option value="0" name="angle" type="double"/><Option value="shape" name="clip_mode" type="QString"/><Option value="feature" name="coordinate_reference" type="QString"/><Option value="1.2" name="displacement_x" type="QString"/><Option value="3x:0,0,0,0,0,0" name="displacement_x_map_unit_scale" type="QString"/><Option value="MM" name="displacement_x_unit" type="QString"/><Option value="0" name="displacement_y" type="QString"/><Option value="3x:0,0,0,0,0,0" name="displacement_y_map_unit_scale" type="QString"/><Option value="MM" name="displacement_y_unit" type="QString"/><Option value="2.4" name="distance_x" type="QString"/><Option value="3x:0,0,0,0,0,0" name="distance_x_map_unit_scale" type="QString"/><Option value="MM" name="distance_x_unit" type="QString"/><Option value="2.4" name="distance_y" type="QString"/><Option value="3x:0,0,0,0,0,0" name="distance_y_map_unit_scale" type="QString"/><Option value="MM" name="distance_y_unit" type="QString"/><Option value="0" name="offset_x" type="QString"/><Option value="3x:0,0,0,0,0,0" name="offset_x_map_unit_scale" type="QString"/><Option value="MM" name="offset_x_unit" type="QString"/><Option value="0" name="offset_y" type="QString"/><Option value="3x:0,0,0,0,0,0" name="offset_y_map_unit_scale" type="QString"/><Option value="MM" name="offset_y_unit" type="QString"/><Option value="3x:0,0,0,0,0,0" name="outline_width_map_unit_scale" type="QString"/><Option value="MM" name="outline_width_unit" type="QString"/><Option value="0" name="random_deviation_x" type="QString"/><Option value="3x:0,0,0,0,0,0" name="random_deviation_x_map_unit_scale" type="QString"/><Option value="MM" name="random_deviation_x_unit" type="QString"/><Option value="0" name="random_deviation_y" type="QString"/><Option value="3x:0,0,0,0,0,0" name="random_deviation_y_map_unit_scale" type="QString"/><Option value="MM" name="random_deviation_y_unit" type="QString"/><Option value="930092414" name="seed" type="QString"/></Option><prop k="angle" v="0"/><prop k="clip_mode" v="shape"/><prop k="coordinate_reference" v="feature"/><prop k="displacement_x" v="1.2"/><prop k="displacement_x_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="displacement_x_unit" v="MM"/><prop k="displacement_y" v="0"/><prop k="displacement_y_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="displacement_y_unit" v="MM"/><prop k="distance_x" v="2.4"/><prop k="distance_x_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="distance_x_unit" v="MM"/><prop k="distance_y" v="2.4"/><prop k="distance_y_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="distance_y_unit" v="MM"/><prop k="offset_x" v="0"/><prop k="offset_x_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="offset_x_unit" v="MM"/><prop k="offset_y" v="0"/><prop k="offset_y_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="offset_y_unit" v="MM"/><prop k="outline_width_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="outline_width_unit" v="MM"/><prop k="random_deviation_x" v="0"/><prop k="random_deviation_x_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="random_deviation_x_unit" v="MM"/><prop k="random_deviation_y" v="0"/><prop k="random_deviation_y_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="random_deviation_y_unit" v="MM"/><prop k="seed" v="930092414"/><data_defined_properties><Option type="Map"><Option value="" name="name" type="QString"/><Option name="properties"/><Option value="collection" name="type" type="QString"/></Option></data_defined_properties><symbol clip_to_extent="1" name="@0@0" alpha="1" force_rhr="0" type="marker"><data_defined_properties><Option type="Map"><Option value="" name="name" type="QString"/><Option name="properties"/><Option value="collection" name="type" type="QString"/></Option></data_defined_properties><layer locked="0" pass="0" class="SimpleMarker" enabled="1"><Option type="Map"><Option value="0" name="angle" type="QString"/><Option value="square" name="cap_style" type="QString"/><Option value="0,0,0,255" name="color" type="QString"/><Option value="1" name="horizontal_anchor_point" type="QString"/><Option value="bevel" name="joinstyle" type="QString"/><Option value="circle" name="name" type="QString"/><Option value="0,0" name="offset" type="QString"/><Option value="3x:0,0,0,0,0,0" name="offset_map_unit_scale" type="QString"/><Option value="MM" name="offset_unit" type="QString"/><Option value="0,0,0,255" name="outline_color" type="QString"/><Option value="solid" name="outline_style" type="QString"/><Option value="0.2" name="outline_width" type="QString"/><Option value="3x:0,0,0,0,0,0" name="outline_width_map_unit_scale" type="QString"/><Option value="MM" name="outline_width_unit" type="QString"/><Option value="diameter" name="scale_method" type="QString"/><Option value="0.6" name="size" type="QString"/><Option value="3x:0,0,0,0,0,0" name="size_map_unit_scale" type="QString"/><Option value="MM" name="size_unit" type="QString"/><Option value="1" name="vertical_anchor_point" type="QString"/></Option><prop k="angle" v="0"/><prop k="cap_style" v="square"/><prop k="color" v="0,0,0,255"/><prop k="horizontal_anchor_point" v="1"/><prop k="joinstyle" v="bevel"/><prop k="name" v="circle"/><prop k="offset" v="0,0"/><prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="offset_unit" v="MM"/><prop k="outline_color" v="0,0,0,255"/><prop k="outline_style" v="solid"/><prop k="outline_width" v="0.2"/><prop k="outline_width_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="outline_width_unit" v="MM"/><prop k="scale_method" v="diameter"/><prop k="size" v="0.6"/><prop k="size_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="size_unit" v="MM"/><prop k="vertical_anchor_point" v="1"/><data_defined_properties><Option type="Map"><Option value="" name="name" type="QString"/><Option name="properties"/><Option value="collection" name="type" type="QString"/></Option></data_defined_properties></layer></symbol></layer><layer locked="0" pass="0" class="SimpleLine" enabled="1"><Option type="Map"><Option value="0" name="align_dash_pattern" type="QString"/><Option value="square" name="capstyle" type="QString"/><Option value="5;2" name="customdash" type="QString"/><Option value="3x:0,0,0,0,0,0" name="customdash_map_unit_scale" type="QString"/><Option value="MM" name="customdash_unit" type="QString"/><Option value="0" name="dash_pattern_offset" type="QString"/><Option value="3x:0,0,0,0,0,0" name="dash_pattern_offset_map_unit_scale" type="QString"/><Option value="MM" name="dash_pattern_offset_unit" type="QString"/><Option value="0" name="draw_inside_polygon" type="QString"/><Option value="bevel" name="joinstyle" type="QString"/><Option value="0,0,0,255" name="line_color" type="QString"/><Option value="solid" name="line_style" type="QString"/><Option value="0.36" name="line_width" type="QString"/><Option value="MM" name="line_width_unit" type="QString"/><Option value="0" name="offset" type="QString"/><Option value="3x:0,0,0,0,0,0" name="offset_map_unit_scale" type="QString"/><Option value="MM" name="offset_unit" type="QString"/><Option value="0" name="ring_filter" type="QString"/><Option value="0" name="trim_distance_end" type="QString"/><Option value="3x:0,0,0,0,0,0" name="trim_distance_end_map_unit_scale" type="QString"/><Option value="MM" name="trim_distance_end_unit" type="QString"/><Option value="0" name="trim_distance_start" type="QString"/><Option value="3x:0,0,0,0,0,0" name="trim_distance_start_map_unit_scale" type="QString"/><Option value="MM" name="trim_distance_start_unit" type="QString"/><Option value="0" name="tweak_dash_pattern_on_corners" type="QString"/><Option value="0" name="use_custom_dash" type="QString"/><Option value="3x:0,0,0,0,0,0" name="width_map_unit_scale" type="QString"/></Option><prop k="align_dash_pattern" v="0"/><prop k="capstyle" v="square"/><prop k="customdash" v="5;2"/><prop k="customdash_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="customdash_unit" v="MM"/><prop k="dash_pattern_offset" v="0"/><prop k="dash_pattern_offset_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="dash_pattern_offset_unit" v="MM"/><prop k="draw_inside_polygon" v="0"/><prop k="joinstyle" v="bevel"/><prop k="line_color" v="0,0,0,255"/><prop k="line_style" v="solid"/><prop k="line_width" v="0.36"/><prop k="line_width_unit" v="MM"/><prop k="offset" v="0"/><prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="offset_unit" v="MM"/><prop k="ring_filter" v="0"/><prop k="trim_distance_end" v="0"/><prop k="trim_distance_end_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="trim_distance_end_unit" v="MM"/><prop k="trim_distance_start" v="0"/><prop k="trim_distance_start_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="trim_distance_start_unit" v="MM"/><prop k="tweak_dash_pattern_on_corners" v="0"/><prop k="use_custom_dash" v="0"/><prop k="width_map_unit_scale" v="3x:0,0,0,0,0,0"/><data_defined_properties><Option type="Map"><Option value="" name="name" type="QString"/><Option name="properties"/><Option value="collection" name="type" type="QString"/></Option></data_defined_properties></layer></symbol>', '{{NUMERACAO}}', iterator::text);
      
      iterator := iterator + 1;

      rules_txt := rules_txt || '<rule symbol="' ||  iterator || '" key="{' || uuid_generate_v4() ||'}" label="restrição exec" filter="restrito_pre IS FALSE AND restrito_exec IS TRUE"/>';
      symbols_txt := symbols_txt || replace('<symbol type="fill" clip_to_extent="1" alpha="1" name="{{NUMERACAO}}" force_rhr="0"><data_defined_properties><Option type="Map"><Option type="QString" name="name" value=""/><Option name="properties"/><Option type="QString" name="type" value="collection"/></Option></data_defined_properties><layer enabled="1" locked="0" pass="0" class="PointPatternFill"><Option type="Map"><Option type="double" name="angle" value="0"/><Option type="QString" name="clip_mode" value="shape"/><Option type="QString" name="coordinate_reference" value="feature"/><Option type="QString" name="displacement_x" value="1.2"/><Option type="QString" name="displacement_x_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="displacement_x_unit" value="MM"/><Option type="QString" name="displacement_y" value="0"/><Option type="QString" name="displacement_y_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="displacement_y_unit" value="MM"/><Option type="QString" name="distance_x" value="4"/><Option type="QString" name="distance_x_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="distance_x_unit" value="MM"/><Option type="QString" name="distance_y" value="4"/><Option type="QString" name="distance_y_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="distance_y_unit" value="MM"/><Option type="QString" name="offset_x" value="0"/><Option type="QString" name="offset_x_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="offset_x_unit" value="MM"/><Option type="QString" name="offset_y" value="0"/><Option type="QString" name="offset_y_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="offset_y_unit" value="MM"/><Option type="QString" name="outline_width_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="outline_width_unit" value="MM"/><Option type="QString" name="random_deviation_x" value="0"/><Option type="QString" name="random_deviation_x_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="random_deviation_x_unit" value="MM"/><Option type="QString" name="random_deviation_y" value="0"/><Option type="QString" name="random_deviation_y_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="random_deviation_y_unit" value="MM"/><Option type="QString" name="seed" value="930092414"/></Option><prop v="0" k="angle"/><prop v="shape" k="clip_mode"/><prop v="feature" k="coordinate_reference"/><prop v="1.2" k="displacement_x"/><prop v="3x:0,0,0,0,0,0" k="displacement_x_map_unit_scale"/><prop v="MM" k="displacement_x_unit"/><prop v="0" k="displacement_y"/><prop v="3x:0,0,0,0,0,0" k="displacement_y_map_unit_scale"/><prop v="MM" k="displacement_y_unit"/><prop v="4" k="distance_x"/><prop v="3x:0,0,0,0,0,0" k="distance_x_map_unit_scale"/><prop v="MM" k="distance_x_unit"/><prop v="4" k="distance_y"/><prop v="3x:0,0,0,0,0,0" k="distance_y_map_unit_scale"/><prop v="MM" k="distance_y_unit"/><prop v="0" k="offset_x"/><prop v="3x:0,0,0,0,0,0" k="offset_x_map_unit_scale"/><prop v="MM" k="offset_x_unit"/><prop v="0" k="offset_y"/><prop v="3x:0,0,0,0,0,0" k="offset_y_map_unit_scale"/><prop v="MM" k="offset_y_unit"/><prop v="3x:0,0,0,0,0,0" k="outline_width_map_unit_scale"/><prop v="MM" k="outline_width_unit"/><prop v="0" k="random_deviation_x"/><prop v="3x:0,0,0,0,0,0" k="random_deviation_x_map_unit_scale"/><prop v="MM" k="random_deviation_x_unit"/><prop v="0" k="random_deviation_y"/><prop v="3x:0,0,0,0,0,0" k="random_deviation_y_map_unit_scale"/><prop v="MM" k="random_deviation_y_unit"/><prop v="930092414" k="seed"/><data_defined_properties><Option type="Map"><Option type="QString" name="name" value=""/><Option name="properties"/><Option type="QString" name="type" value="collection"/></Option></data_defined_properties><symbol type="marker" clip_to_extent="1" alpha="1" name="@0@0" force_rhr="0"><data_defined_properties><Option type="Map"><Option type="QString" name="name" value=""/><Option name="properties"/><Option type="QString" name="type" value="collection"/></Option></data_defined_properties><layer enabled="1" locked="0" pass="0" class="SimpleMarker"><Option type="Map"><Option type="QString" name="angle" value="0"/><Option type="QString" name="cap_style" value="square"/><Option type="QString" name="color" value="0,0,0,255"/><Option type="QString" name="horizontal_anchor_point" value="1"/><Option type="QString" name="joinstyle" value="bevel"/><Option type="QString" name="name" value="cross2"/><Option type="QString" name="offset" value="0,0"/><Option type="QString" name="offset_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="offset_unit" value="MM"/><Option type="QString" name="outline_color" value="0,0,0,255"/><Option type="QString" name="outline_style" value="solid"/><Option type="QString" name="outline_width" value="0.3"/><Option type="QString" name="outline_width_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="outline_width_unit" value="MM"/><Option type="QString" name="scale_method" value="diameter"/><Option type="QString" name="size" value="2"/><Option type="QString" name="size_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="size_unit" value="MM"/><Option type="QString" name="vertical_anchor_point" value="1"/></Option><prop v="0" k="angle"/><prop v="square" k="cap_style"/><prop v="0,0,0,255" k="color"/><prop v="1" k="horizontal_anchor_point"/><prop v="bevel" k="joinstyle"/><prop v="cross2" k="name"/><prop v="0,0" k="offset"/><prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/><prop v="MM" k="offset_unit"/><prop v="0,0,0,255" k="outline_color"/><prop v="solid" k="outline_style"/><prop v="0.3" k="outline_width"/><prop v="3x:0,0,0,0,0,0" k="outline_width_map_unit_scale"/><prop v="MM" k="outline_width_unit"/><prop v="diameter" k="scale_method"/><prop v="2" k="size"/><prop v="3x:0,0,0,0,0,0" k="size_map_unit_scale"/><prop v="MM" k="size_unit"/><prop v="1" k="vertical_anchor_point"/><data_defined_properties><Option type="Map"><Option type="QString" name="name" value=""/><Option name="properties"/><Option type="QString" name="type" value="collection"/></Option></data_defined_properties></layer></symbol></layer><layer enabled="1" locked="0" pass="0" class="SimpleLine"><Option type="Map"><Option type="QString" name="align_dash_pattern" value="0"/><Option type="QString" name="capstyle" value="square"/><Option type="QString" name="customdash" value="5;2"/><Option type="QString" name="customdash_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="customdash_unit" value="MM"/><Option type="QString" name="dash_pattern_offset" value="0"/><Option type="QString" name="dash_pattern_offset_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="dash_pattern_offset_unit" value="MM"/><Option type="QString" name="draw_inside_polygon" value="0"/><Option type="QString" name="joinstyle" value="bevel"/><Option type="QString" name="line_color" value="0,0,0,255"/><Option type="QString" name="line_style" value="solid"/><Option type="QString" name="line_width" value="0.36"/><Option type="QString" name="line_width_unit" value="MM"/><Option type="QString" name="offset" value="0"/><Option type="QString" name="offset_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="offset_unit" value="MM"/><Option type="QString" name="ring_filter" value="0"/><Option type="QString" name="trim_distance_end" value="0"/><Option type="QString" name="trim_distance_end_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="trim_distance_end_unit" value="MM"/><Option type="QString" name="trim_distance_start" value="0"/><Option type="QString" name="trim_distance_start_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="trim_distance_start_unit" value="MM"/><Option type="QString" name="tweak_dash_pattern_on_corners" value="0"/><Option type="QString" name="use_custom_dash" value="0"/><Option type="QString" name="width_map_unit_scale" value="3x:0,0,0,0,0,0"/></Option><prop v="0" k="align_dash_pattern"/><prop v="square" k="capstyle"/><prop v="5;2" k="customdash"/><prop v="3x:0,0,0,0,0,0" k="customdash_map_unit_scale"/><prop v="MM" k="customdash_unit"/><prop v="0" k="dash_pattern_offset"/><prop v="3x:0,0,0,0,0,0" k="dash_pattern_offset_map_unit_scale"/><prop v="MM" k="dash_pattern_offset_unit"/><prop v="0" k="draw_inside_polygon"/><prop v="bevel" k="joinstyle"/><prop v="0,0,0,255" k="line_color"/><prop v="solid" k="line_style"/><prop v="0.36" k="line_width"/><prop v="MM" k="line_width_unit"/><prop v="0" k="offset"/><prop v="3x:0,0,0,0,0,0" k="offset_map_unit_scale"/><prop v="MM" k="offset_unit"/><prop v="0" k="ring_filter"/><prop v="0" k="trim_distance_end"/><prop v="3x:0,0,0,0,0,0" k="trim_distance_end_map_unit_scale"/><prop v="MM" k="trim_distance_end_unit"/><prop v="0" k="trim_distance_start"/><prop v="3x:0,0,0,0,0,0" k="trim_distance_start_map_unit_scale"/><prop v="MM" k="trim_distance_start_unit"/><prop v="0" k="tweak_dash_pattern_on_corners"/><prop v="0" k="use_custom_dash"/><prop v="3x:0,0,0,0,0,0" k="width_map_unit_scale"/><data_defined_properties><Option type="Map"><Option type="QString" name="name" value=""/><Option name="properties"/><Option type="QString" name="type" value="collection"/></Option></data_defined_properties></layer></symbol>', '{{NUMERACAO}}', iterator::text);


      iterator := iterator + 1;

      FOR r IN SELECT se.id, e.code AS tipo_etapa_id, e.nome, rank() OVER (PARTITION BY e.nome ORDER BY se.ordem) as numero 
      FROM (SELECT code, nome, CASE WHEN nome = 'Revisão final' THEN 'Revisão' ELSE nome END AS tipo FROM dominio.tipo_etapa) AS e 
      INNER JOIN macrocontrole.etapa AS se ON e.code = se.tipo_etapa_id
      WHERE se.subfase_id = subfase_ident AND se.lote_id = lote_ident
      ORDER BY se.ordem
      LOOP
        SELECT replace(translate(replace(lower(r.nome),' ', '_'),  
          'àáâãäéèëêíìïîóòõöôúùüûçÇ/-|/\,.;:<>?!`{}[]()~`@#$%^&*+=''',  
          'aaaaaeeeeiiiiooooouuuucc________________________________') || '_' || r.numero, 'execucao_1', 'execucao')
          INTO nome_fixed;

        view_txt := view_txt || ', CASE WHEN ee' || iterator || '.etapa_id IS NULL THEN ''-'' ELSE  ee' || iterator || '.id::text END AS ' || nome_fixed || '_atividade_id';
        view_txt := view_txt || ', CASE WHEN ee' || iterator || '.etapa_id IS NULL THEN ''-'' ELSE  tpg' || iterator || '.nome_abrev::text || '' '' || u' || iterator || '.nome_guerra::text END AS ' || nome_fixed || '_usuario';
        view_txt := view_txt || ', CASE WHEN ee' || iterator || '.etapa_id IS NULL THEN ''-'' ELSE  tt' || iterator || '.nome::text END AS ' || nome_fixed || '_turno';
        view_txt := view_txt || ', CASE WHEN ee' || iterator || '.etapa_id IS NULL THEN ''-'' ELSE  ts' || iterator || '.nome::text END AS ' || nome_fixed || '_situacao';
        view_txt := view_txt || ', CASE WHEN ee' || iterator || '.etapa_id IS NULL THEN ''-'' ELSE  ee' || iterator || '.data_inicio::text END AS ' || nome_fixed || '_data_inicio';
        view_txt := view_txt || ', CASE WHEN ee' || iterator || '.etapa_id IS NULL THEN ''-'' ELSE  ee' || iterator || '.data_fim::text END AS ' || nome_fixed || '_data_fim';
        jointxt := jointxt || ' LEFT JOIN macrocontrole.atividade as ee' || iterator || ' ON ee' || iterator || '.unidade_trabalho_id = ut.id and ee' || iterator || '.etapa_id = ' || r.id;
        jointxt := jointxt || ' LEFT JOIN dominio.tipo_situacao as ts' || iterator || ' ON ts' || iterator || '.code = ee' || iterator || '.tipo_situacao_id';
        jointxt := jointxt || ' LEFT JOIN dgeo.usuario as u' || iterator || ' ON u' || iterator || '.id = ee' || iterator || '.usuario_id';
        jointxt := jointxt || ' LEFT JOIN dominio.tipo_posto_grad as tpg' || iterator || ' ON tpg' || iterator || '.code = u' || iterator || '.tipo_posto_grad_id';
        jointxt := jointxt || ' LEFT JOIN dominio.tipo_turno as tt' || iterator || ' ON tt' || iterator || '.code = u' || iterator || '.tipo_turno_id';
        wheretxt := wheretxt || ' AND (ee' || iterator || '.tipo_situacao_id IS NULL OR ee' || iterator || '.tipo_situacao_id in (1,2,3,4))';


        rules_txt := rules_txt || '<rule symbol="' ||  (3*iterator - 3) || '" key="{' || uuid_generate_v4() ||'}" label="' || nome_fixed || ' não iniciada" filter="' || etapas_concluidas_txt || nome_fixed || '_situacao IN (''Não iniciada'') "/>';
        rules_txt := rules_txt || '<rule symbol="' ||  (3*iterator - 2) || '" key="{' || uuid_generate_v4() ||'}" label="' || nome_fixed || ' em andamento" filter="' || etapas_concluidas_txt || nome_fixed || '_situacao IN (''Em execução'') "/>';
        rules_txt := rules_txt || '<rule symbol="' ||  (3*iterator - 1) || '" key="{' || uuid_generate_v4() ||'}" label="' || nome_fixed || ' pausada" filter="' || etapas_concluidas_txt || nome_fixed || '_situacao IN (''Pausada'') "/>';
 
        IF r.tipo_etapa_id = 1 THEN
          tipo_pausada_txt := exec_pausada_txt;
          tipo_andamento_txt := exec_andamento_txt;
          tipo_txt := exec_txt;
        ELSIF r.tipo_etapa_id = 2 OR r.tipo_etapa_id = 5 THEN
          tipo_pausada_txt := replace(rev_pausada_txt, '{{ORDEM}}', r.numero::text);
          tipo_andamento_txt := replace(rev_andamento_txt, '{{ORDEM}}', r.numero::text);
          tipo_txt := replace(rev_txt, '{{ORDEM}}', r.numero::text);
        ELSIF r.tipo_etapa_id = 3 THEN
          tipo_pausada_txt := replace(cor_pausada_txt, '{{ORDEM}}', r.numero::text);
          tipo_andamento_txt := replace(cor_andamento_txt, '{{ORDEM}}', r.numero::text);
          tipo_txt := replace(cor_txt, '{{ORDEM}}', r.numero::text);
        ELSIF r.tipo_etapa_id = 4 THEN
          tipo_pausada_txt := replace(revcor_pausada_txt, '{{ORDEM}}', r.numero::text);
          tipo_andamento_txt := replace(revcor_andamento_txt, '{{ORDEM}}', r.numero::text);
          tipo_txt := replace(revcor_txt, '{{ORDEM}}', r.numero::text);
        END IF;

        symbols_txt := symbols_txt || replace(tipo_txt, '{{NUMERACAO}}', (3*iterator - 3)::text);
        symbols_txt := symbols_txt || replace(tipo_andamento_txt, '{{NUMERACAO}}', (3*iterator - 2)::text);
        symbols_txt := symbols_txt || replace(tipo_pausada_txt, '{{NUMERACAO}}', (3*iterator - 1)::text);

        etapas_concluidas_txt := etapas_concluidas_txt || nome_fixed || '_situacao IN (''Finalizada'',''Não será executada'',''-'') AND ';
        etapas_nome := etapas_nome || nome_fixed || '_situacao, ';
        iterator := iterator + 1;

      END LOOP;

      view_txt := view_txt || ' FROM macrocontrole.unidade_trabalho AS ut';
      view_txt := view_txt || jointxt;
      view_txt := view_txt || ' LEFT JOIN macrocontrole.bloco AS l ON l.id = ut.bloco_id';
      view_txt := view_txt || ' LEFT JOIN macrocontrole.dado_producao AS dp ON dp.id = ut.dado_producao_id';
      view_txt := view_txt || ' LEFT JOIN dominio.tipo_dado_producao AS tdp ON tdp.code = dp.tipo_dado_producao_id';

      view_txt := view_txt || ' LEFT JOIN (
      SELECT ut.id FROM macrocontrole.unidade_trabalho as ut
      INNER JOIN macrocontrole.atividade AS a ON a.unidade_trabalho_id = ut.id
      INNER JOIN macrocontrole.relacionamento_ut AS ut_sr ON ut_sr.ut_id = a.unidade_trabalho_id
      INNER JOIN macrocontrole.atividade AS a_re ON a_re.unidade_trabalho_id = ut_sr.ut_re_id
      WHERE (a_re.tipo_situacao_id IN (1, 2, 3) AND ut_sr.tipo_pre_requisito_id = 1)
      AND a.tipo_situacao_id = 1
      AND ut.subfase_id = ' || subfase_ident || ' AND ut.lote_id = ' || lote_ident || '
      GROUP BY ut.id) AS rest_pre ON rest_pre.id = ut.id';

      view_txt := view_txt || ' LEFT JOIN (
      SELECT ut.id FROM macrocontrole.unidade_trabalho as ut
      INNER JOIN macrocontrole.atividade AS a ON a.unidade_trabalho_id = ut.id
      INNER JOIN macrocontrole.relacionamento_ut AS ut_sr ON ut_sr.ut_id = a.unidade_trabalho_id
      INNER JOIN macrocontrole.atividade AS a_re ON a_re.unidade_trabalho_id = ut_sr.ut_re_id
      WHERE (a_re.tipo_situacao_id IN (2) AND ut_sr.tipo_pre_requisito_id = 2)
      AND a.tipo_situacao_id = 1
      AND ut.subfase_id = ' || subfase_ident || ' AND ut.lote_id = ' || lote_ident || '
      GROUP BY ut.id) AS rest_exec ON rest_exec.id = ut.id';

      view_txt := view_txt || ' WHERE ut.subfase_id = ' || subfase_ident || ' AND ut.lote_id = ' || lote_ident;
      view_txt := view_txt || wheretxt;
      view_txt := view_txt || ' ORDER BY ut.prioridade;';


      IF view_txt != '' THEN
        EXECUTE view_txt;
        EXECUTE 'ALTER TABLE acompanhamento.lote_' || lote_ident || '_subfase_' || subfase_ident || ' OWNER TO postgres';
        EXECUTE 'GRANT SELECT ON TABLE acompanhamento.lote_' || lote_ident || '_subfase_' || subfase_ident || ' TO PUBLIC';
        EXECUTE 'CREATE INDEX lote_' || lote_ident || '_subfase_' || subfase_ident || '_geom ON acompanhamento.lote_' || lote_ident || '_subfase_' || subfase_ident || ' USING gist (geom);';
        EXECUTE 'CREATE UNIQUE INDEX lote_' || lote_ident || '_subfase_' || subfase_ident || '_id ON acompanhamento.lote_' || lote_ident || '_subfase_' || subfase_ident || ' (id);';
        EXECUTE 'REFRESH MATERIALIZED VIEW CONCURRENTLY acompanhamento.lote_'|| lote_ident || '_subfase_' || subfase_ident;

        iterator := 3*iterator - 3;

        rules_txt := rules_txt || '<rule symbol="' ||  iterator || '" key="{' || uuid_generate_v4() ||'}" label="Concluído" filter="' || etapas_concluidas_txt || ' TRUE"/>';
        symbols_txt := symbols_txt || replace('<symbol force_rhr="0" name="{{NUMERACAO}}" type="fill" clip_to_extent="1" alpha="0.5"> <layer class="SimpleFill" locked="0" enabled="1" pass="0"> <prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/> <prop k="color" v="26,150,65,255"/> <prop k="joinstyle" v="bevel"/> <prop k="offset" v="0,0"/> <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/> <prop k="offset_unit" v="MM"/> <prop k="outline_color" v="0,0,0,255"/> <prop k="outline_style" v="solid"/> <prop k="outline_width" v="0.26"/> <prop k="outline_width_unit" v="MM"/> <prop k="style" v="solid"/> <data_defined_properties> <Option type="Map"> <Option name="name" type="QString" value=""/> <Option name="properties"/> <Option name="type" type="QString" value="collection"/> </Option> </data_defined_properties> </layer> </symbol>', '{{NUMERACAO}}', iterator::text);
        iterator := iterator + 1;

        rules_txt := rules_txt || '<rule symbol="' ||  iterator || '" key="{' || uuid_generate_v4() ||'}" label="Não disponível" filter="(disponivel &lt;> ''true'' and disponivel is not null)"/>';
        symbols_txt := symbols_txt || replace('<symbol force_rhr="0" name="{{NUMERACAO}}" type="fill" clip_to_extent="1" alpha="1"> <layer class="GeometryGenerator" locked="0" enabled="1" pass="0"> <prop k="SymbolType" v="Line"/> <prop k="geometryModifier" v=" intersection( make_line(make_point(x_max( bounds( $geometry )), y_min( bounds( $geometry ))) ,make_point(x_min( bounds( $geometry )), y_max( bounds( $geometry )))), $geometry )&#xd;&#xa; "/> <data_defined_properties> <Option type="Map"> <Option name="name" type="QString" value=""/> <Option name="properties"/> <Option name="type" type="QString" value="collection"/> </Option> </data_defined_properties> <symbol force_rhr="0" name="@{{NUMERACAO}}@0" type="line" clip_to_extent="1" alpha="1"> <layer class="SimpleLine" locked="0" enabled="1" pass="0"> <prop k="capstyle" v="square"/> <prop k="customdash" v="5;2"/> <prop k="customdash_map_unit_scale" v="3x:0,0,0,0,0,0"/> <prop k="customdash_unit" v="MM"/> <prop k="draw_inside_polygon" v="0"/> <prop k="joinstyle" v="bevel"/> <prop k="line_color" v="255,255,255,255"/> <prop k="line_style" v="solid"/> <prop k="line_width" v="2"/> <prop k="line_width_unit" v="MM"/> <prop k="offset" v="0"/> <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/> <prop k="offset_unit" v="MM"/> <prop k="ring_filter" v="0"/> <prop k="use_custom_dash" v="0"/> <prop k="width_map_unit_scale" v="3x:0,0,0,0,0,0"/> <data_defined_properties> <Option type="Map"> <Option name="name" type="QString" value=""/> <Option name="properties"/> <Option name="type" type="QString" value="collection"/> </Option> </data_defined_properties> </layer> </symbol> </layer> <layer class="GeometryGenerator" locked="0" enabled="1" pass="0"> <prop k="SymbolType" v="Line"/> <prop k="geometryModifier" v=" intersection( make_line(make_point(x_max( bounds( $geometry )), y_max( bounds( $geometry ))) ,make_point(x_min( bounds( $geometry )), y_min( bounds( $geometry )))), $geometry )&#xd;&#xa; "/> <data_defined_properties> <Option type="Map"> <Option name="name" type="QString" value=""/> <Option name="properties"/> <Option name="type" type="QString" value="collection"/> </Option> </data_defined_properties> <symbol force_rhr="0" name="@{{NUMERACAO}}@1" type="line" clip_to_extent="1" alpha="1"> <layer class="SimpleLine" locked="0" enabled="1" pass="0"> <prop k="capstyle" v="square"/> <prop k="customdash" v="5;2"/> <prop k="customdash_map_unit_scale" v="3x:0,0,0,0,0,0"/> <prop k="customdash_unit" v="MM"/> <prop k="draw_inside_polygon" v="0"/> <prop k="joinstyle" v="bevel"/> <prop k="line_color" v="255,255,255,255"/> <prop k="line_style" v="solid"/> <prop k="line_width" v="2"/> <prop k="line_width_unit" v="MM"/> <prop k="offset" v="0"/> <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/> <prop k="offset_unit" v="MM"/> <prop k="ring_filter" v="0"/> <prop k="use_custom_dash" v="0"/> <prop k="width_map_unit_scale" v="3x:0,0,0,0,0,0"/> <data_defined_properties> <Option type="Map"> <Option name="name" type="QString" value=""/> <Option name="properties"/> <Option name="type" type="QString" value="collection"/> </Option> </data_defined_properties> </layer> </symbol> </layer> <layer class="GeometryGenerator" locked="0" enabled="1" pass="0"> <prop k="SymbolType" v="Line"/> <prop k="geometryModifier" v=" intersection( make_line(make_point(x_max( bounds( $geometry )), y_min( bounds( $geometry ))) ,make_point(x_min( bounds( $geometry )), y_max( bounds( $geometry )))), $geometry )&#xd;&#xa; "/> <data_defined_properties> <Option type="Map"> <Option name="name" type="QString" value=""/> <Option name="properties"/> <Option name="type" type="QString" value="collection"/> </Option> </data_defined_properties> <symbol force_rhr="0" name="@{{NUMERACAO}}@2" type="line" clip_to_extent="1" alpha="1"> <layer class="SimpleLine" locked="0" enabled="1" pass="0"> <prop k="capstyle" v="square"/> <prop k="customdash" v="5;2"/> <prop k="customdash_map_unit_scale" v="3x:0,0,0,0,0,0"/> <prop k="customdash_unit" v="MM"/> <prop k="draw_inside_polygon" v="0"/> <prop k="joinstyle" v="bevel"/> <prop k="line_color" v="251,154,153,255"/> <prop k="line_style" v="solid"/> <prop k="line_width" v="1"/> <prop k="line_width_unit" v="MM"/> <prop k="offset" v="0"/> <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/> <prop k="offset_unit" v="MM"/> <prop k="ring_filter" v="0"/> <prop k="use_custom_dash" v="0"/> <prop k="width_map_unit_scale" v="3x:0,0,0,0,0,0"/> <data_defined_properties> <Option type="Map"> <Option name="name" type="QString" value=""/> <Option name="properties"/> <Option name="type" type="QString" value="collection"/> </Option> </data_defined_properties> </layer> </symbol> </layer> <layer class="GeometryGenerator" locked="0" enabled="1" pass="0"> <prop k="SymbolType" v="Line"/> <prop k="geometryModifier" v=" intersection( make_line(make_point(x_max( bounds( $geometry )), y_max( bounds( $geometry ))) ,make_point(x_min( bounds( $geometry )), y_min( bounds( $geometry )))), $geometry )&#xd;&#xa; "/> <data_defined_properties> <Option type="Map"> <Option name="name" type="QString" value=""/> <Option name="properties"/> <Option name="type" type="QString" value="collection"/> </Option> </data_defined_properties> <symbol force_rhr="0" name="@{{NUMERACAO}}@3" type="line" clip_to_extent="1" alpha="1"> <layer class="SimpleLine" locked="0" enabled="1" pass="0"> <prop k="capstyle" v="square"/> <prop k="customdash" v="5;2"/> <prop k="customdash_map_unit_scale" v="3x:0,0,0,0,0,0"/> <prop k="customdash_unit" v="MM"/> <prop k="draw_inside_polygon" v="0"/> <prop k="joinstyle" v="bevel"/> <prop k="line_color" v="251,154,153,255"/> <prop k="line_style" v="solid"/> <prop k="line_width" v="1"/> <prop k="line_width_unit" v="MM"/> <prop k="offset" v="0"/> <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/> <prop k="offset_unit" v="MM"/> <prop k="ring_filter" v="0"/> <prop k="use_custom_dash" v="0"/> <prop k="width_map_unit_scale" v="3x:0,0,0,0,0,0"/> <data_defined_properties> <Option type="Map"> <Option name="name" type="QString" value=""/> <Option name="properties"/> <Option name="type" type="QString" value="collection"/> </Option> </data_defined_properties> </layer> </symbol> </layer> </symbol>', '{{NUMERACAO}}', iterator::text);
        iterator := iterator + 1;
      
        rules_txt := rules_txt || '<rule symbol="' ||  iterator || '" key="{' || uuid_generate_v4() ||'}" label="ERRO" filter="ELSE"/>';
        symbols_txt := symbols_txt || replace('<symbol force_rhr="0" name="{{NUMERACAO}}" type="fill" clip_to_extent="1" alpha="1"> <layer class="SimpleFill" locked="0" enabled="1" pass="0"> <prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/> <prop k="color" v="25,4,250,255"/> <prop k="joinstyle" v="bevel"/> <prop k="offset" v="0,0"/> <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/> <prop k="offset_unit" v="MM"/> <prop k="outline_color" v="0,0,0,255"/> <prop k="outline_style" v="solid"/> <prop k="outline_width" v="0.26"/> <prop k="outline_width_unit" v="MM"/> <prop k="style" v="solid"/> <data_defined_properties> <Option type="Map"> <Option name="name" type="QString" value=""/> <Option name="properties"/> <Option name="type" type="QString" value="collection"/> </Option> </data_defined_properties> </layer> </symbol>', '{{NUMERACAO}}', iterator::text);

        estilo_txt := '<!DOCTYPE qgis PUBLIC ''http://mrcc.com/qgis.dtd'' ''SYSTEM''>';
        estilo_txt := estilo_txt || '<qgis styleCategories="Symbology|Labeling" labelsEnabled="1" version="3.4.10-Madeira">';
        estilo_txt := estilo_txt || '<renderer-v2 symbollevels="0" forceraster="0" type="RuleRenderer" enableorderby="0">';
        estilo_txt := estilo_txt || '<rules key="{' || uuid_generate_v4() || '}">' || rules_txt;
        estilo_txt := estilo_txt || '</rules><symbols>' || symbols_txt;
        estilo_txt := estilo_txt || '</symbols></renderer-v2><blendMode>0</blendMode><featureBlendMode>0</featureBlendMode><layerGeometryType>2</layerGeometryType></qgis>';

        INSERT INTO public.layer_styles(f_table_catalog, f_table_schema, f_table_name, f_geometry_column, stylename, styleqml, stylesld, useasdefault, owner, ui, update_time) VALUES
        (current_database(), 'acompanhamento', 'lote_' || lote_ident || '_subfase_'|| subfase_ident, 'geom', 'acompanhamento_subfase', estilo_txt, NULL, TRUE, current_user, NULL, now());
      END IF;
    END IF;
  END;
$$
LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION acompanhamento.cria_view_acompanhamento_subfase(integer, integer)
  OWNER TO postgres;


CREATE OR REPLACE FUNCTION acompanhamento.cria_view_acompanhamento_subfase()
  RETURNS trigger AS
$BODY$
    DECLARE subfase_ident integer;
    DECLARE lote_ident integer;
    BEGIN

    IF TG_OP = 'DELETE' THEN
      subfase_ident := OLD.subfase_id;
      lote_ident := OLD.lote_id;
    ELSE
      subfase_ident := NEW.subfase_id;
      lote_ident := NEW.lote_id;
    END IF;

    IF TG_OP = 'UPDATE' THEN
      EXECUTE 'DROP MATERIALIZED VIEW IF EXISTS acompanhamento.lote_' || OLD.lote_id || '_subfase_'|| OLD.subfase_id;
      EXECUTE 'DROP MATERIALIZED VIEW IF EXISTS acompanhamento.lote_' || NEW.lote_id || '_subfase_'|| NEW.subfase_id;
    ELSE
      EXECUTE 'DROP MATERIALIZED VIEW IF EXISTS acompanhamento.lote_' || lote_ident || '_subfase_'|| subfase_ident;
    END IF;


    DELETE FROM public.layer_styles
    WHERE f_table_schema = 'acompanhamento' AND f_table_name = ('lote_' || lote_ident || '_subfase_'|| subfase_ident) AND stylename = 'acompanhamento_subfase';

    PERFORM acompanhamento.cria_view_acompanhamento_subfase(subfase_ident, lote_ident);

    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;

    END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

CREATE OR REPLACE FUNCTION acompanhamento.cria_view_acompanhamento_lote(lote_ident integer, linhaproducao_ident integer)
  RETURNS void AS
$$
  DECLARE view_txt text;
  DECLARE jointxt text := '';
  DECLARE num integer;
  DECLARE nome_fixed text;
  DECLARE r record;
  DECLARE iterator integer := 1;
  DECLARE rules_txt text := '';
  DECLARE estilo_txt text := '';
  DECLARE fases_concluidas_txt text := '';
  DECLARE symbols_txt text := '';
  DECLARE tipo_txt text := '';
  DECLARE tipo_andamento_txt text := '';
  BEGIN
    SELECT count(*) INTO num FROM macrocontrole.fase WHERE linha_producao_id = linhaproducao_ident;

    IF num > 0 THEN
      view_txt := 'CREATE MATERIALIZED VIEW acompanhamento.lote_' || lote_ident || ' AS 
      SELECT p.id, p.uuid, p.nome, p.mi, p.inom, p.denominador_escala, tp.nome AS tipo_produto, p.geom';

      tipo_txt := '<symbol force_rhr="0" type="fill" name="{{NUMERACAO}}" alpha="1" clip_to_extent="1"><data_defined_properties><Option type="Map"><Option type="QString" name="name" value=""/><Option name="properties"/><Option type="QString" name="type" value="collection"/></Option></data_defined_properties><layer class="SimpleFill" pass="0" enabled="1" locked="0"><Option type="Map"><Option type="QString" name="border_width_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="color" value="{{COR}},255"/><Option type="QString" name="joinstyle" value="bevel"/><Option type="QString" name="offset" value="0,0"/><Option type="QString" name="offset_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="offset_unit" value="MM"/><Option type="QString" name="outline_color" value="0,0,0,255"/><Option type="QString" name="outline_style" value="solid"/><Option type="QString" name="outline_width" value="0.26"/><Option type="QString" name="outline_width_unit" value="MM"/><Option type="QString" name="style" value="solid"/></Option><prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="color" v="{{COR}},255"/><prop k="joinstyle" v="bevel"/><prop k="offset" v="0,0"/><prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="offset_unit" v="MM"/><prop k="outline_color" v="0,0,0,255"/><prop k="outline_style" v="solid"/><prop k="outline_width" v="0.26"/><prop k="outline_width_unit" v="MM"/><prop k="style" v="solid"/><data_defined_properties><Option type="Map"><Option type="QString" name="name" value=""/><Option name="properties"/><Option type="QString" name="type" value="collection"/></Option></data_defined_properties></layer></symbol>';
      tipo_andamento_txt := '<symbol force_rhr="0" type="fill" name="{{NUMERACAO}}" alpha="1" clip_to_extent="1"><data_defined_properties><Option type="Map"><Option type="QString" name="name" value=""/><Option name="properties"/><Option type="QString" name="type" value="collection"/></Option></data_defined_properties><layer class="SimpleFill" pass="0" enabled="1" locked="0"><Option type="Map"><Option type="QString" name="border_width_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="color" value="{{COR}},255"/><Option type="QString" name="joinstyle" value="bevel"/><Option type="QString" name="offset" value="0,0"/><Option type="QString" name="offset_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="offset_unit" value="MM"/><Option type="QString" name="outline_color" value="0,0,0,255"/><Option type="QString" name="outline_style" value="solid"/><Option type="QString" name="outline_width" value="0.26"/><Option type="QString" name="outline_width_unit" value="MM"/><Option type="QString" name="style" value="solid"/></Option><prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="color" v="{{COR}},255"/><prop k="joinstyle" v="bevel"/><prop k="offset" v="0,0"/><prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="offset_unit" v="MM"/><prop k="outline_color" v="0,0,0,255"/><prop k="outline_style" v="solid"/><prop k="outline_width" v="0.26"/><prop k="outline_width_unit" v="MM"/><prop k="style" v="solid"/><data_defined_properties><Option type="Map"><Option type="QString" name="name" value=""/><Option name="properties"/><Option type="QString" name="type" value="collection"/></Option></data_defined_properties></layer><layer class="LinePatternFill" pass="0" enabled="1" locked="0"><Option type="Map"><Option type="QString" name="angle" value="45"/><Option type="QString" name="color" value="0,0,255,255"/><Option type="QString" name="distance" value="1"/><Option type="QString" name="distance_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="distance_unit" value="MM"/><Option type="QString" name="line_width" value="0.26"/><Option type="QString" name="line_width_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="line_width_unit" value="MM"/><Option type="QString" name="offset" value="0"/><Option type="QString" name="offset_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="offset_unit" value="MM"/><Option type="QString" name="outline_width_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="outline_width_unit" value="MM"/></Option><prop k="angle" v="45"/><prop k="color" v="0,0,255,255"/><prop k="distance" v="1"/><prop k="distance_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="distance_unit" v="MM"/><prop k="line_width" v="0.26"/><prop k="line_width_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="line_width_unit" v="MM"/><prop k="offset" v="0"/><prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="offset_unit" v="MM"/><prop k="outline_width_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="outline_width_unit" v="MM"/><data_defined_properties><Option type="Map"><Option type="QString" name="name" value=""/><Option name="properties"/><Option type="QString" name="type" value="collection"/></Option></data_defined_properties><symbol force_rhr="0" type="line" name="@{{NUMERACAO}}@1" alpha="1" clip_to_extent="1"><data_defined_properties><Option type="Map"><Option type="QString" name="name" value=""/><Option name="properties"/><Option type="QString" name="type" value="collection"/></Option></data_defined_properties><layer class="SimpleLine" pass="0" enabled="1" locked="0"><Option type="Map"><Option type="QString" name="align_dash_pattern" value="0"/><Option type="QString" name="capstyle" value="square"/><Option type="QString" name="customdash" value="5;2"/><Option type="QString" name="customdash_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="customdash_unit" value="MM"/><Option type="QString" name="dash_pattern_offset" value="0"/><Option type="QString" name="dash_pattern_offset_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="dash_pattern_offset_unit" value="MM"/><Option type="QString" name="draw_inside_polygon" value="0"/><Option type="QString" name="joinstyle" value="bevel"/><Option type="QString" name="line_color" value="0,0,0,255"/><Option type="QString" name="line_style" value="solid"/><Option type="QString" name="line_width" value="0.26"/><Option type="QString" name="line_width_unit" value="MM"/><Option type="QString" name="offset" value="0"/><Option type="QString" name="offset_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="offset_unit" value="MM"/><Option type="QString" name="ring_filter" value="0"/><Option type="QString" name="tweak_dash_pattern_on_corners" value="0"/><Option type="QString" name="use_custom_dash" value="0"/><Option type="QString" name="width_map_unit_scale" value="3x:0,0,0,0,0,0"/></Option><prop k="align_dash_pattern" v="0"/><prop k="capstyle" v="square"/><prop k="customdash" v="5;2"/><prop k="customdash_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="customdash_unit" v="MM"/><prop k="dash_pattern_offset" v="0"/><prop k="dash_pattern_offset_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="dash_pattern_offset_unit" v="MM"/><prop k="draw_inside_polygon" v="0"/><prop k="joinstyle" v="bevel"/><prop k="line_color" v="0,0,0,255"/><prop k="line_style" v="solid"/><prop k="line_width" v="0.26"/><prop k="line_width_unit" v="MM"/><prop k="offset" v="0"/><prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="offset_unit" v="MM"/><prop k="ring_filter" v="0"/><prop k="tweak_dash_pattern_on_corners" v="0"/><prop k="use_custom_dash" v="0"/><prop k="width_map_unit_scale" v="3x:0,0,0,0,0,0"/><data_defined_properties><Option type="Map"><Option type="QString" name="name" value=""/><Option name="properties"/><Option type="QString" name="type" value="collection"/></Option></data_defined_properties></layer></symbol></layer></symbol>';

      FOR r in SELECT f.id, tf.nome, tf.cor, rank() OVER (PARTITION BY tf.nome ORDER BY f.ordem) as numero FROM macrocontrole.fase AS f
      INNER JOIN dominio.tipo_fase AS tf ON tf.code = f.tipo_fase_id
      WHERE f.linha_producao_id = linhaproducao_ident
      ORDER BY f.ordem
      LOOP

        IF r.numero > 1 THEN
          nome_fixed := translate(replace(lower(r.nome),' ', '_'),  
                'àáâãäéèëêíìïîóòõöôúùüûçÇ/-|/\,.;:<>?!`{}[]()~`@#$%^&*+=''',  
                'aaaaaeeeeiiiiooooouuuucc________________________________') || '_' || r.numero;
        ELSE
          nome_fixed := translate(replace(lower(r.nome),' ', '_'),  
                'àáâãäéèëêíìïîóòõöôúùüûçÇ/-|/\,.;:<>?!`{}[]()~`@#$%^&*+=''',  
                'aaaaaeeeeiiiiooooouuuucc________________________________');
        END IF;


        view_txt := view_txt || ', (CASE WHEN min(ut' || iterator || '.id) IS NOT NULL THEN min(ut' || iterator || '.data_inicio)::text ELSE ''-'' END) AS  ' || nome_fixed || '_data_inicio';
        view_txt := view_txt || ', (CASE WHEN min(ut' || iterator || '.id) IS NOT NULL THEN (CASE WHEN count(*) - count(ut' || iterator || '.data_fim) = 0 THEN max(ut' || iterator || '.data_fim)::text ELSE NULL END) ELSE ''-'' END) AS  ' || nome_fixed || '_data_fim';

        jointxt := jointxt || ' LEFT JOIN 
          (SELECT ut.id, ut.geom, min(a.data_inicio) as data_inicio,
          (CASE WHEN count(*) - count(a.data_fim) = 0 THEN max(a.data_fim) ELSE NULL END) AS data_fim
          FROM macrocontrole.unidade_trabalho AS ut
          INNER JOIN macrocontrole.produto AS p ON p.lote_id = ut.lote_id
          INNER JOIN macrocontrole.subfase AS s ON s.id = ut.subfase_id
          INNER JOIN
          (select unidade_trabalho_id, data_inicio, data_fim from macrocontrole.atividade where tipo_situacao_id IN (1,2,3,4)) AS a
          ON a.unidade_trabalho_id = ut.id
          WHERE s.fase_id = ' || r.id || ' AND ut.lote_id = ' || lote_ident || '
          GROUP BY ut.id) AS ut' || iterator || ' ON ut' || iterator || '.id = rp.ut_id';

        rules_txt := rules_txt || '<rule symbol="' ||  (2*iterator - 2) || '" key="{' || uuid_generate_v4() ||'}" label="' || nome_fixed || ' não iniciada" filter="' || fases_concluidas_txt || nome_fixed || '_data_inicio IS NULL "/>';
        rules_txt := rules_txt || '<rule symbol="' ||  (2*iterator - 1) || '" key="{' || uuid_generate_v4() ||'}" label="' || nome_fixed || ' em execução" filter="' || fases_concluidas_txt || nome_fixed || '_data_fim IS NULL AND ' || nome_fixed || '_data_inicio IS NOT NULL"/>';
        
        fases_concluidas_txt := fases_concluidas_txt || nome_fixed || '_data_fim IS NOT NULL AND ';

        symbols_txt := symbols_txt || replace(replace(tipo_txt, '{{NUMERACAO}}', (2*iterator - 2)::text), '{{COR}}', r.cor);
        symbols_txt := symbols_txt || replace(replace(tipo_andamento_txt, '{{NUMERACAO}}', (2*iterator - 1)::text), '{{COR}}', r.cor);

        iterator := iterator + 1;

      END LOOP;

      view_txt := view_txt || ' FROM macrocontrole.produto AS p INNER JOIN macrocontrole.relacionamento_produto AS rp ON rp.p_id = p.id INNER JOIN dominio.tipo_produto AS tp ON tp.code = p.tipo_produto_id';
      view_txt := view_txt || jointxt;
      view_txt := view_txt || ' WHERE p.lote_id = ' || lote_ident || ' GROUP BY p.id, tp.nome;';

      EXECUTE view_txt;
      EXECUTE 'ALTER TABLE acompanhamento.lote_' || lote_ident || ' OWNER TO postgres';
      EXECUTE 'GRANT SELECT ON TABLE acompanhamento.lote_' || lote_ident || ' TO PUBLIC';
      EXECUTE 'CREATE INDEX lote_' || lote_ident || '_geom ON acompanhamento.lote_' || lote_ident || ' USING gist (geom);';
      EXECUTE 'CREATE UNIQUE INDEX lote_' || lote_ident || '_id ON acompanhamento.lote_' || lote_ident || ' (id);';
      EXECUTE 'REFRESH MATERIALIZED VIEW CONCURRENTLY acompanhamento.lote_'|| lote_ident;

      iterator := 2*iterator - 2;
      rules_txt := rules_txt || '<rule symbol="' ||  iterator || '" key="{' || uuid_generate_v4() ||'}" label="Concluído" filter="' || fases_concluidas_txt || ' TRUE"/>';
      symbols_txt := symbols_txt || replace(replace(tipo_txt, '{{NUMERACAO}}', iterator::text), '{{COR}}', '26,152,80');

      estilo_txt := '<!DOCTYPE qgis PUBLIC ''http://mrcc.com/qgis.dtd'' ''SYSTEM''>';
      estilo_txt := estilo_txt || '<qgis styleCategories="Symbology" version="3.18.3-Zürich">';
      estilo_txt := estilo_txt || '<renderer-v2 forceraster="0" enableorderby="0" type="RuleRenderer" symbollevels="0">';
      estilo_txt := estilo_txt || '<rules key="{' || uuid_generate_v4() || '}">' || rules_txt;
      estilo_txt := estilo_txt || '</rules><symbols>' || symbols_txt;
      estilo_txt := estilo_txt || '</symbols></renderer-v2><blendMode>0</blendMode><featureBlendMode>0</featureBlendMode><layerGeometryType>2</layerGeometryType></qgis>';


      INSERT INTO public.layer_styles(f_table_catalog, f_table_schema, f_table_name, f_geometry_column, stylename, styleqml, stylesld, useasdefault, owner, ui, update_time) VALUES
      (current_database(), 'acompanhamento', 'lote_'|| lote_ident, 'geom', 'acompanhamento_lote', estilo_txt, NULL, TRUE, current_user, NULL, now());

    END IF;
  END;
$$
LANGUAGE plpgsql VOLATILE
  COST 100;

CREATE OR REPLACE FUNCTION acompanhamento.cria_view_acompanhamento_bloco()
  RETURNS void AS
$$
  DECLARE view_txt text;
  DECLARE jointxt text := '';
  DECLARE nome_fixed text;
  DECLARE r record;
  BEGIN
      view_txt := 'CREATE MATERIALIZED VIEW acompanhamento.bloco AS 
      SELECT b.id, b.nome, b.prioridade, l.nome AS lote, b.geom';

      FOR r in SELECT pf.id, pf.nome FROM macrocontrole.perfil_producao AS pf
      LOOP

        nome_fixed := translate(replace(lower(r.nome),' ', '_'),  
              'àáâãäéèëêíìïîóòõöôúùüûçÇ/-|/\,.;:<>?!`{}[]()~`@#$%^&*+=''',  
              'aaaaaeeeeiiiiooooouuuucc________________________________');

        view_txt := view_txt || ',  operadores_' || r.id || '.operadores AS  ' || nome_fixed || '_operadores';
        view_txt := view_txt || ',  atividades_' || r.id || '.atividades AS  ' || nome_fixed || '_atividades';

        jointxt := jointxt || ' INNER JOIN 
            (SELECT b.id, COUNT(pbo.id) AS operadores
            FROM macrocontrole.bloco AS b
            LEFT JOIN (
              SELECT pbo.id, pbo.bloco_id
              FROM macrocontrole.perfil_bloco_operador AS pbo
              INNER JOIN macrocontrole.perfil_producao_operador AS ppo ON ppo.usuario_id = pbo.usuario_id AND ppo.perfil_producao_id = ' || r.id ||'
            ) AS pbo ON pbo.bloco_id = b.id
            GROUP BY b.id) AS operadores_' || r.id || ' ON operadores_' || r.id || '.id = b.id';

        jointxt := jointxt || ' INNER JOIN 
            (SELECT b.id, COUNT(a.id) AS atividades
            FROM macrocontrole.bloco AS b
            LEFT JOIN macrocontrole.unidade_trabalho AS ut ON ut.bloco_id = b.id
            LEFT JOIN (
              SELECT a.id, a.unidade_trabalho_id
              FROM macrocontrole.atividade AS a
              INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
              INNER JOIN macrocontrole.perfil_producao_etapa AS ppe ON ppe.subfase_id = e.subfase_id AND ppe.tipo_etapa_id = e.tipo_etapa_id
              WHERE a.tipo_situacao_id = 1 AND ppe.perfil_producao_id = ' || r.id ||'
            ) AS a ON a.unidade_trabalho_id = ut.id
            GROUP BY b.id) AS atividades_' || r.id || ' ON atividades_' || r.id || '.id = b.id';

      END LOOP;

      view_txt := view_txt || ' FROM (SELECT b.id, b.nome, b.lote_id, b.prioridade, ST_Collect(ut.geom) as geom 
                                FROM macrocontrole.bloco AS b
                                INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.bloco_id = b.id 
                                GROUP BY b.id) AS b
                                INNER JOIN macrocontrole.lote AS l ON l.id = b.lote_id';
      view_txt := view_txt || jointxt;

      EXECUTE view_txt;
      EXECUTE 'ALTER TABLE acompanhamento.bloco OWNER TO postgres';
      EXECUTE 'GRANT SELECT ON TABLE acompanhamento.bloco TO PUBLIC';
      EXECUTE 'CREATE INDEX bloco_geom ON acompanhamento.bloco USING gist (geom);';
      EXECUTE 'CREATE UNIQUE INDEX bloco_id ON acompanhamento.bloco (id);';
      EXECUTE 'REFRESH MATERIALIZED VIEW CONCURRENTLY acompanhamento.bloco';

  END;
$$
LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION acompanhamento.cria_view_acompanhamento_bloco()
  OWNER TO postgres;

CREATE OR REPLACE FUNCTION acompanhamento.view_acompanhamento_bloco()
  RETURNS trigger AS
$BODY$
    BEGIN
    EXECUTE 'DROP MATERIALIZED VIEW IF EXISTS acompanhamento.bloco';

    PERFORM acompanhamento.cria_view_acompanhamento_bloco();

    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;

    END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

CREATE TRIGGER refresh_bloco_perfil_producao_operador
AFTER UPDATE OR INSERT OR DELETE ON macrocontrole.perfil_producao_operador
FOR EACH ROW EXECUTE PROCEDURE acompanhamento.refresh_view_acompanhamento_bloco();

CREATE OR REPLACE FUNCTION acompanhamento.refresh_view_acompanhamento_produto()
  RETURNS trigger AS
$BODY$
    DECLARE lote_ident integer;
    BEGIN
    IF TG_OP = 'DELETE' THEN
      lote_ident := OLD.lote_id;
    ELSE
      lote_ident := NEW.lote_id;
    END IF;
    EXECUTE 'REFRESH MATERIALIZED VIEW CONCURRENTLY acompanhamento.lote_'|| lote_ident;
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
    END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION acompanhamento.refresh_view_acompanhamento_produto()
  OWNER TO postgres;
CREATE TRIGGER refresh_view_acompanhamento_produto
AFTER UPDATE OR INSERT OR DELETE ON macrocontrole.produto
FOR EACH ROW EXECUTE PROCEDURE acompanhamento.refresh_view_acompanhamento_produto();

INSERT INTO macrocontrole.relacionamento_ut (ut_id, ut_re_id, tipo_pre_requisito_id)
SELECT ut.id AS ut_id, ut_re.id AS ut_re_id, prs.tipo_pre_requisito_id
FROM macrocontrole.unidade_trabalho AS ut
INNER JOIN macrocontrole.pre_requisito_subfase AS prs ON prs.subfase_posterior_id = ut.subfase_id
INNER JOIN macrocontrole.unidade_trabalho AS ut_re ON ut_re.subfase_id = prs.subfase_anterior_id AND ut.lote_id = ut_re.lote_id
WHERE ut.id != ut_re.id AND ut.geom && ut_re.geom AND st_relate(ut.geom, ut_re.geom, '2********');

INSERT INTO macrocontrole.relacionamento_produto (p_id, ut_id)
SELECT p.id AS p_id, ut.id AS ut_id
FROM macrocontrole.produto AS p
INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.lote_id = p.lote_id AND p.geom && ut.geom AND st_relate(p.geom, ut.geom, '2********');

DROP MATERIALIZED VIEW IF EXISTS acompanhamento.bloco;
SELECT acompanhamento.cria_view_acompanhamento_bloco();

UPDATE macrocontrole.etapa
SET id = id;

UPDATE macrocontrole.lote
SET id = id;

ALTER TABLE macrocontrole.problema_atividade
ADD COLUMN usuario_id INTEGER NOT NULL DEFAULT 1;

ALTER TABLE macrocontrole.problema_atividade
ADD CONSTRAINT problema_atividade_usuario_id_fkey FOREIGN KEY (usuario_id)
        REFERENCES dgeo.usuario (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION;

ALTER TABLE macrocontrole.problema_atividade ALTER COLUMN usuario_id DROP DEFAULT;

CREATE TABLE dgeo.qgis_themes(
	  id SERIAL NOT NULL PRIMARY KEY,
    nome text NOT NULL,
    definicao_tema text NOT NULL,
    owner varchar(255) NOT NULL,
	  update_time timestamp without time zone NOT NULL DEFAULT now(),
    CONSTRAINT unique_themes UNIQUE (nome)
);

CREATE TABLE macrocontrole.perfil_tema(
	id SERIAL NOT NULL PRIMARY KEY,
	tema_id INTEGER NOT NULL REFERENCES dgeo.qgis_themes (id),
	subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
	lote_id INTEGER NOT NULL REFERENCES macrocontrole.lote (id),
	UNIQUE(tema_id,subfase_id,lote_id)
);

INSERT INTO dominio.tipo_problema (code, nome) VALUES
(7, 'Finalizei a atividade incorretamente');

CREATE SCHEMA metadado;

-- Tipos de palavra chave previstos na ISO19115 / PCDG
CREATE TABLE metadado.tipo_palavra_chave(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO metadado.tipo_palavra_chave (code, nome) VALUES
(1, 'disciplinar'),
(2, 'geologica'),
(3, 'tematica'),
(4, 'temporal'),
(5, 'toponimica');

-- Associa palavra chave a um produto. O produto pode ter multiplas palavras chaves de diferentes tipos.
CREATE TABLE metadado.palavra_chave_produto(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
 	tipo_palavra_chave_id SMALLINT NOT NULL REFERENCES metadado.tipo_palavra_chave (code),
 	produto_id INTEGER NOT NULL REFERENCES macrocontrole.produto (id),
	UNIQUE(nome,produto_id)
);

-- MD_ClassificationCode
CREATE TABLE metadado.codigo_classificacao(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO metadado.codigo_classificacao (code, nome) VALUES
(1, 'ostensivo'),
(2, 'reservado'),
(3, 'confidencial'),
(4, 'secreto'),
(5, 'ultraSecreto');

-- MD_RestrictionCode
CREATE TABLE metadado.codigo_restricao(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO metadado.codigo_restricao (code, nome) VALUES
(1, 'copyright'),
(2, 'patent'),
(3, 'patentPending'),
(4, 'trademark'),
(5, 'license'),
(6, 'intellectualPropertyRights'),
(7, 'restricted'),
(8, 'otherRestrictions');

CREATE TABLE metadado.datum_vertical(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO metadado.datum_vertical (code, nome) VALUES
(0, 'Sem datum vertical'),
(1, 'Datum de Imbituba - SC'),
(2, 'Datum de Santana - AP'),
(3, 'Marégrafo de Torres - RS');


CREATE TABLE metadado.especificacao(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO metadado.especificacao (code, nome) VALUES
(1, 'ET-EDGV 2.1.3'),
(2, 'ET-EDGV 3.0'),
(3, 'T34-700'),
(4, 'ET-RDG');

CREATE TABLE metadado.organizacao(
	id INTEGER NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO metadado.organizacao (id, nome) VALUES
(1, '1º Centro de Geoinformação'),
(2, '2º Centro de Geoinformação'),
(3, '3º Centro de Geoinformação'),
(4, '4º Centro de Geoinformação'),
(5, '5º Centro de Geoinformação');

CREATE TABLE metadado.usuario(
  id SERIAL NOT NULL PRIMARY KEY,
  usuario_sap_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
  nome VARCHAR(255) NOT NULL,
  funcao VARCHAR(255) NOT NULL,
  organizacao_id INTEGER NOT NULL REFERENCES metadado.organizacao (id)
);

CREATE TABLE metadado.responsavel_fase_produto(
  id SERIAL NOT NULL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES metadado.usuario (id),
  fase_id INTEGER NOT NULL REFERENCES macrocontrole.fase (id),
  produto_id INTEGER NOT NULL REFERENCES macrocontrole.produto (id)
);


CREATE TABLE metadado.informacoes_produto(
	id SERIAL NOT NULL PRIMARY KEY,
 	produto_id INTEGER NOT NULL REFERENCES macrocontrole.produto (id),
	resumo TEXT,
	proposito TEXT,
	creditos TEXT,
	informacoes_complementares TEXT,
	limitacao_acesso_id SMALLINT NOT NULL REFERENCES metadado.codigo_restricao (code),
	limitacao_uso_id SMALLINT NOT NULL REFERENCES metadado.codigo_restricao (code),
	restricao_uso_id SMALLINT NOT NULL REFERENCES metadado.codigo_restricao (code),
	grau_sigilo_id SMALLINT NOT NULL REFERENCES metadado.codigo_classificacao (code),
	organizacao_responsavel_id  INTEGER NOT NULL REFERENCES metadado.organizacao (id),
	organizacao_distribuicao_id  INTEGER NOT NULL REFERENCES metadado.organizacao (id),
	datum_vertical_id SMALLINT NOT NULL REFERENCES metadado.datum_vertical (code),
	especificacao_id SMALLINT NOT NULL REFERENCES metadado.especificacao (code),
	responsavel_produto_id INTEGER NOT NULL REFERENCES metadado.usuario (id),
	declaracao_linhagem TEXT,
	projeto_bdgex VARCHAR(255) NOT NULL
);

CREATE TABLE metadado.creditos_qpt(
	id SERIAL NOT NULL PRIMARY KEY,
	qpt text NOT NULL
);

CREATE TABLE metadado.informacoes_edicao(
	id SERIAL NOT NULL PRIMARY KEY,
 	produto_id INTEGER NOT NULL REFERENCES macrocontrole.produto (id),
	pec_planimetrico VARCHAR(255) NOT NULL,
    pec_altimetrico VARCHAR(255) NOT NULL,
    origem_dados_altimetricos VARCHAR(255) NOT NULL,
    territorio_internacional BOOLEAN NOT NULL,
    acesso_restrito BOOLEAN NOT NULL,
    carta_militar BOOLEAN NOT NULL,
	data_criacao VARCHAR(255) NOT NULL,
	creditos_id SMALLINT NOT NULL REFERENCES metadado.creditos_qpt (id),
	epsg_mde VARCHAR(255) NOT NULL,
	caminho_mde VARCHAR(255) NOT NULL,
	dados_terceiro text ARRAY,
	quadro_fases JSON NOT NULL
);

CREATE TABLE metadado.imagens_carta_ortoimagem(
	id SERIAL NOT NULL PRIMARY KEY,
    produto_id INTEGER NOT NULL REFERENCES macrocontrole.produto (id),
	caminho_imagem VARCHAR(255) NOT NULL,
	caminho_estilo VARCHAR(255),
	epsg VARCHAR(255) NOT NULL
);

CREATE TABLE metadado.classes_complementares_orto(
	id SERIAL NOT NULL PRIMARY KEY,
	nome text ARRAY NOT NULL
);

INSERT INTO metadado.classes_complementares_orto (nome)
VALUES (ARRAY [
	'llp_unidade_federacao_a',
	'elemnat_curva_nivel_l',
	'elemnat_ponto_cotado_p',
	'infra_pista_pouso_p',
	'infra_pista_pouso_l',
	'infra_pista_pouso_a',
	'elemnat_toponimo_fisiografico_natural_p',
	'elemnat_toponimo_fisiografico_natural_l',
	'elemnat_ilha_p',
	'elemnat_ilha_a',
	'llp_aglomerado_rural_p',
	'llp_area_pub_militar_a',
	'llp_terra_indigena_a',
	'llp_unidade_conservacao_a',
	'infra_elemento_energia_p',
	'infra_elemento_energia_l',
	'infra_elemento_energia_a',
	'constr_extracao_mineral'
]);

CREATE TABLE metadado.perfil_classes_complementares_orto(
	id SERIAL NOT NULL PRIMARY KEY,
    produto_id INTEGER NOT NULL REFERENCES macrocontrole.produto (id),
	classes_complementares_orto_id INTEGER NOT NULL REFERENCES metadado.classes_complementares_orto (id)
);

UPDATE public.versao
SET nome = '2.2.0' WHERE code = 1;

COMMIT;