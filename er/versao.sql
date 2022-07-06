BEGIN;

CREATE TABLE public.versao(
  code SMALLINT NOT NULL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL
);

INSERT INTO public.versao (code, nome) VALUES
(1, '2.0.3');

CREATE TABLE public.layer_styles(
  id serial NOT NULL PRIMARY KEY,
  f_table_catalog varchar(255),
  f_table_schema varchar(255),
  f_table_name varchar(255),
  f_geometry_column varchar(255),
  stylename varchar(255),
  styleqml text,
  stylesld text,
  useasdefault boolean,
  description text,
  owner varchar(255),
  ui text,
  update_time timestamp without time zone DEFAULT now(),
  type character varying
);

INSERT INTO public.layer_styles VALUES (nextval('public.layer_styles_id_seq'::regclass),current_database(), 'macrocontrole', 'alteracao_fluxo', 'geom', 'alteracao_fluxo', '<!DOCTYPE qgis PUBLIC ''http://mrcc.com/qgis.dtd'' ''SYSTEM''>
<qgis labelsEnabled="1" minScale="100000000" simplifyDrawingHints="0" hasScaleBasedVisibilityFlag="0" maxScale="0" readOnly="0" simplifyDrawingTol="1" version="3.18.3-Zürich" simplifyAlgorithm="0" styleCategories="AllStyleCategories" simplifyMaxScale="1" simplifyLocal="1">
 <flags>
  <Identifiable>1</Identifiable>
  <Removable>1</Removable>
  <Searchable>1</Searchable>
  <Private>0</Private>
 </flags>
 <temporal mode="0" startExpression="" accumulate="0" durationField="" enabled="0" fixedDuration="0" endField="" endExpression="" durationUnit="min" startField="">
  <fixedRange>
   <start></start>
   <end></end>
  </fixedRange>
 </temporal>
 <renderer-v2 forceraster="0" enableorderby="0" symbollevels="0" type="RuleRenderer">
  <rules key="{0644f810-b251-4e11-b410-ebd3c9e04230}">
   <rule symbol="0" filter="&quot;resolvido&quot; IS FALSE" key="{fd598f04-53a4-4bf6-b2f1-0a737bb365ce}"/>
  </rules>
  <symbols>
   <symbol clip_to_extent="1" alpha="1" name="0" force_rhr="0" type="fill">
    <data_defined_properties>
     <Option type="Map">
      <Option value="" name="name" type="QString"/>
      <Option name="properties"/>
      <Option value="collection" name="type" type="QString"/>
     </Option>
    </data_defined_properties>
    <layer class="SimpleFill" pass="0" enabled="1" locked="0">
     <Option type="Map">
      <Option value="3x:0,0,0,0,0,0" name="border_width_map_unit_scale" type="QString"/>
      <Option value="228,26,28,255" name="color" type="QString"/>
      <Option value="bevel" name="joinstyle" type="QString"/>
      <Option value="0,0" name="offset" type="QString"/>
      <Option value="3x:0,0,0,0,0,0" name="offset_map_unit_scale" type="QString"/>
      <Option value="MM" name="offset_unit" type="QString"/>
      <Option value="128,14,16,255" name="outline_color" type="QString"/>
      <Option value="solid" name="outline_style" type="QString"/>
      <Option value="0.26" name="outline_width" type="QString"/>
      <Option value="MM" name="outline_width_unit" type="QString"/>
      <Option value="solid" name="style" type="QString"/>
     </Option>
     <prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
     <prop k="color" v="228,26,28,255"/>
     <prop k="joinstyle" v="bevel"/>
     <prop k="offset" v="0,0"/>
     <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
     <prop k="offset_unit" v="MM"/>
     <prop k="outline_color" v="128,14,16,255"/>
     <prop k="outline_style" v="solid"/>
     <prop k="outline_width" v="0.26"/>
     <prop k="outline_width_unit" v="MM"/>
     <prop k="style" v="solid"/>
     <effect enabled="0" type="effectStack">
      <effect type="dropShadow">
       <Option type="Map">
        <Option value="13" name="blend_mode" type="QString"/>
        <Option value="2.645" name="blur_level" type="QString"/>
        <Option value="MM" name="blur_unit" type="QString"/>
        <Option value="3x:0,0,0,0,0,0" name="blur_unit_scale" type="QString"/>
        <Option value="0,0,0,255" name="color" type="QString"/>
        <Option value="2" name="draw_mode" type="QString"/>
        <Option value="0" name="enabled" type="QString"/>
        <Option value="135" name="offset_angle" type="QString"/>
        <Option value="2" name="offset_distance" type="QString"/>
        <Option value="MM" name="offset_unit" type="QString"/>
        <Option value="3x:0,0,0,0,0,0" name="offset_unit_scale" type="QString"/>
        <Option value="1" name="opacity" type="QString"/>
       </Option>
       <prop k="blend_mode" v="13"/>
       <prop k="blur_level" v="2.645"/>
       <prop k="blur_unit" v="MM"/>
       <prop k="blur_unit_scale" v="3x:0,0,0,0,0,0"/>
       <prop k="color" v="0,0,0,255"/>
       <prop k="draw_mode" v="2"/>
       <prop k="enabled" v="0"/>
       <prop k="offset_angle" v="135"/>
       <prop k="offset_distance" v="2"/>
       <prop k="offset_unit" v="MM"/>
       <prop k="offset_unit_scale" v="3x:0,0,0,0,0,0"/>
       <prop k="opacity" v="1"/>
      </effect>
      <effect type="outerGlow">
       <Option type="Map">
        <Option value="0" name="blend_mode" type="QString"/>
        <Option value="0.7935" name="blur_level" type="QString"/>
        <Option value="MM" name="blur_unit" type="QString"/>
        <Option value="3x:0,0,0,0,0,0" name="blur_unit_scale" type="QString"/>
        <Option value="0,0,255,255" name="color1" type="QString"/>
        <Option value="0,255,0,255" name="color2" type="QString"/>
        <Option value="0" name="color_type" type="QString"/>
        <Option value="0" name="discrete" type="QString"/>
        <Option value="2" name="draw_mode" type="QString"/>
        <Option value="0" name="enabled" type="QString"/>
        <Option value="0.5" name="opacity" type="QString"/>
        <Option value="gradient" name="rampType" type="QString"/>
        <Option value="255,255,255,255" name="single_color" type="QString"/>
        <Option value="2" name="spread" type="QString"/>
        <Option value="MM" name="spread_unit" type="QString"/>
        <Option value="3x:0,0,0,0,0,0" name="spread_unit_scale" type="QString"/>
       </Option>
       <prop k="blend_mode" v="0"/>
       <prop k="blur_level" v="0.7935"/>
       <prop k="blur_unit" v="MM"/>
       <prop k="blur_unit_scale" v="3x:0,0,0,0,0,0"/>
       <prop k="color1" v="0,0,255,255"/>
       <prop k="color2" v="0,255,0,255"/>
       <prop k="color_type" v="0"/>
       <prop k="discrete" v="0"/>
       <prop k="draw_mode" v="2"/>
       <prop k="enabled" v="0"/>
       <prop k="opacity" v="0.5"/>
       <prop k="rampType" v="gradient"/>
       <prop k="single_color" v="255,255,255,255"/>
       <prop k="spread" v="2"/>
       <prop k="spread_unit" v="MM"/>
       <prop k="spread_unit_scale" v="3x:0,0,0,0,0,0"/>
      </effect>
      <effect type="blur">
       <Option type="Map">
        <Option value="0" name="blend_mode" type="QString"/>
        <Option value="2.645" name="blur_level" type="QString"/>
        <Option value="0" name="blur_method" type="QString"/>
        <Option value="MM" name="blur_unit" type="QString"/>
        <Option value="3x:0,0,0,0,0,0" name="blur_unit_scale" type="QString"/>
        <Option value="2" name="draw_mode" type="QString"/>
        <Option value="1" name="enabled" type="QString"/>
        <Option value="1" name="opacity" type="QString"/>
       </Option>
       <prop k="blend_mode" v="0"/>
       <prop k="blur_level" v="2.645"/>
       <prop k="blur_method" v="0"/>
       <prop k="blur_unit" v="MM"/>
       <prop k="blur_unit_scale" v="3x:0,0,0,0,0,0"/>
       <prop k="draw_mode" v="2"/>
       <prop k="enabled" v="1"/>
       <prop k="opacity" v="1"/>
      </effect>
      <effect type="innerShadow">
       <Option type="Map">
        <Option value="13" name="blend_mode" type="QString"/>
        <Option value="2.645" name="blur_level" type="QString"/>
        <Option value="MM" name="blur_unit" type="QString"/>
        <Option value="3x:0,0,0,0,0,0" name="blur_unit_scale" type="QString"/>
        <Option value="0,0,0,255" name="color" type="QString"/>
        <Option value="2" name="draw_mode" type="QString"/>
        <Option value="0" name="enabled" type="QString"/>
        <Option value="135" name="offset_angle" type="QString"/>
        <Option value="2" name="offset_distance" type="QString"/>
        <Option value="MM" name="offset_unit" type="QString"/>
        <Option value="3x:0,0,0,0,0,0" name="offset_unit_scale" type="QString"/>
        <Option value="1" name="opacity" type="QString"/>
       </Option>
       <prop k="blend_mode" v="13"/>
       <prop k="blur_level" v="2.645"/>
       <prop k="blur_unit" v="MM"/>
       <prop k="blur_unit_scale" v="3x:0,0,0,0,0,0"/>
       <prop k="color" v="0,0,0,255"/>
       <prop k="draw_mode" v="2"/>
       <prop k="enabled" v="0"/>
       <prop k="offset_angle" v="135"/>
       <prop k="offset_distance" v="2"/>
       <prop k="offset_unit" v="MM"/>
       <prop k="offset_unit_scale" v="3x:0,0,0,0,0,0"/>
       <prop k="opacity" v="1"/>
      </effect>
      <effect type="innerGlow">
       <Option type="Map">
        <Option value="0" name="blend_mode" type="QString"/>
        <Option value="0.7935" name="blur_level" type="QString"/>
        <Option value="MM" name="blur_unit" type="QString"/>
        <Option value="3x:0,0,0,0,0,0" name="blur_unit_scale" type="QString"/>
        <Option value="0,0,255,255" name="color1" type="QString"/>
        <Option value="0,255,0,255" name="color2" type="QString"/>
        <Option value="0" name="color_type" type="QString"/>
        <Option value="0" name="discrete" type="QString"/>
        <Option value="2" name="draw_mode" type="QString"/>
        <Option value="0" name="enabled" type="QString"/>
        <Option value="0.5" name="opacity" type="QString"/>
        <Option value="gradient" name="rampType" type="QString"/>
        <Option value="255,255,255,255" name="single_color" type="QString"/>
        <Option value="2" name="spread" type="QString"/>
        <Option value="MM" name="spread_unit" type="QString"/>
        <Option value="3x:0,0,0,0,0,0" name="spread_unit_scale" type="QString"/>
       </Option>
       <prop k="blend_mode" v="0"/>
       <prop k="blur_level" v="0.7935"/>
       <prop k="blur_unit" v="MM"/>
       <prop k="blur_unit_scale" v="3x:0,0,0,0,0,0"/>
       <prop k="color1" v="0,0,255,255"/>
       <prop k="color2" v="0,255,0,255"/>
       <prop k="color_type" v="0"/>
       <prop k="discrete" v="0"/>
       <prop k="draw_mode" v="2"/>
       <prop k="enabled" v="0"/>
       <prop k="opacity" v="0.5"/>
       <prop k="rampType" v="gradient"/>
       <prop k="single_color" v="255,255,255,255"/>
       <prop k="spread" v="2"/>
       <prop k="spread_unit" v="MM"/>
       <prop k="spread_unit_scale" v="3x:0,0,0,0,0,0"/>
      </effect>
     </effect>
     <data_defined_properties>
      <Option type="Map">
       <Option value="" name="name" type="QString"/>
       <Option name="properties"/>
       <Option value="collection" name="type" type="QString"/>
      </Option>
     </data_defined_properties>
    </layer>
   </symbol>
  </symbols>
 </renderer-v2>
 <labeling type="rule-based">
  <rules key="{501c1f53-f481-4c25-b7bb-92c62ce95d6a}">
   <rule filter="id = minimum(id) AND count( &quot;id&quot;, filter:= &quot;resolvido&quot; IS FALSE) > 0" key="{0400dab6-6f31-42cd-b6e9-2e281b73c6b5}" description="Pedido alteração de fluxo">
    <settings calloutType="simple">
     <text-style fontWeight="75" textColor="0,0,0,255" fontStrikeout="0" fontLetterSpacing="0" fontUnderline="0" useSubstitutions="0" isExpression="1" blendMode="0" fontKerning="1" fontSizeMapUnitScale="3x:0,0,0,0,0,0" fontSize="10" capitalization="0" textOpacity="1" fontWordSpacing="0" multilineHeight="1" namedStyle="Negrito" previewBkgrdColor="255,255,255,255" fontItalic="0" fontSizeUnit="Point" fontFamily="Arial" textOrientation="horizontal" allowHtml="0" fieldName="''Pedidos de alteração de fluxo: '' ||  count( &quot;id&quot; , filter:=  &quot;resolvido&quot; IS FALSE)">
      <text-buffer bufferSizeMapUnitScale="3x:0,0,0,0,0,0" bufferNoFill="1" bufferOpacity="1" bufferJoinStyle="128" bufferSizeUnits="MM" bufferDraw="0" bufferColor="255,255,255,255" bufferSize="1" bufferBlendMode="0"/>
      <text-mask maskType="0" maskedSymbolLayers="" maskEnabled="0" maskOpacity="1" maskSizeMapUnitScale="3x:0,0,0,0,0,0" maskSize="1.5" maskSizeUnits="MM" maskJoinStyle="128"/>
      <background shapeBorderColor="0,0,0,255" shapeRotationType="0" shapeJoinStyle="64" shapeRadiiX="0" shapeOffsetMapUnitScale="3x:0,0,0,0,0,0" shapeOpacity="1" shapeSizeMapUnitScale="3x:0,0,0,0,0,0" shapeSizeUnit="MM" shapeSizeX="2" shapeRadiiMapUnitScale="3x:0,0,0,0,0,0" shapeBlendMode="0" shapeOffsetX="0" shapeBorderWidthMapUnitScale="3x:0,0,0,0,0,0" shapeType="0" shapeRadiiUnit="MM" shapeBorderWidth="0.2" shapeSizeY="2" shapeRotation="0" shapeOffsetY="0" shapeSVGFile="" shapeDraw="1" shapeFillColor="255,120,75,255" shapeRadiiY="0" shapeOffsetUnit="MM" shapeBorderWidthUnit="MM" shapeSizeType="0">
       <symbol clip_to_extent="1" alpha="1" name="markerSymbol" force_rhr="0" type="marker">
        <data_defined_properties>
         <Option type="Map">
          <Option value="" name="name" type="QString"/>
          <Option name="properties"/>
          <Option value="collection" name="type" type="QString"/>
         </Option>
        </data_defined_properties>
        <layer class="SimpleMarker" pass="0" enabled="1" locked="0">
         <Option type="Map">
          <Option value="0" name="angle" type="QString"/>
          <Option value="152,125,183,255" name="color" type="QString"/>
          <Option value="1" name="horizontal_anchor_point" type="QString"/>
          <Option value="bevel" name="joinstyle" type="QString"/>
          <Option value="circle" name="name" type="QString"/>
          <Option value="0,0" name="offset" type="QString"/>
          <Option value="3x:0,0,0,0,0,0" name="offset_map_unit_scale" type="QString"/>
          <Option value="MM" name="offset_unit" type="QString"/>
          <Option value="35,35,35,255" name="outline_color" type="QString"/>
          <Option value="solid" name="outline_style" type="QString"/>
          <Option value="0" name="outline_width" type="QString"/>
          <Option value="3x:0,0,0,0,0,0" name="outline_width_map_unit_scale" type="QString"/>
          <Option value="MM" name="outline_width_unit" type="QString"/>
          <Option value="diameter" name="scale_method" type="QString"/>
          <Option value="2" name="size" type="QString"/>
          <Option value="3x:0,0,0,0,0,0" name="size_map_unit_scale" type="QString"/>
          <Option value="MM" name="size_unit" type="QString"/>
          <Option value="1" name="vertical_anchor_point" type="QString"/>
         </Option>
         <prop k="angle" v="0"/>
         <prop k="color" v="152,125,183,255"/>
         <prop k="horizontal_anchor_point" v="1"/>
         <prop k="joinstyle" v="bevel"/>
         <prop k="name" v="circle"/>
         <prop k="offset" v="0,0"/>
         <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
         <prop k="offset_unit" v="MM"/>
         <prop k="outline_color" v="35,35,35,255"/>
         <prop k="outline_style" v="solid"/>
         <prop k="outline_width" v="0"/>
         <prop k="outline_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
         <prop k="outline_width_unit" v="MM"/>
         <prop k="scale_method" v="diameter"/>
         <prop k="size" v="2"/>
         <prop k="size_map_unit_scale" v="3x:0,0,0,0,0,0"/>
         <prop k="size_unit" v="MM"/>
         <prop k="vertical_anchor_point" v="1"/>
         <data_defined_properties>
          <Option type="Map">
           <Option value="" name="name" type="QString"/>
           <Option name="properties"/>
           <Option value="collection" name="type" type="QString"/>
          </Option>
         </data_defined_properties>
        </layer>
       </symbol>
      </background>
      <shadow shadowRadius="1.5" shadowOffsetMapUnitScale="3x:0,0,0,0,0,0" shadowRadiusAlphaOnly="0" shadowColor="0,0,0,255" shadowOffsetAngle="135" shadowBlendMode="6" shadowRadiusMapUnitScale="3x:0,0,0,0,0,0" shadowOffsetDist="1" shadowRadiusUnit="MM" shadowOpacity="0.7" shadowUnder="0" shadowScale="100" shadowOffsetGlobal="1" shadowDraw="0" shadowOffsetUnit="MM"/>
      <dd_properties>
       <Option type="Map">
        <Option value="" name="name" type="QString"/>
        <Option name="properties"/>
        <Option value="collection" name="type" type="QString"/>
       </Option>
      </dd_properties>
      <substitutions/>
     </text-style>
     <text-format reverseDirectionSymbol="0" wrapChar="" multilineAlign="0" useMaxLineLengthForAutoWrap="1" decimals="3" autoWrapLength="0" rightDirectionSymbol=">" formatNumbers="0" addDirectionSymbol="0" placeDirectionSymbol="0" leftDirectionSymbol="&lt;" plussign="0"/>
     <placement polygonPlacementFlags="2" maxCurvedCharAngleIn="25" centroidInside="0" yOffset="10" centroidWhole="0" offsetType="0" lineAnchorPercent="0.5" layerType="PolygonGeometry" preserveRotation="1" geometryGeneratorType="PointGeometry" repeatDistanceUnits="MM" overrunDistanceUnit="MM" priority="10" placement="1" repeatDistanceMapUnitScale="3x:0,0,0,0,0,0" dist="0" labelOffsetMapUnitScale="3x:0,0,0,0,0,0" predefinedPositionOrder="TR,TL,BR,BL,R,L,TSR,BSR" fitInPolygonOnly="0" maxCurvedCharAngleOut="-25" overrunDistanceMapUnitScale="3x:0,0,0,0,0,0" xOffset="-30" overrunDistance="0" quadOffset="4" distMapUnitScale="3x:0,0,0,0,0,0" geometryGenerator="point_n(  @map_extent, 3  )" rotationAngle="0" repeatDistance="0" lineAnchorType="0" offsetUnits="MM" geometryGeneratorEnabled="1" placementFlags="10" distUnits="MM"/>
     <rendering minFeatureSize="0" obstacle="0" zIndex="0" upsidedownLabels="0" obstacleFactor="1" scaleVisibility="0" mergeLines="0" fontMaxPixelSize="10000" displayAll="1" scaleMax="0" maxNumLabels="2000" scaleMin="0" drawLabels="1" obstacleType="1" labelPerPart="0" fontLimitPixelSize="0" limitNumLabels="0" fontMinPixelSize="3"/>
     <dd_properties>
      <Option type="Map">
       <Option value="" name="name" type="QString"/>
       <Option name="properties"/>
       <Option value="collection" name="type" type="QString"/>
      </Option>
     </dd_properties>
     <callout type="simple">
      <Option type="Map">
       <Option value="pole_of_inaccessibility" name="anchorPoint" type="QString"/>
       <Option name="ddProperties" type="Map">
        <Option value="" name="name" type="QString"/>
        <Option name="properties"/>
        <Option value="collection" name="type" type="QString"/>
       </Option>
       <Option value="false" name="drawToAllParts" type="bool"/>
       <Option value="0" name="enabled" type="QString"/>
       <Option value="point_on_exterior" name="labelAnchorPoint" type="QString"/>
       <Option value="&lt;symbol clip_to_extent=&quot;1&quot; alpha=&quot;1&quot; name=&quot;symbol&quot; force_rhr=&quot;0&quot; type=&quot;line&quot;>&lt;data_defined_properties>&lt;Option type=&quot;Map&quot;>&lt;Option value=&quot;&quot; name=&quot;name&quot; type=&quot;QString&quot;/>&lt;Option name=&quot;properties&quot;/>&lt;Option value=&quot;collection&quot; name=&quot;type&quot; type=&quot;QString&quot;/>&lt;/Option>&lt;/data_defined_properties>&lt;layer class=&quot;SimpleLine&quot; pass=&quot;0&quot; enabled=&quot;1&quot; locked=&quot;0&quot;>&lt;Option type=&quot;Map&quot;>&lt;Option value=&quot;0&quot; name=&quot;align_dash_pattern&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;square&quot; name=&quot;capstyle&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;5;2&quot; name=&quot;customdash&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;3x:0,0,0,0,0,0&quot; name=&quot;customdash_map_unit_scale&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;MM&quot; name=&quot;customdash_unit&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;0&quot; name=&quot;dash_pattern_offset&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;3x:0,0,0,0,0,0&quot; name=&quot;dash_pattern_offset_map_unit_scale&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;MM&quot; name=&quot;dash_pattern_offset_unit&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;0&quot; name=&quot;draw_inside_polygon&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;bevel&quot; name=&quot;joinstyle&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;60,60,60,255&quot; name=&quot;line_color&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;solid&quot; name=&quot;line_style&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;0.3&quot; name=&quot;line_width&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;MM&quot; name=&quot;line_width_unit&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;0&quot; name=&quot;offset&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;3x:0,0,0,0,0,0&quot; name=&quot;offset_map_unit_scale&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;MM&quot; name=&quot;offset_unit&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;0&quot; name=&quot;ring_filter&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;0&quot; name=&quot;tweak_dash_pattern_on_corners&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;0&quot; name=&quot;use_custom_dash&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;3x:0,0,0,0,0,0&quot; name=&quot;width_map_unit_scale&quot; type=&quot;QString&quot;/>&lt;/Option>&lt;prop k=&quot;align_dash_pattern&quot; v=&quot;0&quot;/>&lt;prop k=&quot;capstyle&quot; v=&quot;square&quot;/>&lt;prop k=&quot;customdash&quot; v=&quot;5;2&quot;/>&lt;prop k=&quot;customdash_map_unit_scale&quot; v=&quot;3x:0,0,0,0,0,0&quot;/>&lt;prop k=&quot;customdash_unit&quot; v=&quot;MM&quot;/>&lt;prop k=&quot;dash_pattern_offset&quot; v=&quot;0&quot;/>&lt;prop k=&quot;dash_pattern_offset_map_unit_scale&quot; v=&quot;3x:0,0,0,0,0,0&quot;/>&lt;prop k=&quot;dash_pattern_offset_unit&quot; v=&quot;MM&quot;/>&lt;prop k=&quot;draw_inside_polygon&quot; v=&quot;0&quot;/>&lt;prop k=&quot;joinstyle&quot; v=&quot;bevel&quot;/>&lt;prop k=&quot;line_color&quot; v=&quot;60,60,60,255&quot;/>&lt;prop k=&quot;line_style&quot; v=&quot;solid&quot;/>&lt;prop k=&quot;line_width&quot; v=&quot;0.3&quot;/>&lt;prop k=&quot;line_width_unit&quot; v=&quot;MM&quot;/>&lt;prop k=&quot;offset&quot; v=&quot;0&quot;/>&lt;prop k=&quot;offset_map_unit_scale&quot; v=&quot;3x:0,0,0,0,0,0&quot;/>&lt;prop k=&quot;offset_unit&quot; v=&quot;MM&quot;/>&lt;prop k=&quot;ring_filter&quot; v=&quot;0&quot;/>&lt;prop k=&quot;tweak_dash_pattern_on_corners&quot; v=&quot;0&quot;/>&lt;prop k=&quot;use_custom_dash&quot; v=&quot;0&quot;/>&lt;prop k=&quot;width_map_unit_scale&quot; v=&quot;3x:0,0,0,0,0,0&quot;/>&lt;data_defined_properties>&lt;Option type=&quot;Map&quot;>&lt;Option value=&quot;&quot; name=&quot;name&quot; type=&quot;QString&quot;/>&lt;Option name=&quot;properties&quot;/>&lt;Option value=&quot;collection&quot; name=&quot;type&quot; type=&quot;QString&quot;/>&lt;/Option>&lt;/data_defined_properties>&lt;/layer>&lt;/symbol>" name="lineSymbol" type="QString"/>
       <Option value="0" name="minLength" type="double"/>
       <Option value="3x:0,0,0,0,0,0" name="minLengthMapUnitScale" type="QString"/>
       <Option value="MM" name="minLengthUnit" type="QString"/>
       <Option value="0" name="offsetFromAnchor" type="double"/>
       <Option value="3x:0,0,0,0,0,0" name="offsetFromAnchorMapUnitScale" type="QString"/>
       <Option value="MM" name="offsetFromAnchorUnit" type="QString"/>
       <Option value="0" name="offsetFromLabel" type="double"/>
       <Option value="3x:0,0,0,0,0,0" name="offsetFromLabelMapUnitScale" type="QString"/>
       <Option value="MM" name="offsetFromLabelUnit" type="QString"/>
      </Option>
     </callout>
    </settings>
   </rule>
  </rules>
 </labeling>
 <customproperties>
  <property key="dualview/previewExpressions">
   <value>"descricao"</value>
  </property>
  <property value="0" key="embeddedWidgets/count"/>
  <property key="variableNames"/>
  <property key="variableValues"/>
 </customproperties>
 <blendMode>0</blendMode>
 <featureBlendMode>0</featureBlendMode>
 <layerOpacity>1</layerOpacity>
 <SingleCategoryDiagramRenderer diagramType="Histogram" attributeLegend="1">
  <DiagramCategory scaleDependency="Area" scaleBasedVisibility="0" penColor="#000000" opacity="1" spacingUnit="MM" width="15" labelPlacementMethod="XHeight" penAlpha="255" minimumSize="0" penWidth="0" spacing="5" height="15" direction="0" lineSizeType="MM" showAxis="1" backgroundAlpha="255" sizeType="MM" minScaleDenominator="0" maxScaleDenominator="1e+08" lineSizeScale="3x:0,0,0,0,0,0" spacingUnitScale="3x:0,0,0,0,0,0" backgroundColor="#ffffff" barWidth="5" enabled="0" sizeScale="3x:0,0,0,0,0,0" rotationOffset="270" diagramOrientation="Up">
   <fontProperties style="" description="MS Shell Dlg 2,8.25,-1,5,50,0,0,0,0,0"/>
   <axisSymbol>
    <symbol clip_to_extent="1" alpha="1" name="" force_rhr="0" type="line">
     <data_defined_properties>
      <Option type="Map">
       <Option value="" name="name" type="QString"/>
       <Option name="properties"/>
       <Option value="collection" name="type" type="QString"/>
      </Option>
     </data_defined_properties>
     <layer class="SimpleLine" pass="0" enabled="1" locked="0">
      <Option type="Map">
       <Option value="0" name="align_dash_pattern" type="QString"/>
       <Option value="square" name="capstyle" type="QString"/>
       <Option value="5;2" name="customdash" type="QString"/>
       <Option value="3x:0,0,0,0,0,0" name="customdash_map_unit_scale" type="QString"/>
       <Option value="MM" name="customdash_unit" type="QString"/>
       <Option value="0" name="dash_pattern_offset" type="QString"/>
       <Option value="3x:0,0,0,0,0,0" name="dash_pattern_offset_map_unit_scale" type="QString"/>
       <Option value="MM" name="dash_pattern_offset_unit" type="QString"/>
       <Option value="0" name="draw_inside_polygon" type="QString"/>
       <Option value="bevel" name="joinstyle" type="QString"/>
       <Option value="35,35,35,255" name="line_color" type="QString"/>
       <Option value="solid" name="line_style" type="QString"/>
       <Option value="0.26" name="line_width" type="QString"/>
       <Option value="MM" name="line_width_unit" type="QString"/>
       <Option value="0" name="offset" type="QString"/>
       <Option value="3x:0,0,0,0,0,0" name="offset_map_unit_scale" type="QString"/>
       <Option value="MM" name="offset_unit" type="QString"/>
       <Option value="0" name="ring_filter" type="QString"/>
       <Option value="0" name="tweak_dash_pattern_on_corners" type="QString"/>
       <Option value="0" name="use_custom_dash" type="QString"/>
       <Option value="3x:0,0,0,0,0,0" name="width_map_unit_scale" type="QString"/>
      </Option>
      <prop k="align_dash_pattern" v="0"/>
      <prop k="capstyle" v="square"/>
      <prop k="customdash" v="5;2"/>
      <prop k="customdash_map_unit_scale" v="3x:0,0,0,0,0,0"/>
      <prop k="customdash_unit" v="MM"/>
      <prop k="dash_pattern_offset" v="0"/>
      <prop k="dash_pattern_offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
      <prop k="dash_pattern_offset_unit" v="MM"/>
      <prop k="draw_inside_polygon" v="0"/>
      <prop k="joinstyle" v="bevel"/>
      <prop k="line_color" v="35,35,35,255"/>
      <prop k="line_style" v="solid"/>
      <prop k="line_width" v="0.26"/>
      <prop k="line_width_unit" v="MM"/>
      <prop k="offset" v="0"/>
      <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
      <prop k="offset_unit" v="MM"/>
      <prop k="ring_filter" v="0"/>
      <prop k="tweak_dash_pattern_on_corners" v="0"/>
      <prop k="use_custom_dash" v="0"/>
      <prop k="width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
      <data_defined_properties>
       <Option type="Map">
        <Option value="" name="name" type="QString"/>
        <Option name="properties"/>
        <Option value="collection" name="type" type="QString"/>
       </Option>
      </data_defined_properties>
     </layer>
    </symbol>
   </axisSymbol>
  </DiagramCategory>
 </SingleCategoryDiagramRenderer>
 <DiagramLayerSettings placement="1" zIndex="0" dist="0" priority="0" showAll="1" obstacle="0" linePlacementFlags="18">
  <properties>
   <Option type="Map">
    <Option value="" name="name" type="QString"/>
    <Option name="properties"/>
    <Option value="collection" name="type" type="QString"/>
   </Option>
  </properties>
 </DiagramLayerSettings>
 <geometryOptions removeDuplicateNodes="0" geometryPrecision="0">
  <activeChecks/>
  <checkConfiguration type="Map">
   <Option name="QgsGeometryGapCheck" type="Map">
    <Option value="0" name="allowedGapsBuffer" type="double"/>
    <Option value="false" name="allowedGapsEnabled" type="bool"/>
    <Option value="" name="allowedGapsLayer" type="QString"/>
   </Option>
  </checkConfiguration>
 </geometryOptions>
 <legend type="default-vector"/>
 <referencedLayers/>
 <fieldConfiguration>
  <field name="id" configurationFlags="None">
   <editWidget type="TextEdit">
    <config>
     <Option type="Map">
      <Option value="false" name="IsMultiline" type="bool"/>
      <Option value="false" name="UseHtml" type="bool"/>
     </Option>
    </config>
   </editWidget>
  </field>
  <field name="atividade_id" configurationFlags="None">
   <editWidget type="Range">
    <config>
     <Option type="Map">
      <Option value="true" name="AllowNull" type="bool"/>
      <Option value="2147483647" name="Max" type="int"/>
      <Option value="-2147483648" name="Min" type="int"/>
      <Option value="0" name="Precision" type="int"/>
      <Option value="1" name="Step" type="int"/>
      <Option value="SpinBox" name="Style" type="QString"/>
     </Option>
    </config>
   </editWidget>
  </field>
  <field name="unidade_trabalho_id" configurationFlags="None">
   <editWidget type="Range">
    <config>
     <Option type="Map">
      <Option value="true" name="AllowNull" type="bool"/>
      <Option value="2147483647" name="Max" type="int"/>
      <Option value="-2147483648" name="Min" type="int"/>
      <Option value="0" name="Precision" type="int"/>
      <Option value="1" name="Step" type="int"/>
      <Option value="SpinBox" name="Style" type="QString"/>
     </Option>
    </config>
   </editWidget>
  </field>
  <field name="descricao" configurationFlags="None">
   <editWidget type="TextEdit">
    <config>
     <Option type="Map">
      <Option value="false" name="IsMultiline" type="bool"/>
      <Option value="false" name="UseHtml" type="bool"/>
     </Option>
    </config>
   </editWidget>
  </field>
  <field name="data" configurationFlags="None">
   <editWidget type="DateTime">
    <config>
     <Option type="Map">
      <Option value="true" name="allow_null" type="bool"/>
      <Option value="true" name="calendar_popup" type="bool"/>
      <Option value="yyyy-MM-dd HH:mm:ss" name="display_format" type="QString"/>
      <Option value="yyyy-MM-dd HH:mm:ss" name="field_format" type="QString"/>
      <Option value="false" name="field_iso_format" type="bool"/>
     </Option>
    </config>
   </editWidget>
  </field>
  <field name="resolvido" configurationFlags="None">
   <editWidget type="CheckBox">
    <config>
     <Option type="Map">
      <Option value="" name="CheckedState" type="QString"/>
      <Option value="0" name="TextDisplayMethod" type="int"/>
      <Option value="" name="UncheckedState" type="QString"/>
     </Option>
    </config>
   </editWidget>
  </field>
 </fieldConfiguration>
 <aliases>
  <alias name="" index="0" field="id"/>
  <alias name="" index="1" field="atividade_id"/>
  <alias name="" index="2" field="unidade_trabalho_id"/>
  <alias name="" index="3" field="descricao"/>
  <alias name="" index="4" field="data"/>
  <alias name="" index="5" field="resolvido"/>
 </aliases>
 <defaults>
  <default expression="" applyOnUpdate="0" field="id"/>
  <default expression="" applyOnUpdate="0" field="atividade_id"/>
  <default expression="" applyOnUpdate="0" field="unidade_trabalho_id"/>
  <default expression="" applyOnUpdate="0" field="descricao"/>
  <default expression="" applyOnUpdate="0" field="data"/>
  <default expression="" applyOnUpdate="0" field="resolvido"/>
 </defaults>
 <constraints>
  <constraint exp_strength="0" notnull_strength="1" constraints="3" unique_strength="1" field="id"/>
  <constraint exp_strength="0" notnull_strength="1" constraints="1" unique_strength="0" field="atividade_id"/>
  <constraint exp_strength="0" notnull_strength="1" constraints="1" unique_strength="0" field="unidade_trabalho_id"/>
  <constraint exp_strength="0" notnull_strength="1" constraints="1" unique_strength="0" field="descricao"/>
  <constraint exp_strength="0" notnull_strength="1" constraints="1" unique_strength="0" field="data"/>
  <constraint exp_strength="0" notnull_strength="1" constraints="1" unique_strength="0" field="resolvido"/>
 </constraints>
 <constraintExpressions>
  <constraint exp="" desc="" field="id"/>
  <constraint exp="" desc="" field="atividade_id"/>
  <constraint exp="" desc="" field="unidade_trabalho_id"/>
  <constraint exp="" desc="" field="descricao"/>
  <constraint exp="" desc="" field="data"/>
  <constraint exp="" desc="" field="resolvido"/>
 </constraintExpressions>
 <expressionfields/>
 <attributeactions>
  <defaultAction value="{00000000-0000-0000-0000-000000000000}" key="Canvas"/>
 </attributeactions>
 <attributetableconfig sortExpression="&quot;resolvido&quot;" actionWidgetStyle="dropDown" sortOrder="0">
  <columns>
   <column hidden="0" name="id" width="-1" type="field"/>
   <column hidden="0" name="atividade_id" width="143" type="field"/>
   <column hidden="0" name="unidade_trabalho_id" width="157" type="field"/>
   <column hidden="0" name="descricao" width="133" type="field"/>
   <column hidden="0" name="data" width="122" type="field"/>
   <column hidden="0" name="resolvido" width="115" type="field"/>
   <column hidden="1" width="-1" type="actions"/>
  </columns>
 </attributetableconfig>
 <conditionalstyles>
  <rowstyles/>
  <fieldstyles/>
 </conditionalstyles>
 <storedexpressions/>
 <editform tolerant="1"></editform>
 <editforminit/>
 <editforminitcodesource>0</editforminitcodesource>
 <editforminitfilepath></editforminitfilepath>
 <editforminitcode><![CDATA[# -*- coding: utf-8 -*-
"""
QGIS forms can have a Python function that is called when the form is
opened.

Use this function to add extra logic to your forms.

Enter the name of the function in the "Python Init function"
field.
An example follows:
"""
from qgis.PyQt.QtWidgets import QWidget

def my_form_open(dialog, layer, feature):
	geom = feature.geometry()
	control = dialog.findChild(QWidget, "MyLineEdit")
]]></editforminitcode>
 <featformsuppress>0</featformsuppress>
 <editorlayout>generatedlayout</editorlayout>
 <editable>
  <field editable="0" name="atividade_id"/>
  <field editable="0" name="data"/>
  <field editable="0" name="descricao"/>
  <field editable="0" name="id"/>
  <field editable="0" name="resolvido"/>
  <field editable="0" name="unidade_trabalho_id"/>
 </editable>
 <labelOnTop>
  <field labelOnTop="0" name="atividade_id"/>
  <field labelOnTop="0" name="data"/>
  <field labelOnTop="0" name="descricao"/>
  <field labelOnTop="0" name="id"/>
  <field labelOnTop="0" name="resolvido"/>
  <field labelOnTop="0" name="unidade_trabalho_id"/>
 </labelOnTop>
 <dataDefinedFieldProperties/>
 <widgets/>
 <previewExpression>"descricao"</previewExpression>
 <mapTip></mapTip>
 <layerGeometryType>2</layerGeometryType>
</qgis>
', '<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:se="http://www.opengis.net/se" version="1.1.0" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
 <NamedLayer>
  <se:Name>alteracao_fluxo</se:Name>
  <UserStyle>
   <se:Name>alteracao_fluxo</se:Name>
   <se:FeatureTypeStyle>
    <se:Rule>
     <se:Name></se:Name>
     <se:PolygonSymbolizer>
      <se:Fill>
       <se:SvgParameter name="fill">#e41a1c</se:SvgParameter>
      </se:Fill>
      <se:Stroke>
       <se:SvgParameter name="stroke">#800e10</se:SvgParameter>
       <se:SvgParameter name="stroke-width">1</se:SvgParameter>
       <se:SvgParameter name="stroke-linejoin">bevel</se:SvgParameter>
      </se:Stroke>
     </se:PolygonSymbolizer>
    </se:Rule>
    <se:Rule>
     <se:TextSymbolizer>
      <se:Label>
       <!--SE Export for ''Pedidos de alteração de fluxo: '' || count(id, NULL, resolvido IS FALSE) not implemented yet-->Placeholder</se:Label>
      <se:Font>
       <se:SvgParameter name="font-family">Arial</se:SvgParameter>
       <se:SvgParameter name="font-size">13</se:SvgParameter>
       <se:SvgParameter name="font-weight">bold</se:SvgParameter>
      </se:Font>
      <se:LabelPlacement>
       <se:PointPlacement>
        <se:AnchorPoint>
         <se:AnchorPointX>0.5</se:AnchorPointX>
         <se:AnchorPointY>0.5</se:AnchorPointY>
        </se:AnchorPoint>
        <se:Displacement>
         <se:DisplacementX>-107</se:DisplacementX>
         <se:DisplacementY>36</se:DisplacementY>
        </se:Displacement>
       </se:PointPlacement>
      </se:LabelPlacement>
      <se:Fill>
       <se:SvgParameter name="fill">#000000</se:SvgParameter>
      </se:Fill>
      <se:Graphic>
       <se:Mark>
        <se:WellKnownName>square</se:WellKnownName>
        <se:Fill>
         <se:SvgParameter name="fill">#ff784b</se:SvgParameter>
        </se:Fill>
        <se:Stroke>
         <se:SvgParameter name="stroke">#000000</se:SvgParameter>
         <se:SvgParameter name="stroke-width">1</se:SvgParameter>
        </se:Stroke>
       </se:Mark>
       <se:Size>7</se:Size>
      </se:Graphic>
      <se:Priority>1000</se:Priority>
      <se:VendorOption name="conflictResolution">false</se:VendorOption>
      <se:VendorOption name="graphic-resize">stretch</se:VendorOption>
      <se:VendorOption name="graphic-margin">7 7</se:VendorOption>
     </se:TextSymbolizer>
    </se:Rule>
   </se:FeatureTypeStyle>
  </UserStyle>
 </NamedLayer>
</StyledLayerDescriptor>
', TRUE, NULL, current_user, NULL, now(), 'Polygon');

INSERT INTO public.layer_styles VALUES (nextval('public.layer_styles_id_seq'::regclass), current_database(), 'macrocontrole', 'problema_atividade', 'geom', 'problema_atividade', '<!DOCTYPE qgis PUBLIC ''http://mrcc.com/qgis.dtd'' ''SYSTEM''>
<qgis labelsEnabled="1" minScale="100000000" simplifyDrawingHints="0" hasScaleBasedVisibilityFlag="0" maxScale="0" readOnly="0" simplifyDrawingTol="1" version="3.18.3-Zürich" simplifyAlgorithm="0" styleCategories="AllStyleCategories" simplifyMaxScale="1" simplifyLocal="1">
 <flags>
  <Identifiable>1</Identifiable>
  <Removable>1</Removable>
  <Searchable>1</Searchable>
  <Private>0</Private>
 </flags>
 <temporal mode="0" startExpression="" accumulate="0" durationField="" enabled="0" fixedDuration="0" endField="" endExpression="" durationUnit="min" startField="">
  <fixedRange>
   <start></start>
   <end></end>
  </fixedRange>
 </temporal>
 <renderer-v2 forceraster="0" enableorderby="0" symbollevels="0" type="RuleRenderer">
  <rules key="{0644f810-b251-4e11-b410-ebd3c9e04230}">
   <rule symbol="0" filter="&quot;resolvido&quot; IS FALSE" key="{fd598f04-53a4-4bf6-b2f1-0a737bb365ce}"/>
  </rules>
  <symbols>
   <symbol clip_to_extent="1" alpha="1" name="0" force_rhr="0" type="fill">
    <data_defined_properties>
     <Option type="Map">
      <Option value="" name="name" type="QString"/>
      <Option name="properties"/>
      <Option value="collection" name="type" type="QString"/>
     </Option>
    </data_defined_properties>
    <layer class="SimpleFill" pass="0" enabled="1" locked="0">
     <Option type="Map">
      <Option value="3x:0,0,0,0,0,0" name="border_width_map_unit_scale" type="QString"/>
      <Option value="228,26,28,255" name="color" type="QString"/>
      <Option value="bevel" name="joinstyle" type="QString"/>
      <Option value="0,0" name="offset" type="QString"/>
      <Option value="3x:0,0,0,0,0,0" name="offset_map_unit_scale" type="QString"/>
      <Option value="MM" name="offset_unit" type="QString"/>
      <Option value="128,14,16,255" name="outline_color" type="QString"/>
      <Option value="solid" name="outline_style" type="QString"/>
      <Option value="0.26" name="outline_width" type="QString"/>
      <Option value="MM" name="outline_width_unit" type="QString"/>
      <Option value="solid" name="style" type="QString"/>
     </Option>
     <prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
     <prop k="color" v="228,26,28,255"/>
     <prop k="joinstyle" v="bevel"/>
     <prop k="offset" v="0,0"/>
     <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
     <prop k="offset_unit" v="MM"/>
     <prop k="outline_color" v="128,14,16,255"/>
     <prop k="outline_style" v="solid"/>
     <prop k="outline_width" v="0.26"/>
     <prop k="outline_width_unit" v="MM"/>
     <prop k="style" v="solid"/>
     <effect enabled="0" type="effectStack">
      <effect type="dropShadow">
       <Option type="Map">
        <Option value="13" name="blend_mode" type="QString"/>
        <Option value="2.645" name="blur_level" type="QString"/>
        <Option value="MM" name="blur_unit" type="QString"/>
        <Option value="3x:0,0,0,0,0,0" name="blur_unit_scale" type="QString"/>
        <Option value="0,0,0,255" name="color" type="QString"/>
        <Option value="2" name="draw_mode" type="QString"/>
        <Option value="0" name="enabled" type="QString"/>
        <Option value="135" name="offset_angle" type="QString"/>
        <Option value="2" name="offset_distance" type="QString"/>
        <Option value="MM" name="offset_unit" type="QString"/>
        <Option value="3x:0,0,0,0,0,0" name="offset_unit_scale" type="QString"/>
        <Option value="1" name="opacity" type="QString"/>
       </Option>
       <prop k="blend_mode" v="13"/>
       <prop k="blur_level" v="2.645"/>
       <prop k="blur_unit" v="MM"/>
       <prop k="blur_unit_scale" v="3x:0,0,0,0,0,0"/>
       <prop k="color" v="0,0,0,255"/>
       <prop k="draw_mode" v="2"/>
       <prop k="enabled" v="0"/>
       <prop k="offset_angle" v="135"/>
       <prop k="offset_distance" v="2"/>
       <prop k="offset_unit" v="MM"/>
       <prop k="offset_unit_scale" v="3x:0,0,0,0,0,0"/>
       <prop k="opacity" v="1"/>
      </effect>
      <effect type="outerGlow">
       <Option type="Map">
        <Option value="0" name="blend_mode" type="QString"/>
        <Option value="0.7935" name="blur_level" type="QString"/>
        <Option value="MM" name="blur_unit" type="QString"/>
        <Option value="3x:0,0,0,0,0,0" name="blur_unit_scale" type="QString"/>
        <Option value="0,0,255,255" name="color1" type="QString"/>
        <Option value="0,255,0,255" name="color2" type="QString"/>
        <Option value="0" name="color_type" type="QString"/>
        <Option value="0" name="discrete" type="QString"/>
        <Option value="2" name="draw_mode" type="QString"/>
        <Option value="0" name="enabled" type="QString"/>
        <Option value="0.5" name="opacity" type="QString"/>
        <Option value="gradient" name="rampType" type="QString"/>
        <Option value="255,255,255,255" name="single_color" type="QString"/>
        <Option value="2" name="spread" type="QString"/>
        <Option value="MM" name="spread_unit" type="QString"/>
        <Option value="3x:0,0,0,0,0,0" name="spread_unit_scale" type="QString"/>
       </Option>
       <prop k="blend_mode" v="0"/>
       <prop k="blur_level" v="0.7935"/>
       <prop k="blur_unit" v="MM"/>
       <prop k="blur_unit_scale" v="3x:0,0,0,0,0,0"/>
       <prop k="color1" v="0,0,255,255"/>
       <prop k="color2" v="0,255,0,255"/>
       <prop k="color_type" v="0"/>
       <prop k="discrete" v="0"/>
       <prop k="draw_mode" v="2"/>
       <prop k="enabled" v="0"/>
       <prop k="opacity" v="0.5"/>
       <prop k="rampType" v="gradient"/>
       <prop k="single_color" v="255,255,255,255"/>
       <prop k="spread" v="2"/>
       <prop k="spread_unit" v="MM"/>
       <prop k="spread_unit_scale" v="3x:0,0,0,0,0,0"/>
      </effect>
      <effect type="blur">
       <Option type="Map">
        <Option value="0" name="blend_mode" type="QString"/>
        <Option value="2.645" name="blur_level" type="QString"/>
        <Option value="0" name="blur_method" type="QString"/>
        <Option value="MM" name="blur_unit" type="QString"/>
        <Option value="3x:0,0,0,0,0,0" name="blur_unit_scale" type="QString"/>
        <Option value="2" name="draw_mode" type="QString"/>
        <Option value="1" name="enabled" type="QString"/>
        <Option value="1" name="opacity" type="QString"/>
       </Option>
       <prop k="blend_mode" v="0"/>
       <prop k="blur_level" v="2.645"/>
       <prop k="blur_method" v="0"/>
       <prop k="blur_unit" v="MM"/>
       <prop k="blur_unit_scale" v="3x:0,0,0,0,0,0"/>
       <prop k="draw_mode" v="2"/>
       <prop k="enabled" v="1"/>
       <prop k="opacity" v="1"/>
      </effect>
      <effect type="innerShadow">
       <Option type="Map">
        <Option value="13" name="blend_mode" type="QString"/>
        <Option value="2.645" name="blur_level" type="QString"/>
        <Option value="MM" name="blur_unit" type="QString"/>
        <Option value="3x:0,0,0,0,0,0" name="blur_unit_scale" type="QString"/>
        <Option value="0,0,0,255" name="color" type="QString"/>
        <Option value="2" name="draw_mode" type="QString"/>
        <Option value="0" name="enabled" type="QString"/>
        <Option value="135" name="offset_angle" type="QString"/>
        <Option value="2" name="offset_distance" type="QString"/>
        <Option value="MM" name="offset_unit" type="QString"/>
        <Option value="3x:0,0,0,0,0,0" name="offset_unit_scale" type="QString"/>
        <Option value="1" name="opacity" type="QString"/>
       </Option>
       <prop k="blend_mode" v="13"/>
       <prop k="blur_level" v="2.645"/>
       <prop k="blur_unit" v="MM"/>
       <prop k="blur_unit_scale" v="3x:0,0,0,0,0,0"/>
       <prop k="color" v="0,0,0,255"/>
       <prop k="draw_mode" v="2"/>
       <prop k="enabled" v="0"/>
       <prop k="offset_angle" v="135"/>
       <prop k="offset_distance" v="2"/>
       <prop k="offset_unit" v="MM"/>
       <prop k="offset_unit_scale" v="3x:0,0,0,0,0,0"/>
       <prop k="opacity" v="1"/>
      </effect>
      <effect type="innerGlow">
       <Option type="Map">
        <Option value="0" name="blend_mode" type="QString"/>
        <Option value="0.7935" name="blur_level" type="QString"/>
        <Option value="MM" name="blur_unit" type="QString"/>
        <Option value="3x:0,0,0,0,0,0" name="blur_unit_scale" type="QString"/>
        <Option value="0,0,255,255" name="color1" type="QString"/>
        <Option value="0,255,0,255" name="color2" type="QString"/>
        <Option value="0" name="color_type" type="QString"/>
        <Option value="0" name="discrete" type="QString"/>
        <Option value="2" name="draw_mode" type="QString"/>
        <Option value="0" name="enabled" type="QString"/>
        <Option value="0.5" name="opacity" type="QString"/>
        <Option value="gradient" name="rampType" type="QString"/>
        <Option value="255,255,255,255" name="single_color" type="QString"/>
        <Option value="2" name="spread" type="QString"/>
        <Option value="MM" name="spread_unit" type="QString"/>
        <Option value="3x:0,0,0,0,0,0" name="spread_unit_scale" type="QString"/>
       </Option>
       <prop k="blend_mode" v="0"/>
       <prop k="blur_level" v="0.7935"/>
       <prop k="blur_unit" v="MM"/>
       <prop k="blur_unit_scale" v="3x:0,0,0,0,0,0"/>
       <prop k="color1" v="0,0,255,255"/>
       <prop k="color2" v="0,255,0,255"/>
       <prop k="color_type" v="0"/>
       <prop k="discrete" v="0"/>
       <prop k="draw_mode" v="2"/>
       <prop k="enabled" v="0"/>
       <prop k="opacity" v="0.5"/>
       <prop k="rampType" v="gradient"/>
       <prop k="single_color" v="255,255,255,255"/>
       <prop k="spread" v="2"/>
       <prop k="spread_unit" v="MM"/>
       <prop k="spread_unit_scale" v="3x:0,0,0,0,0,0"/>
      </effect>
     </effect>
     <data_defined_properties>
      <Option type="Map">
       <Option value="" name="name" type="QString"/>
       <Option name="properties"/>
       <Option value="collection" name="type" type="QString"/>
      </Option>
     </data_defined_properties>
    </layer>
   </symbol>
  </symbols>
 </renderer-v2>
 <labeling type="rule-based">
  <rules key="{9c03b094-8f4d-4f89-99c1-876bed128735}">
   <rule filter="id = minimum(id) AND count( &quot;id&quot;, filter:= &quot;resolvido&quot; IS FALSE) > 0" key="{4372cdf1-f25f-4cee-8adf-dccbb33d0650}" description="Problema em atividade">
    <settings calloutType="simple">
     <text-style fontWeight="75" textColor="0,0,0,255" fontStrikeout="0" fontLetterSpacing="0" fontUnderline="0" useSubstitutions="0" isExpression="1" blendMode="0" fontKerning="1" fontSizeMapUnitScale="3x:0,0,0,0,0,0" fontSize="10" capitalization="0" textOpacity="1" fontWordSpacing="0" multilineHeight="1" namedStyle="Negrito" previewBkgrdColor="255,255,255,255" fontItalic="0" fontSizeUnit="Point" fontFamily="Arial" textOrientation="horizontal" allowHtml="0" fieldName="''Problema em atividade: '' ||  count( &quot;id&quot; , filter:=  &quot;resolvido&quot; IS FALSE)">
      <text-buffer bufferSizeMapUnitScale="3x:0,0,0,0,0,0" bufferNoFill="1" bufferOpacity="1" bufferJoinStyle="128" bufferSizeUnits="MM" bufferDraw="0" bufferColor="255,255,255,255" bufferSize="1" bufferBlendMode="0"/>
      <text-mask maskType="0" maskedSymbolLayers="" maskEnabled="0" maskOpacity="1" maskSizeMapUnitScale="3x:0,0,0,0,0,0" maskSize="1.5" maskSizeUnits="MM" maskJoinStyle="128"/>
      <background shapeBorderColor="0,0,0,255" shapeRotationType="0" shapeJoinStyle="64" shapeRadiiX="0" shapeOffsetMapUnitScale="3x:0,0,0,0,0,0" shapeOpacity="1" shapeSizeMapUnitScale="3x:0,0,0,0,0,0" shapeSizeUnit="MM" shapeSizeX="2" shapeRadiiMapUnitScale="3x:0,0,0,0,0,0" shapeBlendMode="0" shapeOffsetX="0" shapeBorderWidthMapUnitScale="3x:0,0,0,0,0,0" shapeType="0" shapeRadiiUnit="MM" shapeBorderWidth="0.2" shapeSizeY="2" shapeRotation="0" shapeOffsetY="0" shapeSVGFile="" shapeDraw="1" shapeFillColor="255,120,75,255" shapeRadiiY="0" shapeOffsetUnit="MM" shapeBorderWidthUnit="MM" shapeSizeType="0">
       <symbol clip_to_extent="1" alpha="1" name="markerSymbol" force_rhr="0" type="marker">
        <data_defined_properties>
         <Option type="Map">
          <Option value="" name="name" type="QString"/>
          <Option name="properties"/>
          <Option value="collection" name="type" type="QString"/>
         </Option>
        </data_defined_properties>
        <layer class="SimpleMarker" pass="0" enabled="1" locked="0">
         <Option type="Map">
          <Option value="0" name="angle" type="QString"/>
          <Option value="152,125,183,255" name="color" type="QString"/>
          <Option value="1" name="horizontal_anchor_point" type="QString"/>
          <Option value="bevel" name="joinstyle" type="QString"/>
          <Option value="circle" name="name" type="QString"/>
          <Option value="0,0" name="offset" type="QString"/>
          <Option value="3x:0,0,0,0,0,0" name="offset_map_unit_scale" type="QString"/>
          <Option value="MM" name="offset_unit" type="QString"/>
          <Option value="35,35,35,255" name="outline_color" type="QString"/>
          <Option value="solid" name="outline_style" type="QString"/>
          <Option value="0" name="outline_width" type="QString"/>
          <Option value="3x:0,0,0,0,0,0" name="outline_width_map_unit_scale" type="QString"/>
          <Option value="MM" name="outline_width_unit" type="QString"/>
          <Option value="diameter" name="scale_method" type="QString"/>
          <Option value="2" name="size" type="QString"/>
          <Option value="3x:0,0,0,0,0,0" name="size_map_unit_scale" type="QString"/>
          <Option value="MM" name="size_unit" type="QString"/>
          <Option value="1" name="vertical_anchor_point" type="QString"/>
         </Option>
         <prop k="angle" v="0"/>
         <prop k="color" v="152,125,183,255"/>
         <prop k="horizontal_anchor_point" v="1"/>
         <prop k="joinstyle" v="bevel"/>
         <prop k="name" v="circle"/>
         <prop k="offset" v="0,0"/>
         <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
         <prop k="offset_unit" v="MM"/>
         <prop k="outline_color" v="35,35,35,255"/>
         <prop k="outline_style" v="solid"/>
         <prop k="outline_width" v="0"/>
         <prop k="outline_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
         <prop k="outline_width_unit" v="MM"/>
         <prop k="scale_method" v="diameter"/>
         <prop k="size" v="2"/>
         <prop k="size_map_unit_scale" v="3x:0,0,0,0,0,0"/>
         <prop k="size_unit" v="MM"/>
         <prop k="vertical_anchor_point" v="1"/>
         <data_defined_properties>
          <Option type="Map">
           <Option value="" name="name" type="QString"/>
           <Option name="properties"/>
           <Option value="collection" name="type" type="QString"/>
          </Option>
         </data_defined_properties>
        </layer>
       </symbol>
      </background>
      <shadow shadowRadius="1.5" shadowOffsetMapUnitScale="3x:0,0,0,0,0,0" shadowRadiusAlphaOnly="0" shadowColor="0,0,0,255" shadowOffsetAngle="135" shadowBlendMode="6" shadowRadiusMapUnitScale="3x:0,0,0,0,0,0" shadowOffsetDist="1" shadowRadiusUnit="MM" shadowOpacity="0.7" shadowUnder="0" shadowScale="100" shadowOffsetGlobal="1" shadowDraw="0" shadowOffsetUnit="MM"/>
      <dd_properties>
       <Option type="Map">
        <Option value="" name="name" type="QString"/>
        <Option name="properties"/>
        <Option value="collection" name="type" type="QString"/>
       </Option>
      </dd_properties>
      <substitutions/>
     </text-style>
     <text-format reverseDirectionSymbol="0" wrapChar="" multilineAlign="0" useMaxLineLengthForAutoWrap="1" decimals="3" autoWrapLength="0" rightDirectionSymbol=">" formatNumbers="0" addDirectionSymbol="0" placeDirectionSymbol="0" leftDirectionSymbol="&lt;" plussign="0"/>
     <placement polygonPlacementFlags="2" maxCurvedCharAngleIn="25" centroidInside="0" yOffset="20" centroidWhole="0" offsetType="0" lineAnchorPercent="0.5" layerType="PolygonGeometry" preserveRotation="1" geometryGeneratorType="PointGeometry" repeatDistanceUnits="MM" overrunDistanceUnit="MM" priority="10" placement="1" repeatDistanceMapUnitScale="3x:0,0,0,0,0,0" dist="0" labelOffsetMapUnitScale="3x:0,0,0,0,0,0" predefinedPositionOrder="TR,TL,BR,BL,R,L,TSR,BSR" fitInPolygonOnly="0" maxCurvedCharAngleOut="-25" overrunDistanceMapUnitScale="3x:0,0,0,0,0,0" xOffset="-30" overrunDistance="0" quadOffset="4" distMapUnitScale="3x:0,0,0,0,0,0" geometryGenerator="point_n(  @map_extent, 3  )" rotationAngle="0" repeatDistance="0" lineAnchorType="0" offsetUnits="MM" geometryGeneratorEnabled="1" placementFlags="10" distUnits="MM"/>
     <rendering minFeatureSize="0" obstacle="0" zIndex="0" upsidedownLabels="0" obstacleFactor="1" scaleVisibility="0" mergeLines="0" fontMaxPixelSize="10000" displayAll="1" scaleMax="0" maxNumLabels="2000" scaleMin="0" drawLabels="1" obstacleType="1" labelPerPart="0" fontLimitPixelSize="0" limitNumLabels="0" fontMinPixelSize="3"/>
     <dd_properties>
      <Option type="Map">
       <Option value="" name="name" type="QString"/>
       <Option name="properties"/>
       <Option value="collection" name="type" type="QString"/>
      </Option>
     </dd_properties>
     <callout type="simple">
      <Option type="Map">
       <Option value="pole_of_inaccessibility" name="anchorPoint" type="QString"/>
       <Option name="ddProperties" type="Map">
        <Option value="" name="name" type="QString"/>
        <Option name="properties"/>
        <Option value="collection" name="type" type="QString"/>
       </Option>
       <Option value="false" name="drawToAllParts" type="bool"/>
       <Option value="0" name="enabled" type="QString"/>
       <Option value="point_on_exterior" name="labelAnchorPoint" type="QString"/>
       <Option value="&lt;symbol clip_to_extent=&quot;1&quot; alpha=&quot;1&quot; name=&quot;symbol&quot; force_rhr=&quot;0&quot; type=&quot;line&quot;>&lt;data_defined_properties>&lt;Option type=&quot;Map&quot;>&lt;Option value=&quot;&quot; name=&quot;name&quot; type=&quot;QString&quot;/>&lt;Option name=&quot;properties&quot;/>&lt;Option value=&quot;collection&quot; name=&quot;type&quot; type=&quot;QString&quot;/>&lt;/Option>&lt;/data_defined_properties>&lt;layer class=&quot;SimpleLine&quot; pass=&quot;0&quot; enabled=&quot;1&quot; locked=&quot;0&quot;>&lt;Option type=&quot;Map&quot;>&lt;Option value=&quot;0&quot; name=&quot;align_dash_pattern&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;square&quot; name=&quot;capstyle&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;5;2&quot; name=&quot;customdash&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;3x:0,0,0,0,0,0&quot; name=&quot;customdash_map_unit_scale&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;MM&quot; name=&quot;customdash_unit&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;0&quot; name=&quot;dash_pattern_offset&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;3x:0,0,0,0,0,0&quot; name=&quot;dash_pattern_offset_map_unit_scale&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;MM&quot; name=&quot;dash_pattern_offset_unit&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;0&quot; name=&quot;draw_inside_polygon&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;bevel&quot; name=&quot;joinstyle&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;60,60,60,255&quot; name=&quot;line_color&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;solid&quot; name=&quot;line_style&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;0.3&quot; name=&quot;line_width&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;MM&quot; name=&quot;line_width_unit&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;0&quot; name=&quot;offset&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;3x:0,0,0,0,0,0&quot; name=&quot;offset_map_unit_scale&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;MM&quot; name=&quot;offset_unit&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;0&quot; name=&quot;ring_filter&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;0&quot; name=&quot;tweak_dash_pattern_on_corners&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;0&quot; name=&quot;use_custom_dash&quot; type=&quot;QString&quot;/>&lt;Option value=&quot;3x:0,0,0,0,0,0&quot; name=&quot;width_map_unit_scale&quot; type=&quot;QString&quot;/>&lt;/Option>&lt;prop k=&quot;align_dash_pattern&quot; v=&quot;0&quot;/>&lt;prop k=&quot;capstyle&quot; v=&quot;square&quot;/>&lt;prop k=&quot;customdash&quot; v=&quot;5;2&quot;/>&lt;prop k=&quot;customdash_map_unit_scale&quot; v=&quot;3x:0,0,0,0,0,0&quot;/>&lt;prop k=&quot;customdash_unit&quot; v=&quot;MM&quot;/>&lt;prop k=&quot;dash_pattern_offset&quot; v=&quot;0&quot;/>&lt;prop k=&quot;dash_pattern_offset_map_unit_scale&quot; v=&quot;3x:0,0,0,0,0,0&quot;/>&lt;prop k=&quot;dash_pattern_offset_unit&quot; v=&quot;MM&quot;/>&lt;prop k=&quot;draw_inside_polygon&quot; v=&quot;0&quot;/>&lt;prop k=&quot;joinstyle&quot; v=&quot;bevel&quot;/>&lt;prop k=&quot;line_color&quot; v=&quot;60,60,60,255&quot;/>&lt;prop k=&quot;line_style&quot; v=&quot;solid&quot;/>&lt;prop k=&quot;line_width&quot; v=&quot;0.3&quot;/>&lt;prop k=&quot;line_width_unit&quot; v=&quot;MM&quot;/>&lt;prop k=&quot;offset&quot; v=&quot;0&quot;/>&lt;prop k=&quot;offset_map_unit_scale&quot; v=&quot;3x:0,0,0,0,0,0&quot;/>&lt;prop k=&quot;offset_unit&quot; v=&quot;MM&quot;/>&lt;prop k=&quot;ring_filter&quot; v=&quot;0&quot;/>&lt;prop k=&quot;tweak_dash_pattern_on_corners&quot; v=&quot;0&quot;/>&lt;prop k=&quot;use_custom_dash&quot; v=&quot;0&quot;/>&lt;prop k=&quot;width_map_unit_scale&quot; v=&quot;3x:0,0,0,0,0,0&quot;/>&lt;data_defined_properties>&lt;Option type=&quot;Map&quot;>&lt;Option value=&quot;&quot; name=&quot;name&quot; type=&quot;QString&quot;/>&lt;Option name=&quot;properties&quot;/>&lt;Option value=&quot;collection&quot; name=&quot;type&quot; type=&quot;QString&quot;/>&lt;/Option>&lt;/data_defined_properties>&lt;/layer>&lt;/symbol>" name="lineSymbol" type="QString"/>
       <Option value="0" name="minLength" type="double"/>
       <Option value="3x:0,0,0,0,0,0" name="minLengthMapUnitScale" type="QString"/>
       <Option value="MM" name="minLengthUnit" type="QString"/>
       <Option value="0" name="offsetFromAnchor" type="double"/>
       <Option value="3x:0,0,0,0,0,0" name="offsetFromAnchorMapUnitScale" type="QString"/>
       <Option value="MM" name="offsetFromAnchorUnit" type="QString"/>
       <Option value="0" name="offsetFromLabel" type="double"/>
       <Option value="3x:0,0,0,0,0,0" name="offsetFromLabelMapUnitScale" type="QString"/>
       <Option value="MM" name="offsetFromLabelUnit" type="QString"/>
      </Option>
     </callout>
    </settings>
   </rule>
  </rules>
 </labeling>
 <customproperties>
  <property key="dualview/previewExpressions">
   <value>"descricao"</value>
  </property>
  <property value="0" key="embeddedWidgets/count"/>
  <property key="variableNames"/>
  <property key="variableValues"/>
 </customproperties>
 <blendMode>0</blendMode>
 <featureBlendMode>0</featureBlendMode>
 <layerOpacity>1</layerOpacity>
 <SingleCategoryDiagramRenderer diagramType="Histogram" attributeLegend="1">
  <DiagramCategory scaleDependency="Area" scaleBasedVisibility="0" penColor="#000000" opacity="1" spacingUnit="MM" width="15" labelPlacementMethod="XHeight" penAlpha="255" minimumSize="0" penWidth="0" spacing="5" height="15" direction="0" lineSizeType="MM" showAxis="1" backgroundAlpha="255" sizeType="MM" minScaleDenominator="0" maxScaleDenominator="1e+08" lineSizeScale="3x:0,0,0,0,0,0" spacingUnitScale="3x:0,0,0,0,0,0" backgroundColor="#ffffff" barWidth="5" enabled="0" sizeScale="3x:0,0,0,0,0,0" rotationOffset="270" diagramOrientation="Up">
   <fontProperties style="" description="MS Shell Dlg 2,8.25,-1,5,50,0,0,0,0,0"/>
   <axisSymbol>
    <symbol clip_to_extent="1" alpha="1" name="" force_rhr="0" type="line">
     <data_defined_properties>
      <Option type="Map">
       <Option value="" name="name" type="QString"/>
       <Option name="properties"/>
       <Option value="collection" name="type" type="QString"/>
      </Option>
     </data_defined_properties>
     <layer class="SimpleLine" pass="0" enabled="1" locked="0">
      <Option type="Map">
       <Option value="0" name="align_dash_pattern" type="QString"/>
       <Option value="square" name="capstyle" type="QString"/>
       <Option value="5;2" name="customdash" type="QString"/>
       <Option value="3x:0,0,0,0,0,0" name="customdash_map_unit_scale" type="QString"/>
       <Option value="MM" name="customdash_unit" type="QString"/>
       <Option value="0" name="dash_pattern_offset" type="QString"/>
       <Option value="3x:0,0,0,0,0,0" name="dash_pattern_offset_map_unit_scale" type="QString"/>
       <Option value="MM" name="dash_pattern_offset_unit" type="QString"/>
       <Option value="0" name="draw_inside_polygon" type="QString"/>
       <Option value="bevel" name="joinstyle" type="QString"/>
       <Option value="35,35,35,255" name="line_color" type="QString"/>
       <Option value="solid" name="line_style" type="QString"/>
       <Option value="0.26" name="line_width" type="QString"/>
       <Option value="MM" name="line_width_unit" type="QString"/>
       <Option value="0" name="offset" type="QString"/>
       <Option value="3x:0,0,0,0,0,0" name="offset_map_unit_scale" type="QString"/>
       <Option value="MM" name="offset_unit" type="QString"/>
       <Option value="0" name="ring_filter" type="QString"/>
       <Option value="0" name="tweak_dash_pattern_on_corners" type="QString"/>
       <Option value="0" name="use_custom_dash" type="QString"/>
       <Option value="3x:0,0,0,0,0,0" name="width_map_unit_scale" type="QString"/>
      </Option>
      <prop k="align_dash_pattern" v="0"/>
      <prop k="capstyle" v="square"/>
      <prop k="customdash" v="5;2"/>
      <prop k="customdash_map_unit_scale" v="3x:0,0,0,0,0,0"/>
      <prop k="customdash_unit" v="MM"/>
      <prop k="dash_pattern_offset" v="0"/>
      <prop k="dash_pattern_offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
      <prop k="dash_pattern_offset_unit" v="MM"/>
      <prop k="draw_inside_polygon" v="0"/>
      <prop k="joinstyle" v="bevel"/>
      <prop k="line_color" v="35,35,35,255"/>
      <prop k="line_style" v="solid"/>
      <prop k="line_width" v="0.26"/>
      <prop k="line_width_unit" v="MM"/>
      <prop k="offset" v="0"/>
      <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
      <prop k="offset_unit" v="MM"/>
      <prop k="ring_filter" v="0"/>
      <prop k="tweak_dash_pattern_on_corners" v="0"/>
      <prop k="use_custom_dash" v="0"/>
      <prop k="width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
      <data_defined_properties>
       <Option type="Map">
        <Option value="" name="name" type="QString"/>
        <Option name="properties"/>
        <Option value="collection" name="type" type="QString"/>
       </Option>
      </data_defined_properties>
     </layer>
    </symbol>
   </axisSymbol>
  </DiagramCategory>
 </SingleCategoryDiagramRenderer>
 <DiagramLayerSettings placement="1" zIndex="0" dist="0" priority="0" showAll="1" obstacle="0" linePlacementFlags="18">
  <properties>
   <Option type="Map">
    <Option value="" name="name" type="QString"/>
    <Option name="properties"/>
    <Option value="collection" name="type" type="QString"/>
   </Option>
  </properties>
 </DiagramLayerSettings>
 <geometryOptions removeDuplicateNodes="0" geometryPrecision="0">
  <activeChecks/>
  <checkConfiguration type="Map">
   <Option name="QgsGeometryGapCheck" type="Map">
    <Option value="0" name="allowedGapsBuffer" type="double"/>
    <Option value="false" name="allowedGapsEnabled" type="bool"/>
    <Option value="" name="allowedGapsLayer" type="QString"/>
   </Option>
  </checkConfiguration>
 </geometryOptions>
 <legend type="default-vector"/>
 <referencedLayers/>
 <fieldConfiguration>
  <field name="id" configurationFlags="None">
   <editWidget type="TextEdit">
    <config>
     <Option type="Map">
      <Option value="false" name="IsMultiline" type="bool"/>
      <Option value="false" name="UseHtml" type="bool"/>
     </Option>
    </config>
   </editWidget>
  </field>
  <field name="atividade_id" configurationFlags="None">
   <editWidget type="Range">
    <config>
     <Option type="Map">
      <Option value="true" name="AllowNull" type="bool"/>
      <Option value="2147483647" name="Max" type="int"/>
      <Option value="-2147483648" name="Min" type="int"/>
      <Option value="0" name="Precision" type="int"/>
      <Option value="1" name="Step" type="int"/>
      <Option value="SpinBox" name="Style" type="QString"/>
     </Option>
    </config>
   </editWidget>
  </field>
  <field name="unidade_trabalho_id" configurationFlags="None">
   <editWidget type="Range">
    <config>
     <Option type="Map">
      <Option value="true" name="AllowNull" type="bool"/>
      <Option value="2147483647" name="Max" type="int"/>
      <Option value="-2147483648" name="Min" type="int"/>
      <Option value="0" name="Precision" type="int"/>
      <Option value="1" name="Step" type="int"/>
      <Option value="SpinBox" name="Style" type="QString"/>
     </Option>
    </config>
   </editWidget>
  </field>
  <field name="tipo_problema_id" configurationFlags="None">
   <editWidget type="Range">
    <config>
     <Option type="Map">
      <Option value="true" name="AllowNull" type="bool"/>
      <Option value="2147483647" name="Max" type="int"/>
      <Option value="-2147483648" name="Min" type="int"/>
      <Option value="0" name="Precision" type="int"/>
      <Option value="1" name="Step" type="int"/>
      <Option value="SpinBox" name="Style" type="QString"/>
     </Option>
    </config>
   </editWidget>
  </field>
  <field name="descricao" configurationFlags="None">
   <editWidget type="TextEdit">
    <config>
     <Option type="Map">
      <Option value="false" name="IsMultiline" type="bool"/>
      <Option value="false" name="UseHtml" type="bool"/>
     </Option>
    </config>
   </editWidget>
  </field>
  <field name="data" configurationFlags="None">
   <editWidget type="DateTime">
    <config>
     <Option type="Map">
      <Option value="true" name="allow_null" type="bool"/>
      <Option value="true" name="calendar_popup" type="bool"/>
      <Option value="yyyy-MM-dd HH:mm:ss" name="display_format" type="QString"/>
      <Option value="yyyy-MM-dd HH:mm:ss" name="field_format" type="QString"/>
      <Option value="false" name="field_iso_format" type="bool"/>
     </Option>
    </config>
   </editWidget>
  </field>
  <field name="resolvido" configurationFlags="None">
   <editWidget type="CheckBox">
    <config>
     <Option type="Map">
      <Option value="" name="CheckedState" type="QString"/>
      <Option value="0" name="TextDisplayMethod" type="int"/>
      <Option value="" name="UncheckedState" type="QString"/>
     </Option>
    </config>
   </editWidget>
  </field>
 </fieldConfiguration>
 <aliases>
  <alias name="" index="0" field="id"/>
  <alias name="" index="1" field="atividade_id"/>
  <alias name="" index="2" field="unidade_trabalho_id"/>
  <alias name="" index="3" field="tipo_problema_id"/>
  <alias name="" index="4" field="descricao"/>
  <alias name="" index="5" field="data"/>
  <alias name="" index="6" field="resolvido"/>
 </aliases>
 <defaults>
  <default expression="" applyOnUpdate="0" field="id"/>
  <default expression="" applyOnUpdate="0" field="atividade_id"/>
  <default expression="" applyOnUpdate="0" field="unidade_trabalho_id"/>
  <default expression="" applyOnUpdate="0" field="tipo_problema_id"/>
  <default expression="" applyOnUpdate="0" field="descricao"/>
  <default expression="" applyOnUpdate="0" field="data"/>
  <default expression="" applyOnUpdate="0" field="resolvido"/>
 </defaults>
 <constraints>
  <constraint exp_strength="0" notnull_strength="1" constraints="3" unique_strength="1" field="id"/>
  <constraint exp_strength="0" notnull_strength="1" constraints="1" unique_strength="0" field="atividade_id"/>
  <constraint exp_strength="0" notnull_strength="1" constraints="1" unique_strength="0" field="unidade_trabalho_id"/>
  <constraint exp_strength="0" notnull_strength="1" constraints="1" unique_strength="0" field="tipo_problema_id"/>
  <constraint exp_strength="0" notnull_strength="1" constraints="1" unique_strength="0" field="descricao"/>
  <constraint exp_strength="0" notnull_strength="1" constraints="1" unique_strength="0" field="data"/>
  <constraint exp_strength="0" notnull_strength="1" constraints="1" unique_strength="0" field="resolvido"/>
 </constraints>
 <constraintExpressions>
  <constraint exp="" desc="" field="id"/>
  <constraint exp="" desc="" field="atividade_id"/>
  <constraint exp="" desc="" field="unidade_trabalho_id"/>
  <constraint exp="" desc="" field="tipo_problema_id"/>
  <constraint exp="" desc="" field="descricao"/>
  <constraint exp="" desc="" field="data"/>
  <constraint exp="" desc="" field="resolvido"/>
 </constraintExpressions>
 <expressionfields/>
 <attributeactions>
  <defaultAction value="{00000000-0000-0000-0000-000000000000}" key="Canvas"/>
 </attributeactions>
 <attributetableconfig sortExpression="" actionWidgetStyle="dropDown" sortOrder="0">
  <columns>
   <column hidden="0" name="id" width="-1" type="field"/>
   <column hidden="0" name="atividade_id" width="-1" type="field"/>
   <column hidden="0" name="unidade_trabalho_id" width="-1" type="field"/>
   <column hidden="0" name="tipo_problema_id" width="-1" type="field"/>
   <column hidden="0" name="descricao" width="-1" type="field"/>
   <column hidden="0" name="data" width="-1" type="field"/>
   <column hidden="0" name="resolvido" width="-1" type="field"/>
   <column hidden="1" width="-1" type="actions"/>
  </columns>
 </attributetableconfig>
 <conditionalstyles>
  <rowstyles/>
  <fieldstyles/>
 </conditionalstyles>
 <storedexpressions/>
 <editform tolerant="1"></editform>
 <editforminit/>
 <editforminitcodesource>0</editforminitcodesource>
 <editforminitfilepath></editforminitfilepath>
 <editforminitcode><![CDATA[# -*- coding: utf-8 -*-
"""
QGIS forms can have a Python function that is called when the form is
opened.

Use this function to add extra logic to your forms.

Enter the name of the function in the "Python Init function"
field.
An example follows:
"""
from qgis.PyQt.QtWidgets import QWidget

def my_form_open(dialog, layer, feature):
	geom = feature.geometry()
	control = dialog.findChild(QWidget, "MyLineEdit")
]]></editforminitcode>
 <featformsuppress>0</featformsuppress>
 <editorlayout>generatedlayout</editorlayout>
 <editable>
  <field editable="0" name="atividade_id"/>
  <field editable="0" name="data"/>
  <field editable="0" name="descricao"/>
  <field editable="0" name="id"/>
  <field editable="0" name="resolvido"/>
  <field editable="0" name="tipo_problema_id"/>
  <field editable="0" name="unidade_trabalho_id"/>
 </editable>
 <labelOnTop>
  <field labelOnTop="0" name="atividade_id"/>
  <field labelOnTop="0" name="data"/>
  <field labelOnTop="0" name="descricao"/>
  <field labelOnTop="0" name="id"/>
  <field labelOnTop="0" name="resolvido"/>
  <field labelOnTop="0" name="tipo_problema_id"/>
  <field labelOnTop="0" name="unidade_trabalho_id"/>
 </labelOnTop>
 <dataDefinedFieldProperties/>
 <widgets/>
 <previewExpression>"descricao"</previewExpression>
 <mapTip></mapTip>
 <layerGeometryType>2</layerGeometryType>
</qgis>
', '<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:se="http://www.opengis.net/se" version="1.1.0" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
 <NamedLayer>
  <se:Name>problema_atividade</se:Name>
  <UserStyle>
   <se:Name>problema_atividade</se:Name>
   <se:FeatureTypeStyle>
    <se:Rule>
     <se:Name></se:Name>
     <se:PolygonSymbolizer>
      <se:Fill>
       <se:SvgParameter name="fill">#e41a1c</se:SvgParameter>
      </se:Fill>
      <se:Stroke>
       <se:SvgParameter name="stroke">#800e10</se:SvgParameter>
       <se:SvgParameter name="stroke-width">1</se:SvgParameter>
       <se:SvgParameter name="stroke-linejoin">bevel</se:SvgParameter>
      </se:Stroke>
     </se:PolygonSymbolizer>
    </se:Rule>
    <se:Rule>
     <se:TextSymbolizer>
      <se:Label>
       <!--SE Export for ''Problema em atividade: '' || count(id, NULL, resolvido IS FALSE) not implemented yet-->Placeholder</se:Label>
      <se:Font>
       <se:SvgParameter name="font-family">Arial</se:SvgParameter>
       <se:SvgParameter name="font-size">13</se:SvgParameter>
       <se:SvgParameter name="font-weight">bold</se:SvgParameter>
      </se:Font>
      <se:LabelPlacement>
       <se:PointPlacement>
        <se:AnchorPoint>
         <se:AnchorPointX>0.5</se:AnchorPointX>
         <se:AnchorPointY>0.5</se:AnchorPointY>
        </se:AnchorPoint>
        <se:Displacement>
         <se:DisplacementX>-107</se:DisplacementX>
         <se:DisplacementY>71</se:DisplacementY>
        </se:Displacement>
       </se:PointPlacement>
      </se:LabelPlacement>
      <se:Fill>
       <se:SvgParameter name="fill">#000000</se:SvgParameter>
      </se:Fill>
      <se:Graphic>
       <se:Mark>
        <se:WellKnownName>square</se:WellKnownName>
        <se:Fill>
         <se:SvgParameter name="fill">#ff784b</se:SvgParameter>
        </se:Fill>
        <se:Stroke>
         <se:SvgParameter name="stroke">#000000</se:SvgParameter>
         <se:SvgParameter name="stroke-width">1</se:SvgParameter>
        </se:Stroke>
       </se:Mark>
       <se:Size>7</se:Size>
      </se:Graphic>
      <se:Priority>1000</se:Priority>
      <se:VendorOption name="conflictResolution">false</se:VendorOption>
      <se:VendorOption name="graphic-resize">stretch</se:VendorOption>
      <se:VendorOption name="graphic-margin">7 7</se:VendorOption>
     </se:TextSymbolizer>
    </se:Rule>
   </se:FeatureTypeStyle>
  </UserStyle>
 </NamedLayer>
</StyledLayerDescriptor>
', TRUE, NULL, current_user, NULL, now(), 'Polygon');

COMMIT;