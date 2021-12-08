BEGIN;

CREATE SCHEMA acompanhamento;

CREATE TABLE acompanhamento.login(
  id SERIAL NOT NULL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
  data_login  timestamp with time zone NOT NULL
);

CREATE OR REPLACE FUNCTION acompanhamento.cria_view_acompanhamento_subfase(subfase_ident integer, lote_ident integer)
  RETURNS void AS
$$
    DECLARE view_txt text;
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
    SELECT count(*) INTO num FROM macrocontrole.etapa WHERE subfase_id = subfase_ident;
    IF num > 0 THEN
      view_txt := 'CREATE MATERIALIZED VIEW acompanhamento.lote_' || lote_ident || '_subfase_' || subfase_ident || '  AS 
      SELECT ut.id, ut.subfase_id, ut.disponivel, l.nome AS bloco, ut.nome, dp.nome AS dado_producao, dp.configuracao_producao, tdp.nome AS tipo_dado_producao, dp.configuracao_finalizacao, tdf.nome AS tipo_dado_finalizacao, ut.prioridade, ut.geom';

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

      FOR r IN SELECT se.id, e.code AS tipo_etapa_id, e.nome, rank() OVER (PARTITION BY e.nome ORDER BY se.ordem) as numero FROM dominio.tipo_etapa AS e 
      INNER JOIN macrocontrole.etapa AS se ON e.code = se.tipo_etapa_id
      WHERE se.subfase_id = subfase_ident
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
        ELSIF r.tipo_etapa_id = 2 THEN
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
      view_txt := view_txt || ' LEFT JOIN dominio.tipo_dado_producao AS tdf ON tdf.code = dp.tipo_dado_finalizacao_id';
      view_txt := view_txt || ' WHERE ut.subfase_id = ' || subfase_ident || ' AND ut.lote_id = ' || lote_ident;
      view_txt := view_txt || wheretxt;
      view_txt := view_txt || ' ORDER BY ut.prioridade;';

      EXECUTE view_txt;
      EXECUTE 'GRANT SELECT ON TABLE acompanhamento.lote_' || lote_ident || '_subfase_' || subfase_ident || ' TO PUBLIC';
      EXECUTE 'CREATE INDEX lote_' || lote_ident || '_subfase_' || subfase_ident || '_geom ON acompanhamento.lote_' || lote_ident || '_subfase_' || subfase_ident || ' USING gist (geom);';
      EXECUTE 'CREATE UNIQUE INDEX lote_' || lote_ident || '_subfase_' || subfase_ident || '_id ON acompanhamento.lote_' || lote_ident || '_subfase_' || subfase_ident || ' (id);';

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
    ELSE
      subfase_ident := NEW.subfase_id;
    END IF;

    SELECT l.id
    INTO lote_ident
    FROM macrocontrole.subfase AS s
    INNER JOIN macrocontrole.fase AS f ON s.fase_id = f.id
    INNER JOIN macrocontrole.lote AS l ON f.linha_producao_id = l.linha_producao_id
    WHERE s.id = subfase_ident;

    EXECUTE 'DROP MATERIALIZED VIEW IF EXISTS acompanhamento.lote_' || lote_ident || '_subfase_'|| subfase_ident;

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
ALTER FUNCTION acompanhamento.cria_view_acompanhamento_subfase()
  OWNER TO postgres;

