BEGIN;

CREATE SCHEMA acompanhamento;

CREATE TABLE acompanhamento.login(
  id SERIAL NOT NULL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
  data_login  timestamp with time zone NOT NULL
);

CREATE VIEW acompanhamento.usuarios_sem_atividades AS
SELECT u.id AS usuario_id, tpg.nome_abrev || ' ' || u.nome_guerra as usuario, tt.nome AS turno
FROM dgeo.usuario AS u
INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
INNER JOIN dominio.tipo_turno AS tt ON tt.code = u.tipo_turno_id
LEFT JOIN 
(
  SELECT id, usuario_id 
  FROM macrocontrole.atividade AS ee 
  WHERE ee.tipo_situacao_id = 2 -- em execucao
  ) AS ee
ON ee.usuario_id = u.id
WHERE ee.id IS NULL AND u.ativo IS TRUE
ORDER BY u.nome_guerra;

CREATE VIEW acompanhamento.ultimo_login AS
SELECT u.id AS usuario_id, tpg.nome_abrev || ' ' || u.nome_guerra as usuario, tt.nome AS turno, l.data_login
FROM dgeo.usuario AS u
INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
INNER JOIN dominio.tipo_turno AS tt ON tt.code = u.tipo_turno_id
INNER JOIN
(SELECT usuario_id, max(data_login) as data_login FROM acompanhamento.login GROUP BY usuario_id) AS l
ON l.usuario_id = u.id
WHERE u.ativo IS TRUE
ORDER BY l.data_login DESC;

CREATE VIEW acompanhamento.usuarios_logados_hoje AS
SELECT u.id AS usuario_id, tpg.nome_abrev || ' ' || u.nome_guerra as usuario, tt.nome AS turno, l.data_login
FROM dgeo.usuario AS u
INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
INNER JOIN dominio.tipo_turno AS tt ON tt.code = u.tipo_turno_id
INNER JOIN
(SELECT usuario_id, max(data_login) as data_login FROM acompanhamento.login GROUP BY usuario_id) AS l
ON l.usuario_id = u.id
WHERE l.data_login::date = now()::date
ORDER BY l.data_login DESC;

CREATE VIEW acompanhamento.usuarios_nao_logados_hoje AS
SELECT u.id AS usuario_id, tpg.nome_abrev || ' ' || u.nome_guerra as usuario, tt.nome AS turno, l.data_login
FROM dgeo.usuario AS u
INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
INNER JOIN dominio.tipo_turno AS tt ON tt.code = u.tipo_turno_id
INNER JOIN
(SELECT usuario_id, max(data_login) as data_login FROM acompanhamento.login GROUP BY usuario_id) AS l
ON l.usuario_id = u.id
WHERE u.ativo IS TRUE and l.data_login::date != now()::date
ORDER BY l.data_login DESC;

