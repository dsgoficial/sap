'use strict'

const {format} = require('date-fns');

const { db } = require('../database')

const { AppError, httpCode } = require('../utils')

const controller = {}


controller.getInfoSubfaseLote = async (subfaseId, loteId) => {
  const atividades = db.sapConn.any(
    `SELECT a.etapa_id, e.ordem AS etapa_ordem, te.nome AS etapa_nome, a.tipo_situacao_id, a.data_inicio, a.data_fim
    FROM macrocontrole.atividade AS a
    INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
    INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
    INNER JOIN dominio.tipo_etapa AS te ON te.code = e.tipo_etapa_id
    WHERE ut.subfase_id = $<subfaseId> AND ut.lote_id = $<loteId> AND a.tipo_situacao_id != 5
    ORDER BY e.ordem
    `,
    {subfaseId, loteId}
  )
  const estatisticas = {}

  atividades.forEach(a => {
    if(!(a.etapa_id in estatisticas)){
      estatisticas[a.etapa_id] = {}
      estatisticas[a.etapa_id].nome = a.etapa_nome
      estatisticas[a.etapa_id].atividades_em_execucao = 0
      estatisticas[a.etapa_id].atividades_pausadas = 0
      estatisticas[a.etapa_id].atividades_restantes = 0
      estatisticas[a.etapa_id].atividades_finalizadas = 0
      estatisticas[a.etapa_id].atividades_finalizadas_hoje = 0
      estatisticas[a.etapa_id].atividades_finalizadas_semana = 0
    }

    if(a.tipo_situacao === 2){
      estatisticas[a.etapa_id].atividades_em_execucao += 1
    }
    if(a.tipo_situacao === 3){
      estatisticas[a.etapa_id].atividades_pausadas += 1
    }
    if(a.tipo_situacao === 1){
      estatisticas[a.etapa_id].atividades_restantes += 1
    }
    const dataFim = format(a.data_fim,'dd.MM.yyyy')
    const hoje = format(new Date(),'dd.MM.yyyy')
    const semanaFim = format(dataFim,'I.yyyy')
    const semana = format(hoje,'I.yyyy')

    if(a.tipo_situacao === 4){
      estatisticas[a.etapa_id].atividades_finalizada += 1
    }

    if(a.tipo_situacao === 4 && dataFim === hoje){
      estatisticas[a.etapa_id].atividades_finalizadas_hoje += 1
    }

    if(a.tipo_situacao === 4 && semanaFim === semana){
      estatisticas[a.etapa_id].atividades_finalizadas_semana += 1
    }
  })

  return estatisticas
}

controller.getInfoLote = async loteId => {
  const atividades = db.sapConn.any(
    `SELECT p.id, s.fase_id, f.ordem AS fase_ordem, tf.nome AS fase_nome, min(a.data_inicio) as data_inicio, 
    (CASE WHEN count(*) - count(a.data_fim) = 0 THEN max(a.data_fim) ELSE NULL END) AS data_fim
    FROM macrocontrole.produto AS p
    INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.lote_id = p.lote_id AND ut.geom && p.geom AND st_relate(ut.geom, p.geom, ''2********'')
    INNER JOIN macrocontrole.subfase AS s ON ut.subfase_id = s.id
    INNER JOIN macrocontrole.fase AS f on f.id = s.fase_id
    INNER JOIN dominio.tipo_fase AS tf on tf.code = f.tipo_fase_id
    INNER JOIN macrocontrole.atividade ON a.unidade_trabalho_id = ut.id
    WHERE p.lote_id = $<loteId> AND a.tipo_situacao_id != 5
    GROUP BY p.id, s.fase_id, f.ordem, tf.nome
    ORDER BY f.ordem
    `,
    {loteId}
  )
  const estatisticas = {}

  atividades.forEach(a => {
    if(!(a.fase_id in estatisticas)){
      estatisticas[a.fase_id] = {}
      estatisticas[a.fase_id].nome = a.fase_nome
      estatisticas[a.fase_id].atividades_finalizadas = 0
      estatisticas[a.fase_id].atividades_em_execucao = 0
      estatisticas[a.fase_id].atividades_restantes = 0
      estatisticas[a.fase_id].atividades_finalizadas_semana = 0
      estatisticas[a.fase_id].atividades_finalizadas_mes = 0
    }

    if(a.data_inicio && a.data_fim){
      estatisticas[a.fase_id].atividades_finalizadas += 1
    }
    if(a.data_inicio && !a.data_fim){
      estatisticas[a.fase_id].atividades_em_execucao += 1
    }
    if(!a.data_inicio && !a.data_fim){
      estatisticas[a.fase_id].atividades_restantes += 1
    }
    const semanaFim = format(a.data_fim,'I.yyyy')
    const semana = format(new Date(),'I.yyyy')
    const mesFim = format(a.data_fim,'M.yyyy')
    const mes = format(new Date(),'M.yyyy')

    if(a.data_inicio && a.data_fim && semanaFim === semana){
      estatisticas[a.fase_id].atividades_finalizada_semana += 1
    }
    if(a.data_inicio && a.data_fim && mesFim === mes){
      estatisticas[a.fase_id].atividades_finalizadas_mes += 1
    }
  })

  return estatisticas
}


