"use strict";

const { db } = require("../database");

const { AppError, httpCode } = require("../utils");

const controller = {};

const fixActivity = (no_activity, min_max_points) => {
  const no_activity_fixed = {};
  no_activity.forEach(na => {
    if (!(na.dia in no_activity_fixed)) {
      no_activity_fixed[na.dia] = [];
    }
    no_activity_fixed[na.dia].push({
      previous_data: na.previous_data,
      data: na.data
    });
  });

  const activity_fixed = {};
  for (let dia in no_activity_fixed) {
    for (let i = 0; i < no_activity_fixed[dia].length; i++) {
      if (!(dia in activity_fixed)) {
        activity_fixed[dia] = {};
        activity_fixed[dia]["data"] = [];
        min_max_points.forEach(mm => {
          if (mm.dia == dia) {
            activity_fixed[dia]["measure"] = mm.usuario + " - " + mm.dia;
            const aux = [];
            aux.push(mm.min_data);
            aux.push(1);
            aux.push(no_activity_fixed[dia][i].previous_data);
            activity_fixed[dia]["data"].push(aux);
          }
        });
      }
      const aux = [];
      aux.push(no_activity_fixed[dia][i].previous_data);
      aux.push(0);
      aux.push(no_activity_fixed[dia][i].data);
      activity_fixed[dia]["data"].push(aux);
      if (i < no_activity_fixed[dia].length - 1) {
        const aux = [];
        aux.push(no_activity_fixed[dia][i].data);
        aux.push(1);
        aux.push(no_activity_fixed[dia][i + 1].previous_data);
        activity_fixed[dia]["data"].push(aux);
      }
      if (i == no_activity_fixed[dia].length - 1) {
        min_max_points.forEach(mm => {
          if (mm.dia == dia) {
            if (no_activity_fixed[dia][i].data != mm.max_data) {
              const aux = [];
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

const activityStatistics = activity_fixed => {
  for (let dia in activity_fixed) {
    const parts = {};
    parts["0"] = [];
    parts["1"] = [];
    activity_fixed[dia]["data"].forEach(d => {
      const i = new Date(d[0]);
      const f = new Date(d[2]);
      const diff = Math.ceil(Math.abs(f.getTime() - i.getTime()) / (1000 * 60));
      parts[d[1]].push(diff);
    });
    activity_fixed[dia]["statistics"] = {};
    const active = parts["1"].reduce((a, b) => a + b, 0);
    const not_active = parts["0"].reduce((a, b) => a + b, 0);
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

controller.getAcaoUsuario = async (usuario_id, days) => {
  const no_activity = await db.sapConn.any(
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
  const min_max_points = await db.sapConn.any(
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
  const activity_fixed = fixActivity(no_activity, min_max_points);
  activity_fixed = activityStatistics(activity_fixed);

  return activity_fixed;
};

controller.getAcaoEmExecucao = async () => {
  const no_activity = await db.sapConn.any(
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
  const min_max_points = await db.sapConn.any(
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
  const activity_fixed = fixActivity(no_activity, min_max_points);
  activity_fixed = activityStatistics(activity_fixed);

  return activity_fixed;
};

controller.getMvtLinhaProducao = async (nome, x, y, z) => {
  const camadaExist = await db.sapConn.any(
    `
    SELECT EXISTS (
      SELECT 1
      FROM   information_schema.tables 
      WHERE  table_schema = 'acompanhamento'
      AND    table_name = $<nome>
      );
  `,
    { nome }
  );
  if (!camadaExist) {
    throw new AppError(
      "Camada de acompanhamento não encontrada",
      httpCode.BadRequest
    );
  }

  return db.sapConn.one(
    `
  SELECT ST_AsMVT(q, $<nome>, 4096, 'geom')
    FROM (
      SELECT
          c.*,
          ST_AsMVTGeom(
              geom
              BBox($<x>, $<y>, $<z>),
              4096,
              0,
              false
          ) AS geom
      FROM acompanhamento.$<nome:raw> AS c
      WHERE c.geom && BBox($<x>, $<y>, $<z>)
      AND ST_Intersects(c.geom, BBox($<x>, $<y>, $<z>))
    ) q
  `,
    { nome, x, y, z }
  );
};

controller.getPerdaRecursoHumano = async mes => {
  return db.sapConn.any(
    `
    SELECT prh.id, prh.usuario_id, prh.tipo_perda_recurso_humano_id, prh.horas, prh.data, prh.observacao,
    tprh.nome AS tipo_perda_recurso_humano, 
    FROM macrocontrole.perda_recurso_humano AS prh
    INNER JOIN dominio.tipo_perda_recurso_humano AS tprh ON tprh.code = prh.tipo_perda_recurso_humano_id
    INNER JOIN dgeo.usuario AS u ON u.id = prh.usuario_id
    INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
    WHERE EXTRACT(MONTH FROM prh.data) = $<mes>
  `,
    { mes }
  );
};

controller.getTipoPerdaRecursoHumano = async () => {
  return db.sapConn.any(
    `SELECT code, nome FROM dominio.tipo_perda_recurso_humano`
  );
};

controller.criaPerdaRecursoHumano = async perdaRecursoHumano => {
  const table = new db.pgp.helpers.TableName({
    table: "perda_recurso_humano",
    schema: "macrocontrole"
  });

  const cs = new db.pgp.helpers.ColumnSet(
    [
      "usuario_id",
      "tipo_perda_recurso_humano_id",
      "horas",
      "data",
      "observacao"
    ],
    {
      table
    }
  );

  const query = db.pgp.helpers.insert(perdaRecursoHumano, cs);

  db.sapConn.none(query);
};

controller.getDiasTrabalhados = async mes => {
  return db.sapConn.any(
    `
    SELECT DISTINCT l.usuario_id, DATE(l.data_login) AS data
    FROM acompanhamento.login AS l
    WHERE EXTRACT(MONTH FROM l.data_login) = $<mes>
  `,
    { mes }
  );
};

controller.getInfoProjetos = async (ano, finalizado) => {
  //TODO
  const dados = await db.sapConn.any(
    `
    SELECT DISTINCT l.usuario_id, DATE(l.data_login) AS data
    FROM acompanhamento.login AS l
    WHERE EXTRACT(MONTH FROM l.data_login) = $<mes>
  `,
    { mes }
  );
};

module.exports = controller;