CREATE VIEW acompanhamento.quantitativo_fila_distribuicao AS
SELECT ROW_NUMBER () OVER (ORDER BY ativ.perfil_producao_id, ativ.subfase_id, ativ.lote_id) AS id, 
ativ.perfil_producao_id, pp.nome AS perfil_producao, 
ativ.subfase_id, s.nome AS subfase, 
ativ.lote_id, l.nome AS lote,  count(*) quantidade
FROM (
SELECT etapa_id, unidade_trabalho_id, perfil_producao_id, subfase_id, lote_id
        FROM (
        SELECT ut.lote_id, se.subfase_id, ppo.perfil_producao_id, ee.etapa_id, ee.unidade_trabalho_id, ee_ant.tipo_situacao_id AS situacao_ant
        FROM macrocontrole.atividade AS ee
        INNER JOIN macrocontrole.perfil_producao_etapa AS pse ON pse.etapa_id = ee.etapa_id
        INNER JOIN macrocontrole.perfil_producao_operador AS ppo ON ppo.perfil_producao_id = pse.perfil_producao_id
        INNER JOIN dgeo.usuario AS u ON u.id = ppo.usuario_id
        INNER JOIN macrocontrole.etapa AS se ON se.id = ee.etapa_id
        INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = ee.unidade_trabalho_id
        INNER JOIN macrocontrole.lote AS lo ON lo.id = ut.lote_id
        LEFT JOIN
        (
          SELECT ee.tipo_situacao_id, ee.unidade_trabalho_id, se.ordem, se.subfase_id FROM macrocontrole.atividade AS ee
          INNER JOIN macrocontrole.etapa AS se ON se.id = ee.etapa_id
          WHERE ee.tipo_situacao_id != 6
        ) 
        AS ee_ant ON ee_ant.unidade_trabalho_id = ee.unidade_trabalho_id AND ee_ant.subfase_id = se.subfase_id
        AND se.ordem > ee_ant.ordem
        WHERE ut.disponivel IS TRUE AND ee.tipo_situacao_id = 1
        AND ee.id NOT IN
        (
          SELECT a.id FROM macrocontrole.atividade AS a
          INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
          INNER JOIN macrocontrole.pre_requisito_subfase AS prs ON prs.subfase_posterior_id = ut.subfase_id
          INNER JOIN macrocontrole.unidade_trabalho AS ut_re ON ut_re.subfase_id = prs.subfase_anterior_id
          INNER JOIN macrocontrole.atividade AS a_re ON a_re.unidade_trabalho_id = ut_re.id
          WHERE prs.tipo_pre_requisito_id = 1 AND 
          ut.geom && ut_re.geom AND
          st_relate(ut.geom, ut_re.geom, '2********') AND
          a_re.tipo_situacao_id IN (1, 2, 3)
        )
        ) AS sit
        GROUP BY etapa_id, unidade_trabalho_id, perfil_producao_id, subfase_id, lote_id
        HAVING MIN(situacao_ant) IS NULL OR every(situacao_ant IN (4,5))
) AS ativ
INNER JOIN macrocontrole.perfil_producao AS pp INNER JOIN pp.id = ativ.perfil_producao_id
INNER JOIN macrocontrole.subfase AS s INNER JOIN s.id = ativ.subfase_id
INNER JOIN macrocontrole.lote AS l INNER JOIN l.id = ativ.lote_id
GROUP BY perfil_producao_id, subfase_id, lote_id
ORDER BY perfil_producao_id, subfase_id, lote_id;

CREATE VIEW acompanhamento.quantitativo_atividades AS
SELECT ROW_NUMBER () OVER (ORDER BY ativ.etapa_id, ativ.subfase_id, ativ.lote_id) AS id, 
ativ.etapa_id, e.nome as etapa,
ativ.subfase_id, s.nome as subfase,
ativ.lote_id, l.nome as lote,
count(*) quantidade
FROM (
SELECT etapa_id, unidade_trabalho_id, subfase_id, lote_id
        FROM (
        SELECT ut.lote_id, se.subfase_id, ee.etapa_id, ee.unidade_trabalho_id, ee_ant.tipo_situacao_id AS situacao_ant
        FROM macrocontrole.atividade AS ee
        INNER JOIN macrocontrole.etapa AS se ON se.id = ee.etapa_id
        INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = ee.unidade_trabalho_id
        INNER JOIN macrocontrole.lote AS lo ON lo.id = ut.lote_id
        LEFT JOIN
        (
          SELECT ee.tipo_situacao_id, ee.unidade_trabalho_id, se.ordem, se.subfase_id FROM macrocontrole.atividade AS ee
          INNER JOIN macrocontrole.etapa AS se ON se.id = ee.etapa_id
          WHERE ee.tipo_situacao_id != 6
        ) 
        AS ee_ant ON ee_ant.unidade_trabalho_id = ee.unidade_trabalho_id AND ee_ant.subfase_id = se.subfase_id
        AND se.ordem > ee_ant.ordem
        WHERE ut.disponivel IS TRUE AND ee.tipo_situacao_id = 1
        AND ee.id NOT IN
        (
          SELECT a.id FROM macrocontrole.atividade AS a
          INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
          INNER JOIN macrocontrole.pre_requisito_subfase AS prs ON prs.subfase_posterior_id = ut.subfase_id
          INNER JOIN macrocontrole.unidade_trabalho AS ut_re ON ut_re.subfase_id = prs.subfase_anterior_id
          INNER JOIN macrocontrole.atividade AS a_re ON a_re.unidade_trabalho_id = ut_re.id
          WHERE prs.tipo_pre_requisito_id = 1 AND 
          ut.geom && ut_re.geom AND
          st_relate(ut.geom, ut_re.geom, '2********') AND
          a_re.tipo_situacao_id IN (1, 2, 3)
        )
        ) AS sit
        GROUP BY etapa_id, unidade_trabalho_id, subfase_id, lote_id
        HAVING MIN(situacao_ant) IS NULL OR every(situacao_ant IN (4,5))
) AS ativ
INNER JOIN macrocontrole.etapa AS e INNER JOIN e.id = ativ.etapa_id
INNER JOIN macrocontrole.subfase AS s INNER JOIN s.id = ativ.subfase_id
INNER JOIN macrocontrole.lote AS l INNER JOIN l.id = ativ.lote_id
GROUP BY etapa_id, subfase_id, lote_id
ORDER BY etapa_id, subfase_id, lote_id;