controller.usuariosSemAtividade = async () => {
  return db.sapConn.any(
    `SELECT u.id AS usuario_id, tpg.nome_abrev || ' ' || u.nome_guerra as usuario, tt.nome AS turno
    FROM dgeo.usuario AS u
    INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
    INNER JOIN dominio.tipo_turno AS tt ON tt.code = u.tipo_turno_id
    LEFT JOIN 
    (
      SELECT id, usuario_id 
      FROM macrocontrole.atividade AS ee 
      WHERE ee.tipo_situacao_id = 2
      ) AS ee
    ON ee.usuario_id = u.id
    WHERE ee.id IS NULL AND u.ativo IS TRUE
    ORDER BY u.nome_guerra;
    `
  )
}
controller.ultimosLogin = async () => {
  return db.sapConn.any(
    `SELECT u.id AS usuario_id, tpg.nome_abrev || ' ' || u.nome_guerra as usuario, tt.nome AS turno, l.data_login
    FROM dgeo.usuario AS u
    INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
    INNER JOIN dominio.tipo_turno AS tt ON tt.code = u.tipo_turno_id
    INNER JOIN
    (SELECT usuario_id, max(data_login) as data_login FROM acompanhamento.login GROUP BY usuario_id) AS l
    ON l.usuario_id = u.id
    WHERE u.ativo IS TRUE
    ORDER BY l.data_login DESC;
    `
  )
}

controller.usuariosLogadosHoje = async () => {
  return db.sapConn.any(
    `SELECT u.id AS usuario_id, tpg.nome_abrev || ' ' || u.nome_guerra as usuario, tt.nome AS turno, l.data_ultimo_login
    FROM dgeo.usuario AS u
    INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
    INNER JOIN dominio.tipo_turno AS tt ON tt.code = u.tipo_turno_id
    INNER JOIN
    (SELECT usuario_id, max(data_login) as data_ultimo_login FROM acompanhamento.login GROUP BY usuario_id) AS l
    ON l.usuario_id = u.id
    WHERE l.data_ultimo_login::date = now()::date
    ORDER BY l.data_ultimo_login DESC;
    `
  )
}

controller.usuariosNaoLogadosHoje = async () => {
  return db.sapConn.any(
    `SELECT u.id AS usuario_id, tpg.nome_abrev || ' ' || u.nome_guerra as usuario, tt.nome AS turno, l.data_login
    FROM dgeo.usuario AS u
    INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
    INNER JOIN dominio.tipo_turno AS tt ON tt.code = u.tipo_turno_id
    INNER JOIN
    (SELECT usuario_id, max(data_login) as data_login FROM acompanhamento.login GROUP BY usuario_id) AS l
    ON l.usuario_id = u.id
    WHERE u.ativo IS TRUE and l.data_login::date != now()::date
    ORDER BY l.data_login DESC;
    `
  )
}

