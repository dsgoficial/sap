
const { db } = require("../database");

const controller = {};
const {serializeError} = require('serialize-error');

controller.calcula_fila = async usuario => {
  return db
    .task(async t => {
      let fila_prioritaria = await t.oneOrNone(
        `SELECT id
        FROM (
        SELECT ee.id, ee.etapa_id, ee.unidade_trabalho_id, ee_ant.tipo_situacao_id AS situacao_ant, fp.prioridade AS fp_prioridade
        FROM macrocontrole.atividade AS ee
        INNER JOIN macrocontrole.etapa AS se ON se.id = ee.etapa_id
        INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = ee.unidade_trabalho_id
        INNER JOIN macrocontrole.lote AS lo ON lo.id = ut.lote_id
        INNER JOIN macrocontrole.fila_prioritaria AS fp ON fp.atividade_id = ee.id
        LEFT JOIN
        (
          SELECT ee.tipo_situacao_id, ee.unidade_trabalho_id, se.ordem, se.subfase_id FROM macrocontrole.atividade AS ee
          INNER JOIN macrocontrole.etapa AS se ON se.id = ee.etapa_id
          WHERE ee.tipo_situacao_id in (1,2,3,4)
        ) 
        AS ee_ant ON ee_ant.unidade_trabalho_id = ee.unidade_trabalho_id AND ee_ant.subfase_id = se.subfase_id
        AND se.ordem > ee_ant.ordem
        WHERE ut.disponivel IS TRUE AND ee.tipo_situacao_id = 1 AND fp.usuario_id = $1
        AND ee.id NOT IN
        (
          SELECT a.id FROM macrocontrole.atividade AS a
          INNER JOIN macrocontrole.perfil_producao_etapa AS ppe ON ppe.etapa_id = a.etapa_id
          INNER JOIN macrocontrole.perfil_producao_operador AS ppo ON ppo.perfil_producao_id = ppe.perfil_producao_id
          INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
          INNER JOIN macrocontrole.pre_requisito_subfase AS prs ON prs.subfase_posterior_id = ut.subfase_id
          INNER JOIN macrocontrole.unidade_trabalho AS ut_re ON ut_re.subfase_id = prs.subfase_anterior_id
          INNER JOIN macrocontrole.atividade AS a_re ON a_re.unidade_trabalho_id = ut_re.id
          WHERE ppo.usuario_id = $1 AND prs.tipo_pre_requisito_id = 1 AND 
          ut.geom && ut_re.geom AND
          st_relate(ut.geom, ut_re.geom, '2********') AND
          a_re.tipo_situacao_id IN (1, 2, 3)
        )
        ) AS sit
        GROUP BY id, fp_prioridade
        HAVING MIN(situacao_ant) IS NULL OR every(situacao_ant IN (4)) 
        ORDER BY fp_prioridade
        LIMIT 1`,
        [usuario]
      );

      if (fila_prioritaria != null) {
        return fila_prioritaria;
      }

      let fila_prioritaria_grupo = await t.oneOrNone(
        `SELECT id
        FROM (
        SELECT ee.id, ee.etapa_id, ee.unidade_trabalho_id, ee_ant.tipo_situacao_id AS situacao_ant, fpg.prioridade AS fpg_prioridade
        FROM macrocontrole.atividade AS ee
        INNER JOIN macrocontrole.etapa AS se ON se.id = ee.etapa_id
        INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = ee.unidade_trabalho_id
        INNER JOIN macrocontrole.lote AS lo ON lo.id = ut.lote_id
        INNER JOIN macrocontrole.fila_prioritaria_grupo AS fpg ON fpg.atividade_id = ee.id
        INNER JOIN macrocontrole.perfil_producao_operador AS ppo ON ppo.perfil_producao_id = fpg.perfil_producao_id
        LEFT JOIN
        (
          SELECT ee.tipo_situacao_id, ee.unidade_trabalho_id, se.ordem, se.subfase_id FROM macrocontrole.atividade AS ee
          INNER JOIN macrocontrole.etapa AS se ON se.id = ee.etapa_id
          WHERE ee.tipo_situacao_id in (1,2,3,4)
        ) 
        AS ee_ant ON ee_ant.unidade_trabalho_id = ee.unidade_trabalho_id AND ee_ant.subfase_id = se.subfase_id
        AND se.ordem > ee_ant.ordem
        WHERE ut.disponivel IS TRUE AND ppo.usuario_id = $1 AND ee.tipo_situacao_id = 1 AND fpg.perfil_producao_id = ppo.perfil_producao_id
        AND ee.id NOT IN
        (
          SELECT a.id FROM macrocontrole.atividade AS a
          INNER JOIN macrocontrole.perfil_producao_etapa AS ppe ON ppe.etapa_id = a.etapa_id
          INNER JOIN macrocontrole.perfil_producao_operador AS ppo ON ppo.perfil_producao_id = ppe.perfil_producao_id
          INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
          INNER JOIN macrocontrole.pre_requisito_subfase AS prs ON prs.subfase_posterior_id = ut.subfase_id
          INNER JOIN macrocontrole.unidade_trabalho AS ut_re ON ut_re.subfase_id = prs.subfase_anterior_id
          INNER JOIN macrocontrole.atividade AS a_re ON a_re.unidade_trabalho_id = ut_re.id
          WHERE ppo.usuario_id = $1 AND prs.tipo_pre_requisito_id = 1 AND 
          ut.geom && ut_re.geom AND
          st_relate(ut.geom, ut_re.geom, '2********') AND
          a_re.tipo_situacao_id IN (1, 2, 3)
        )
        ) AS sit
        GROUP BY id, fpg_prioridade
        HAVING MIN(situacao_ant) IS NULL OR every(situacao_ant IN (4)) 
        ORDER BY fpg_prioridade
        LIMIT 1`,
        [usuario]
      );

      if (fila_prioritaria_grupo != null) {
        return fila_prioritaria_grupo;
      }

      let cartas_pausadas = await t.oneOrNone(
        `SELECT id
        FROM (
        SELECT ee.id, ee.etapa_id, ee.unidade_trabalho_id, ee_ant.tipo_situacao_id AS situacao_ant, lo.prioridade AS lo_prioridade, ut.prioridade AS ut_prioridade
        FROM macrocontrole.atividade AS ee
        INNER JOIN macrocontrole.etapa AS se ON se.id = ee.etapa_id
        INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = ee.unidade_trabalho_id
        INNER JOIN macrocontrole.lote AS lo ON lo.id = ut.lote_id
        LEFT JOIN
        (
          SELECT ee.tipo_situacao_id, ee.unidade_trabalho_id, se.ordem, se.subfase_id FROM macrocontrole.atividade AS ee
          INNER JOIN macrocontrole.etapa AS se ON se.id = ee.etapa_id
          WHERE ee.tipo_situacao_id in (1,2,3,4)
        ) 
        AS ee_ant ON ee_ant.unidade_trabalho_id = ee.unidade_trabalho_id AND ee_ant.subfase_id = se.subfase_id
        AND se.ordem > ee_ant.ordem
        WHERE ut.disponivel IS TRUE AND ee.usuario_id = $1 AND ee.tipo_situacao_id = 3
        AND ee.id NOT IN
        (
          SELECT a.id FROM macrocontrole.atividade AS a
          INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
          INNER JOIN macrocontrole.pre_requisito_subfase AS prs ON prs.subfase_posterior_id = ut.subfase_id
          INNER JOIN macrocontrole.unidade_trabalho AS ut_re ON ut_re.subfase_id = prs.subfase_anterior_id
          INNER JOIN macrocontrole.atividade AS a_re ON a_re.unidade_trabalho_id = ut_re.id
          WHERE a.usuario_id = $1 AND prs.tipo_pre_requisito_id = 1 AND 
          ut.geom && ut_re.geom AND
          st_relate(ut.geom, ut_re.geom, '2********') AND
          a_re.tipo_situacao_id IN (1, 2, 3)
        )
        ) AS sit
        GROUP BY id, lo_prioridade, ut_prioridade
        HAVING MIN(situacao_ant) IS NULL OR every(situacao_ant IN (4)) 
        ORDER BY lo_prioridade, ut_prioridade
        LIMIT 1`,
        [usuario]
      );

      if (cartas_pausadas != null) {
        return cartas_pausadas;
      }

      let prioridade_operador = await t.oneOrNone(
        `SELECT id
        FROM (
        SELECT ee.id, ee.etapa_id, ee.unidade_trabalho_id, ee_ant.tipo_situacao_id AS situacao_ant, lo.prioridade AS lo_prioridade, pse.prioridade AS pse_prioridade, ut.prioridade AS ut_prioridade
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
          WHERE ee.tipo_situacao_id in (1,2,3,4)
        ) 
        AS ee_ant ON ee_ant.unidade_trabalho_id = ee.unidade_trabalho_id AND ee_ant.subfase_id = se.subfase_id
        AND se.ordem > ee_ant.ordem
        WHERE ut.disponivel IS TRUE AND ppo.usuario_id = $1 AND ee.tipo_situacao_id = 1
        AND ee.id NOT IN
        (
          SELECT a.id FROM macrocontrole.atividade AS a
          INNER JOIN macrocontrole.perfil_producao_etapa AS ppe ON ppe.etapa_id = a.etapa_id
          INNER JOIN macrocontrole.perfil_producao_operador AS ppo ON ppo.perfil_producao_id = ppe.perfil_producao_id
          INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
          INNER JOIN macrocontrole.pre_requisito_subfase AS prs ON prs.subfase_posterior_id = ut.subfase_id
          INNER JOIN macrocontrole.unidade_trabalho AS ut_re ON ut_re.subfase_id = prs.subfase_anterior_id
          INNER JOIN macrocontrole.atividade AS a_re ON a_re.unidade_trabalho_id = ut_re.id
          WHERE ppo.usuario_id = $1 AND prs.tipo_pre_requisito_id = 1 AND 
          ut.geom && ut_re.geom AND
          st_relate(ut.geom, ut_re.geom, '2********') AND
          a_re.tipo_situacao_id IN (1, 2, 3) AND a.tipo_situacao_id = 1
        )
        AND ee.id NOT IN
        (
          SELECT a.id FROM macrocontrole.atividade AS a
          INNER JOIN macrocontrole.perfil_producao_etapa AS ppe ON ppe.etapa_id = a.etapa_id
          INNER JOIN macrocontrole.perfil_producao_operador AS ppo ON ppo.perfil_producao_id = ppe.perfil_producao_id
          INNER JOIN macrocontrole.etapa AS et ON et.id = a.etapa_id
          INNER JOIN macrocontrole.subfase AS sub ON sub.id = et.subfase_id
          INNER JOIN macrocontrole.fase AS fa ON fa.id = sub.fase_id
          INNER JOIN dgeo.usuario AS u ON u.id = ppo.usuario_id
          INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
          INNER JOIN macrocontrole.restricao_etapa AS re ON re.etapa_posterior_id = a.etapa_id
          INNER JOIN macrocontrole.etapa AS et_re ON et_re.id = re.etapa_anterior_id AND et_re.subfase_id != et.subfase_id
          INNER JOIN macrocontrole.subfase AS sub_re ON sub_re.id = et_re.subfase_id
          INNER JOIN macrocontrole.fase AS fa_re ON fa_re.id = sub_re.fase_id AND fa_re.linha_producao_id = fa.linha_producao_id
          INNER JOIN macrocontrole.atividade AS a_re ON a_re.etapa_id = et_re.id
          INNER JOIN dgeo.usuario AS u_re ON u_re.id = a_re.usuario_id
          INNER JOIN macrocontrole.unidade_trabalho AS ut_re ON ut_re.id = a_re.unidade_trabalho_id AND ut.geom && ut_re.geom AND st_relate(ut.geom, ut_re.geom, '2********')
          WHERE ppo.usuario_id = $1 AND (
              (re.tipo_restricao_id = 1 AND a_re.usuario_id = $1) OR
              (re.tipo_restricao_id = 2 AND a_re.usuario_id != $1) OR 
              (re.tipo_restricao_id = 3 AND u_re.tipo_turno_id != u.tipo_turno_id AND u_re.tipo_turno_id != 3 AND u.tipo_turno_id != 3)
          ) AND a_re.tipo_situacao_id in (1,2,3,4)  AND a.tipo_situacao_id = 1
        )
        AND ee.id NOT IN
        (
          SELECT ee.id FROM macrocontrole.atividade AS ee
          INNER JOIN macrocontrole.perfil_producao_etapa AS pse ON pse.etapa_id = ee.etapa_id
          INNER JOIN macrocontrole.perfil_producao_operador AS ppo ON ppo.perfil_producao_id = pse.perfil_producao_id
          INNER JOIN macrocontrole.etapa AS et ON et.id = ee.etapa_id
          INNER JOIN dgeo.usuario AS u ON u.id = ppo.usuario_id
          INNER JOIN macrocontrole.restricao_etapa AS re ON re.etapa_posterior_id = ee.etapa_id
          INNER JOIN macrocontrole.atividade AS ee_re ON ee_re.etapa_id = re.etapa_anterior_id
            AND ee_re.unidade_trabalho_id = ee.unidade_trabalho_id
          INNER JOIN macrocontrole.etapa AS et_re ON et_re.id = ee_re.etapa_id
          INNER JOIN dgeo.usuario AS u_re ON u_re.id = ee_re.usuario_id
          WHERE ppo.usuario_id = $1 AND et_re.subfase_id = et.subfase_id AND (
            (re.tipo_restricao_id = 1 AND ee_re.usuario_id = $1) OR
            (re.tipo_restricao_id = 2 AND ee_re.usuario_id != $1) OR 
            (re.tipo_restricao_id = 3 AND u_re.tipo_turno_id != u.tipo_turno_id AND u_re.tipo_turno_id != 3 AND u.tipo_turno_id != 3)
          ) AND ee_re.tipo_situacao_id in (1,2,3,4) AND ee.tipo_situacao_id = 1
        )
        AND ee.id NOT IN
        (
          SELECT atividade_id FROM macrocontrole.fila_prioritaria
        )
        AND ee.id NOT IN
        (
          SELECT atividade_id FROM macrocontrole.fila_prioritaria_grupo
        )
        ) AS sit
        GROUP BY id, lo_prioridade, pse_prioridade, ut_prioridade
        HAVING MIN(situacao_ant) IS NULL OR every(situacao_ant IN (4)) 
        ORDER BY lo_prioridade, pse_prioridade, ut_prioridade
        LIMIT 1`,
        [usuario]
      );

      if (prioridade_operador) {
        return prioridade_operador;
      }

      return null;
    })
    .then(prioridade => {
      return { erro: null, prioridade: prioridade };
    })
    .catch(error => {
      const err = new Error("Falha durante calculo da fila.");
      err.status = 500;
      err.context = "distribuicao_ctrl";
      err.information = {};
      err.information.usuario_id = usuario;
      err.information.trace = serializeError(error)
      return { erro: err, prioridade: null };
    });
};