CREATE VIEW acompanhamento.atividades_em_execucao AS
SELECT ee.id, p.nome AS projeto_nome, lp.nome AS linha_producao_nome, tf.nome AS fase_nome, s.nome AS subfase_nome,
te.nome AS etapa_nome, ut.nome AS unidade_trabalho_nome,
u.id AS usuario_id, 
tpg.nome_abrev || ' ' || u.nome_guerra as usuario, tt.nome AS turno
ee.data_inicio, ee.id as atividade_id
FROM macrocontrole.atividade AS ee
INNER JOIN dgeo.usuario AS u ON u.id = ee.usuario_id
INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
INNER JOIN dominio.tipo_turno AS tt ON tt.code = u.tipo_turno_id
INNER JOIN macrocontrole.etapa AS e ON e.id = ee.etapa_id
INNER JOIN dominio.tipo_etapa AS te ON te.code = e.tipo_etapa_id
INNER JOIN macrocontrole.unidade_trabalho AS ut ON ee.unidade_trabalho_id = ut.id
INNER JOIN macrocontrole.subfase AS s ON s.id = e.subfase_id
INNER JOIN macrocontrole.fase AS f ON f.id = s.fase_id
INNER JOIN dominio.tipo_fase AS tf ON tf.code = f.tipo_fase_id
INNER JOIN macrocontrole.linha_producao AS lp ON lp.id = f.linha_producao_id
INNER JOIN macrocontrole.projeto AS p ON p.id = lp.projeto_id
WHERE ee.tipo_situacao_id = 2 --em execucao
ORDER BY ee.data_inicio ASC;

CREATE VIEW acompanhamento.ultimas_atividades_finalizadas AS
SELECT ee.id, p.nome AS projeto_nome, lp.nome AS linha_producao_nome, tf.nome AS fase_nome, s.nome AS subfase_nome,
te.nome AS etapa_nome, ut.nome AS unidade_trabalho_nome, u.id AS usuario_id, 
tpg.nome_abrev || ' ' || u.nome_guerra as usuario, tt.nome AS turno
ee.data_inicio, ee.data_fim, ee.id as atividade_id
FROM macrocontrole.atividade AS ee
INNER JOIN dgeo.usuario AS u ON u.id = ee.usuario_id
INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
INNER JOIN dominio.tipo_turno AS tt ON tt.code = u.tipo_turno_id
INNER JOIN macrocontrole.etapa AS e ON e.id = ee.etapa_id
INNER JOIN dominio.tipo_etapa AS te ON te.code = e.tipo_etapa_id
INNER JOIN macrocontrole.unidade_trabalho AS ut ON ee.unidade_trabalho_id = ut.id
INNER JOIN macrocontrole.subfase AS s ON s.id = e.subfase_id
INNER JOIN macrocontrole.fase AS f ON f.id = s.fase_id
INNER JOIN dominio.tipo_fase AS tf ON tf.code = f.tipo_fase_id
INNER JOIN macrocontrole.linha_producao AS lp ON lp.id = f.linha_producao_id
INNER JOIN macrocontrole.projeto AS p ON p.id = lp.projeto_id
WHERE ee.tipo_situacao_id = 4 --finalizada
ORDER BY ee.data_fim DESC
LIMIT 100;

CREATE OR REPLACE FUNCTION acompanhamento.cria_view_acompanhamento_subfase()
  RETURNS trigger AS
