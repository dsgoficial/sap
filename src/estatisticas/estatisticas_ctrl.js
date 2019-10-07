"use strict";

const pgp = require("pg-promise")();

const { db } = require("../database");
const { serializeError } = require("serialize-error");

const controller = {};

const fix_activity = (no_activity, min_max_points) => {
  let no_activity_fixed = {};
  no_activity.forEach(na => {
    if (!(na.dia in no_activity_fixed)) {
      no_activity_fixed[na.dia] = [];
    }
    no_activity_fixed[na.dia].push({
      previous_data: na.previous_data,
      data: na.data
    });
  });

  let activity_fixed = {};
  for (let dia in no_activity_fixed) {
    for (let i = 0; i < no_activity_fixed[dia].length; i++) {
      if (!(dia in activity_fixed)) {
        activity_fixed[dia] = {};
        activity_fixed[dia]["data"] = [];
        min_max_points.forEach(mm => {
          if (mm.dia == dia) {
            activity_fixed[dia]["measure"] = mm.usuario + " - " + mm.dia;
            let aux = [];
            aux.push(mm.min_data);
            aux.push(1);
            aux.push(no_activity_fixed[dia][i].previous_data);
            activity_fixed[dia]["data"].push(aux);
          }
        });
      }
      let aux = [];
      aux.push(no_activity_fixed[dia][i].previous_data);
      aux.push(0);
      aux.push(no_activity_fixed[dia][i].data);
      activity_fixed[dia]["data"].push(aux);
      if (i < no_activity_fixed[dia].length - 1) {
        let aux = [];
        aux.push(no_activity_fixed[dia][i].data);
        aux.push(1);
        aux.push(no_activity_fixed[dia][i + 1].previous_data);
        activity_fixed[dia]["data"].push(aux);
      }
      if (i == no_activity_fixed[dia].length - 1) {
        min_max_points.forEach(mm => {
          if (mm.dia == dia) {
            if (no_activity_fixed[dia][i].data != mm.max_data) {
              let aux = [];
              aux.push(no_activity_fixed[dia][i].data);
              aux.push(1);
              aux.push(mm.max_data);
              activity_fixed[dia]["data"].push(aux);
            }
          }
        });
      }
    }
  }
  return activity_fixed;
};

const activity_statistics = activity_fixed => {
  for (let dia in activity_fixed) {
    let parts = {};
    parts["0"] = [];
    parts["1"] = [];
    activity_fixed[dia]["data"].forEach(d => {
      let i = new Date(d[0]);
      let f = new Date(d[2]);
      let diff = Math.ceil(Math.abs(f.getTime() - i.getTime()) / (1000 * 60));
      parts[d[1]].push(diff);
    });
    activity_fixed[dia]["statistics"] = {};
    let active = parts["1"].reduce((a, b) => a + b, 0);
    let not_active = parts["0"].reduce((a, b) => a + b, 0);
    activity_fixed[dia]["statistics"]["tempo_total"] = active + not_active;
    activity_fixed[dia]["statistics"]["aproveitamento"] =
      (100 * active) / (active + not_active);
    activity_fixed[dia]["statistics"]["media_inatividade"] =
      not_active / parts["0"].length;
    activity_fixed[dia]["statistics"]["max_atividade"] = parts["1"].reduce(
      function(a, b) {
        return Math.max(a, b);
      }
    );
    activity_fixed[dia]["statistics"]["max_inatividade"] = parts["0"].reduce(
      function(a, b) {
        return Math.max(a, b);
      }
    );
  }
  return activity_fixed;
};

get_acao_em_execucao;