controller.dados_producao = async atividade_id => {
  return db
    .task(async t => {
      let dadosut = await t.one(
        `SELECT ee.unidade_trabalho_id, ee.etapa_id, u.id as usuario_id, u.nome_guerra, s.id as subfase_id, s.nome as subfase_nome, ut.epsg, 
        ST_ASEWKT(ST_Transform(ut.geom,ut.epsg::integer)) as unidade_trabalho_geom,
        ut.nome as unidade_trabalho_nome, bd.nome AS nome_bd, bd.servidor, bd.porta, e.code as etapa_code, e.nome as etapa_nome, ee.observacao as observacao_atividade,
        se.observacao AS observacao_etapa, ut.observacao AS observacao_unidade_trabalho, s.observacao AS observacao_subfase
        FROM macrocontrole.atividade as ee
        INNER JOIN macrocontrole.etapa as se ON se.id = ee.etapa_id
        INNER JOIN dominio.tipo_etapa as e ON e.code = se.tipo_etapa_id
        INNER JOIN macrocontrole.subfase as s ON s.id = se.subfase_id
        INNER JOIN macrocontrole.unidade_trabalho as ut ON ut.id = ee.unidade_trabalho_id
        LEFT JOIN macrocontrole.banco_dados AS bd ON bd.id = ut.banco_dados_id
        LEFT JOIN dgeo.usuario AS u ON u.id = ee.usuario_id
        WHERE ee.id = $1`,
        [atividade_id]
      );

      const info = {};
      info.usuario_id = dadosut.usuario_id;
      info.usuario = dadosut.nome_guerra;
      info.atividade = {};

      let camadas;
      let atributos;
      let menus;

      if (dadosut.etapa_code == 1 || dadosut.etapa_code == 4) {
        camadas = await t.any(
          `SELECT c.schema, c.nome, c.alias, c.documentacao, pc.escala_trabalho, pc.atributo_filtro_subfase
          FROM macrocontrole.perfil_propriedades_camada AS pc
          INNER JOIN macrocontrole.camada AS c ON c.id = pc.camada_id
          WHERE pc.subfase_id = $1 and not pc.camada_apontamento`,
          [dadosut.subfase_id]
        );
        atributos = await t.any(
          `SELECT a.nome, a.alias, c.nome as camada, c.schema
          FROM macrocontrole.atributo AS a
          INNER JOIN macrocontrole.perfil_propriedades_camada AS pc ON pc.camada_id = a.camada_id
          INNER JOIN macrocontrole.camada AS c ON c.id = pc.camada_id
          WHERE pc.subfase_id = $1 and not pc.camada_apontamento`,
          [dadosut.subfase_id]
        );
      } else {
        camadas = await t.any(
          `SELECT c.schema, c.nome, c.alias, c.documentacao, pc.escala_trabalho, pc.atributo_filtro_subfase, pc.camada_apontamento, pc.atributo_justificativa_apontamento, pc.atributo_situacao_correcao
          FROM macrocontrole.perfil_propriedades_camada AS pc
          INNER JOIN macrocontrole.camada AS c ON c.id = pc.camada_id
          WHERE pc.subfase_id = $1`,
          [dadosut.subfase_id]
        );
        atributos = await t.any(
          `SELECT a.nome, a.alias, c.nome as camada, c.schema
          FROM macrocontrole.atributo AS a
          INNER JOIN macrocontrole.perfil_propriedades_camada AS pc ON pc.camada_id = a.camada_id
          INNER JOIN macrocontrole.camada AS c ON c.id = pc.camada_id
          WHERE pc.subfase_id = $1`,
          [dadosut.subfase_id]
        );
      }

      if (dadosut.etapa_code == 2) {
        menus = await t.any(
          `SELECT mp.nome, mp.definicao_menu, mp.ordem_menu FROM macrocontrole.perfil_menu AS pm
          INNER JOIN dgeo.layer_menus AS mp On mp.nome = pm.nome
          WHERE subfase_id = $1`,
          [dadosut.subfase_id]
        );
      } else {
        menus = await t.any(
          `SELECT mp.nome, mp.definicao_menu, mp.ordem_menu FROM macrocontrole.perfil_menu AS pm
          INNER JOIN dgeo.layer_menus AS mp On mp.nome = pm.nome
          WHERE subfase_id = $1 and not menu_revisao`,
          [dadosut.subfase_id]
        );
      }

      let estilos = await t.any(
        `SELECT ls.f_table_schema, ls.f_table_name, ls.f_geometry_column, ls.stylename, ls.styleqml, ls.ui FROM macrocontrole.perfil_estilo AS pe
        INNER JOIN dgeo.layer_styles AS ls ON ls.stylename = pe.nome
        INNER JOIN macrocontrole.camada AS c ON c.nome = ls.f_table_name AND c.schema = ls.f_table_schema
        INNER JOIN macrocontrole.perfil_propriedades_camada AS pc ON pc.camada_id = c.id
        WHERE pe.subfase_id = $1 AND pc.subfase_id = $1`,
        [dadosut.subfase_id]
      );

      let regras = await t.any(
        `SELECT lr.tipo_regra, lr.schema, lr.camada, lr.atributo, lr.regra, lr.grupo_regra, lr.cor_rgb, lr.descricao, lr.ordem FROM macrocontrole.perfil_regras as pr
        INNER JOIN dgeo.layer_rules AS lr ON lr.grupo_regra = pr.nome
        INNER JOIN macrocontrole.camada AS c ON c.nome = lr.camada AND c.schema = lr.schema
        INNER JOIN macrocontrole.perfil_propriedades_camada AS pc ON pc.camada_id = c.id
        WHERE pr.subfase_id = $1 AND pc.subfase_id = $1`,
        [dadosut.subfase_id]
      );

      let fme = await t.any(
        "SELECT servidor, porta, rotina, gera_falso_positivo FROM macrocontrole.perfil_fme WHERE subfase_id = $1",
        [dadosut.subfase_id]
      );

      let configuracao = await t.any(
        "SELECT tipo_configuracao_id, parametros FROM macrocontrole.perfil_configuracao_qgis WHERE subfase_id = $1",
        [dadosut.subfase_id]
      );

      let monitoramento = await t.any(
        `SELECT pm.tipo_monitoramento_id, tm.nome as tipo_monitoramento
        FROM macrocontrole.perfil_monitoramento AS pm
        INNER JOIN dominio.tipo_monitoramento AS tm ON tm.code = pm.tipo_monitoramento_id
        WHERE subfase_id = $1`,
        [dadosut.subfase_id]
      );

      let insumos = await t.any(
        `SELECT i.nome, i.caminho, i.epsg, i.tipo_insumo_id, iut.caminho_padrao
        FROM macrocontrole.insumo AS i
        INNER JOIN macrocontrole.insumo_unidade_trabalho AS iut ON i.id = iut.insumo_id
        WHERE iut.unidade_trabalho_id = $1`,
        [dadosut.unidade_trabalho_id]
      );

      let models_qgis = await t.any(
        `SELECT pmq.nome, lqm.descricao, lqm.model_xml, pmq.gera_falso_positivo
        FROM macrocontrole.perfil_model_qgis AS pmq
        INNER JOIN dgeo.layer_qgis_models AS lqm ON pmq.nome = lqm.nome
        WHERE pmq.subfase_id = $1`,
        [dadosut.subfase_id]
      );
      info.atividade.models_qgis = [];
      models_qgis.forEach(r => {
        info.atividade.models_qgis.push({
          nome: r.nome,
          descricao: r.descricao,
          model_xml: r.model_xml,
          gera_falso_positivo: r.gera_falso_positivo
        });
      });

      info.atividade.id = atividade_id;
      info.atividade.epsg = dadosut.epsg;
      info.atividade.observacao_atividade = dadosut.observacao_atividade;
      info.atividade.observacao_etapa = dadosut.observacao_etapa;
      info.atividade.observacao_subfase = dadosut.observacao_subfase;
      info.atividade.observacao_unidade_trabalho =
        dadosut.observacao_unidade_trabalho;
      info.atividade.unidade_trabalho = dadosut.unidade_trabalho_nome;
      info.atividade.geom = dadosut.unidade_trabalho_geom;
      info.atividade.unidade_trabalho_id = dadosut.unidade_trabalho_id;
      info.atividade.etapa_id = dadosut.etapa_id;
      info.atividade.tipo_etapa_id = dadosut.etapa_code;
      info.atividade.nome =
        dadosut.subfase_nome +
        " - " +
        dadosut.etapa_nome +
        " - " +
        dadosut.unidade_trabalho_nome;
      info.atividade.banco_dados = {
        nome: dadosut.nome_bd,
        servidor: dadosut.servidor,
        porta: dadosut.porta
      };

      info.atividade.fme = [];
      fme.forEach(f => {
        info.atividade.fme.push({
          rotina: f.rotina,
          servidor: f.servidor,
          porta: f.porta,
          gera_falso_positivo: f.gera_falso_positivo
        });
      });

      info.atividade.estilos = estilos;
      info.atividade.regras = regras;
      info.atividade.menus = menus;
      info.atividade.configuracoes = configuracao;

      info.atividade.camadas = [];

      camadas.forEach(r => {
        let aux = { nome: r.nome, schema: r.schema };
        if (r.alias) {
          aux.alias = r.alias;
        }
        if (r.documentacao) {
          aux.documentacao = r.documentacao;
        }
        if (r.escala_trabalho) {
          aux.escala_trabalho = r.escala_trabalho;
        }
        if (r.atributo_filtro_subfase) {
          aux.atributo_filtro_subfase = r.atributo_filtro_subfase;
        }
        if (r.camada_apontamento) {
          aux.camada_apontamento = r.camada_apontamento;
          aux.atributo_situacao_correcao = r.atributo_situacao_correcao;
          aux.atributo_justificativa_apontamento =
            r.atributo_justificativa_apontamento;
        }
        let aux_att = [];
        atributos.forEach(a => {
          if (a.camada === r.nome && a.schema === r.schema) {
            aux_att.push({ nome: a.nome, alias: a.alias });
          }
        });
        if (aux_att.length > 0) {
          aux.atributos = aux_att;
        }
        info.atividade.camadas.push(aux);
      });

      info.atividade.monitoramento = {
        id: monitoramento.tipo_monitoramento_id,
        tipo_monitoramento: monitoramento.tipo_monitoramento
      };

      info.atividade.insumos = [];

      insumos.forEach(i => {
        info.atividade.insumos.push({
          nome: i.nome,
          caminho: i.caminho,
          epsg: i.epsg,
          tipo_insumo_id: i.tipo_insumo_id,
          caminho_padrao: i.caminho_padrao
        });
      });

      let perfil_linhagem = await t.oneOrNone(
        "SELECT tipo_exibicao_id FROM macrocontrole.perfil_linhagem WHERE subfase_id = $1 LIMIT 1",
        [dadosut.subfase_id]
      );
      let linhagem;
      if (
        perfil_linhagem &&
        ((perfil_linhagem.tipo_exibicao_id == 2 && dadosut.etapa_code == 2) ||
          perfil_linhagem.tipo_exibicao_id == 3)
      ) {
        linhagem = await t.any(
          `SELECT a_ant.data_inicio, a_ant.data_fim, u.nome_guerra, tpg.nome_abrev AS posto_grad,
          replace(etapa.nome || ' - ' || etapa.numero, 'Execução - 1', 'Execução') as etapa, ts.nome as situacao
          FROM macrocontrole.atividade AS a
          INNER JOIN macrocontrole.atividade AS a_ant ON a_ant.unidade_trabalho_id = a.unidade_trabalho_id
          INNER JOIN (
            SELECT e.nome, se.id, se.ordem,
            rank() OVER (PARTITION BY e.nome ORDER BY se.ordem) as numero 
            FROM dominio.tipo_etapa AS e
            INNER JOIN macrocontrole.etapa AS se ON e.code = se.tipo_etapa_id) AS etapa ON etapa.id = a_ant.etapa_id
          INNER JOIN dominio.tipo_situacao AS ts ON ts.code = a_ant.tipo_situacao_id
          INNER JOIN dgeo.usuario AS u ON u.id = a_ant.usuario_id
          INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
          WHERE a.id = $1
          ORDER BY etapa.ordem, a_ant.data_fim
          `,
          [atividade_id]
        );
      } else {
        linhagem = await t.any(
          `SELECT a_ant.data_inicio, a_ant.data_fim,
          replace(etapa.nome || ' - ' || etapa.numero, 'Execução - 1', 'Execução') as etapa, ts.nome as situacao
          FROM macrocontrole.atividade AS a
          INNER JOIN macrocontrole.atividade AS a_ant ON a_ant.unidade_trabalho_id = a.unidade_trabalho_id
          INNER JOIN (
            SELECT e.nome, se.id, se.ordem,
            rank() OVER (PARTITION BY e.nome ORDER BY se.ordem) as numero 
            FROM dominio.tipo_etapa AS e
            INNER JOIN macrocontrole.etapa AS se ON e.code = se.tipo_etapa_id) AS etapa ON etapa.id = a_ant.etapa_id
          INNER JOIN dominio.tipo_situacao AS ts ON ts.code = a_ant.tipo_situacao_id
          WHERE a.id = $1
          ORDER BY etapa.ordem, a_ant.data_fim
          `,
          [atividade_id]
        );
      }
      linhagem.forEach(r => {
        if (r.data_inicio) {
          r.data_inicio = new Date(r.data_inicio).toLocaleString();
        }
        if (r.data_fim) {
          r.data_fim = new Date(r.data_fim).toLocaleString();
        }
      });

      info.atividade.linhagem = linhagem;

      let requisitos = await t.any(
        `SELECT r.descricao
        FROM macrocontrole.requisito_finalizacao AS r
        WHERE r.subfase_id = $1 ORDER BY r.ordem`,
        [dadosut.subfase_id]
      );
      info.atividade.requisitos = [];
      requisitos.forEach(r => info.atividade.requisitos.push(r.descricao));

      /*
      let questionario = await t.any(
        `SELECT q.nome nome_questionario, p.id AS pergunta_id, p.texto AS pergunta,
        o.id AS opcao_id, o.texto AS opcao
        FROM avaliacao.questionario AS q
        INNER JOIN avaliacao.pergunta AS p ON p.questionario_id = q.id
        INNER JOIN avaliacao.opcao AS o ON o.pergunta_id = p.id
        WHERE q.etapa_id = $1 
        ORDER BY p.ordem, o.ordem`,
        [etapa]
      );
      info.atividade.questionario = {};
      info.atividade.questionario.perguntas = [];
      let perguntas = {};
      questionario.forEach(i => {
        info.atividade.questionario.nome = i.nome_questionario;

        if (!(i.pergunta_id in perguntas)) {
          perguntas[i.pergunta_id] = {
            pergunta_id: i.pergunta_id,
            pergunta: i.pergunta
          };
          perguntas[i.pergunta_id].opcoes = [];
        }

        perguntas[i.pergunta_id].opcoes.push({
          opcao_id: i.opcao_id,
          opcao: i.opcao
        });
      });

      for (let key in perguntas) {
        info.atividade.questionario.perguntas.push(perguntas[key]);
      }
      */

      return info;
    })
    .then(info => {
      return { erro: null, dados: info };
    })
    .catch(error => {
      const err = new Error("Falha durante calculo dos dados de Producao.");
      err.status = 500;
      err.context = "distribuicao_ctrl";
      err.information = {};
      err.information.atividade_id = atividade_id;
      err.information.trace = serializeError(error)
      return { erro: err, dados: null };
    });
};