controller.quantitativoFilaDistribuicao = async () => {
  return db.sapConn.any(
    `SELECT ROW_NUMBER () OVER (ORDER BY ativ.perfil_producao_id, ativ.subfase_id, ativ.bloco_id) AS id,
    ativ.perfil_producao_id, pp.nome AS perfil_producao, 
    ativ.subfase_id, s.nome AS subfase,
    ativ.bloco_id, l.nome AS bloco,  count(*) quantidade
    FROM (
    SELECT etapa_id, unidade_trabalho_id, perfil_producao_id, subfase_id, bloco_id
            FROM (
            SELECT ut.bloco_id, se.subfase_id, ppo.perfil_producao_id, ee.etapa_id, ee.unidade_trabalho_id, ee_ant.tipo_situacao_id AS situacao_ant
            FROM macrocontrole.atividade AS ee
            INNER JOIN macrocontrole.perfil_producao_etapa AS pse ON pse.etapa_id = ee.etapa_id
            INNER JOIN macrocontrole.perfil_producao_operador AS ppo ON ppo.perfil_producao_id = pse.perfil_producao_id
            INNER JOIN dgeo.usuario AS u ON u.id = ppo.usuario_id
            INNER JOIN macrocontrole.etapa AS se ON se.id = ee.etapa_id
            INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = ee.unidade_trabalho_id
            INNER JOIN macrocontrole.bloco AS lo ON lo.id = ut.bloco_id
            INNER JOIN macrocontrole.lote AS l ON l.id = ut.lote_id
            INNER JOIN macrocontrole.perfil_projeto_operador AS pproj ON pproj.projeto_id = l.projeto_id AND pproj.usuario_id = ppo.usuario_id
            LEFT JOIN
            (
              SELECT ee.tipo_situacao_id, ee.unidade_trabalho_id, se.ordem, se.subfase_id FROM macrocontrole.atividade AS ee
              INNER JOIN macrocontrole.etapa AS se ON se.id = ee.etapa_id
              WHERE ee.tipo_situacao_id in (1,2,3,4)
            ) 
            AS ee_ant ON ee_ant.unidade_trabalho_id = ee.unidade_trabalho_id AND ee_ant.subfase_id = se.subfase_id
            AND se.ordem > ee_ant.ordem
            WHERE ut.disponivel IS TRUE AND ee.tipo_situacao_id = 1
            AND a.id NOT IN
            (
              SELECT a.id FROM macrocontrole.atividade AS a
              INNER JOIN macrocontrole.perfil_producao_etapa AS ppe ON ppe.etapa_id = a.etapa_id
              INNER JOIN macrocontrole.perfil_producao_operador AS ppo ON ppo.perfil_producao_id = ppe.perfil_producao_id
              INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
              INNER JOIN macrocontrole.lote AS l ON l.id = ut.lote_id
              INNER JOIN macrocontrole.perfil_projeto_operador AS pproj ON pproj.projeto_id = l.projeto_id AND pproj.usuario_id = ppo.usuario_id
              INNER JOIN macrocontrole.pre_requisito_subfase AS prs ON prs.subfase_posterior_id = ut.subfase_id
              INNER JOIN macrocontrole.unidade_trabalho AS ut_re ON ut_re.subfase_id = prs.subfase_anterior_id
              INNER JOIN macrocontrole.atividade AS a_re ON a_re.unidade_trabalho_id = ut_re.id
              WHERE ppo.usuario_id = $1 AND prs.tipo_pre_requisito_id = 1 AND 
              ut.geom && ut_re.geom AND
              st_relate(ut.geom, ut_re.geom, '2********') AND
              a_re.tipo_situacao_id IN (1, 2, 3) AND a.tipo_situacao_id = 1
            )
            AND a.id NOT IN
            (
              SELECT a.id FROM macrocontrole.atividade AS a
              INNER JOIN macrocontrole.perfil_producao_etapa AS ppe ON ppe.etapa_id = a.etapa_id
              INNER JOIN macrocontrole.perfil_producao_operador AS ppo ON ppo.perfil_producao_id = ppe.perfil_producao_id
              INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
              INNER JOIN macrocontrole.lote AS l ON l.id = ut.lote_id
              INNER JOIN macrocontrole.perfil_projeto_operador AS pproj ON pproj.projeto_id = l.projeto_id AND pproj.usuario_id = ppo.usuario_id
              INNER JOIN macrocontrole.pre_requisito_subfase AS prs ON prs.subfase_posterior_id = ut.subfase_id
              INNER JOIN macrocontrole.unidade_trabalho AS ut_re ON ut_re.subfase_id = prs.subfase_anterior_id
              INNER JOIN macrocontrole.atividade AS a_re ON a_re.unidade_trabalho_id = ut_re.id
              WHERE ppo.usuario_id = $1 AND prs.tipo_pre_requisito_id = 2 AND 
              ut.geom && ut_re.geom AND
              st_relate(ut.geom, ut_re.geom, '2********') AND
              a_re.tipo_situacao_id IN (2) AND a.tipo_situacao_id = 1
            )
            ) AS sit
            GROUP BY etapa_id, unidade_trabalho_id, perfil_producao_id, subfase_id, bloco_id
            HAVING MIN(situacao_ant) IS NULL OR every(situacao_ant IN (4))
    ) AS ativ
    INNER JOIN macrocontrole.perfil_producao AS pp ON pp.id = ativ.perfil_producao_id
    INNER JOIN macrocontrole.subfase AS s ON s.id = ativ.subfase_id
    INNER JOIN macrocontrole.bloco AS l ON l.id = ativ.bloco_id
    GROUP BY ativ.perfil_producao_id, l.nome, s.nome, pp.nome, ativ.subfase_id, ativ.bloco_id
    ORDER BY ativ.perfil_producao_id, ativ.subfase_id, ativ.bloco_id;
    `
  )
}