CREATE TRIGGER cria_view_acompanhamento_subfase
AFTER UPDATE OR INSERT OR DELETE ON macrocontrole.etapa
FOR EACH ROW EXECUTE PROCEDURE acompanhamento.cria_view_acompanhamento_subfase();

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
      SELECT p.id, p.uuid, p.nome, p.mi, p.inom, p.escala, tp.nome AS tipo_produto, p.geom';

      tipo_txt := '<symbol force_rhr="0" type="fill" name="{{NUMERACAO}}" alpha="1" clip_to_extent="1"><data_defined_properties><Option type="Map"><Option type="QString" name="name" value=""/><Option name="properties"/><Option type="QString" name="type" value="collection"/></Option></data_defined_properties><layer class="SimpleFill" pass="0" enabled="1" locked="0"><Option type="Map"><Option type="QString" name="border_width_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="color" value="{{COR}},255"/><Option type="QString" name="joinstyle" value="bevel"/><Option type="QString" name="offset" value="0,0"/><Option type="QString" name="offset_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="offset_unit" value="MM"/><Option type="QString" name="outline_color" value="0,0,0,255"/><Option type="QString" name="outline_style" value="solid"/><Option type="QString" name="outline_width" value="0.26"/><Option type="QString" name="outline_width_unit" value="MM"/><Option type="QString" name="style" value="solid"/></Option><prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="color" v="{{COR}},255"/><prop k="joinstyle" v="bevel"/><prop k="offset" v="0,0"/><prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="offset_unit" v="MM"/><prop k="outline_color" v="0,0,0,255"/><prop k="outline_style" v="solid"/><prop k="outline_width" v="0.26"/><prop k="outline_width_unit" v="MM"/><prop k="style" v="solid"/><data_defined_properties><Option type="Map"><Option type="QString" name="name" value=""/><Option name="properties"/><Option type="QString" name="type" value="collection"/></Option></data_defined_properties></layer></symbol>';
      tipo_andamento_txt := '<symbol force_rhr="0" type="fill" name="{{NUMERACAO}}" alpha="1" clip_to_extent="1"><data_defined_properties><Option type="Map"><Option type="QString" name="name" value=""/><Option name="properties"/><Option type="QString" name="type" value="collection"/></Option></data_defined_properties><layer class="SimpleFill" pass="0" enabled="1" locked="0"><Option type="Map"><Option type="QString" name="border_width_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="color" value="{{COR}},255"/><Option type="QString" name="joinstyle" value="bevel"/><Option type="QString" name="offset" value="0,0"/><Option type="QString" name="offset_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="offset_unit" value="MM"/><Option type="QString" name="outline_color" value="0,0,0,255"/><Option type="QString" name="outline_style" value="solid"/><Option type="QString" name="outline_width" value="0.26"/><Option type="QString" name="outline_width_unit" value="MM"/><Option type="QString" name="style" value="solid"/></Option><prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="color" v="{{COR}},255"/><prop k="joinstyle" v="bevel"/><prop k="offset" v="0,0"/><prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="offset_unit" v="MM"/><prop k="outline_color" v="0,0,0,255"/><prop k="outline_style" v="solid"/><prop k="outline_width" v="0.26"/><prop k="outline_width_unit" v="MM"/><prop k="style" v="solid"/><data_defined_properties><Option type="Map"><Option type="QString" name="name" value=""/><Option name="properties"/><Option type="QString" name="type" value="collection"/></Option></data_defined_properties></layer><layer class="LinePatternFill" pass="0" enabled="1" locked="0"><Option type="Map"><Option type="QString" name="angle" value="45"/><Option type="QString" name="color" value="0,0,255,255"/><Option type="QString" name="distance" value="1"/><Option type="QString" name="distance_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="distance_unit" value="MM"/><Option type="QString" name="line_width" value="0.26"/><Option type="QString" name="line_width_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="line_width_unit" value="MM"/><Option type="QString" name="offset" value="0"/><Option type="QString" name="offset_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="offset_unit" value="MM"/><Option type="QString" name="outline_width_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="outline_width_unit" value="MM"/></Option><prop k="angle" v="45"/><prop k="color" v="0,0,255,255"/><prop k="distance" v="1"/><prop k="distance_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="distance_unit" v="MM"/><prop k="line_width" v="0.26"/><prop k="line_width_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="line_width_unit" v="MM"/><prop k="offset" v="0"/><prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="offset_unit" v="MM"/><prop k="outline_width_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="outline_width_unit" v="MM"/><data_defined_properties><Option type="Map"><Option type="QString" name="name" value=""/><Option name="properties"/><Option type="QString" name="type" value="collection"/></Option></data_defined_properties><symbol force_rhr="0" type="line" name="@{{NUMERACAO}}@1" alpha="1" clip_to_extent="1"><data_defined_properties><Option type="Map"><Option type="QString" name="name" value=""/><Option name="properties"/><Option type="QString" name="type" value="collection"/></Option></data_defined_properties><layer class="SimpleLine" pass="0" enabled="1" locked="0"><Option type="Map"><Option type="QString" name="align_dash_pattern" value="0"/><Option type="QString" name="capstyle" value="square"/><Option type="QString" name="customdash" value="5;2"/><Option type="QString" name="customdash_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="customdash_unit" value="MM"/><Option type="QString" name="dash_pattern_offset" value="0"/><Option type="QString" name="dash_pattern_offset_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="dash_pattern_offset_unit" value="MM"/><Option type="QString" name="draw_inside_polygon" value="0"/><Option type="QString" name="joinstyle" value="bevel"/><Option type="QString" name="line_color" value="0,0,0,255"/><Option type="QString" name="line_style" value="solid"/><Option type="QString" name="line_width" value="0.26"/><Option type="QString" name="line_width_unit" value="MM"/><Option type="QString" name="offset" value="0"/><Option type="QString" name="offset_map_unit_scale" value="3x:0,0,0,0,0,0"/><Option type="QString" name="offset_unit" value="MM"/><Option type="QString" name="ring_filter" value="0"/><Option type="QString" name="tweak_dash_pattern_on_corners" value="0"/><Option type="QString" name="use_custom_dash" value="0"/><Option type="QString" name="width_map_unit_scale" value="3x:0,0,0,0,0,0"/></Option><prop k="align_dash_pattern" v="0"/><prop k="capstyle" v="square"/><prop k="customdash" v="5;2"/><prop k="customdash_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="customdash_unit" v="MM"/><prop k="dash_pattern_offset" v="0"/><prop k="dash_pattern_offset_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="dash_pattern_offset_unit" v="MM"/><prop k="draw_inside_polygon" v="0"/><prop k="joinstyle" v="bevel"/><prop k="line_color" v="0,0,0,255"/><prop k="line_style" v="solid"/><prop k="line_width" v="0.26"/><prop k="line_width_unit" v="MM"/><prop k="offset" v="0"/><prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/><prop k="offset_unit" v="MM"/><prop k="ring_filter" v="0"/><prop k="tweak_dash_pattern_on_corners" v="0"/><prop k="use_custom_dash" v="0"/><prop k="width_map_unit_scale" v="3x:0,0,0,0,0,0"/><data_defined_properties><Option type="Map"><Option type="QString" name="name" value=""/><Option name="properties"/><Option type="QString" name="type" value="collection"/></Option></data_defined_properties></layer></symbol></layer></symbol>';
      
      FOR r in SELECT f.id, tf.nome, tf.cor FROM macrocontrole.fase AS f
      INNER JOIN dominio.tipo_fase AS tf ON tf.code = f.tipo_fase_id
      WHERE f.linha_producao_id = linhaproducao_ident
      ORDER BY f.ordem
      LOOP

        nome_fixed := translate(replace(lower(r.nome),' ', '_'),  
              'àáâãäéèëêíìïîóòõöôúùüûçÇ/-|/\,.;:<>?!`{}[]()~`@#$%^&*+=''',  
              'aaaaaeeeeiiiiooooouuuucc________________________________');

        view_txt := view_txt || ', (CASE WHEN min(ut' || iterator || '.id) IS NOT NULL THEN min(ut' || iterator || '.data_inicio)::text ELSE ''-'' END) AS  ' || nome_fixed || '_data_inicio';
        view_txt := view_txt || ', (CASE WHEN min(ut' || iterator || '.id) IS NOT NULL THEN (CASE WHEN count(*) - count(ut' || iterator || '.data_fim) = 0 THEN max(ut' || iterator || '.data_fim)::text ELSE NULL END) ELSE ''-'' END) AS  ' || nome_fixed || '_data_fim';

        jointxt := jointxt || ' LEFT JOIN 
          (SELECT ut.id, ut.geom, min(a.data_inicio) as data_inicio,
          (CASE WHEN count(*) - count(a.data_fim) = 0 THEN max(a.data_fim) ELSE NULL END) AS data_fim
          FROM macrocontrole.unidade_trabalho AS ut
          INNER JOIN macrocontrole.subfase AS s ON s.id = ut.subfase_id
          INNER JOIN
          (select unidade_trabalho_id, data_inicio, data_fim from macrocontrole.atividade where tipo_situacao_id IN (1,2,3,4)) AS a
          ON a.unidade_trabalho_id = ut.id
          WHERE s.fase_id = ' || r.id || ' AND ut.lote_id = ' || lote_ident || '
          GROUP BY ut.id) AS ut' || iterator || '
          ON ut' || iterator || '.geom && p.geom AND st_relate(ut' || iterator || '.geom, p.geom, ''2********'')';



        rules_txt := rules_txt || '<rule symbol="' ||  (2*iterator - 2) || '" key="{' || uuid_generate_v4() ||'}" label="' || nome_fixed || ' não iniciada" filter="' || fases_concluidas_txt || nome_fixed || '_data_inicio IS NULL "/>';
        rules_txt := rules_txt || '<rule symbol="' ||  (2*iterator - 1) || '" key="{' || uuid_generate_v4() ||'}" label="' || nome_fixed || ' em execução" filter="' || fases_concluidas_txt || nome_fixed || '_data_fim IS NULL AND ' || nome_fixed || '_data_inicio IS NOT NULL"/>';
        
        fases_concluidas_txt := fases_concluidas_txt || nome_fixed || '_data_fim IS NOT NULL AND ';

        symbols_txt := symbols_txt || replace(replace(tipo_txt, '{{NUMERACAO}}', (2*iterator - 2)::text), '{{COR}}', r.cor);
        symbols_txt := symbols_txt || replace(replace(tipo_andamento_txt, '{{NUMERACAO}}', (2*iterator - 1)::text), '{{COR}}', r.cor);

        iterator := iterator + 1;

      END LOOP;

      view_txt := view_txt || ' FROM macrocontrole.produto AS p INNER JOIN dominio.tipo_produto AS tp ON tp.code = p.tipo_produto_id';
      view_txt := view_txt || jointxt;
      view_txt := view_txt || ' WHERE p.lote_id = ' || lote_ident || ' GROUP BY p.id;';

      EXECUTE view_txt;
      EXECUTE 'GRANT SELECT ON TABLE acompanhamento.lote_' || lote_ident || ' TO PUBLIC';
      EXECUTE 'CREATE INDEX lote_' || lote_ident || '_geom ON acompanhamento.lote_' || lote_ident || ' USING gist (geom);';
      EXECUTE 'CREATE UNIQUE INDEX lote_' || lote_ident || '_id ON acompanhamento.lote_' || lote_ident || ' (id);';

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
ALTER FUNCTION acompanhamento.cria_view_acompanhamento_lote(integer, integer)
  OWNER TO postgres;