controller.verifica = async usuario_id => {
  try {
    let em_andamento = await db.oneOrNone(
      `SELECT a.id
      FROM macrocontrole.atividade AS a
      INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
      WHERE a.usuario_id = $1 and ut.disponivel IS TRUE and a.tipo_situacao_id = 2 LIMIT 1`,
      [usuario_id]
    );
    if (em_andamento) {
      await db.none(
        `UPDATE macrocontrole.atividade SET
          tipo_situacao_id = 3 
          WHERE tipo_situacao_id = 2 and usuario_id = $1 and id != $2`,
        [usuario_id, em_andamento.id]
      );
      const { erro, dados } = await controller.dados_producao(em_andamento.id);
      if (erro) {
        return { verificaError: erro, dados: null };
      }
      return { verificaError: null, dados: dados };
    } else {
      return { verificaError: null, dados: null };
    }
  } catch (error) {
    const err = new Error("Falha durante tentativa de verificação.");
    err.status = 500;
    err.context = "distribuicao_ctrl";
    err.information = {};
    err.information.usuario_id = usuario_id;
    err.information.trace = serializeError(error)
    return { verificaError: err, dados: null };
  }
};

controller.finaliza = async (usuario_id, atividade_id, sem_correcao) => {
  const data_fim = new Date();
  try {
    let result = await db.result(
      `UPDATE macrocontrole.atividade SET
      data_fim = $1, tipo_situacao_id = 4, tempo_execucao_microcontrole = macrocontrole.tempo_execucao_microcontrole($2), tempo_execucao_estimativa = macrocontrole.tempo_execucao_estimativa($2)
      WHERE id = $2 and usuario_id = $3 and tipo_situacao_id in (2)`,
      [data_fim, atividade_id, usuario_id]
    );

    if (!result.rowCount || result.rowCount != 1) {
      throw new Error("Erro ao finalizar atividade. Atividade não encontrada.");
    }

    if (sem_correcao) {
      let result = await db.result(
        `DELETE FROM macrocontrole.atividade 
        WHERE id in (
          with prox as (select e.id, lead(e.id, 1) OVER(PARTITION BY e.subfase_id ORDER BY e.ordem) as prox_id
          from macrocontrole.atividade as a
          inner join macrocontrole.etapa as erev on erev.id = a.etapa_id
          inner join macrocontrole.etapa as e on e.subfase_id = erev.subfase_id
          where erev.tipo_etapa_id = 2 and a.id = $1)
          select a.id
          from macrocontrole.atividade as a
          inner join macrocontrole.atividade as arev on arev.unidade_trabalho_id = a.unidade_trabalho_id
          inner join prox as p on p.prox_id = a.etapa_id and p.id = arev.etapa_id
          where arev.id=$1
        )`,
        [atividade_id]
      );

      if (!result.rowCount || result.rowCount != 1) {
        throw new Error("Erro ao bloquear correção.");
      }
    }

    return { finalizaError: null };
  } catch (error) {
    const err = new Error("Falha durante tentativa de finalização.");
    err.status = 500;
    err.context = "distribuicao_ctrl";
    err.information = {};
    err.information.atividade_id = atividade_id;
    err.information.sem_correcao = sem_correcao;
    err.information.trace = serializeError(error)
    return { finalizaError: err };
  }
};