controller.quantitativoAtividades = async () => {
  return db.sapConn.any(
    `SELECT ROW_NUMBER () OVER (ORDER BY ativ.etapa_id, ativ.subfase_id, ativ.bloco_id) AS id, 
    ativ.etapa_id, te.nome as etapa,
    ativ.subfase_id, s.nome as subfase,
    ativ.bloco_id, l.nome as bloco,
    count(*) quantidade
    FROM (
    SELECT etapa_id, unidade_trabalho_id, subfase_id, bloco_id
            FROM (
            SELECT ut.bloco_id, se.subfase_id, ee.etapa_id, ee.unidade_trabalho_id, ee_ant.tipo_situacao_id AS situacao_ant
            FROM macrocontrole.atividade AS ee
            INNER JOIN macrocontrole.etapa AS se ON se.id = ee.etapa_id
            INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = ee.unidade_trabalho_id
            INNER JOIN macrocontrole.bloco AS lo ON lo.id = ut.bloco_id
            INNER JOIN macrocontrole.lote AS l ON l.id = ut.lote_id
            INNER JOIN macrocontrole.perfil_projeto_operador AS pproj ON pproj.projeto_id = l.projeto_id AND pproj.usuario_id = ppo.usuario_id          
            LEFT JOIN
            (
              SELECT ee.tipo_situacao_id, ee.unidade_trabalho_id, se.ordem, se.subfase_id FROM macrocontrole.atividade AS ee
              INNER JOIN macrocontrole.etapa AS se ON se.id = ee.etapa_id
              WHERE ee.tipo_situacao_id in (1,2,3,4)
            ) 
            AS ee_ant ON ee_ant.unidade_trabalho_id = ee.unidade_trabalho_id AND ee_ant.subfase_id = se.subfase_id
            AND se.ordem > ee_ant.ordem
            WHERE ut.disponivel IS TRUE AND ee.tipo_situacao_id = 1
            AND a.id NOT IN
            (
              SELECT a.id FROM macrocontrole.atividade AS a
              INNER JOIN macrocontrole.perfil_producao_etapa AS ppe ON ppe.etapa_id = a.etapa_id
              INNER JOIN macrocontrole.perfil_producao_operador AS ppo ON ppo.perfil_producao_id = ppe.perfil_producao_id
              INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
              INNER JOIN macrocontrole.lote AS l ON l.id = ut.lote_id
              INNER JOIN macrocontrole.perfil_projeto_operador AS pproj ON pproj.projeto_id = l.projeto_id AND pproj.usuario_id = ppo.usuario_id
              INNER JOIN macrocontrole.pre_requisito_subfase AS prs ON prs.subfase_posterior_id = ut.subfase_id
              INNER JOIN macrocontrole.unidade_trabalho AS ut_re ON ut_re.subfase_id = prs.subfase_anterior_id
              INNER JOIN macrocontrole.atividade AS a_re ON a_re.unidade_trabalho_id = ut_re.id
              WHERE ppo.usuario_id = $1 AND prs.tipo_pre_requisito_id = 1 AND 
              ut.geom && ut_re.geom AND
              st_relate(ut.geom, ut_re.geom, '2********') AND
              a_re.tipo_situacao_id IN (1, 2, 3) AND a.tipo_situacao_id = 1
            )
            AND a.id NOT IN
            (
              SELECT a.id FROM macrocontrole.atividade AS a
              INNER JOIN macrocontrole.perfil_producao_etapa AS ppe ON ppe.etapa_id = a.etapa_id
              INNER JOIN macrocontrole.perfil_producao_operador AS ppo ON ppo.perfil_producao_id = ppe.perfil_producao_id
              INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
              INNER JOIN macrocontrole.lote AS l ON l.id = ut.lote_id
              INNER JOIN macrocontrole.perfil_projeto_operador AS pproj ON pproj.projeto_id = l.projeto_id AND pproj.usuario_id = ppo.usuario_id
              INNER JOIN macrocontrole.pre_requisito_subfase AS prs ON prs.subfase_posterior_id = ut.subfase_id
              INNER JOIN macrocontrole.unidade_trabalho AS ut_re ON ut_re.subfase_id = prs.subfase_anterior_id
              INNER JOIN macrocontrole.atividade AS a_re ON a_re.unidade_trabalho_id = ut_re.id
              WHERE ppo.usuario_id = $1 AND prs.tipo_pre_requisito_id = 2 AND 
              ut.geom && ut_re.geom AND
              st_relate(ut.geom, ut_re.geom, '2********') AND
              a_re.tipo_situacao_id IN (2) AND a.tipo_situacao_id = 1
            )
            ) AS sit
            GROUP BY etapa_id, unidade_trabalho_id, subfase_id, bloco_id
            HAVING MIN(situacao_ant) IS NULL OR every(situacao_ant IN (4))
    ) AS ativ
    INNER JOIN macrocontrole.etapa AS e ON e.id = ativ.etapa_id
    INNER JOIN dominio.tipo_etapa AS te ON te.code = e.tipo_etapa_id
    INNER JOIN macrocontrole.subfase AS s ON s.id = ativ.subfase_id
    INNER JOIN macrocontrole.bloco AS l ON l.id = ativ.bloco_id
    GROUP BY ativ.etapa_id, te.nome, s.nome, l.nome, ativ.subfase_id, ativ.bloco_id
    ORDER BY ativ.etapa_id, ativ.subfase_id, ativ.bloco_id;
    `
  )
}