CREATE OR REPLACE FUNCTION acompanhamento.trigger_view_acompanhamento_lote()
  RETURNS trigger AS
$BODY$
    DECLARE lote_ident integer;
    DECLARE linhaproducao_ident integer;
    BEGIN

    IF TG_OP = 'DELETE' THEN
      lote_ident := OLD.id;
    ELSE
      lote_ident := NEW.id;
    END IF;

    EXECUTE 'DROP MATERIALIZED VIEW IF EXISTS acompanhamento.lote_'|| lote_ident;

    DELETE FROM public.layer_styles
    WHERE f_table_schema = 'acompanhamento' AND f_table_name = ('lote_'|| lote_ident) AND stylename = 'acompanhamento_lote';

    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    END IF;

    linhaproducao_ident := NEW.linha_producao_id;


    PERFORM acompanhamento.cria_view_acompanhamento_lote(lote_ident, linhaproducao_ident);

    RETURN NEW;

    END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION acompanhamento.trigger_view_acompanhamento_lote()
  OWNER TO postgres;

CREATE TRIGGER trigger_view_acompanhamento_lote
AFTER UPDATE OR INSERT OR DELETE ON macrocontrole.lote
FOR EACH ROW EXECUTE PROCEDURE acompanhamento.trigger_view_acompanhamento_lote();