$BODY$
    DECLARE view_txt text;
    DECLARE jointxt text := '';
    DECLARE wheretxt text := '';
    DECLARE subfase_ident integer;
    DECLARE num integer;
    DECLARE subfase_nome text;
    DECLARE nome_fixed text;
    DECLARE r record;
    DECLARE iterator integer := 1;
    DECLARE estilo_txt text;
    DECLARE rotulo_config text;
    BEGIN

    IF TG_OP = 'DELETE' THEN
      subfase_ident := OLD.subfase_id;
    ELSE
      subfase_ident := NEW.subfase_id;
    END IF;

    SELECT translate(replace(lower(nome),' ', '_'),  
          'àáâãäéèëêíìïîóòõöôúùüûçÇ/-|/\,.;:<>?!`{}[]()~`@#$%^&*+=''',  
          'aaaaaeeeeiiiiooooouuuucc________________________________')
          INTO subfase_nome FROM macrocontrole.subfase WHERE id = subfase_ident;

    EXECUTE 'DROP VIEW IF EXISTS acompanhamento.subfase_'|| subfase_ident || '_' || subfase_nome;

    DELETE FROM public.layer_styles
    WHERE f_table_schema = 'acompanhamento' AND f_table_name = 'subfase_'|| subfase_ident || '_' || subfase_nome AND stylename = 'acompanhamento_subfase';

    SELECT count(*) INTO num FROM macrocontrole.etapa WHERE subfase_id = subfase_ident;
    IF num > 0 THEN
      view_txt := 'CREATE VIEW acompanhamento.subfase_' || subfase_ident || '_'  || subfase_nome || ' AS 
      SELECT ut.id, ut.disponivel, l.nome AS lote, ut.nome, bd.servidor || '':'' || bd.porta || ''/'' || bd.nome as banco_dados, ut.prioridade, ut.geom';

      FOR r IN SELECT se.id, e.nome, rank() OVER (PARTITION BY e.nome ORDER BY se.ordem) as numero FROM dominio.tipo_etapa AS e 
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
        wheretxt := wheretxt || ' AND (ee' || iterator || '.tipo_situacao_id IS NULL OR ee' || iterator || '.tipo_situacao_id != 6)';
        iterator := iterator + 1;
      END LOOP;

      view_txt := view_txt || ' FROM macrocontrole.unidade_trabalho AS ut';
      view_txt := view_txt || jointxt;
      view_txt := view_txt || ' INNER JOIN macrocontrole.lote AS l ON l.id = ut.lote_id';
      view_txt := view_txt || ' INNER JOIN macrocontrole.banco_dados AS bd ON bd.id = ut.banco_dados_id';
      view_txt := view_txt || ' WHERE ut.subfase_id = ' || subfase_ident;
      view_txt := view_txt || wheretxt;
      view_txt := view_txt || ' ORDER BY ut.prioridade;';

      EXECUTE view_txt;
      EXECUTE 'GRANT ALL ON TABLE acompanhamento.subfase_' || subfase_ident || '_'  || subfase_nome || ' TO PUBLIC';


    estilo_txt := '<!DOCTYPE qgis PUBLIC ''http://mrcc.com/qgis.dtd'' ''SYSTEM''>';
    estilo_txt := estilo_txt || '<qgis styleCategories="Symbology|Labeling" labelsEnabled="1" version="3.4.10-Madeira">';
    rotulo_config := '<settings>'
    '<text-style multilineHeight="1" blendMode="0" previewBkgrdColor="#ffffff" fontCapitals="0" fontWeight="50" textColor="0,0,0,255" fontWordSpacing="0" fontSizeMapUnitScale="3x:0,0,0,0,0,0" fontStrikeout="0" fontUnderline="0" fontSizeUnit="MapUnit" namedStyle="Normal" fieldName="{{ORDEM}}" fontItalic="0" textOpacity="1" useSubstitutions="0" fontSize="0.04" fontLetterSpacing="0" isExpression="1" fontFamily="Arial">'
    '<text-buffer bufferOpacity="1" bufferDraw="1" bufferSizeUnits="MM" bufferSize="1" bufferSizeMapUnitScale="3x:0,0,0,0,0,0" bufferNoFill="1" bufferBlendMode="0" bufferColor="255,255,255,255" bufferJoinStyle="128"/>'
    '<background shapeOffsetX="0" shapeJoinStyle="64" shapeSizeX="0" shapeBorderWidthUnit="MM" shapeRotationType="0" shapeRadiiMapUnitScale="3x:0,0,0,0,0,0" shapeOpacity="1" shapeRadiiUnit="MM" shapeBorderWidthMapUnitScale="3x:0,0,0,0,0,0" shapeBorderColor="128,128,128,255" shapeType="0" shapeFillColor="255,255,255,255" shapeSizeUnit="MM" shapeRotation="0" shapeSizeMapUnitScale="3x:0,0,0,0,0,0" shapeRadiiX="0" shapeOffsetY="0" shapeBlendMode="0" shapeOffsetMapUnitScale="3x:0,0,0,0,0,0" shapeRadiiY="0" shapeDraw="0" shapeSizeY="0" shapeBorderWidth="0" shapeSVGFile="" shapeSizeType="0" shapeOffsetUnit="MM"/>'
    '<shadow shadowDraw="0" shadowOffsetDist="1" shadowOffsetGlobal="1" shadowRadiusMapUnitScale="3x:0,0,0,0,0,0" shadowOffsetAngle="135" shadowOffsetMapUnitScale="3x:0,0,0,0,0,0" shadowRadius="1.5" shadowOffsetUnit="MM" shadowOpacity="0.7" shadowRadiusAlphaOnly="0" shadowColor="0,0,0,255" shadowScale="100" shadowRadiusUnit="MM" shadowBlendMode="6" shadowUnder="0"/>'
    '<substitutions/>'
    '</text-style>'
    '<text-format useMaxLineLengthForAutoWrap="1" reverseDirectionSymbol="0" wrapChar="" rightDirectionSymbol=">" formatNumbers="0" autoWrapLength="0" placeDirectionSymbol="0" addDirectionSymbol="0" decimals="3" multilineAlign="4294967295" plussign="0" leftDirectionSymbol="&lt;"/>'
    '<placement distMapUnitScale="3x:0,0,0,0,0,0" centroidWhole="1" preserveRotation="1" placementFlags="10" repeatDistanceMapUnitScale="3x:0,0,0,0,0,0" labelOffsetMapUnitScale="3x:0,0,0,0,0,0" fitInPolygonOnly="0" maxCurvedCharAngleOut="-25" rotationAngle="0" distUnits="MM" maxCurvedCharAngleIn="25" repeatDistanceUnits="MM" offsetType="0" dist="0" offsetUnits="MM" xOffset="0" placement="1" priority="5" repeatDistance="0" centroidInside="0" yOffset="0" quadOffset="4" predefinedPositionOrder="TR,TL,BR,BL,R,L,TSR,BSR"/>'
    '<rendering scaleMin="0" labelPerPart="0" obstacleType="0" zIndex="0" obstacleFactor="1" maxNumLabels="2000" fontMaxPixelSize="10000" fontMinPixelSize="3" scaleVisibility="0" limitNumLabels="0" mergeLines="0" fontLimitPixelSize="0" displayAll="0" obstacle="1" drawLabels="1" scaleMax="0" upsidedownLabels="0" minFeatureSize="0"/>'
    '<dd_properties>'
    '<Option type="Map">'
    '<Option name="name" value="" type="QString"/>'
    '<Option name="properties"/>'
    '<Option name="type" value="collection" type="QString"/>'
    '</Option>'
    '</dd_properties>'
    '</settings>'
    estilo_txt := estilo_txt || '<blendMode>0</blendMode><featureBlendMode>0</featureBlendMode><layerGeometryType>2</layerGeometryType></qgis>';

    INSERT INTO public.layer_styles(f_table_catalog, f_table_schema, f_table_name, f_geometry_column, stylename, styleqml, stylesld, useasdefault, owner, ui, update_time) VALUES
    (current_database(), 'acompanhamento', 'subfase_'|| subfase_ident || '_' || subfase_nome, 'geom', 'acompanhamento_subfase', estilo_txt, NULL, TRUE, current_user, NULL, now());

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
ALTER FUNCTION acompanhamento.cria_view_acompanhamento_subfase()
  OWNER TO postgres;