controller.atividadesEmExecucao = async () => {
  return db.sapConn.any(
    `SELECT ROW_NUMBER () OVER (ORDER BY a.data_inicio) AS id, p.nome AS projeto_nome, l.nome AS lote, lp.nome AS linha_producao_nome, tf.nome AS fase_nome, s.nome AS subfase_nome,
    te.nome AS etapa_nome, b.nome AS bloco, ut.id as unidade_trabalho_id, ut.nome AS unidade_trabalho_nome, a.id as atividade_id,
    u.id AS usuario_id, 
    tpg.nome_abrev || ' ' || u.nome_guerra as usuario, tt.nome AS turno,
    a.data_inicio, ut.geom
    FROM macrocontrole.atividade AS a
    INNER JOIN dgeo.usuario AS u ON u.id = a.usuario_id
    INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
    INNER JOIN dominio.tipo_turno AS tt ON tt.code = u.tipo_turno_id
    INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
    INNER JOIN dominio.tipo_etapa AS te ON te.code = e.tipo_etapa_id
    INNER JOIN macrocontrole.unidade_trabalho AS ut ON a.unidade_trabalho_id = ut.id
    INNER JOIN macrocontrole.bloco AS b ON b.id = ut.bloco_id
    INNER JOIN macrocontrole.subfase AS s ON s.id = e.subfase_id
    INNER JOIN macrocontrole.fase AS f ON f.id = s.fase_id
    INNER JOIN dominio.tipo_fase AS tf ON tf.code = f.tipo_fase_id
    INNER JOIN macrocontrole.linha_producao AS lp ON lp.id = f.linha_producao_id
    INNER JOIN macrocontrole.lote AS l ON l.id = ut.lote_id
    INNER JOIN macrocontrole.projeto AS p ON p.id = l.projeto_id
    WHERE a.tipo_situacao_id = 2
    ORDER BY a.data_inicio ASC;
    `
  )
}