controller.inicia = async usuario_id => {
  const data_inicio = new Date();
  const { erro, prioridade } = await controller.calcula_fila(usuario_id);
  if (erro) {
    return { iniciaError: erro, dados: null };
  }
  if (!prioridade) {
    return { iniciaError: null, dados: null };
  }
  return db
    .tx(async t => {
      await t.none(
        `UPDATE macrocontrole.atividade SET
          tipo_situacao_id = 3 
          WHERE tipo_situacao_id = 2 and usuario_id = $1`,
        [usuario_id]
      );
      await t.none(
        `DELETE FROM macrocontrole.fila_prioritaria
          WHERE atividade_id IN (
          SELECT id from macrocontrole.atividade WHERE id = $1)`,
        [prioridade.id]
      );
      await t.none(
        `DELETE FROM macrocontrole.fila_prioritaria_grupo
          WHERE atividade_id IN (
          SELECT id from macrocontrole.atividade WHERE id = $1)`,
        [prioridade.id]
      );
      let result = await t.result(
        `UPDATE macrocontrole.atividade SET
          data_inicio = $1, tipo_situacao_id = 2, usuario_id = $3
          WHERE id = $2 and tipo_situacao_id IN (1,3)`,
        [data_inicio, prioridade.id, usuario_id]
      );

      if (!result.rowCount) {
        throw new Error("Não pode iniciar a tarefa selecionada para a fila.");
      }

      return result;
    })
    .then(async data => {
      const { erro, dados } = await controller.dados_producao(prioridade.id);
      if (erro) {
        return { iniciaError: erro, dados: null };
      }
      return { iniciaError: null, dados };
    })
    .catch(error => {
      const err = new Error("Falha durante tentativa de inicialização.");
      err.status = 500;
      err.context = "distribuicao_ctrl";
      err.information = {};
      err.information.usuario_id = usuario_id;
      err.information.trace = serializeError(error)
      return { iniciaError, dados: null };
    });
};