CREATE TRIGGER cria_view_acompanhamento_subfase
AFTER UPDATE OR INSERT OR DELETE ON macrocontrole.etapa
FOR EACH ROW EXECUTE PROCEDURE acompanhamento.cria_view_acompanhamento_subfase();

CREATE OR REPLACE FUNCTION acompanhamento.cria_view_acompanhamento_fase()
  RETURNS trigger AS
$BODY$
    DECLARE view_txt text;
    DECLARE jointxt text := '';
    DECLARE linhaproducao_ident integer;
    DECLARE fase_ident integer;
    DECLARE num integer;
    DECLARE fase_nome text;
    DECLARE nome_fixed text;
    DECLARE r record;
    DECLARE iterator integer := 1;
    BEGIN

    IF TG_OP = 'DELETE' THEN
      fase_ident := OLD.fase_id;
    ELSE
      fase_ident := NEW.fase_id;
    END IF;

    SELECT translate(replace(lower(tp.nome),' ', '_'),  
          'àáâãäéèëêíìïîóòõöôúùüûçÇ/-|/\,.;:<>?!`{}[]()~`@#$%^&*+=''',  
          'aaaaaeeeeiiiiooooouuuucc________________________________'),
          f.linha_producao_id
          INTO fase_nome, linhaproducao_ident
          FROM macrocontrole.fase AS f
          INNER JOIN dominio.tipo_fase AS tp ON tp.code = f.tipo_fase_id
          WHERE f.id = fase_ident;

    EXECUTE 'DROP VIEW IF EXISTS acompanhamento.fase_'|| fase_ident || '_' || fase_nome;

    SELECT count(*) INTO num FROM macrocontrole.subfase WHERE fase_id = fase_ident;
    IF num > 0 THEN
      view_txt := 'CREATE VIEW acompanhamento.fase_' || fase_ident || '_'  || fase_nome || ' AS 
      SELECT p.id, p.nome, p.mi, p.inom, p.escala, p.geom';

      FOR r in SELECT s.id, s.nome FROM macrocontrole.subfase AS s
      WHERE s.fase_id = fase_ident
      ORDER BY s.ordem
      LOOP
        SELECT translate(replace(lower(r.nome),' ', '_'),  
          'àáâãäéèëêíìïîóòõöôúùüûçÇ/-|/\,.;:<>?!`{}[]()~`@#$%^&*+=''',  
          'aaaaaeeeeiiiiooooouuuucc________________________________')
          INTO nome_fixed;
        view_txt := view_txt || ', (CASE WHEN min(ut' || iterator || '.id) IS NOT NULL THEN min(ut' || iterator || '.data_inicio)::text ELSE ''-'' END) AS  ' || nome_fixed || '_data_inicio';
        view_txt := view_txt || ', (CASE WHEN min(ut' || iterator || '.id) IS NOT NULL THEN (CASE WHEN count(*) - count(ut' || iterator || '.data_fim) = 0 THEN max(ut' || iterator || '.data_fim)::text ELSE NULL END) ELSE ''-'' END) AS  ' || nome_fixed || '_data_fim';

        jointxt := jointxt || ' LEFT JOIN 
          (SELECT ut.id, ut.geom, min(a.data_inicio) as data_inicio,
          (CASE WHEN count(*) - count(a.data_fim) = 0 THEN max(a.data_fim) ELSE NULL END) AS data_fim
          FROM macrocontrole.unidade_trabalho AS ut
          INNER JOIN
          (select unidade_trabalho_id, data_inicio, data_fim from macrocontrole.atividade where tipo_situacao_id NOT IN (5,6)) AS a
          ON a.unidade_trabalho_id = ut.id
          WHERE ut.subfase_id = ' || r.id || '
          GROUP BY ut.id) AS ut' || iterator || '
          ON ut' || iterator || '.geom && p.geom AND st_relate(ut' || iterator || '.geom, p.geom, ''2********'')';

        iterator := iterator + 1;
      END LOOP;

      view_txt := view_txt || ' FROM macrocontrole.produto AS p ';
      view_txt := view_txt || jointxt;
      view_txt := view_txt || ' WHERE p.linha_producao_id = ' || linhaproducao_ident || ' GROUP BY p.id;';

      EXECUTE view_txt;
      EXECUTE 'GRANT ALL ON TABLE acompanhamento.fase_' || fase_ident || '_'  || fase_nome || ' TO PUBLIC';

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
ALTER FUNCTION acompanhamento.cria_view_acompanhamento_fase()
  OWNER TO postgres;