controller.ultimasAtividadesFinalizadas = async () => {
  return db.sapConn.any(
    `SELECT ROW_NUMBER () OVER (ORDER BY ee.data_fim DESC) AS id, p.nome AS projeto_nome, l.nome AS lote, lp.nome AS linha_producao_nome, tf.nome AS fase_nome, s.nome AS subfase_nome,
    te.nome AS etapa_nome, b.nome AS bloco, ut.id as unidade_trabalho_id, ut.nome AS unidade_trabalho_nome, ee.id as atividade_id,  u.id AS usuario_id, 
    tpg.nome_abrev || ' ' || u.nome_guerra as usuario, tt.nome AS turno,
    ee.data_inicio, ee.data_fim, ut.geom
    FROM macrocontrole.atividade AS ee
    INNER JOIN dgeo.usuario AS u ON u.id = ee.usuario_id
    INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
    INNER JOIN dominio.tipo_turno AS tt ON tt.code = u.tipo_turno_id
    INNER JOIN macrocontrole.etapa AS e ON e.id = ee.etapa_id
    INNER JOIN dominio.tipo_etapa AS te ON te.code = e.tipo_etapa_id
    INNER JOIN macrocontrole.unidade_trabalho AS ut ON ee.unidade_trabalho_id = ut.id
    INNER JOIN macrocontrole.bloco AS b ON b.id = ut.bloco_id
    INNER JOIN macrocontrole.subfase AS s ON s.id = e.subfase_id
    INNER JOIN macrocontrole.fase AS f ON f.id = s.fase_id
    INNER JOIN dominio.tipo_fase AS tf ON tf.code = f.tipo_fase_id
    INNER JOIN macrocontrole.linha_producao AS lp ON lp.id = f.linha_producao_id
    INNER JOIN macrocontrole.lote AS l ON l.id = ut.lote_id
    INNER JOIN macrocontrole.projeto AS p ON p.id = l.projeto_id
    WHERE ee.tipo_situacao_id = 4
    ORDER BY ee.data_fim DESC
    LIMIT 20;
    `
  )
}