CREATE OR REPLACE FUNCTION acompanhamento.trigger_view_acompanhamento_lote_fase()
  RETURNS trigger AS
$BODY$
    DECLARE lote_ident integer;
    DECLARE fase_ident integer;
    DECLARE linhaproducao_ident integer;
    BEGIN

    IF TG_OP = 'DELETE' THEN
      fase_ident := OLD.id;
    ELSE
      fase_ident := NEW.id;
    END IF;
    SELECT l.id, l.linha_producao_id
              INTO lote_ident, linhaproducao_ident
              FROM macrocontrole.fase AS f
              INNER JOIN macrocontrole.lote AS l ON f.linha_producao_id = l.linha_producao_id
              WHERE f.id = fase_ident;

    EXECUTE 'DROP MATERIALIZED VIEW IF EXISTS acompanhamento.lote_'|| lote_ident;

    DELETE FROM public.layer_styles
    WHERE f_table_schema = 'acompanhamento' AND f_table_name = ('lote_'|| lote_ident) AND stylename = 'acompanhamento_lote';

    PERFORM acompanhamento.cria_view_acompanhamento_lote(lote_ident, linhaproducao_ident);

    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;

    END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION acompanhamento.trigger_view_acompanhamento_lote_fase()
  OWNER TO postgres;

CREATE TRIGGER trigger_view_acompanhamento_lote_fase
AFTER UPDATE OR INSERT OR DELETE ON macrocontrole.fase
FOR EACH ROW EXECUTE PROCEDURE acompanhamento.trigger_view_acompanhamento_lote_fase();