CREATE TRIGGER cria_view_acompanhamento_fase
AFTER UPDATE OR INSERT OR DELETE ON macrocontrole.subfase
FOR EACH ROW EXECUTE PROCEDURE acompanhamento.cria_view_acompanhamento_fase();

CREATE OR REPLACE FUNCTION acompanhamento.cria_view_acompanhamento_linha_producao()
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

    IF TG_OP = 'DELETE' THEN
      linhaproducao_ident := OLD.linha_producao_id;
    ELSE
      linhaproducao_ident := NEW.linha_producao_id;
    END IF;

    SELECT translate(replace(lower(lp.nome),' ', '_'),  
          'àáâãäéèëêíìïîóòõöôúùüûçÇ/-|/\,.;:<>?!`{}[]()~`@#$%^&*+=''',  
          'aaaaaeeeeiiiiooooouuuucc________________________________')
          INTO linhaproducao_nome
          FROM macrocontrole.linha_producao AS lp
          WHERE lp.id = linhaproducao_ident;

    EXECUTE 'DROP VIEW IF EXISTS acompanhamento.linha_producao_'|| linhaproducao_ident || '_' || linhaproducao_nome;

    SELECT count(*) INTO num FROM macrocontrole.fase WHERE linha_producao_id = linhaproducao_ident;
    IF num > 0 THEN
      view_txt := 'CREATE VIEW acompanhamento.linha_producao_' || linhaproducao_ident || '_'  || linhaproducao_nome || ' AS 
      SELECT p.id, p.nome, p.mi, p.inom, p.escala, p.geom';

      FOR r in SELECT f.id, tf.nome FROM macrocontrole.fase AS f
      INNER JOIN dominio.tipo_fase AS tf ON tf.code = f.tipo_fase_id
      WHERE f.linha_producao_id = linhaproducao_ident
      ORDER BY f.ordem
      LOOP
        SELECT translate(replace(lower(r.nome),' ', '_'),  
          'àáâãäéèëêíìïîóòõöôúùüûçÇ/-|/\,.;:<>?!`{}[]()~`@#$%^&*+=''',  
          'aaaaaeeeeiiiiooooouuuucc________________________________')
          INTO nome_fixed;
        view_txt := view_txt || ', (CASE WHEN min(ut' || iterator || '.id) IS NOT NULL THEN min(ut' || iterator || '.data_inicio)::text ELSE ''-'' END) AS  ' || nome_fixed || '_data_inicio';
        view_txt := view_txt || ', (CASE WHEN min(ut' || iterator || '.id) IS NOT NULL THEN (CASE WHEN count(*) - count(ut' || iterator || '.data_fim) = 0 THEN max(ut' || iterator || '.data_fim)::text ELSE NULL END) ELSE ''-'' END) AS  ' || nome_fixed || '_data_fim';

        jointxt := jointxt || ' LEFT JOIN 
          (SELECT ut.id, ut.geom, min(a.data_inicio) as data_inicio,
          (CASE WHEN count(*) - count(a.data_fim) = 0 THEN max(a.data_fim) ELSE NULL END) AS data_fim
          FROM macrocontrole.unidade_trabalho AS ut
          INNER JOIN macrocontrole.subfase AS s ON s.id = ut.subfase_id
          INNER JOIN
          (select unidade_trabalho_id, data_inicio, data_fim from macrocontrole.atividade where tipo_situacao_id NOT IN (5,6)) AS a
          ON a.unidade_trabalho_id = ut.id
          WHERE s.fase_id = ' || r.id || '
          GROUP BY ut.id) AS ut' || iterator || '
          ON ut' || iterator || '.geom && p.geom AND st_relate(ut' || iterator || '.geom, p.geom, ''2********'')';

        iterator := iterator + 1;
      END LOOP;

      view_txt := view_txt || ' FROM macrocontrole.produto AS p ';
      view_txt := view_txt || jointxt;
      view_txt := view_txt || ' WHERE p.linha_producao_id = ' || linhaproducao_ident || ' GROUP BY p.id;';

      EXECUTE view_txt;
      EXECUTE 'GRANT ALL ON TABLE acompanhamento.linha_producao_' || linhaproducao_ident || '_'  || linhaproducao_nome || ' TO PUBLIC';

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
ALTER FUNCTION acompanhamento.cria_view_acompanhamento_linha_producao()
  OWNER TO postgres;

CREATE TRIGGER cria_view_acompanhamento_linha_producao
AFTER UPDATE OR INSERT OR DELETE ON macrocontrole.fase
FOR EACH ROW EXECUTE PROCEDURE acompanhamento.cria_view_acompanhamento_linha_producao();

COMMIT;