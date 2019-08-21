<!DOCTYPE qgis PUBLIC 'http://mrcc.com/qgis.dtd' 'SYSTEM'>
<qgis styleCategories="Symbology|Labeling" labelsEnabled="1" version="3.4.10-Madeira">
  <renderer-v2 enableorderby="0" symbollevels="0" forceraster="0" type="RuleRenderer">
    <rules key="{8414aafe-1ef5-445d-855b-215bc583c28f}">
      <rule filter="&quot;execucao_1_situacao&quot; IN ('Não iniciada') " key="{33038ffc-700d-4122-8788-54b00912d4ff}" label="Não iniciada" symbol="0"/>
      <rule filter="&quot;execucao_1_situacao&quot; IN ('Em execução','Pausada')" key="{fd1cc937-8fe2-4ab4-ab22-9b5207d5f230}" label="Execução - em andamento" symbol="1"/>
      <rule filter="&quot;disponivel&quot; = 'true' &#xd;&#xa;AND &quot;execucao_1_situacao&quot; IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND &quot;revisao_e_correcao_1_situacao&quot;  IN ('Não iniciada')&#xd;&#xa;" key="{131b0433-0507-446f-ac1d-fb7f70f15e34}" label="Execução" symbol="2"/>
      <rule filter="&quot;execucao_1_situacao&quot; IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND &quot;revisao_e_correcao_1_situacao&quot;  IN ('Em execução','Pausada')" key="{541d85ce-549b-4ef5-8e87-6a07bf2aa824}" label="Rev/Cor - em andamento" symbol="3"/>
      <rule filter="&quot;execucao_1_situacao&quot; IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND &quot;revisao_e_correcao_1_situacao&quot;  IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND   &quot;revisao_1_situacao&quot;  IN ('Não iniciada')&#xd;&#xa;" key="{95f1c12f-f2df-42a9-9a61-7687be7ca9fe}" label="Rev/Cor" symbol="4"/>
      <rule filter="&quot;execucao_1_situacao&quot; IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND &quot;revisao_e_correcao_1_situacao&quot;  IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND   &quot;revisao_1_situacao&quot;  IN ('Em execução','Pausada')&#xd;&#xa;" key="{3589e9b4-84b9-41e3-8669-eb9f6631c90d}" label="Revisão - em andamento" symbol="5"/>
      <rule filter="&quot;execucao_1_situacao&quot; IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND &quot;revisao_e_correcao_1_situacao&quot;  IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND   &quot;revisao_1_situacao&quot;  IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND    &quot;correcao_1_situacao&quot;   IN ('Não iniciada')&#xd;&#xa;" key="{b3fdcbbd-08fa-4b9c-aa7a-4541b26ed579}" label="Revisao" symbol="6"/>
      <rule filter="&quot;execucao_1_situacao&quot; IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND &quot;revisao_e_correcao_1_situacao&quot;  IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND   &quot;revisao_1_situacao&quot;  IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND    &quot;correcao_1_situacao&quot;   IN ('Em execução','Pausada')&#xd;&#xa;&#xd;&#xa;" key="{b2f0239f-e558-418a-a199-462c13647ca2}" label="Correção - em andamento" symbol="7"/>
      <rule filter="&quot;execucao_1_situacao&quot; IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND &quot;revisao_e_correcao_1_situacao&quot;  IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND   &quot;revisao_1_situacao&quot;  IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND    &quot;correcao_1_situacao&quot;   IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND    &quot;revisao_2_situacao&quot;   IN ('Não iniciada')" key="{98b79fd9-058b-4c79-af4f-6ab78c71f4ab}" label="Correção" symbol="8"/>
      <rule filter="&quot;execucao_1_situacao&quot; IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND &quot;revisao_e_correcao_1_situacao&quot;  IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND   &quot;revisao_1_situacao&quot;  IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND    &quot;correcao_1_situacao&quot;   IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND    &quot;revisao_2_situacao&quot;   IN ('Em execução','Pausada')" key="{82f9c8d1-12a2-4ebb-842e-a6cb9a7c55c3}" label="Revisão - em andamento" symbol="9"/>
      <rule filter="&quot;execucao_1_situacao&quot; IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND &quot;revisao_e_correcao_1_situacao&quot;  IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND   &quot;revisao_1_situacao&quot;  IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND    &quot;correcao_1_situacao&quot;   IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND    &quot;revisao_2_situacao&quot;   IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND    &quot;correcao_2_situacao&quot;   IN ('Não iniciada')" key="{d3694839-e733-4b95-91c4-53a49c70f331}" label="Revisao" symbol="10"/>
      <rule filter="&quot;execucao_1_situacao&quot; IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND &quot;revisao_e_correcao_1_situacao&quot;  IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND   &quot;revisao_1_situacao&quot;  IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND    &quot;correcao_1_situacao&quot;   IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND    &quot;revisao_2_situacao&quot;   IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND    &quot;correcao_2_situacao&quot;   IN ('Em execução','Pausada')" key="{b2d3c974-2ba1-4dfb-99b0-8adf1bb57942}" label="Correção  - em andamento" symbol="11"/>
      <rule filter="&quot;execucao_1_situacao&quot; IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND &quot;revisao_e_correcao_1_situacao&quot;  IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND   &quot;revisao_1_situacao&quot;  IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND    &quot;correcao_1_situacao&quot;   IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND    &quot;revisao_2_situacao&quot;   IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND    &quot;correcao_2_situacao&quot;   IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND &quot;revisao_e_correcao_2_situacao&quot; IN ('Não iniciada')" key="{4ebf138a-b14d-4098-9127-b3a0a1e27af9}" label="Correção" symbol="12"/>
      <rule filter="&quot;execucao_1_situacao&quot; IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND &quot;revisao_e_correcao_1_situacao&quot;  IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND   &quot;revisao_1_situacao&quot;  IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND    &quot;correcao_1_situacao&quot;   IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND    &quot;revisao_2_situacao&quot;   IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND    &quot;correcao_2_situacao&quot;   IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND &quot;revisao_e_correcao_2_situacao&quot; IN ('Em execução','Pausada')" key="{50403eeb-ee09-4d2b-9238-8b4173b0c3be}" label="Rev/Cor - em andamento" symbol="13"/>
      <rule filter="&quot;execucao_1_situacao&quot; IN ('Finalizada','Não será executada','-') &#xd;&#xa;AND &quot;revisao_e_correcao_1_situacao&quot; IN ('Finalizada','Não será executada','-') &#xd;&#xa;AND &quot;revisao_1_situacao&quot; IN ('Finalizada','Não será executada','-') &#xd;&#xa;AND &quot;correcao_1_situacao&quot; IN ('Finalizada','Não será executada','-') &#xd;&#xa;AND &quot;revisao_2_situacao&quot; IN ('Finalizada','Não será executada','-') &#xd;&#xa;AND &quot;correcao_2_situacao&quot; IN ('Finalizada','Não será executada','-') &#xd;&#xa;AND &quot;revisao_e_correcao_2_situacao&quot; IN ('Finalizada','Não será executada','-') " key="{e4d80aab-5659-4644-bcd7-5b279754b003}" label="Concluído" symbol="14"/>
      <rule filter="ELSE" key="{5d5fa87c-2b11-49ca-ae8d-a62f2c1b9495}" label="ERRO" symbol="15"/>
      <rule filter=" (&quot;disponivel&quot; &lt;> 'true' and &quot;disponivel&quot; is not null)  " key="{36ad63a0-c874-4c07-bae4-4586fef7c6df}" label="Não disponível" symbol="16"/>
      <rule filter="'Pausada' in ( &quot;execucao_1_situacao&quot; , &quot;revisao_e_correcao_1_situacao&quot; , &quot;revisao_1_situacao&quot; , &quot;correcao_1_situacao&quot; , &quot;revisao_2_situacao&quot; , &quot;correcao_2_situacao&quot; , &quot;revisao_e_correcao_2_situacao&quot; )" key="{37c2a3b4-12e3-4a45-bee8-50dd5e12bce2}" label="Pausada" symbol="17"/>
    </rules>
    <symbols>
      <symbol name="0" force_rhr="0" type="fill" alpha="0.5" clip_to_extent="1">
        <layer locked="0" pass="0" enabled="1" class="SimpleFill">
          <prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="color" v="230,230,230,255"/>
          <prop k="joinstyle" v="bevel"/>
          <prop k="offset" v="0,0"/>
          <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="offset_unit" v="MM"/>
          <prop k="outline_color" v="0,0,0,255"/>
          <prop k="outline_style" v="solid"/>
          <prop k="outline_width" v="0.26"/>
          <prop k="outline_width_unit" v="MM"/>
          <prop k="style" v="solid"/>
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </data_defined_properties>
        </layer>
      </symbol>
      <symbol name="1" force_rhr="0" type="fill" alpha="0.5" clip_to_extent="1">
        <layer locked="0" pass="0" enabled="1" class="SimpleFill">
          <prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="color" v="215,25,28,255"/>
          <prop k="joinstyle" v="bevel"/>
          <prop k="offset" v="0,0"/>
          <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="offset_unit" v="MM"/>
          <prop k="outline_color" v="0,0,0,255"/>
          <prop k="outline_style" v="solid"/>
          <prop k="outline_width" v="0.26"/>
          <prop k="outline_width_unit" v="MM"/>
          <prop k="style" v="solid"/>
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </data_defined_properties>
        </layer>
        <layer locked="0" pass="0" enabled="1" class="LinePatternFill">
          <prop k="angle" v="45"/>
          <prop k="color" v="0,0,255,255"/>
          <prop k="distance" v="1"/>
          <prop k="distance_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="distance_unit" v="MM"/>
          <prop k="line_width" v="0.26"/>
          <prop k="line_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="line_width_unit" v="MM"/>
          <prop k="offset" v="0"/>
          <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="offset_unit" v="MM"/>
          <prop k="outline_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="outline_width_unit" v="MM"/>
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </data_defined_properties>
          <symbol name="@1@1" force_rhr="0" type="line" alpha="1" clip_to_extent="1">
            <layer locked="0" pass="0" enabled="1" class="SimpleLine">
              <prop k="capstyle" v="square"/>
              <prop k="customdash" v="5;2"/>
              <prop k="customdash_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <prop k="customdash_unit" v="MM"/>
              <prop k="draw_inside_polygon" v="0"/>
              <prop k="joinstyle" v="bevel"/>
              <prop k="line_color" v="0,0,0,255"/>
              <prop k="line_style" v="solid"/>
              <prop k="line_width" v="0.26"/>
              <prop k="line_width_unit" v="MM"/>
              <prop k="offset" v="0"/>
              <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <prop k="offset_unit" v="MM"/>
              <prop k="ring_filter" v="0"/>
              <prop k="use_custom_dash" v="0"/>
              <prop k="width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <data_defined_properties>
                <Option type="Map">
                  <Option name="name" value="" type="QString"/>
                  <Option name="properties"/>
                  <Option name="type" value="collection" type="QString"/>
                </Option>
              </data_defined_properties>
            </layer>
          </symbol>
        </layer>
      </symbol>
      <symbol name="10" force_rhr="0" type="fill" alpha="0.5" clip_to_extent="1">
        <layer locked="0" pass="0" enabled="1" class="SimpleFill">
          <prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="color" v="253,192,134,255"/>
          <prop k="joinstyle" v="bevel"/>
          <prop k="offset" v="0,0"/>
          <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="offset_unit" v="MM"/>
          <prop k="outline_color" v="0,0,0,255"/>
          <prop k="outline_style" v="solid"/>
          <prop k="outline_width" v="0.26"/>
          <prop k="outline_width_unit" v="MM"/>
          <prop k="style" v="solid"/>
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </data_defined_properties>
        </layer>
      </symbol>
      <symbol name="11" force_rhr="0" type="fill" alpha="0.5" clip_to_extent="1">
        <layer locked="0" pass="0" enabled="1" class="SimpleFill">
          <prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="color" v="255,255,153,255"/>
          <prop k="joinstyle" v="bevel"/>
          <prop k="offset" v="0,0"/>
          <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="offset_unit" v="MM"/>
          <prop k="outline_color" v="0,0,0,255"/>
          <prop k="outline_style" v="solid"/>
          <prop k="outline_width" v="0.26"/>
          <prop k="outline_width_unit" v="MM"/>
          <prop k="style" v="solid"/>
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </data_defined_properties>
        </layer>
        <layer locked="0" pass="0" enabled="1" class="LinePatternFill">
          <prop k="angle" v="45"/>
          <prop k="color" v="255,255,153,255"/>
          <prop k="distance" v="1"/>
          <prop k="distance_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="distance_unit" v="MM"/>
          <prop k="line_width" v="0.26"/>
          <prop k="line_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="line_width_unit" v="MM"/>
          <prop k="offset" v="0"/>
          <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="offset_unit" v="MM"/>
          <prop k="outline_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="outline_width_unit" v="MM"/>
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </data_defined_properties>
          <symbol name="@11@1" force_rhr="0" type="line" alpha="1" clip_to_extent="1">
            <layer locked="0" pass="0" enabled="1" class="SimpleLine">
              <prop k="capstyle" v="square"/>
              <prop k="customdash" v="5;2"/>
              <prop k="customdash_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <prop k="customdash_unit" v="MM"/>
              <prop k="draw_inside_polygon" v="0"/>
              <prop k="joinstyle" v="bevel"/>
              <prop k="line_color" v="255,255,153,255"/>
              <prop k="line_style" v="solid"/>
              <prop k="line_width" v="0.26"/>
              <prop k="line_width_unit" v="MM"/>
              <prop k="offset" v="0"/>
              <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <prop k="offset_unit" v="MM"/>
              <prop k="ring_filter" v="0"/>
              <prop k="use_custom_dash" v="0"/>
              <prop k="width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <data_defined_properties>
                <Option type="Map">
                  <Option name="name" value="" type="QString"/>
                  <Option name="properties"/>
                  <Option name="type" value="collection" type="QString"/>
                </Option>
              </data_defined_properties>
            </layer>
          </symbol>
        </layer>
      </symbol>
      <symbol name="12" force_rhr="0" type="fill" alpha="0.5" clip_to_extent="1">
        <layer locked="0" pass="0" enabled="1" class="SimpleFill">
          <prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="color" v="255,255,153,255"/>
          <prop k="joinstyle" v="bevel"/>
          <prop k="offset" v="0,0"/>
          <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="offset_unit" v="MM"/>
          <prop k="outline_color" v="0,0,0,255"/>
          <prop k="outline_style" v="solid"/>
          <prop k="outline_width" v="0.26"/>
          <prop k="outline_width_unit" v="MM"/>
          <prop k="style" v="solid"/>
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </data_defined_properties>
        </layer>
      </symbol>
      <symbol name="13" force_rhr="0" type="fill" alpha="0.5" clip_to_extent="1">
        <layer locked="0" pass="0" enabled="1" class="SimpleFill">
          <prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="color" v="190,174,212,255"/>
          <prop k="joinstyle" v="bevel"/>
          <prop k="offset" v="0,0"/>
          <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="offset_unit" v="MM"/>
          <prop k="outline_color" v="0,0,0,255"/>
          <prop k="outline_style" v="solid"/>
          <prop k="outline_width" v="0.26"/>
          <prop k="outline_width_unit" v="MM"/>
          <prop k="style" v="solid"/>
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </data_defined_properties>
        </layer>
        <layer locked="0" pass="0" enabled="1" class="LinePatternFill">
          <prop k="angle" v="45"/>
          <prop k="color" v="0,0,255,255"/>
          <prop k="distance" v="1"/>
          <prop k="distance_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="distance_unit" v="MM"/>
          <prop k="line_width" v="0.26"/>
          <prop k="line_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="line_width_unit" v="MM"/>
          <prop k="offset" v="0"/>
          <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="offset_unit" v="MM"/>
          <prop k="outline_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="outline_width_unit" v="MM"/>
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </data_defined_properties>
          <symbol name="@13@1" force_rhr="0" type="line" alpha="1" clip_to_extent="1">
            <layer locked="0" pass="0" enabled="1" class="SimpleLine">
              <prop k="capstyle" v="square"/>
              <prop k="customdash" v="5;2"/>
              <prop k="customdash_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <prop k="customdash_unit" v="MM"/>
              <prop k="draw_inside_polygon" v="0"/>
              <prop k="joinstyle" v="bevel"/>
              <prop k="line_color" v="0,0,0,255"/>
              <prop k="line_style" v="solid"/>
              <prop k="line_width" v="0.26"/>
              <prop k="line_width_unit" v="MM"/>
              <prop k="offset" v="0"/>
              <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <prop k="offset_unit" v="MM"/>
              <prop k="ring_filter" v="0"/>
              <prop k="use_custom_dash" v="0"/>
              <prop k="width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <data_defined_properties>
                <Option type="Map">
                  <Option name="name" value="" type="QString"/>
                  <Option name="properties"/>
                  <Option name="type" value="collection" type="QString"/>
                </Option>
              </data_defined_properties>
            </layer>
          </symbol>
        </layer>
      </symbol>
      <symbol name="14" force_rhr="0" type="fill" alpha="0.5" clip_to_extent="1">
        <layer locked="0" pass="0" enabled="1" class="SimpleFill">
          <prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="color" v="26,150,65,255"/>
          <prop k="joinstyle" v="bevel"/>
          <prop k="offset" v="0,0"/>
          <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="offset_unit" v="MM"/>
          <prop k="outline_color" v="0,0,0,255"/>
          <prop k="outline_style" v="solid"/>
          <prop k="outline_width" v="0.26"/>
          <prop k="outline_width_unit" v="MM"/>
          <prop k="style" v="solid"/>
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </data_defined_properties>
        </layer>
      </symbol>
      <symbol name="15" force_rhr="0" type="fill" alpha="1" clip_to_extent="1">
        <layer locked="0" pass="0" enabled="1" class="SimpleFill">
          <prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="color" v="25,4,250,255"/>
          <prop k="joinstyle" v="bevel"/>
          <prop k="offset" v="0,0"/>
          <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="offset_unit" v="MM"/>
          <prop k="outline_color" v="0,0,0,255"/>
          <prop k="outline_style" v="solid"/>
          <prop k="outline_width" v="0.26"/>
          <prop k="outline_width_unit" v="MM"/>
          <prop k="style" v="solid"/>
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </data_defined_properties>
        </layer>
      </symbol>
      <symbol name="16" force_rhr="0" type="fill" alpha="1" clip_to_extent="1">
        <layer locked="0" pass="0" enabled="1" class="GeometryGenerator">
          <prop k="SymbolType" v="Line"/>
          <prop k="geometryModifier" v="  intersection( make_line(make_point(x_max(  bounds(  $geometry )), y_min(  bounds(  $geometry ))) ,make_point(x_min(  bounds(  $geometry )), y_max(  bounds(  $geometry )))), $geometry )&#xd;&#xa; "/>
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </data_defined_properties>
          <symbol name="@16@0" force_rhr="0" type="line" alpha="1" clip_to_extent="1">
            <layer locked="0" pass="0" enabled="1" class="SimpleLine">
              <prop k="capstyle" v="square"/>
              <prop k="customdash" v="5;2"/>
              <prop k="customdash_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <prop k="customdash_unit" v="MM"/>
              <prop k="draw_inside_polygon" v="0"/>
              <prop k="joinstyle" v="bevel"/>
              <prop k="line_color" v="255,255,255,255"/>
              <prop k="line_style" v="solid"/>
              <prop k="line_width" v="2"/>
              <prop k="line_width_unit" v="MM"/>
              <prop k="offset" v="0"/>
              <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <prop k="offset_unit" v="MM"/>
              <prop k="ring_filter" v="0"/>
              <prop k="use_custom_dash" v="0"/>
              <prop k="width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <data_defined_properties>
                <Option type="Map">
                  <Option name="name" value="" type="QString"/>
                  <Option name="properties"/>
                  <Option name="type" value="collection" type="QString"/>
                </Option>
              </data_defined_properties>
            </layer>
          </symbol>
        </layer>
        <layer locked="0" pass="0" enabled="1" class="GeometryGenerator">
          <prop k="SymbolType" v="Line"/>
          <prop k="geometryModifier" v="  intersection( make_line(make_point(x_max(  bounds(  $geometry )), y_max(  bounds(  $geometry ))) ,make_point(x_min(  bounds(  $geometry )), y_min(  bounds(  $geometry )))), $geometry )&#xd;&#xa; "/>
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </data_defined_properties>
          <symbol name="@16@1" force_rhr="0" type="line" alpha="1" clip_to_extent="1">
            <layer locked="0" pass="0" enabled="1" class="SimpleLine">
              <prop k="capstyle" v="square"/>
              <prop k="customdash" v="5;2"/>
              <prop k="customdash_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <prop k="customdash_unit" v="MM"/>
              <prop k="draw_inside_polygon" v="0"/>
              <prop k="joinstyle" v="bevel"/>
              <prop k="line_color" v="255,255,255,255"/>
              <prop k="line_style" v="solid"/>
              <prop k="line_width" v="2"/>
              <prop k="line_width_unit" v="MM"/>
              <prop k="offset" v="0"/>
              <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <prop k="offset_unit" v="MM"/>
              <prop k="ring_filter" v="0"/>
              <prop k="use_custom_dash" v="0"/>
              <prop k="width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <data_defined_properties>
                <Option type="Map">
                  <Option name="name" value="" type="QString"/>
                  <Option name="properties"/>
                  <Option name="type" value="collection" type="QString"/>
                </Option>
              </data_defined_properties>
            </layer>
          </symbol>
        </layer>
        <layer locked="0" pass="0" enabled="1" class="GeometryGenerator">
          <prop k="SymbolType" v="Line"/>
          <prop k="geometryModifier" v="  intersection( make_line(make_point(x_max(  bounds(  $geometry )), y_min(  bounds(  $geometry ))) ,make_point(x_min(  bounds(  $geometry )), y_max(  bounds(  $geometry )))), $geometry )&#xd;&#xa; "/>
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </data_defined_properties>
          <symbol name="@16@2" force_rhr="0" type="line" alpha="1" clip_to_extent="1">
            <layer locked="0" pass="0" enabled="1" class="SimpleLine">
              <prop k="capstyle" v="square"/>
              <prop k="customdash" v="5;2"/>
              <prop k="customdash_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <prop k="customdash_unit" v="MM"/>
              <prop k="draw_inside_polygon" v="0"/>
              <prop k="joinstyle" v="bevel"/>
              <prop k="line_color" v="251,154,153,255"/>
              <prop k="line_style" v="solid"/>
              <prop k="line_width" v="1"/>
              <prop k="line_width_unit" v="MM"/>
              <prop k="offset" v="0"/>
              <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <prop k="offset_unit" v="MM"/>
              <prop k="ring_filter" v="0"/>
              <prop k="use_custom_dash" v="0"/>
              <prop k="width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <data_defined_properties>
                <Option type="Map">
                  <Option name="name" value="" type="QString"/>
                  <Option name="properties"/>
                  <Option name="type" value="collection" type="QString"/>
                </Option>
              </data_defined_properties>
            </layer>
          </symbol>
        </layer>
        <layer locked="0" pass="0" enabled="1" class="GeometryGenerator">
          <prop k="SymbolType" v="Line"/>
          <prop k="geometryModifier" v="  intersection( make_line(make_point(x_max(  bounds(  $geometry )), y_max(  bounds(  $geometry ))) ,make_point(x_min(  bounds(  $geometry )), y_min(  bounds(  $geometry )))), $geometry )&#xd;&#xa; "/>
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </data_defined_properties>
          <symbol name="@16@3" force_rhr="0" type="line" alpha="1" clip_to_extent="1">
            <layer locked="0" pass="0" enabled="1" class="SimpleLine">
              <prop k="capstyle" v="square"/>
              <prop k="customdash" v="5;2"/>
              <prop k="customdash_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <prop k="customdash_unit" v="MM"/>
              <prop k="draw_inside_polygon" v="0"/>
              <prop k="joinstyle" v="bevel"/>
              <prop k="line_color" v="251,154,153,255"/>
              <prop k="line_style" v="solid"/>
              <prop k="line_width" v="1"/>
              <prop k="line_width_unit" v="MM"/>
              <prop k="offset" v="0"/>
              <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <prop k="offset_unit" v="MM"/>
              <prop k="ring_filter" v="0"/>
              <prop k="use_custom_dash" v="0"/>
              <prop k="width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <data_defined_properties>
                <Option type="Map">
                  <Option name="name" value="" type="QString"/>
                  <Option name="properties"/>
                  <Option name="type" value="collection" type="QString"/>
                </Option>
              </data_defined_properties>
            </layer>
          </symbol>
        </layer>
      </symbol>
      <symbol name="17" force_rhr="0" type="fill" alpha="1" clip_to_extent="1">
        <layer locked="0" pass="0" enabled="1" class="GeometryGenerator">
          <prop k="SymbolType" v="Line"/>
          <prop k="geometryModifier" v="  intersection( &#xd;&#xa;&#x9;make_line(&#xd;&#xa;&#x9;&#x9;make_point(&#xd;&#xa;&#x9;&#x9;&#x9;x_max(bounds($geometry )),&#xd;&#xa;&#x9;&#x9;&#x9;(y_max(bounds($geometry )) + y_min(  bounds(  $geometry )))/2&#xd;&#xa;&#x9;&#x9;),&#xd;&#xa;&#x9;&#x9;make_point(&#xd;&#xa;&#x9;&#x9;&#x9;x_min(bounds($geometry )),&#xd;&#xa;&#x9;&#x9;&#x9;( y_max(  bounds(  $geometry )) + y_min(  bounds(  $geometry )))/2&#xd;&#xa;&#x9;&#x9;)&#xd;&#xa;&#x9;)&#xd;&#xa;, $geometry )&#xd;&#xa; "/>
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </data_defined_properties>
          <symbol name="@17@0" force_rhr="0" type="line" alpha="1" clip_to_extent="1">
            <layer locked="0" pass="0" enabled="1" class="SimpleLine">
              <prop k="capstyle" v="square"/>
              <prop k="customdash" v="5;2"/>
              <prop k="customdash_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <prop k="customdash_unit" v="MM"/>
              <prop k="draw_inside_polygon" v="0"/>
              <prop k="joinstyle" v="bevel"/>
              <prop k="line_color" v="255,255,255,255"/>
              <prop k="line_style" v="solid"/>
              <prop k="line_width" v="2"/>
              <prop k="line_width_unit" v="MM"/>
              <prop k="offset" v="0"/>
              <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <prop k="offset_unit" v="MM"/>
              <prop k="ring_filter" v="0"/>
              <prop k="use_custom_dash" v="0"/>
              <prop k="width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <data_defined_properties>
                <Option type="Map">
                  <Option name="name" value="" type="QString"/>
                  <Option name="properties"/>
                  <Option name="type" value="collection" type="QString"/>
                </Option>
              </data_defined_properties>
            </layer>
          </symbol>
        </layer>
        <layer locked="0" pass="0" enabled="1" class="GeometryGenerator">
          <prop k="SymbolType" v="Line"/>
          <prop k="geometryModifier" v="  intersection( make_line(make_point((x_max(  bounds(  $geometry )) + x_min(  bounds(  $geometry )))/2, y_max(  bounds(  $geometry ))) ,make_point((x_max(  bounds(  $geometry )) + x_min(  bounds(  $geometry )))/2, y_min(  bounds(  $geometry )))), $geometry )&#xd;&#xa; "/>
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </data_defined_properties>
          <symbol name="@17@1" force_rhr="0" type="line" alpha="1" clip_to_extent="1">
            <layer locked="0" pass="0" enabled="1" class="SimpleLine">
              <prop k="capstyle" v="square"/>
              <prop k="customdash" v="5;2"/>
              <prop k="customdash_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <prop k="customdash_unit" v="MM"/>
              <prop k="draw_inside_polygon" v="0"/>
              <prop k="joinstyle" v="bevel"/>
              <prop k="line_color" v="255,255,255,255"/>
              <prop k="line_style" v="solid"/>
              <prop k="line_width" v="2"/>
              <prop k="line_width_unit" v="MM"/>
              <prop k="offset" v="0"/>
              <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <prop k="offset_unit" v="MM"/>
              <prop k="ring_filter" v="0"/>
              <prop k="use_custom_dash" v="0"/>
              <prop k="width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <data_defined_properties>
                <Option type="Map">
                  <Option name="name" value="" type="QString"/>
                  <Option name="properties"/>
                  <Option name="type" value="collection" type="QString"/>
                </Option>
              </data_defined_properties>
            </layer>
          </symbol>
        </layer>
        <layer locked="0" pass="0" enabled="1" class="GeometryGenerator">
          <prop k="SymbolType" v="Line"/>
          <prop k="geometryModifier" v="  intersection( &#xd;&#xa;&#x9;make_line(&#xd;&#xa;&#x9;&#x9;make_point(&#xd;&#xa;&#x9;&#x9;&#x9;x_max(bounds($geometry )),&#xd;&#xa;&#x9;&#x9;&#x9;(y_max(bounds($geometry )) + y_min(  bounds(  $geometry )))/2&#xd;&#xa;&#x9;&#x9;),&#xd;&#xa;&#x9;&#x9;make_point(&#xd;&#xa;&#x9;&#x9;&#x9;x_min(bounds($geometry )),&#xd;&#xa;&#x9;&#x9;&#x9;( y_max(  bounds(  $geometry )) + y_min(  bounds(  $geometry )))/2&#xd;&#xa;&#x9;&#x9;)&#xd;&#xa;&#x9;)&#xd;&#xa;, $geometry )&#xd;&#xa; "/>
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </data_defined_properties>
          <symbol name="@17@2" force_rhr="0" type="line" alpha="1" clip_to_extent="1">
            <layer locked="0" pass="0" enabled="1" class="SimpleLine">
              <prop k="capstyle" v="square"/>
              <prop k="customdash" v="5;2"/>
              <prop k="customdash_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <prop k="customdash_unit" v="MM"/>
              <prop k="draw_inside_polygon" v="0"/>
              <prop k="joinstyle" v="bevel"/>
              <prop k="line_color" v="0,0,0,128"/>
              <prop k="line_style" v="solid"/>
              <prop k="line_width" v="1"/>
              <prop k="line_width_unit" v="MM"/>
              <prop k="offset" v="0"/>
              <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <prop k="offset_unit" v="MM"/>
              <prop k="ring_filter" v="0"/>
              <prop k="use_custom_dash" v="0"/>
              <prop k="width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <data_defined_properties>
                <Option type="Map">
                  <Option name="name" value="" type="QString"/>
                  <Option name="properties"/>
                  <Option name="type" value="collection" type="QString"/>
                </Option>
              </data_defined_properties>
            </layer>
          </symbol>
        </layer>
        <layer locked="0" pass="0" enabled="1" class="GeometryGenerator">
          <prop k="SymbolType" v="Line"/>
          <prop k="geometryModifier" v="  intersection( make_line(make_point((x_max(  bounds(  $geometry )) + x_min(  bounds(  $geometry )))/2, y_max(  bounds(  $geometry ))) ,make_point((x_max(  bounds(  $geometry )) + x_min(  bounds(  $geometry )))/2, y_min(  bounds(  $geometry )))), $geometry )&#xd;&#xa; "/>
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </data_defined_properties>
          <symbol name="@17@3" force_rhr="0" type="line" alpha="1" clip_to_extent="1">
            <layer locked="0" pass="0" enabled="1" class="SimpleLine">
              <prop k="capstyle" v="square"/>
              <prop k="customdash" v="5;2"/>
              <prop k="customdash_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <prop k="customdash_unit" v="MM"/>
              <prop k="draw_inside_polygon" v="0"/>
              <prop k="joinstyle" v="bevel"/>
              <prop k="line_color" v="0,0,0,128"/>
              <prop k="line_style" v="solid"/>
              <prop k="line_width" v="1"/>
              <prop k="line_width_unit" v="MM"/>
              <prop k="offset" v="0"/>
              <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <prop k="offset_unit" v="MM"/>
              <prop k="ring_filter" v="0"/>
              <prop k="use_custom_dash" v="0"/>
              <prop k="width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <data_defined_properties>
                <Option type="Map">
                  <Option name="name" value="" type="QString"/>
                  <Option name="properties"/>
                  <Option name="type" value="collection" type="QString"/>
                </Option>
              </data_defined_properties>
            </layer>
          </symbol>
        </layer>
      </symbol>
      <symbol name="2" force_rhr="0" type="fill" alpha="0.5" clip_to_extent="1">
        <layer locked="0" pass="0" enabled="1" class="SimpleFill">
          <prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="color" v="215,25,28,255"/>
          <prop k="joinstyle" v="bevel"/>
          <prop k="offset" v="0,0"/>
          <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="offset_unit" v="MM"/>
          <prop k="outline_color" v="0,0,0,255"/>
          <prop k="outline_style" v="solid"/>
          <prop k="outline_width" v="0.26"/>
          <prop k="outline_width_unit" v="MM"/>
          <prop k="style" v="solid"/>
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </data_defined_properties>
        </layer>
      </symbol>
      <symbol name="3" force_rhr="0" type="fill" alpha="0.5" clip_to_extent="1">
        <layer locked="0" pass="0" enabled="1" class="SimpleFill">
          <prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="color" v="190,174,212,255"/>
          <prop k="joinstyle" v="bevel"/>
          <prop k="offset" v="0,0"/>
          <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="offset_unit" v="MM"/>
          <prop k="outline_color" v="0,0,0,255"/>
          <prop k="outline_style" v="solid"/>
          <prop k="outline_width" v="0.26"/>
          <prop k="outline_width_unit" v="MM"/>
          <prop k="style" v="solid"/>
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </data_defined_properties>
        </layer>
        <layer locked="0" pass="0" enabled="1" class="LinePatternFill">
          <prop k="angle" v="45"/>
          <prop k="color" v="0,0,255,255"/>
          <prop k="distance" v="1"/>
          <prop k="distance_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="distance_unit" v="MM"/>
          <prop k="line_width" v="0.26"/>
          <prop k="line_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="line_width_unit" v="MM"/>
          <prop k="offset" v="0"/>
          <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="offset_unit" v="MM"/>
          <prop k="outline_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="outline_width_unit" v="MM"/>
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </data_defined_properties>
          <symbol name="@3@1" force_rhr="0" type="line" alpha="1" clip_to_extent="1">
            <layer locked="0" pass="0" enabled="1" class="SimpleLine">
              <prop k="capstyle" v="square"/>
              <prop k="customdash" v="5;2"/>
              <prop k="customdash_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <prop k="customdash_unit" v="MM"/>
              <prop k="draw_inside_polygon" v="0"/>
              <prop k="joinstyle" v="bevel"/>
              <prop k="line_color" v="0,0,0,255"/>
              <prop k="line_style" v="solid"/>
              <prop k="line_width" v="0.26"/>
              <prop k="line_width_unit" v="MM"/>
              <prop k="offset" v="0"/>
              <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <prop k="offset_unit" v="MM"/>
              <prop k="ring_filter" v="0"/>
              <prop k="use_custom_dash" v="0"/>
              <prop k="width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <data_defined_properties>
                <Option type="Map">
                  <Option name="name" value="" type="QString"/>
                  <Option name="properties"/>
                  <Option name="type" value="collection" type="QString"/>
                </Option>
              </data_defined_properties>
            </layer>
          </symbol>
        </layer>
      </symbol>
      <symbol name="4" force_rhr="0" type="fill" alpha="0.5" clip_to_extent="1">
        <layer locked="0" pass="0" enabled="1" class="SimpleFill">
          <prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="color" v="190,174,212,255"/>
          <prop k="joinstyle" v="bevel"/>
          <prop k="offset" v="0,0"/>
          <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="offset_unit" v="MM"/>
          <prop k="outline_color" v="0,0,0,255"/>
          <prop k="outline_style" v="solid"/>
          <prop k="outline_width" v="0.26"/>
          <prop k="outline_width_unit" v="MM"/>
          <prop k="style" v="solid"/>
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </data_defined_properties>
        </layer>
      </symbol>
      <symbol name="5" force_rhr="0" type="fill" alpha="0.5" clip_to_extent="1">
        <layer locked="0" pass="0" enabled="1" class="SimpleFill">
          <prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="color" v="253,192,134,255"/>
          <prop k="joinstyle" v="bevel"/>
          <prop k="offset" v="0,0"/>
          <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="offset_unit" v="MM"/>
          <prop k="outline_color" v="0,0,0,255"/>
          <prop k="outline_style" v="solid"/>
          <prop k="outline_width" v="0.26"/>
          <prop k="outline_width_unit" v="MM"/>
          <prop k="style" v="solid"/>
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </data_defined_properties>
        </layer>
        <layer locked="0" pass="0" enabled="1" class="LinePatternFill">
          <prop k="angle" v="45"/>
          <prop k="color" v="0,0,255,255"/>
          <prop k="distance" v="1"/>
          <prop k="distance_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="distance_unit" v="MM"/>
          <prop k="line_width" v="0.26"/>
          <prop k="line_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="line_width_unit" v="MM"/>
          <prop k="offset" v="0"/>
          <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="offset_unit" v="MM"/>
          <prop k="outline_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="outline_width_unit" v="MM"/>
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </data_defined_properties>
          <symbol name="@5@1" force_rhr="0" type="line" alpha="1" clip_to_extent="1">
            <layer locked="0" pass="0" enabled="1" class="SimpleLine">
              <prop k="capstyle" v="square"/>
              <prop k="customdash" v="5;2"/>
              <prop k="customdash_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <prop k="customdash_unit" v="MM"/>
              <prop k="draw_inside_polygon" v="0"/>
              <prop k="joinstyle" v="bevel"/>
              <prop k="line_color" v="0,0,0,255"/>
              <prop k="line_style" v="solid"/>
              <prop k="line_width" v="0.26"/>
              <prop k="line_width_unit" v="MM"/>
              <prop k="offset" v="0"/>
              <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <prop k="offset_unit" v="MM"/>
              <prop k="ring_filter" v="0"/>
              <prop k="use_custom_dash" v="0"/>
              <prop k="width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <data_defined_properties>
                <Option type="Map">
                  <Option name="name" value="" type="QString"/>
                  <Option name="properties"/>
                  <Option name="type" value="collection" type="QString"/>
                </Option>
              </data_defined_properties>
            </layer>
          </symbol>
        </layer>
      </symbol>
      <symbol name="6" force_rhr="0" type="fill" alpha="0.5" clip_to_extent="1">
        <layer locked="0" pass="0" enabled="1" class="SimpleFill">
          <prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="color" v="253,192,134,255"/>
          <prop k="joinstyle" v="bevel"/>
          <prop k="offset" v="0,0"/>
          <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="offset_unit" v="MM"/>
          <prop k="outline_color" v="0,0,0,255"/>
          <prop k="outline_style" v="solid"/>
          <prop k="outline_width" v="0.26"/>
          <prop k="outline_width_unit" v="MM"/>
          <prop k="style" v="solid"/>
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </data_defined_properties>
        </layer>
      </symbol>
      <symbol name="7" force_rhr="0" type="fill" alpha="0.5" clip_to_extent="1">
        <layer locked="0" pass="0" enabled="1" class="SimpleFill">
          <prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="color" v="255,255,153,255"/>
          <prop k="joinstyle" v="bevel"/>
          <prop k="offset" v="0,0"/>
          <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="offset_unit" v="MM"/>
          <prop k="outline_color" v="0,0,0,255"/>
          <prop k="outline_style" v="solid"/>
          <prop k="outline_width" v="0.26"/>
          <prop k="outline_width_unit" v="MM"/>
          <prop k="style" v="solid"/>
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </data_defined_properties>
        </layer>
        <layer locked="0" pass="0" enabled="1" class="LinePatternFill">
          <prop k="angle" v="45"/>
          <prop k="color" v="0,0,255,255"/>
          <prop k="distance" v="1"/>
          <prop k="distance_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="distance_unit" v="MM"/>
          <prop k="line_width" v="0.26"/>
          <prop k="line_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="line_width_unit" v="MM"/>
          <prop k="offset" v="0"/>
          <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="offset_unit" v="MM"/>
          <prop k="outline_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="outline_width_unit" v="MM"/>
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </data_defined_properties>
          <symbol name="@7@1" force_rhr="0" type="line" alpha="1" clip_to_extent="1">
            <layer locked="0" pass="0" enabled="1" class="SimpleLine">
              <prop k="capstyle" v="square"/>
              <prop k="customdash" v="5;2"/>
              <prop k="customdash_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <prop k="customdash_unit" v="MM"/>
              <prop k="draw_inside_polygon" v="0"/>
              <prop k="joinstyle" v="bevel"/>
              <prop k="line_color" v="0,0,0,255"/>
              <prop k="line_style" v="solid"/>
              <prop k="line_width" v="0.26"/>
              <prop k="line_width_unit" v="MM"/>
              <prop k="offset" v="0"/>
              <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <prop k="offset_unit" v="MM"/>
              <prop k="ring_filter" v="0"/>
              <prop k="use_custom_dash" v="0"/>
              <prop k="width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <data_defined_properties>
                <Option type="Map">
                  <Option name="name" value="" type="QString"/>
                  <Option name="properties"/>
                  <Option name="type" value="collection" type="QString"/>
                </Option>
              </data_defined_properties>
            </layer>
          </symbol>
        </layer>
      </symbol>
      <symbol name="8" force_rhr="0" type="fill" alpha="0.5" clip_to_extent="1">
        <layer locked="0" pass="0" enabled="1" class="SimpleFill">
          <prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="color" v="255,255,153,255"/>
          <prop k="joinstyle" v="bevel"/>
          <prop k="offset" v="0,0"/>
          <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="offset_unit" v="MM"/>
          <prop k="outline_color" v="0,0,0,255"/>
          <prop k="outline_style" v="solid"/>
          <prop k="outline_width" v="0.26"/>
          <prop k="outline_width_unit" v="MM"/>
          <prop k="style" v="solid"/>
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </data_defined_properties>
        </layer>
      </symbol>
      <symbol name="9" force_rhr="0" type="fill" alpha="0.5" clip_to_extent="1">
        <layer locked="0" pass="0" enabled="1" class="SimpleFill">
          <prop k="border_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="color" v="253,192,134,255"/>
          <prop k="joinstyle" v="bevel"/>
          <prop k="offset" v="0,0"/>
          <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="offset_unit" v="MM"/>
          <prop k="outline_color" v="0,0,0,255"/>
          <prop k="outline_style" v="solid"/>
          <prop k="outline_width" v="0.26"/>
          <prop k="outline_width_unit" v="MM"/>
          <prop k="style" v="solid"/>
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </data_defined_properties>
        </layer>
        <layer locked="0" pass="0" enabled="1" class="LinePatternFill">
          <prop k="angle" v="45"/>
          <prop k="color" v="0,0,255,255"/>
          <prop k="distance" v="1"/>
          <prop k="distance_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="distance_unit" v="MM"/>
          <prop k="line_width" v="0.26"/>
          <prop k="line_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="line_width_unit" v="MM"/>
          <prop k="offset" v="0"/>
          <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="offset_unit" v="MM"/>
          <prop k="outline_width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
          <prop k="outline_width_unit" v="MM"/>
          <data_defined_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </data_defined_properties>
          <symbol name="@9@1" force_rhr="0" type="line" alpha="1" clip_to_extent="1">
            <layer locked="0" pass="0" enabled="1" class="SimpleLine">
              <prop k="capstyle" v="square"/>
              <prop k="customdash" v="5;2"/>
              <prop k="customdash_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <prop k="customdash_unit" v="MM"/>
              <prop k="draw_inside_polygon" v="0"/>
              <prop k="joinstyle" v="bevel"/>
              <prop k="line_color" v="0,0,0,255"/>
              <prop k="line_style" v="solid"/>
              <prop k="line_width" v="0.26"/>
              <prop k="line_width_unit" v="MM"/>
              <prop k="offset" v="0"/>
              <prop k="offset_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <prop k="offset_unit" v="MM"/>
              <prop k="ring_filter" v="0"/>
              <prop k="use_custom_dash" v="0"/>
              <prop k="width_map_unit_scale" v="3x:0,0,0,0,0,0"/>
              <data_defined_properties>
                <Option type="Map">
                  <Option name="name" value="" type="QString"/>
                  <Option name="properties"/>
                  <Option name="type" value="collection" type="QString"/>
                </Option>
              </data_defined_properties>
            </layer>
          </symbol>
        </layer>
      </symbol>
    </symbols>
  </renderer-v2>
  <labeling type="rule-based">
    <rules key="{220a8c2f-8491-4b79-b44e-b49f5c381db1}">
      <rule filter="&quot;execucao_1_situacao&quot; IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND &quot;revisao_e_correcao_1_situacao&quot;  NOT IN ('Não iniciada')&#xa;AND   &quot;revisao_1_situacao&quot;  IN ('Não iniciada')" key="{1e7b5682-d70e-4f12-8c2e-7c00e1f2384c}">
        <settings>
          <text-style multilineHeight="1" blendMode="0" previewBkgrdColor="#ffffff" fontCapitals="0" fontWeight="50" textColor="0,0,0,255" fontWordSpacing="0" fontSizeMapUnitScale="3x:0,0,0,0,0,0" fontStrikeout="0" fontUnderline="0" fontSizeUnit="MapUnit" namedStyle="Normal" fieldName="1" fontItalic="0" textOpacity="1" useSubstitutions="0" fontSize="0.04" fontLetterSpacing="0" isExpression="1" fontFamily="MS Shell Dlg 2">
            <text-buffer bufferOpacity="1" bufferDraw="1" bufferSizeUnits="MM" bufferSize="1" bufferSizeMapUnitScale="3x:0,0,0,0,0,0" bufferNoFill="1" bufferBlendMode="0" bufferColor="255,255,255,255" bufferJoinStyle="128"/>
            <background shapeOffsetX="0" shapeJoinStyle="64" shapeSizeX="0" shapeBorderWidthUnit="MM" shapeRotationType="0" shapeRadiiMapUnitScale="3x:0,0,0,0,0,0" shapeOpacity="1" shapeRadiiUnit="MM" shapeBorderWidthMapUnitScale="3x:0,0,0,0,0,0" shapeBorderColor="128,128,128,255" shapeType="0" shapeFillColor="255,255,255,255" shapeSizeUnit="MM" shapeRotation="0" shapeSizeMapUnitScale="3x:0,0,0,0,0,0" shapeRadiiX="0" shapeOffsetY="0" shapeBlendMode="0" shapeOffsetMapUnitScale="3x:0,0,0,0,0,0" shapeRadiiY="0" shapeDraw="0" shapeSizeY="0" shapeBorderWidth="0" shapeSVGFile="" shapeSizeType="0" shapeOffsetUnit="MM"/>
            <shadow shadowDraw="0" shadowOffsetDist="1" shadowOffsetGlobal="1" shadowRadiusMapUnitScale="3x:0,0,0,0,0,0" shadowOffsetAngle="135" shadowOffsetMapUnitScale="3x:0,0,0,0,0,0" shadowRadius="1.5" shadowOffsetUnit="MM" shadowOpacity="0.7" shadowRadiusAlphaOnly="0" shadowColor="0,0,0,255" shadowScale="100" shadowRadiusUnit="MM" shadowBlendMode="6" shadowUnder="0"/>
            <substitutions/>
          </text-style>
          <text-format useMaxLineLengthForAutoWrap="1" reverseDirectionSymbol="0" wrapChar="" rightDirectionSymbol=">" formatNumbers="0" autoWrapLength="0" placeDirectionSymbol="0" addDirectionSymbol="0" decimals="3" multilineAlign="4294967295" plussign="0" leftDirectionSymbol="&lt;"/>
          <placement distMapUnitScale="3x:0,0,0,0,0,0" centroidWhole="1" preserveRotation="1" placementFlags="10" repeatDistanceMapUnitScale="3x:0,0,0,0,0,0" labelOffsetMapUnitScale="3x:0,0,0,0,0,0" fitInPolygonOnly="0" maxCurvedCharAngleOut="-25" rotationAngle="0" distUnits="MM" maxCurvedCharAngleIn="25" repeatDistanceUnits="MM" offsetType="0" dist="0" offsetUnits="MM" xOffset="0" placement="1" priority="5" repeatDistance="0" centroidInside="0" yOffset="0" quadOffset="4" predefinedPositionOrder="TR,TL,BR,BL,R,L,TSR,BSR"/>
          <rendering scaleMin="0" labelPerPart="0" obstacleType="0" zIndex="0" obstacleFactor="1" maxNumLabels="2000" fontMaxPixelSize="10000" fontMinPixelSize="3" scaleVisibility="0" limitNumLabels="0" mergeLines="0" fontLimitPixelSize="0" displayAll="0" obstacle="1" drawLabels="1" scaleMax="0" upsidedownLabels="0" minFeatureSize="0"/>
          <dd_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </dd_properties>
        </settings>
      </rule>
      <rule filter="&quot;execucao_1_situacao&quot; IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND &quot;revisao_e_correcao_1_situacao&quot; IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND &quot;revisao_1_situacao&quot; NOT IN ('Não iniciada')&#xd;&#xa;AND &quot;correcao_1_situacao&quot;   IN ('Não iniciada')&#xd;&#xa;" key="{13275884-c96c-4c1d-a716-1d0089bf4361}">
        <settings>
          <text-style multilineHeight="1" blendMode="0" previewBkgrdColor="#ffffff" fontCapitals="0" fontWeight="50" textColor="0,0,0,255" fontWordSpacing="0" fontSizeMapUnitScale="3x:0,0,0,0,0,0" fontStrikeout="0" fontUnderline="0" fontSizeUnit="MapUnit" namedStyle="Normal" fieldName="1" fontItalic="0" textOpacity="1" useSubstitutions="0" fontSize="0.04" fontLetterSpacing="0" isExpression="1" fontFamily="MS Shell Dlg 2">
            <text-buffer bufferOpacity="1" bufferDraw="1" bufferSizeUnits="MM" bufferSize="1" bufferSizeMapUnitScale="3x:0,0,0,0,0,0" bufferNoFill="1" bufferBlendMode="0" bufferColor="255,255,255,255" bufferJoinStyle="128"/>
            <background shapeOffsetX="0" shapeJoinStyle="64" shapeSizeX="0" shapeBorderWidthUnit="MM" shapeRotationType="0" shapeRadiiMapUnitScale="3x:0,0,0,0,0,0" shapeOpacity="1" shapeRadiiUnit="MM" shapeBorderWidthMapUnitScale="3x:0,0,0,0,0,0" shapeBorderColor="128,128,128,255" shapeType="0" shapeFillColor="255,255,255,255" shapeSizeUnit="MM" shapeRotation="0" shapeSizeMapUnitScale="3x:0,0,0,0,0,0" shapeRadiiX="0" shapeOffsetY="0" shapeBlendMode="0" shapeOffsetMapUnitScale="3x:0,0,0,0,0,0" shapeRadiiY="0" shapeDraw="0" shapeSizeY="0" shapeBorderWidth="0" shapeSVGFile="" shapeSizeType="0" shapeOffsetUnit="MM"/>
            <shadow shadowDraw="0" shadowOffsetDist="1" shadowOffsetGlobal="1" shadowRadiusMapUnitScale="3x:0,0,0,0,0,0" shadowOffsetAngle="135" shadowOffsetMapUnitScale="3x:0,0,0,0,0,0" shadowRadius="1.5" shadowOffsetUnit="MM" shadowOpacity="0.7" shadowRadiusAlphaOnly="0" shadowColor="0,0,0,255" shadowScale="100" shadowRadiusUnit="MM" shadowBlendMode="6" shadowUnder="0"/>
            <substitutions/>
          </text-style>
          <text-format useMaxLineLengthForAutoWrap="1" reverseDirectionSymbol="0" wrapChar="" rightDirectionSymbol=">" formatNumbers="0" autoWrapLength="0" placeDirectionSymbol="0" addDirectionSymbol="0" decimals="3" multilineAlign="4294967295" plussign="0" leftDirectionSymbol="&lt;"/>
          <placement distMapUnitScale="3x:0,0,0,0,0,0" centroidWhole="1" preserveRotation="1" placementFlags="10" repeatDistanceMapUnitScale="3x:0,0,0,0,0,0" labelOffsetMapUnitScale="3x:0,0,0,0,0,0" fitInPolygonOnly="0" maxCurvedCharAngleOut="-25" rotationAngle="0" distUnits="MM" maxCurvedCharAngleIn="25" repeatDistanceUnits="MM" offsetType="0" dist="0" offsetUnits="MM" xOffset="0" placement="1" priority="5" repeatDistance="0" centroidInside="0" yOffset="0" quadOffset="4" predefinedPositionOrder="TR,TL,BR,BL,R,L,TSR,BSR"/>
          <rendering scaleMin="0" labelPerPart="0" obstacleType="0" zIndex="0" obstacleFactor="1" maxNumLabels="2000" fontMaxPixelSize="10000" fontMinPixelSize="3" scaleVisibility="0" limitNumLabels="0" mergeLines="0" fontLimitPixelSize="0" displayAll="0" obstacle="1" drawLabels="1" scaleMax="0" upsidedownLabels="0" minFeatureSize="0"/>
          <dd_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </dd_properties>
        </settings>
      </rule>
      <rule filter="&quot;execucao_1_situacao&quot; IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND &quot;revisao_e_correcao_1_situacao&quot;  IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND &quot;revisao_1_situacao&quot;  IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND &quot;correcao_1_situacao&quot;  NOT IN ('Não iniciada')&#xd;&#xa;AND &quot;revisao_2_situacao&quot;   IN ('Não iniciada')" key="{c7a1848b-afa5-4789-82b0-cf07caaeb448}">
        <settings>
          <text-style multilineHeight="1" blendMode="0" previewBkgrdColor="#ffffff" fontCapitals="0" fontWeight="50" textColor="0,0,0,255" fontWordSpacing="0" fontSizeMapUnitScale="3x:0,0,0,0,0,0" fontStrikeout="0" fontUnderline="0" fontSizeUnit="MapUnit" namedStyle="Normal" fieldName="1" fontItalic="0" textOpacity="1" useSubstitutions="0" fontSize="0.04" fontLetterSpacing="0" isExpression="1" fontFamily="MS Shell Dlg 2">
            <text-buffer bufferOpacity="1" bufferDraw="1" bufferSizeUnits="MM" bufferSize="1" bufferSizeMapUnitScale="3x:0,0,0,0,0,0" bufferNoFill="1" bufferBlendMode="0" bufferColor="255,255,255,255" bufferJoinStyle="128"/>
            <background shapeOffsetX="0" shapeJoinStyle="64" shapeSizeX="0" shapeBorderWidthUnit="MM" shapeRotationType="0" shapeRadiiMapUnitScale="3x:0,0,0,0,0,0" shapeOpacity="1" shapeRadiiUnit="MM" shapeBorderWidthMapUnitScale="3x:0,0,0,0,0,0" shapeBorderColor="128,128,128,255" shapeType="0" shapeFillColor="255,255,255,255" shapeSizeUnit="MM" shapeRotation="0" shapeSizeMapUnitScale="3x:0,0,0,0,0,0" shapeRadiiX="0" shapeOffsetY="0" shapeBlendMode="0" shapeOffsetMapUnitScale="3x:0,0,0,0,0,0" shapeRadiiY="0" shapeDraw="0" shapeSizeY="0" shapeBorderWidth="0" shapeSVGFile="" shapeSizeType="0" shapeOffsetUnit="MM"/>
            <shadow shadowDraw="0" shadowOffsetDist="1" shadowOffsetGlobal="1" shadowRadiusMapUnitScale="3x:0,0,0,0,0,0" shadowOffsetAngle="135" shadowOffsetMapUnitScale="3x:0,0,0,0,0,0" shadowRadius="1.5" shadowOffsetUnit="MM" shadowOpacity="0.7" shadowRadiusAlphaOnly="0" shadowColor="0,0,0,255" shadowScale="100" shadowRadiusUnit="MM" shadowBlendMode="6" shadowUnder="0"/>
            <substitutions/>
          </text-style>
          <text-format useMaxLineLengthForAutoWrap="1" reverseDirectionSymbol="0" wrapChar="" rightDirectionSymbol=">" formatNumbers="0" autoWrapLength="0" placeDirectionSymbol="0" addDirectionSymbol="0" decimals="3" multilineAlign="4294967295" plussign="0" leftDirectionSymbol="&lt;"/>
          <placement distMapUnitScale="3x:0,0,0,0,0,0" centroidWhole="1" preserveRotation="1" placementFlags="10" repeatDistanceMapUnitScale="3x:0,0,0,0,0,0" labelOffsetMapUnitScale="3x:0,0,0,0,0,0" fitInPolygonOnly="0" maxCurvedCharAngleOut="-25" rotationAngle="0" distUnits="MM" maxCurvedCharAngleIn="25" repeatDistanceUnits="MM" offsetType="0" dist="0" offsetUnits="MM" xOffset="0" placement="1" priority="5" repeatDistance="0" centroidInside="0" yOffset="0" quadOffset="4" predefinedPositionOrder="TR,TL,BR,BL,R,L,TSR,BSR"/>
          <rendering scaleMin="0" labelPerPart="0" obstacleType="0" zIndex="0" obstacleFactor="1" maxNumLabels="2000" fontMaxPixelSize="10000" fontMinPixelSize="3" scaleVisibility="0" limitNumLabels="0" mergeLines="0" fontLimitPixelSize="0" displayAll="0" obstacle="1" drawLabels="1" scaleMax="0" upsidedownLabels="0" minFeatureSize="0"/>
          <dd_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </dd_properties>
        </settings>
      </rule>
      <rule filter="&quot;execucao_1_situacao&quot; IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND &quot;revisao_e_correcao_1_situacao&quot;  IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND   &quot;revisao_1_situacao&quot;  IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND    &quot;correcao_1_situacao&quot;   IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND &quot;revisao_2_situacao&quot;   NOT IN ('Não iniciada')&#xd;&#xa;AND &quot;correcao_2_situacao&quot;   IN ('Não iniciada')" key="{8000e476-702d-40fc-9028-fc6fa74128af}">
        <settings>
          <text-style multilineHeight="1" blendMode="0" previewBkgrdColor="#ffffff" fontCapitals="0" fontWeight="50" textColor="0,0,0,255" fontWordSpacing="0" fontSizeMapUnitScale="3x:0,0,0,0,0,0" fontStrikeout="0" fontUnderline="0" fontSizeUnit="MapUnit" namedStyle="Normal" fieldName="2" fontItalic="0" textOpacity="1" useSubstitutions="0" fontSize="0.04" fontLetterSpacing="0" isExpression="1" fontFamily="MS Shell Dlg 2">
            <text-buffer bufferOpacity="1" bufferDraw="1" bufferSizeUnits="MM" bufferSize="1" bufferSizeMapUnitScale="3x:0,0,0,0,0,0" bufferNoFill="1" bufferBlendMode="0" bufferColor="255,255,255,255" bufferJoinStyle="128"/>
            <background shapeOffsetX="0" shapeJoinStyle="64" shapeSizeX="0" shapeBorderWidthUnit="MM" shapeRotationType="0" shapeRadiiMapUnitScale="3x:0,0,0,0,0,0" shapeOpacity="1" shapeRadiiUnit="MM" shapeBorderWidthMapUnitScale="3x:0,0,0,0,0,0" shapeBorderColor="128,128,128,255" shapeType="0" shapeFillColor="255,255,255,255" shapeSizeUnit="MM" shapeRotation="0" shapeSizeMapUnitScale="3x:0,0,0,0,0,0" shapeRadiiX="0" shapeOffsetY="0" shapeBlendMode="0" shapeOffsetMapUnitScale="3x:0,0,0,0,0,0" shapeRadiiY="0" shapeDraw="0" shapeSizeY="0" shapeBorderWidth="0" shapeSVGFile="" shapeSizeType="0" shapeOffsetUnit="MM"/>
            <shadow shadowDraw="0" shadowOffsetDist="1" shadowOffsetGlobal="1" shadowRadiusMapUnitScale="3x:0,0,0,0,0,0" shadowOffsetAngle="135" shadowOffsetMapUnitScale="3x:0,0,0,0,0,0" shadowRadius="1.5" shadowOffsetUnit="MM" shadowOpacity="0.7" shadowRadiusAlphaOnly="0" shadowColor="0,0,0,255" shadowScale="100" shadowRadiusUnit="MM" shadowBlendMode="6" shadowUnder="0"/>
            <substitutions/>
          </text-style>
          <text-format useMaxLineLengthForAutoWrap="1" reverseDirectionSymbol="0" wrapChar="" rightDirectionSymbol=">" formatNumbers="0" autoWrapLength="0" placeDirectionSymbol="0" addDirectionSymbol="0" decimals="3" multilineAlign="4294967295" plussign="0" leftDirectionSymbol="&lt;"/>
          <placement distMapUnitScale="3x:0,0,0,0,0,0" centroidWhole="1" preserveRotation="1" placementFlags="10" repeatDistanceMapUnitScale="3x:0,0,0,0,0,0" labelOffsetMapUnitScale="3x:0,0,0,0,0,0" fitInPolygonOnly="0" maxCurvedCharAngleOut="-25" rotationAngle="0" distUnits="MM" maxCurvedCharAngleIn="25" repeatDistanceUnits="MM" offsetType="0" dist="0" offsetUnits="MM" xOffset="0" placement="1" priority="5" repeatDistance="0" centroidInside="0" yOffset="0" quadOffset="4" predefinedPositionOrder="TR,TL,BR,BL,R,L,TSR,BSR"/>
          <rendering scaleMin="0" labelPerPart="0" obstacleType="0" zIndex="0" obstacleFactor="1" maxNumLabels="2000" fontMaxPixelSize="10000" fontMinPixelSize="3" scaleVisibility="0" limitNumLabels="0" mergeLines="0" fontLimitPixelSize="0" displayAll="0" obstacle="1" drawLabels="1" scaleMax="0" upsidedownLabels="0" minFeatureSize="0"/>
          <dd_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </dd_properties>
        </settings>
      </rule>
      <rule filter="&quot;execucao_1_situacao&quot; IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND &quot;revisao_e_correcao_1_situacao&quot; IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND &quot;revisao_1_situacao&quot; IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND &quot;correcao_1_situacao&quot; IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND &quot;revisao_2_situacao&quot; IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND &quot;correcao_2_situacao&quot; NOT IN ('Não iniciada')&#xd;&#xa;AND &quot;revisao_e_correcao_2_situacao&quot; IN ('Não iniciada')" key="{c963a26e-2897-49a4-99bb-0b4b0075ac48}">
        <settings>
          <text-style multilineHeight="1" blendMode="0" previewBkgrdColor="#ffffff" fontCapitals="0" fontWeight="50" textColor="0,0,0,255" fontWordSpacing="0" fontSizeMapUnitScale="3x:0,0,0,0,0,0" fontStrikeout="0" fontUnderline="0" fontSizeUnit="MapUnit" namedStyle="Normal" fieldName="2" fontItalic="0" textOpacity="1" useSubstitutions="0" fontSize="0.04" fontLetterSpacing="0" isExpression="1" fontFamily="MS Shell Dlg 2">
            <text-buffer bufferOpacity="1" bufferDraw="1" bufferSizeUnits="MM" bufferSize="1" bufferSizeMapUnitScale="3x:0,0,0,0,0,0" bufferNoFill="1" bufferBlendMode="0" bufferColor="255,255,255,255" bufferJoinStyle="128"/>
            <background shapeOffsetX="0" shapeJoinStyle="64" shapeSizeX="0" shapeBorderWidthUnit="MM" shapeRotationType="0" shapeRadiiMapUnitScale="3x:0,0,0,0,0,0" shapeOpacity="1" shapeRadiiUnit="MM" shapeBorderWidthMapUnitScale="3x:0,0,0,0,0,0" shapeBorderColor="128,128,128,255" shapeType="0" shapeFillColor="255,255,255,255" shapeSizeUnit="MM" shapeRotation="0" shapeSizeMapUnitScale="3x:0,0,0,0,0,0" shapeRadiiX="0" shapeOffsetY="0" shapeBlendMode="0" shapeOffsetMapUnitScale="3x:0,0,0,0,0,0" shapeRadiiY="0" shapeDraw="0" shapeSizeY="0" shapeBorderWidth="0" shapeSVGFile="" shapeSizeType="0" shapeOffsetUnit="MM"/>
            <shadow shadowDraw="0" shadowOffsetDist="1" shadowOffsetGlobal="1" shadowRadiusMapUnitScale="3x:0,0,0,0,0,0" shadowOffsetAngle="135" shadowOffsetMapUnitScale="3x:0,0,0,0,0,0" shadowRadius="1.5" shadowOffsetUnit="MM" shadowOpacity="0.7" shadowRadiusAlphaOnly="0" shadowColor="0,0,0,255" shadowScale="100" shadowRadiusUnit="MM" shadowBlendMode="6" shadowUnder="0"/>
            <substitutions/>
          </text-style>
          <text-format useMaxLineLengthForAutoWrap="1" reverseDirectionSymbol="0" wrapChar="" rightDirectionSymbol=">" formatNumbers="0" autoWrapLength="0" placeDirectionSymbol="0" addDirectionSymbol="0" decimals="3" multilineAlign="4294967295" plussign="0" leftDirectionSymbol="&lt;"/>
          <placement distMapUnitScale="3x:0,0,0,0,0,0" centroidWhole="1" preserveRotation="1" placementFlags="10" repeatDistanceMapUnitScale="3x:0,0,0,0,0,0" labelOffsetMapUnitScale="3x:0,0,0,0,0,0" fitInPolygonOnly="0" maxCurvedCharAngleOut="-25" rotationAngle="0" distUnits="MM" maxCurvedCharAngleIn="25" repeatDistanceUnits="MM" offsetType="0" dist="0" offsetUnits="MM" xOffset="0" placement="1" priority="5" repeatDistance="0" centroidInside="0" yOffset="0" quadOffset="4" predefinedPositionOrder="TR,TL,BR,BL,R,L,TSR,BSR"/>
          <rendering scaleMin="0" labelPerPart="0" obstacleType="0" zIndex="0" obstacleFactor="1" maxNumLabels="2000" fontMaxPixelSize="10000" fontMinPixelSize="3" scaleVisibility="0" limitNumLabels="0" mergeLines="0" fontLimitPixelSize="0" displayAll="0" obstacle="1" drawLabels="1" scaleMax="0" upsidedownLabels="0" minFeatureSize="0"/>
          <dd_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </dd_properties>
        </settings>
      </rule>
      <rule filter="&quot;execucao_1_situacao&quot; IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND &quot;revisao_e_correcao_1_situacao&quot; IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND &quot;revisao_1_situacao&quot; IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND &quot;correcao_1_situacao&quot; IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND &quot;revisao_2_situacao&quot; IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND &quot;correcao_2_situacao&quot; IN ('Finalizada','Não será executada','-')&#xd;&#xa;AND &quot;revisao_e_correcao_2_situacao&quot; IN ('Em execução','Pausada')" key="{f9cea31f-c144-493e-a0d4-a59640fc2a51}">
        <settings>
          <text-style multilineHeight="1" blendMode="0" previewBkgrdColor="#ffffff" fontCapitals="0" fontWeight="50" textColor="0,0,0,255" fontWordSpacing="0" fontSizeMapUnitScale="3x:0,0,0,0,0,0" fontStrikeout="0" fontUnderline="0" fontSizeUnit="MapUnit" namedStyle="Normal" fieldName="2" fontItalic="0" textOpacity="1" useSubstitutions="0" fontSize="0.04" fontLetterSpacing="0" isExpression="1" fontFamily="MS Shell Dlg 2">
            <text-buffer bufferOpacity="1" bufferDraw="1" bufferSizeUnits="MM" bufferSize="1" bufferSizeMapUnitScale="3x:0,0,0,0,0,0" bufferNoFill="1" bufferBlendMode="0" bufferColor="255,255,255,255" bufferJoinStyle="128"/>
            <background shapeOffsetX="0" shapeJoinStyle="64" shapeSizeX="0" shapeBorderWidthUnit="MM" shapeRotationType="0" shapeRadiiMapUnitScale="3x:0,0,0,0,0,0" shapeOpacity="1" shapeRadiiUnit="MM" shapeBorderWidthMapUnitScale="3x:0,0,0,0,0,0" shapeBorderColor="128,128,128,255" shapeType="0" shapeFillColor="255,255,255,255" shapeSizeUnit="MM" shapeRotation="0" shapeSizeMapUnitScale="3x:0,0,0,0,0,0" shapeRadiiX="0" shapeOffsetY="0" shapeBlendMode="0" shapeOffsetMapUnitScale="3x:0,0,0,0,0,0" shapeRadiiY="0" shapeDraw="0" shapeSizeY="0" shapeBorderWidth="0" shapeSVGFile="" shapeSizeType="0" shapeOffsetUnit="MM"/>
            <shadow shadowDraw="0" shadowOffsetDist="1" shadowOffsetGlobal="1" shadowRadiusMapUnitScale="3x:0,0,0,0,0,0" shadowOffsetAngle="135" shadowOffsetMapUnitScale="3x:0,0,0,0,0,0" shadowRadius="1.5" shadowOffsetUnit="MM" shadowOpacity="0.7" shadowRadiusAlphaOnly="0" shadowColor="0,0,0,255" shadowScale="100" shadowRadiusUnit="MM" shadowBlendMode="6" shadowUnder="0"/>
            <substitutions/>
          </text-style>
          <text-format useMaxLineLengthForAutoWrap="1" reverseDirectionSymbol="0" wrapChar="" rightDirectionSymbol=">" formatNumbers="0" autoWrapLength="0" placeDirectionSymbol="0" addDirectionSymbol="0" decimals="3" multilineAlign="4294967295" plussign="0" leftDirectionSymbol="&lt;"/>
          <placement distMapUnitScale="3x:0,0,0,0,0,0" centroidWhole="1" preserveRotation="1" placementFlags="10" repeatDistanceMapUnitScale="3x:0,0,0,0,0,0" labelOffsetMapUnitScale="3x:0,0,0,0,0,0" fitInPolygonOnly="0" maxCurvedCharAngleOut="-25" rotationAngle="0" distUnits="MM" maxCurvedCharAngleIn="25" repeatDistanceUnits="MM" offsetType="0" dist="0" offsetUnits="MM" xOffset="0" placement="1" priority="5" repeatDistance="0" centroidInside="0" yOffset="0" quadOffset="4" predefinedPositionOrder="TR,TL,BR,BL,R,L,TSR,BSR"/>
          <rendering scaleMin="0" labelPerPart="0" obstacleType="0" zIndex="0" obstacleFactor="1" maxNumLabels="2000" fontMaxPixelSize="10000" fontMinPixelSize="3" scaleVisibility="0" limitNumLabels="0" mergeLines="0" fontLimitPixelSize="0" displayAll="0" obstacle="1" drawLabels="1" scaleMax="0" upsidedownLabels="0" minFeatureSize="0"/>
          <dd_properties>
            <Option type="Map">
              <Option name="name" value="" type="QString"/>
              <Option name="properties"/>
              <Option name="type" value="collection" type="QString"/>
            </Option>
          </dd_properties>
        </settings>
      </rule>
    </rules>
  </labeling>
  <blendMode>0</blendMode>
  <featureBlendMode>0</featureBlendMode>
  <layerGeometryType>2</layerGeometryType>
</qgis>