controller.get_acao_usuario = async (usuario_id, days) => {
  try {
    let no_activity = await db.any(
      `
      WITH datas AS (
        SELECT ma.data
        FROM microcontrole.monitoramento_acao AS ma
        INNER JOIN macrocontrole.atividade AS a ON a.id = ma.atividade_id
        WHERE a.usuario_id = $1 AND ma.data::date > NOW()::date - interval '$2:raw day'
        ORDER BY data
        )
        , dl AS (
        SELECT data, LAG(data,1) OVER(ORDER BY data) AS previous_data
        FROM datas
        )
        SELECT to_char(data::date, 'YYYY-MM-DD') AS dia, to_char(previous_data, 'YYYY-MM-DD HH24:MI:00') as previous_data, 
        to_char(data, 'YYYY-MM-DD HH24:MI:00') as data
        FROM dl WHERE data IS NOT NULL AND previous_data IS NOT NULL
        AND data::date = previous_data::date AND (60*DATE_PART('hour', data  - previous_data ) + DATE_PART('minute', data - previous_data ) + DATE_PART('seconds', data - previous_data )/60) > 3
        ORDER BY data::date, previous_data;
      `,
      [usuario_id, days]
    );
    let min_max_points = await db.any(
      `
      SELECT to_char(ma.data::date, 'YYYY-MM-DD') AS dia, to_char(min(ma.data), 'YYYY-MM-DD HH24:MI:00') as min_data, to_char(max(ma.data), 'YYYY-MM-DD HH24:MI:00') as max_data, tpg.nome_abrev || ' ' || u.nome_guerra as usuario
      FROM microcontrole.monitoramento_acao AS ma
      INNER JOIN macrocontrole.atividade AS a ON a.id = ma.atividade_id
      INNER JOIN dgeo.usuario AS u ON u.id = a.usuario_id
      INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
      WHERE a.usuario_id = $1 AND ma.data > NOW() - interval '$2:raw day'
      GROUP BY data::date, tpg.nome_abrev , u.nome_guerra
      ORDER BY data::date
      `,
      [usuario_id, days]
    );
    let activity_fixed = fix_activity(no_activity, min_max_points);
    activity_fixed = activity_statistics(activity_fixed);

    return { error: null, dados: activity_fixed };
  } catch (error) {
    const err = new Error(
      "Falha durante retorno dos dados de ação do usuário."
    );
    err.status = 500;
    err.context = "estatisticas_ctrl";
    err.information = {};
    err.information.usuario_id = usuario_id;
    err.information.days = days;
    err.information.trace = serializeError(error);
    return { error: err, dados: null };
  }
};

controller.get_acao_em_execucao = async () => {
  try {
    let no_activity = await db.any(
      `
      WITH datas AS (
        SELECT a.usuario_id, ma.data
        FROM microcontrole.monitoramento_acao AS ma
        INNER JOIN macrocontrole.atividade AS a ON a.id = ma.atividade_id
        WHERE a.tipo_situacao_id = 2 AND ma.data::date = NOW()::date
        ORDER BY data
        )
        , dl AS (
        SELECT usuario_id, data, LAG(data,1) OVER(PARTITION BY usuario_id ORDER BY data) AS previous_data
        FROM datas
        )
        SELECT usuario_id, to_char(data::date, 'YYYY-MM-DD') AS dia, to_char(previous_data, 'YYYY-MM-DD HH24:MI:00') as previous_data, 
        to_char(data, 'YYYY-MM-DD HH24:MI:00') as data
        FROM dl WHERE data IS NOT NULL AND previous_data IS NOT NULL
        AND data::date = previous_data::date AND (60*DATE_PART('hour', data  - previous_data ) + DATE_PART('minute', data - previous_data ) + DATE_PART('seconds', data - previous_data )/60) > 3
        ORDER BY usuario_id, data::date, previous_data;
      `
    );
    let min_max_points = await db.any(
      `
      SELECT u.id AS usuario_id, to_char(ma.data::date, 'YYYY-MM-DD') AS dia, to_char(min(ma.data), 'YYYY-MM-DD HH24:MI:00') as min_data, to_char(max(ma.data), 'YYYY-MM-DD HH24:MI:00') as max_data, tpg.nome_abrev || ' ' || u.nome_guerra as usuario
      FROM microcontrole.monitoramento_acao AS ma
      INNER JOIN macrocontrole.atividade AS a ON a.id = ma.atividade_id
      INNER JOIN dgeo.usuario AS u ON u.id = a.usuario_id
      INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
      WHERE a.tipo_situacao_id = 2 AND ma.data::date = NOW()::date
      GROUP BY data::date, u.id, tpg.nome_abrev , u.nome_guerra
      ORDER BY data::date
      `
    );
    let activity_fixed = fix_activity(no_activity, min_max_points);
    activity_fixed = activity_statistics(activity_fixed);

    return { error: null, dados: activity_fixed };
  } catch (error) {
    const err = new Error(
      "Falha durante retorno dos dados de ação do usuário."
    );
    err.status = 500;
    err.context = "estatisticas_ctrl";
    err.information = {};
    err.information.trace = serializeError(error);
    return { error: err, dados: null };
  }
};
module.exports = controller;