controller.usuariosSemPerfil = async () => {
  return db.sapConn.any(
    `SELECT u.id AS usuario_id, tpg.nome_abrev || ' ' || u.nome_guerra as usuario,
    (CASE 
      WHEN ppo.id IS NULL AND pproj.id IS NULL THEN 'Usuário sem perfil de produção e perfil de projeto' 
      WHEN ppo.id IS NULL THEN 'Usuário sem perfil de produção'
      ELSE 'Usuário sem perfil de projeto'
    END) AS situacao
    FROM dgeo.usuario AS u
    INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
    LEFT JOIN macrocontrole.perfil_producao_operador AS ppo ON ppo.usuario_id = u.id
    LEFT JOIN macrocontrole.perfil_projeto_operador AS pproj ON pproj.usuario_id = u.id
    WHERE ppo.id IS NULL OR pproj.id IS NULL AND u.ativo IS TRUE
    `
  )
}

/*
const fixActivity = (noActivity, minMaxPoints) => {
  const noActivityFixed = {}
  noActivity.forEach((na) => {
    if (!(na.dia in noActivityFixed)) {
      noActivityFixed[na.dia] = []
    }
    noActivityFixed[na.dia].push({
      previous_data: na.previous_data,
      data: na.data
    })
  })

  const activityFixed = {}
  for (const dia of noActivityFixed) {
    for (let i = 0; i < noActivityFixed[dia].length; i++) {
      if (!(dia in activityFixed)) {
        activityFixed[dia] = {}
        activityFixed[dia].data = []
        minMaxPoints.forEach((mm) => {
          if (mm.dia === dia) {
            activityFixed[dia].measure = mm.usuario + ' - ' + mm.dia
            const aux = []
            aux.push(mm.min_data)
            aux.push(1)
            aux.push(noActivityFixed[dia][i].previous_data)
            activityFixed[dia].data.push(aux)
          }
        })
      }
      const aux = []
      aux.push(noActivityFixed[dia][i].previous_data)
      aux.push(0)
      aux.push(noActivityFixed[dia][i].data)
      activityFixed[dia].data.push(aux)
      if (i < noActivityFixed[dia].length - 1) {
        const aux = []
        aux.push(noActivityFixed[dia][i].data)
        aux.push(1)
        aux.push(noActivityFixed[dia][i + 1].previous_data)
        activityFixed[dia].data.push(aux)
      }
      if (i === noActivityFixed[dia].length - 1) {
        minMaxPoints.forEach((mm) => {
          if (mm.dia === dia) {
            if (noActivityFixed[dia][i].data !== mm.max_data) {
              const aux = []
              aux.push(noActivityFixed[dia][i].data)
              aux.push(1)
              aux.push(mm.max_data)
              activityFixed[dia].data.push(aux)
            }
          }
        })
      }
    }
  }
  return activityFixed
}

const activityStatistics = (activityFixed) => {
  for (const dia of activityFixed) {
    const parts = {}
    parts['0'] = []
    parts['1'] = []
    activityFixed[dia].data.forEach((d) => {
      const i = new Date(d[0])
      const f = new Date(d[2])
      const diff = Math.ceil(Math.abs(f.getTime() - i.getTime()) / (1000 * 60))
      parts[d[1]].push(diff)
    })
    activityFixed[dia].statistics = {}
    const active = parts['1'].reduce((a, b) => a + b, 0)
    const notActive = parts['0'].reduce((a, b) => a + b, 0)
    activityFixed[dia].statistics.tempo_total = active + notActive
    activityFixed[dia].statistics.aproveitamento =
      (100 * active) / (active + notActive)
    activityFixed[dia].statistics.media_inatividade =
      notActive / parts['0'].length
    activityFixed[dia].statistics.max_atividade = parts['1'].reduce((a, b) =>
      Math.max(a, b)
    )
    activityFixed[dia].statistics.max_inatividade = parts['0'].reduce((a, b) =>
      Math.max(a, b)
    )
  }
  return activityFixed
}

controller.getAcaoUsuario = async (usuarioId, days) => {
  const noActivity = await db.sapConn.any(
    `
      WITH datas AS (
        SELECT ma.data
        FROM microcontrole.monitoramento_comportamento AS ma
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
    [usuarioId, days]
  )
  const minMaxPoints = await db.sapConn.any(
    `
      SELECT to_char(ma.data::date, 'YYYY-MM-DD') AS dia, to_char(min(ma.data), 'YYYY-MM-DD HH24:MI:00') as min_data, to_char(max(ma.data), 'YYYY-MM-DD HH24:MI:00') as max_data, tpg.nome_abrev || ' ' || u.nome_guerra as usuario
      FROM microcontrole.monitoramento_comportamento AS ma
      INNER JOIN macrocontrole.atividade AS a ON a.id = ma.atividade_id
      INNER JOIN dgeo.usuario AS u ON u.id = a.usuario_id
      INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
      WHERE a.usuario_id = $1 AND ma.data > NOW() - interval '$2:raw day'
      GROUP BY data::date, tpg.nome_abrev , u.nome_guerra
      ORDER BY data::date
      `,
    [usuarioId, days]
  )
  const activityFixed = fixActivity(noActivity, minMaxPoints)

  return activityStatistics(activityFixed)
}

controller.getAcaoEmExecucao = async () => {
  const noActivity = await db.sapConn.any(
    `
      WITH datas AS (
        SELECT a.usuario_id, ma.data
        FROM microcontrole.monitoramento_comportamento AS ma
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
  )
  const minMaxPoints = await db.sapConn.any(
    `
      SELECT u.id AS usuario_id, to_char(ma.data::date, 'YYYY-MM-DD') AS dia, to_char(min(ma.data), 'YYYY-MM-DD HH24:MI:00') as min_data, to_char(max(ma.data), 'YYYY-MM-DD HH24:MI:00') as max_data, tpg.nome_abrev || ' ' || u.nome_guerra as usuario
      FROM microcontrole.monitoramento_comportamento AS ma
      INNER JOIN macrocontrole.atividade AS a ON a.id = ma.atividade_id
      INNER JOIN dgeo.usuario AS u ON u.id = a.usuario_id
      INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
      WHERE a.tipo_situacao_id = 2 AND ma.data::date = NOW()::date
      GROUP BY data::date, u.id, tpg.nome_abrev , u.nome_guerra
      ORDER BY data::date
      `
  )
  const activityFixed = fixActivity(noActivity, minMaxPoints)

  return activityStatistics(activityFixed)
}

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
  )
  if (!camadaExist) {
    throw new AppError(
      'Camada de acompanhamento não encontrada',
      httpCode.BadRequest
    )
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
  )
}

controller.getPerdaRecursoHumano = async (mes) => {
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
  )
}

controller.getTipoPerdaRecursoHumano = async () => {
  return db.sapConn.any(
    'SELECT code, nome FROM dominio.tipo_perda_recurso_humano'
  )
}

controller.criaPerdaRecursoHumano = async (perdaRecursoHumano) => {
  const cs = new db.pgp.helpers.ColumnSet([
    'usuario_id',
    'tipo_perda_recurso_humano_id',
    'horas',
    'data',
    'observacao'
  ])

  const query = db.pgp.helpers.insert(perdaRecursoHumano, cs, {
    table: 'perda_recurso_humano',
    schema: 'macrocontrole'
  })

  return db.sapConn.none(query)
}

controller.getDiasTrabalhados = async (mes) => {
  return db.sapConn.any(
    `
    SELECT DISTINCT l.usuario_id, tpg.nome_abrev || ' ' || u.nome_gerra AS nome_usuario, DATE(l.data_login) AS data
    FROM acompanhamento.login AS l
    INNER JOIN dgeo.usuario AS u ON u.id = l.usuario_id
    INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
    WHERE EXTRACT(MONTH FROM l.data_login) = $<mes>
  `,
    { mes }
  )
}

controller.getInfoProjetos = async (ano, finalizado) => {
  // TODO

  const dados = await db.sapConn.any(
    `
    SELECT DISTINCT l.usuario_id, DATE(l.data_login) AS data
    FROM acompanhamento.login AS l
    WHERE EXTRACT(MONTH FROM l.data_login) = $<mes>
  `,
    { mes }
  )
  
}
*/

module.exports = controller