CREATE OR REPLACE FUNCTION acompanhamento.refresh_view_acompanhamento_atividade()
  RETURNS trigger AS
$BODY$
    DECLARE etapa_ident integer;
    DECLARE lote_ident integer;
    DECLARE subfase_ident integer;
    BEGIN

    IF TG_OP = 'DELETE' THEN
      etapa_ident := OLD.etapa_id;
    ELSE
      etapa_ident := NEW.etapa_id;
    END IF;

    SELECT l.id, s.id
              INTO lote_ident, subfase_ident
              FROM macrocontrole.etapa AS e
              INNER JOIN macrocontrole.subfase AS s ON e.subfase_id = s.id
              INNER JOIN macrocontrole.fase AS f ON s.fase_id = f.id
              INNER JOIN macrocontrole.lote AS l ON f.linha_producao_id = l.linha_producao_id
              WHERE e.id = etapa_ident;

    EXECUTE 'REFRESH MATERIALIZED VIEW CONCURRENTLY acompanhamento.lote_'|| lote_ident;
    EXECUTE 'REFRESH MATERIALIZED VIEW CONCURRENTLY acompanhamento.lote_'|| lote_ident || '_subfase_' || subfase_ident;

    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;

    END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION acompanhamento.refresh_view_acompanhamento_atividade()
  OWNER TO postgres;

CREATE TRIGGER refresh_view_acompanhamento_atividade
AFTER UPDATE OR INSERT OR DELETE ON macrocontrole.atividade
FOR EACH ROW EXECUTE PROCEDURE acompanhamento.refresh_view_acompanhamento_atividade();

CREATE OR REPLACE FUNCTION acompanhamento.refresh_view_acompanhamento_ut_etapa()
  RETURNS trigger AS
$BODY$
    DECLARE subfase_ident integer;
    DECLARE lote_ident integer;
    BEGIN

    IF TG_OP = 'DELETE' THEN
      subfase_ident := OLD.subfase_id;
    ELSE
      subfase_ident := NEW.subfase_id;
    END IF;

    SELECT l.id
    INTO lote_ident
    FROM macrocontrole.subfase AS s
    INNER JOIN macrocontrole.fase AS f ON s.fase_id = f.id
    INNER JOIN macrocontrole.lote AS l ON f.linha_producao_id = l.linha_producao_id
    WHERE s.id = subfase_ident;

    EXECUTE 'REFRESH MATERIALIZED VIEW CONCURRENTLY acompanhamento.lote_'|| lote_ident;
    EXECUTE 'REFRESH MATERIALIZED VIEW CONCURRENTLY acompanhamento.lote_'|| lote_ident || '_subfase_' || subfase_ident;

    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;

    END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION acompanhamento.refresh_view_acompanhamento_ut_etapa()
  OWNER TO postgres;

CREATE TRIGGER refresh_view_acompanhamento_ut
AFTER UPDATE OR INSERT OR DELETE ON macrocontrole.unidade_trabalho
FOR EACH ROW EXECUTE PROCEDURE acompanhamento.refresh_view_acompanhamento_ut_etapa();

CREATE TRIGGER refresh_view_acompanhamento_etapa
AFTER UPDATE OR INSERT OR DELETE ON macrocontrole.etapa
FOR EACH ROW EXECUTE PROCEDURE acompanhamento.refresh_view_acompanhamento_ut_etapa();

CREATE OR REPLACE FUNCTION acompanhamento.refresh_view_acompanhamento_subfase()
  RETURNS trigger AS
$BODY$
    DECLARE subfase_ident integer;
    DECLARE lote_ident integer;
    BEGIN

    IF TG_OP = 'DELETE' THEN
      subfase_ident := OLD.id;
    ELSE
      subfase_ident := NEW.id;
    END IF;

    SELECT l.id
    INTO lote_ident
    FROM macrocontrole.subfase AS s
    INNER JOIN macrocontrole.fase AS f ON s.fase_id = f.id
    INNER JOIN macrocontrole.lote AS l ON f.linha_producao_id = l.linha_producao_id
    WHERE s.id = subfase_ident;

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
ALTER FUNCTION acompanhamento.refresh_view_acompanhamento_subfase()
  OWNER TO postgres;

CREATE TRIGGER refresh_view_acompanhamento_subfase
AFTER UPDATE OR INSERT OR DELETE ON macrocontrole.subfase
FOR EACH ROW EXECUTE PROCEDURE acompanhamento.refresh_view_acompanhamento_subfase();

COMMIT;