controller.responde_questionario = async (atividade_id, respostas) => {
  const data_questionario = new Date();
  try {
    await db.tx(async t => {
      let resposta_questionario = await t.one(
        `
      INSERT INTO avaliacao.resposta_questionario(data, atividade_id) VALUES($1,$2) RETURNING id
      `,
        [data_questionario, atividade_id]
      );
      let queries = [];
      respostas.forEach(r => {
        queries.push(
          t.none(
            `
          INSERT INTO avaliacao.resposta(pergunta_id, opcao_id, resposta_questionario_id) VALUES($1,$2,$3)
          `,
            [r.pergunta_id, r.opcao_id, resposta_questionario.id]
          )
        );
      });
      return await t.batch(queries);
    });
    return { error: null };
  } catch (error) {
    const err = new Error("Falha durante envio do questionário.");
    err.status = 500;
    err.context = "distribuicao_ctrl";
    err.information = {};
    err.information.usuario_id = usuario_id;
    err.information.atividade_id = atividade_id;
    err.information.respostas = respostas;
    err.information.trace = serializeError(error)
    return { error: err };
  }
};

controller.problema_atividade = async (
  atividade_id,
  tipo_problema_id,
  descricao
) => {
  try {
    const data_fim = new Date();
    await db.tx(async t => {
      await t.any(
        `
      UPDATE macrocontrole.atividade SET
      data_fim = $1, tipo_situacao_id = 5, tempo_execucao_microcontrole = macrocontrole.tempo_execucao_microcontrole($2), tempo_execucao_estimativa = macrocontrole.tempo_execucao_estimativa($2)
      WHERE id = $2
      `,
        [data_fim, atividade_id]
      );
      let atividade = await t.one(
        `SELECT etapa_id, unidade_trabalho_id, usuario_id FROM macrocontrole.atividade WHERE id = $1`,
        [atividade_id]
      );

      let new_id = await t.one(
        `
      INSERT INTO macrocontrole.atividade(etapa_id, unidade_trabalho_id, usuario_id, tipo_situacao_id)
      VALUES($1,$2,$3,3) RETURNING id
      `,
        [
          atividade.etapa_id,
          atividade.unidade_trabalho_id,
          atividade.usuario_id
        ]
      );
      await t.any(
        `
      INSERT INTO macrocontrole.problema_atividade(atividade_id, unidade_trabalho_id, tipo_problema_id, descricao, resolvido)
      VALUES($1,$2,$3,$4,FALSE)
      `,
        [new_id.id, atividade.unidade_trabalho_id, tipo_problema_id, descricao]
      );
      await t.any(
        `
        UPDATE macrocontrole.unidade_trabalho SET
        disponivel = FALSE
        WHERE id = $1
        `,
        [atividade.unidade_trabalho_id]
      );
    });
    return { error: null };
  } catch (error) {
    const err = new Error("Falha durante envio do problema da atividade.");
    err.status = 500;
    err.context = "distribuicao_ctrl";
    err.information = {};
    err.information.atividade_id = atividade_id;
    err.information.tipo_problema_id = tipo_problema_id;
    err.information.descricao = descricao;
    err.information.trace = serializeError(error)
    return { error: err };
  }
};

controller.get_tipo_problema = async () => {
  try {
    let tipo_problema = await db.any(
      `SELECT code, nome
      FROM dominio.tipo_problema`
    );
    let dados = [];
    tipo_problema.forEach(p => {
      dados.push({ tipo_problema_id: p.code, tipo_problema: p.nome });
    });
    return { error: null, dados: dados };
  } catch (error) {
    const err = new Error("Falha durante tentativa de retornar tipo problema.");
    err.status = 500;
    err.context = "distribuicao_ctrl";
    err.information = {};
    err.information.trace = serializeError(error)
    return { error: err, dados: null };
  }
};

module.exports = controller;
