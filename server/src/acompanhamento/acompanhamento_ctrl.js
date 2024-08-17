'use strict'

const { format, subWeeks, subMonths } = require('date-fns');

const { db } = require('../database')

const { AppError, httpCode } = require('../utils')

const controller = {}


controller.getInfoSubfaseLote = async (subfaseId, loteId) => {//Verificar
  const atividades = db.sapConn.any(
    `SELECT a.etapa_id, e.ordem AS etapa_ordem, te.nome AS etapa_nome, a.tipo_situacao_id, a.data_inicio, a.data_fim
    FROM macrocontrole.atividade AS a
    INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
    INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
    INNER JOIN dominio.tipo_etapa AS te ON te.code = e.tipo_etapa_id
    WHERE ut.subfase_id = $<subfaseId> AND ut.lote_id = $<loteId> AND a.tipo_situacao_id != 5
    ORDER BY e.ordem
    `,
    { subfaseId, loteId }
  )
  const estatisticas = {}

  atividades.forEach(a => {
    if (!(a.etapa_id in estatisticas)) {
      estatisticas[a.etapa_id] = {}
      estatisticas[a.etapa_id].nome = a.etapa_nome
      estatisticas[a.etapa_id].atividades_em_execucao = 0
      estatisticas[a.etapa_id].atividades_pausadas = 0
      estatisticas[a.etapa_id].atividades_restantes = 0
      estatisticas[a.etapa_id].atividades_finalizadas = 0
      estatisticas[a.etapa_id].atividades_finalizadas_hoje = 0
      estatisticas[a.etapa_id].atividades_finalizadas_semana = 0
      estatisticas[a.etapa_id].atividades_finalizadas_semana_anterior = 0
    }

    if (a.tipo_situacao === 2) {
      estatisticas[a.etapa_id].atividades_em_execucao += 1
    }
    if (a.tipo_situacao === 3) {
      estatisticas[a.etapa_id].atividades_pausadas += 1
    }
    if (a.tipo_situacao === 1) {
      estatisticas[a.etapa_id].atividades_restantes += 1
    }
    const dataFim = format(a.data_fim, 'dd.MM.yyyy')
    const hoje = format(new Date(), 'dd.MM.yyyy')
    const semanaFim = format(a.data_fim, 'I.yyyy')
    const semana = format(new Date(), 'I.yyyy')
    const semanaAnterior = subWeeks(new Date(), 1)

    if (a.tipo_situacao === 4) {
      estatisticas[a.etapa_id].atividades_finalizada += 1
    }

    if (a.tipo_situacao === 4 && dataFim === hoje) {
      estatisticas[a.etapa_id].atividades_finalizadas_hoje += 1
    }

    if (a.tipo_situacao === 4 && semanaFim === semana) {
      estatisticas[a.etapa_id].atividades_finalizadas_semana += 1
    }

    if (a.tipo_situacao === 4 && semanaFim === semanaAnterior) {
      estatisticas[a.etapa_id].atividades_finalizadas_semana_anterior += 1
    }
  })

  return estatisticas
}

controller.getInfoLote = async loteId => {//Verificar
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
    { loteId }
  )
  const estatisticas = {}

  atividades.forEach(a => {
    if (!(a.fase_id in estatisticas)) {
      estatisticas[a.fase_id] = {}
      estatisticas[a.fase_id].nome = a.fase_nome
      estatisticas[a.fase_id].atividades_finalizadas = 0
      estatisticas[a.fase_id].atividades_em_execucao = 0
      estatisticas[a.fase_id].atividades_restantes = 0
      estatisticas[a.fase_id].atividades_finalizadas_semana = 0
      estatisticas[a.fase_id].atividades_finalizadas_mes = 0
      estatisticas[a.fase_id].atividades_finalizadas_semana_anterior = 0
      estatisticas[a.fase_id].atividades_finalizadas_mes_anterior = 0
    }

    if (a.data_inicio && a.data_fim) {
      estatisticas[a.fase_id].atividades_finalizadas += 1
    }
    if (a.data_inicio && !a.data_fim) {
      estatisticas[a.fase_id].atividades_em_execucao += 1
    }
    if (!a.data_inicio && !a.data_fim) {
      estatisticas[a.fase_id].atividades_restantes += 1
    }
    const semanaFim = format(a.data_fim, 'I.yyyy')
    const semana = format(new Date(), 'I.yyyy')
    const mesFim = format(a.data_fim, 'M.yyyy')
    const mes = format(new Date(), 'M.yyyy')
    const semanaAnterior = subWeeks(new Date(), 1)
    const mesAnterior = subMonths(new Date(), 1)



    if (a.data_inicio && a.data_fim && semanaFim === semana) {
      estatisticas[a.fase_id].atividades_finalizada_semana += 1
    }
    if (a.data_inicio && a.data_fim && mesFim === mes) {
      estatisticas[a.fase_id].atividades_finalizadas_mes += 1
    }

    if (a.data_inicio && a.data_fim && semanaFim === semanaAnterior) {
      estatisticas[a.fase_id].atividades_finalizadas_semana_anterior += 1
    }
    if (a.data_inicio && a.data_fim && mesFim === mesAnterior) {
      estatisticas[a.fase_id].atividades_finalizadas_mes_anterior += 1
    }
  })

  return estatisticas
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

controller.quantitativoFilaDistribuicao = async () => {//Verificar
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

controller.quantitativoAtividades = async () => {//Verificar
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
    a.data_inicio, CURRENT_TIMESTAMP - a.data_inicio AS duracao
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
    ee.data_inicio, ee.data_fim
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
      WHEN ppo.id IS NULL AND pbloco.id IS NULL THEN 'Usuário sem perfil de produção e perfil de bloco' 
      WHEN ppo.id IS NULL THEN 'Usuário sem perfil de produção'
      ELSE 'Usuário sem perfil de bloco'
    END) AS situacao
    FROM dgeo.usuario AS u
    INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
    LEFT JOIN macrocontrole.perfil_producao_operador AS ppo ON ppo.usuario_id = u.id
    LEFT JOIN macrocontrole.perfil_bloco_operador AS pbloco ON pbloco.usuario_id = u.id
    WHERE ppo.id IS NULL OR pbloco.id IS NULL AND u.ativo IS TRUE
    `
  )
}

controller.atividadeUsuarios = async () => {
  return db.sapConn.any(
    `SELECT tpg.nome_abrev || ' ' || u.nome_guerra as usuario, ativ.data_inicio, ativ.etapa, ativ.subfase, ativ.fase, ativ.bloco, ativ.lote, ativ.projeto
    FROM dgeo.usuario AS u 
    LEFT JOIN (
      SELECT a.usuario_id, a.data_inicio, te.nome AS etapa, s.nome AS subfase, 
      tf.nome AS fase, l.nome_abrev AS lote, p.nome_abrev AS projeto, b.nome AS bloco
      FROM macrocontrole.atividade AS a
      INNER JOIN dgeo.usuario AS u ON u.id = a.usuario_id
      INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
      INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
      INNER JOIN dominio.tipo_etapa AS te ON te.code = e.tipo_etapa_id
      INNER JOIN macrocontrole.subfase AS s ON s.id = e.subfase_id
      INNER JOIN macrocontrole.fase AS f ON f.id = s.fase_id
      INNER JOIN dominio.tipo_fase AS tf ON tf.code = f.tipo_fase_id
      INNER JOIN macrocontrole.lote AS l ON l.id = e.lote_id
      INNER JOIN macrocontrole.projeto AS p ON p.id = l.projeto_id
      INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
      INNER JOIN macrocontrole.bloco AS b ON b.id = ut.bloco_id
      WHERE a.tipo_situacao_id = 2
    ) AS ativ ON ativ.usuario_id = u.id
    WHERE u.ativo is TRUE
    ORDER BY ativ.data_inicio;
    `
  )
}

controller.acompanhamentoGrade = async () => {
  const dado_producao = await db.sapConn.any(
    `SELECT a.id AS atividade_id, dp.configuracao_producao, tpg.nome_abrev || ' ' || u.nome_guerra as usuario, a.data_inicio,
    te.nome AS etapa, s.nome AS subfase, tf.nome AS fase, l.nome_abrev AS lote, p.nome_abrev AS projeto, b.nome AS bloco
      FROM macrocontrole.atividade AS a
      INNER JOIN macrocontrole.unidade_trabalho AS ut on ut.id = a.unidade_trabalho_id
      INNER JOIN macrocontrole.dado_producao AS dp ON dp.id = ut.dado_producao_id
      INNER JOIN dgeo.usuario AS u ON u.id = a.usuario_id
      INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
      INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
      INNER JOIN dominio.tipo_etapa AS te ON te.code = e.tipo_etapa_id
      INNER JOIN macrocontrole.subfase AS s ON s.id = e.subfase_id
      INNER JOIN macrocontrole.fase AS f ON f.id = s.fase_id
      INNER JOIN dominio.tipo_fase AS tf ON tf.code = f.tipo_fase_id
      INNER JOIN macrocontrole.lote AS l ON l.id = e.lote_id
      INNER JOIN macrocontrole.projeto AS p ON p.id = l.projeto_id
      INNER JOIN macrocontrole.bloco AS b ON b.id = ut.bloco_id
      WHERE a.tipo_situacao_id = 2 AND dp.tipo_dado_producao_id in (2,3);
      `
  )
  if (!dado_producao) {
    return null
  }
  const grades = []

  for (const info of dado_producao) {
    const servidor = info.configuracao_producao.split(':')[0]
    const porta_banco = info.configuracao_producao.split(':')[1]
    const porta = porta_banco.split('/')[0]
    const banco = porta_banco.split('/')[1]
    const gridConn = await db.createAdminConn(servidor, porta, banco, false)

    try {
      const grade = await gridConn.any(
        `WITH
        xrank AS (
          SELECT 
            id,
            data_atualizacao,
            visited,
            DENSE_RANK() OVER (ORDER BY ST_XMin(geom)) AS j
          FROM public.aux_grid_revisao_a
          WHERE atividade_id = $1
        ),
        yrank AS (
          SELECT 
            id,
            DENSE_RANK() OVER (ORDER BY ST_YMin(geom) DESC) AS i
          FROM public.aux_grid_revisao_a
          WHERE atividade_id = $1
        )
        SELECT 
          x.j,
          y.i,
          x.data_atualizacao,
          x.visited
        FROM xrank AS x
        JOIN yrank AS y ON x.id = y.id
        ORDER BY j,i        
        `, info.atividade_id
      )

      info.grade = grade;

      grades.push(info)

    } catch (error) {
      console.log(error)
    }
  }

  return grades

}

controller.atividadeSubfase = async () => {
  const result = await db.sapConn.any(
    `
    WITH dates AS (
      SELECT generate_series(date_trunc('year', CURRENT_DATE), CURRENT_DATE, '1 day')::date AS day
    ),
    activity_intervals AS (
      SELECT ut.lote_id, ut.subfase_id, a.data_inicio, COALESCE(a.data_fim, NOW()) AS data_fim
      FROM macrocontrole.atividade AS a
      INNER JOIN macrocontrole.unidade_trabalho AS ut On ut.id = a.unidade_trabalho_id
      WHERE a.data_inicio IS NOT NULL
    ),
    activity_days AS (
      SELECT DISTINCT dates.day, activity_intervals.lote_id, activity_intervals.subfase_id
      FROM dates
      INNER JOIN activity_intervals ON dates.day BETWEEN activity_intervals.data_inicio AND activity_intervals.data_fim
      ORDER BY dates.day
    ),
    activity_groups AS (
    SELECT l.nome AS lote, s.nome AS subfase, array_agg(array[ad.day::text, 1::text, (ad.day + INTERVAL '1 day')::date::text]) AS data, MIN(ad.day) AS min_date
    FROM activity_days AS ad
    INNER JOIN macrocontrole.lote AS l ON l.id = ad.lote_id
    INNER JOIN macrocontrole.subfase AS s ON s.id = ad.subfase_id
    GROUP BY lote, subfase
    )
    SELECT lote, subfase, data
    FROM activity_groups
    ORDER BY lote, min_date;
  `)

  let today = new Date();
  function* dateGenerator() {
    let date = new Date(today.getFullYear(), 0, 1);  // Start from January 1st
    while (date <= today) {
      yield date.toISOString().split('T')[0];
      date.setDate(date.getDate() + 1);  // Move to next day
    }
  }

  result.forEach(d => {

    let fixed = [];
    let current = d.data.shift();
    let gen = dateGenerator();

    // Loop over all days from January 1st to today
    for (let date of gen) {
      if (current && current[0] === date) {
        // If current date is in our data, add it to the result
        fixed.push(current);
        current = d.data.shift();
      } else {
        // If current date is not in our data, add a placeholder with zero
        let nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        fixed.push([date, 0, nextDate.toISOString().split('T')[0]]);
      }
    }

    // Add any remaining data
    if (current) {
      fixed.push(current);
    }
    d.data = fixed
  })


  result.forEach(d => {
    let fixed = [];
    let current = d.data[0];
    current[1] = parseInt(current[1]); // Convert string to integer

    for (let i = 1; i < d.data.length; i++) {
      d.data[i][1] = parseInt(d.data[i][1]); // Convert string to integer
      if (current[2] === d.data[i][0] && current[1] == d.data[i][1]) {
        current[2] = d.data[i][2];
      } else {
        fixed.push(current);
        current = d.data[i];
      }
    }

    // Push the last range to the result
    fixed.push(current);
    d.data = fixed
  })

  return result

}

controller.atividadeUsuario = async () => {
  const result = await db.sapConn.any(
    `
    WITH dates AS (
      SELECT generate_series(date_trunc('year', CURRENT_DATE), CURRENT_DATE, '1 day')::date AS day
    ),
    activity_intervals AS (
      SELECT a.usuario_id, a.data_inicio, COALESCE(a.data_fim, NOW()) AS data_fim
      FROM macrocontrole.atividade AS a
      WHERE a.data_inicio IS NOT NULL
    ),
    activity_days AS (
      SELECT DISTINCT dates.day, activity_intervals.usuario_id
      FROM dates
      INNER JOIN activity_intervals ON dates.day BETWEEN activity_intervals.data_inicio AND activity_intervals.data_fim
      ORDER BY dates.day
    ),
    activity_groups AS (
    SELECT tpg.nome_abrev || ' ' || u.nome_guerra as usuario, array_agg(array[ad.day::text, 1::text, (ad.day + INTERVAL '1 day')::date::text]) AS data, MIN(ad.day) AS min_date
    FROM activity_days AS ad
    INNER JOIN dgeo.usuario AS u ON u.id = ad.usuario_id
    INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
    GROUP BY usuario
    )
    SELECT usuario, data
    FROM activity_groups
    ORDER BY usuario, min_date;
  `)

  let today = new Date();
  function* dateGenerator() {
    let date = new Date(today.getFullYear(), 0, 1);  // Start from January 1st
    while (date <= today) {
      yield date.toISOString().split('T')[0];
      date.setDate(date.getDate() + 1);  // Move to next day
    }
  }

  result.forEach(d => {

    let fixed = [];
    let current = d.data.shift();
    let gen = dateGenerator();

    // Loop over all days from January 1st to today
    for (let date of gen) {
      if (current && current[0] === date) {
        // If current date is in our data, add it to the result
        fixed.push(current);
        current = d.data.shift();
      } else {
        // If current date is not in our data, add a placeholder with zero
        let nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        fixed.push([date, 0, nextDate.toISOString().split('T')[0]]);
      }
    }

    // Add any remaining data
    if (current) {
      fixed.push(current);
    }
    d.data = fixed
  })


  result.forEach(d => {
    let fixed = [];
    let current = d.data[0];
    current[1] = parseInt(current[1]); // Convert string to integer

    for (let i = 1; i < d.data.length; i++) {
      d.data[i][1] = parseInt(d.data[i][1]); // Convert string to integer
      if (current[2] === d.data[i][0] && current[1] == d.data[i][1]) {
        current[2] = d.data[i][2];
      } else {
        fixed.push(current);
        current = d.data[i];
      }
    }

    // Push the last range to the result
    fixed.push(current);
    d.data = fixed
  })

  return result

}

controller.situacaoSubfase = async () => {
  return await db.sapConn.any(
    `
    WITH finalizadas AS 
    (
      SELECT ut.bloco_id, ut.subfase_id, COUNT(a.tipo_situacao_id) AS finalizadas
    FROM macrocontrole.atividade AS a
    INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
    WHERE a.tipo_situacao_id = 4
    GROUP BY ut.bloco_id, ut.subfase_id
    ),
    nao_finalizadas AS (
    SELECT ut.bloco_id, ut.subfase_id, COUNT(a.tipo_situacao_id) AS nao_finalizadas
    FROM macrocontrole.atividade AS a
    INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
    WHERE a.tipo_situacao_id not in (4,5)
    GROUP BY ut.bloco_id, ut.subfase_id
    ),
    combined AS (
    SELECT 
        COALESCE(t1.bloco_id, t2.bloco_id) as bloco_id, 
        COALESCE(t1.subfase_id, t2.subfase_id) as subfase_id, 
        t1.finalizadas, 
        t2.nao_finalizadas
    FROM finalizadas t1
    FULL OUTER JOIN nao_finalizadas t2  ON t1.bloco_id = t2.bloco_id AND t1.subfase_id = t2.subfase_id
    )
    SELECT b.nome AS bloco, s.nome AS subfase, c.finalizadas, c.nao_finalizadas
    FROM combined AS c
    INNER JOIN macrocontrole.bloco AS b ON b.id = c.bloco_id
    INNER JOIN macrocontrole.subfase AS s ON s.id = c.subfase_id
    INNER JOIN macrocontrole.lote AS l ON l.id = b.lote_id
    INNER JOIN macrocontrole.projeto AS p ON p.id = l.projeto_id
    WHERE p.finalizado IS FALSE
    ORDER BY b.prioridade,s.ordem
  `,
  )

}


controller.getDadosSiteAcompanhamento = async () => {

  const dados = await db.sapConn.any(
    `
    SELECT p.id AS projeto_id, p.nome AS projeto, p.descricao AS descricao_projeto, l.id AS lote_id, l.nome AS lote, l.descricao AS descricao_lote,
    f.id AS fase_id, 
    json_build_array(json_build_array(ST_XMin(prod.bounds), ST_YMin(prod.bounds)), json_build_array(ST_XMax(prod.bounds), ST_YMax(prod.bounds))) AS bounds
    FROM macrocontrole.projeto AS p
    INNER JOIN macrocontrole.lote AS l ON l.projeto_id = p.id
    INNER JOIN macrocontrole.fase AS f ON f.linha_producao_id = l.linha_producao_id
    INNER JOIN (
      SELECT lote_id, ST_Envelope(ST_Collect(geom)) AS bounds
      FROM macrocontrole.produto
      GROUP BY lote_id
      ) AS prod ON prod.lote_id = l.id
    WHERE p.finalizado IS FALSE
    ORDER BY p.id, l.id, f.ordem;
  `)

  let dados_organizados = {}
  let aux_lotes = {}
  dados.forEach(d => {
    if (!(d.projeto_id in dados_organizados)) {
      dados_organizados[d.projeto_id] = {}
      dados_organizados[d.projeto_id]['lotes'] = []
      aux_lotes[d.projeto_id] = {}
    }
    dados_organizados[d.projeto_id]['title'] = d.projeto
    dados_organizados[d.projeto_id]['description'] = d.descricao_projeto

    if (!(d.lote_id in aux_lotes[d.projeto_id])) {
      aux_lotes[d.projeto_id][d.lote_id] = {}
      aux_lotes[d.projeto_id][d.lote_id]['legend'] = [0]
    }
    aux_lotes[d.projeto_id][d.lote_id]['name'] = d.lote
    aux_lotes[d.projeto_id][d.lote_id]['subtitle'] = d.subtitle
    aux_lotes[d.projeto_id][d.lote_id]['description'] = d.descricao_lote
    aux_lotes[d.projeto_id][d.lote_id]['legend'].push(d.fase_id)

    aux_lotes[d.projeto_id][d.lote_id]['zoom'] = d.bounds;

  })
  Object.keys(aux_lotes).forEach(pkey => {
    Object.keys(aux_lotes[pkey]).forEach(lkey => {
      dados_organizados[pkey]['lotes'].push(aux_lotes[pkey][lkey])
    })
  })

  const geojsonQuery = await db.sapConn.any(
    `
    SELECT p.lote_id, json_build_object(
      'type', 'FeatureCollection',
      'features', json_agg(
          json_build_object(
              'type', 'Feature',
              'geometry', ST_AsGeoJSON(geom)::json,
              'properties', json_build_object(
                  'id', p.id,
                  'identificador', p.mi,
                  'situacao', COALESCE(tf.nome, 'Previsto')
                )
            )
        )
      ) AS json
    FROM macrocontrole.produto AS p
    INNER JOIN macrocontrole.lote AS l ON l.id = p.lote_id
    INNER JOIN macrocontrole.projeto AS proj ON proj.id = l.projeto_id
    INNER JOIN (
      SELECT sit.id, CASE WHEN sit.completed THEN max(sit.fase_id) ELSE NULL END AS fase_atual
      FROM (
      SELECT p.id, sf.fase_id, bool_and(ut.completed) AS completed
      FROM macrocontrole.produto AS p
      LEFT JOIN macrocontrole.relacionamento_produto AS rp ON rp.p_id = p.id
      LEFT JOIN (
        SELECT ut.id, ut.subfase_id, (CASE WHEN count(*) - count(a.data_fim) = 0 THEN TRUE ELSE FALSE END) AS completed 
        FROM macrocontrole.unidade_trabalho AS ut
        INNER JOIN macrocontrole.atividade AS a ON a.unidade_trabalho_id = ut.id
        GROUP BY ut.id
      ) AS ut ON rp.ut_id = ut.id
      LEFT JOIN macrocontrole.subfase AS sf ON sf.id = ut.subfase_id
      GROUP BY p.id, sf.fase_id
      ORDER BY p.id, sf.fase_id) AS sit
      GROUP BY sit.id, sit.completed
      ORDER BY sit.id
    ) AS sit ON sit.id = p.id
	  LEFT JOIN macrocontrole.fase AS f ON f.id = sit.fase_atual
	  LEFT JOIN dominio.tipo_fase AS tf ON tf.code = f.tipo_fase_id
    WHERE proj.finalizado IS FALSE
    GROUP BY p.lote_id;
  `)

  let retorno = []
  retorno.push({
    'nome': 'dados.json',
    'dados': dados_organizados
  })

  geojsonQuery.forEach(g => {
    let aux = {}
    aux['nome'] = `${g.lote_id}.geojson`
    aux['dados'] = g.json
    retorno.push(aux)
  })

  return retorno
}




controller.getInfoSubfasePIT = async ano => {
  return await db.sapConn.any(
    `
    SELECT l.nome AS lote, s.nome AS subfase, EXTRACT(MONTH FROM sit.data_fim) AS month, COUNT(sit.id) AS count
    FROM (SELECT p.id, p.lote_id, ut.subfase_id, bool_and(ut.completed) AS completed, max(ut.data_fim) AS data_fim
          FROM macrocontrole.produto AS p
          LEFT JOIN macrocontrole.relacionamento_produto AS rp ON rp.p_id = p.id
          LEFT JOIN (
            SELECT ut.id, ut.subfase_id, (CASE WHEN count(*) - count(a.data_fim) = 0 THEN TRUE ELSE FALSE END) AS completed, max(a.data_fim) AS data_fim
            FROM macrocontrole.unidade_trabalho AS ut 
            INNER JOIN macrocontrole.atividade AS a ON a.unidade_trabalho_id = ut.id
            GROUP BY ut.id
          ) AS ut ON rp.ut_id = ut.id
          GROUP BY p.id, ut.subfase_id, p.lote_id
          ORDER BY p.id, ut.subfase_id, p.lote_id
      ) AS sit
    INNER JOIN macrocontrole.lote AS l ON l.id = sit.lote_id
    INNER JOIN macrocontrole.subfase AS s ON s.id = sit.subfase_id
    WHERE sit.completed = TRUE AND EXTRACT(YEAR FROM sit.data_fim) = $<ano>
    GROUP BY l.nome, s.nome, s.ordem, EXTRACT(MONTH FROM sit.data_fim)
    ORDER BY l.nome, s.ordem, EXTRACT(MONTH FROM sit.data_fim)
  `,
    { ano }
  )

}

controller.getInfoPIT = async ano => {
  return await db.sapConn.any(
    `
    WITH months AS (
      SELECT generate_series(1, EXTRACT(MONTH FROM current_date)::int) AS month
  ),
  projects_lotes_meta AS (
      SELECT DISTINCT pr.nome AS projeto, l.nome AS lote, pit.meta
      FROM macrocontrole.lote AS l
      JOIN macrocontrole.projeto AS pr ON pr.id = l.projeto_id
      LEFT JOIN macrocontrole.pit AS pit ON pit.lote_id = l.id AND pit.ano = $<ano>
  ),
  data AS (
      SELECT pit.meta, pr.nome AS projeto, l.nome AS lote, EXTRACT(MONTH FROM sit.data_fim) AS month, COUNT(sit.id) AS finalizadas
      FROM (
            SELECT p.id, p.lote_id, ut.projeto_id, bool_and(ut.completed) AS completed, max(ut.data_fim) AS data_fim
            FROM macrocontrole.produto AS p
            LEFT JOIN macrocontrole.relacionamento_produto AS rp ON rp.p_id = p.id
            LEFT JOIN (
              SELECT ut.id, l.projeto_id, (CASE WHEN count(*) - count(a.data_fim) = 0 THEN TRUE ELSE FALSE END) AS completed, max(a.data_fim) AS data_fim
              FROM macrocontrole.unidade_trabalho AS ut 
              INNER JOIN macrocontrole.atividade AS a ON a.unidade_trabalho_id = ut.id
              INNER JOIN macrocontrole.lote AS l ON l.id = ut.lote_id
              GROUP BY ut.id, l.projeto_id
            ) AS ut ON rp.ut_id = ut.id
            GROUP BY p.id, ut.projeto_id, p.lote_id
            ORDER BY p.id, ut.projeto_id, p.lote_id
        ) AS sit
      INNER JOIN macrocontrole.lote AS l ON l.id = sit.lote_id
      INNER JOIN macrocontrole.projeto AS pr ON pr.id = sit.projeto_id
    LEFT JOIN macrocontrole.pit AS pit ON pit.lote_id = sit.lote_id AND pit.ano = $<ano>
      WHERE sit.completed = TRUE AND EXTRACT(YEAR FROM sit.data_fim) = $<ano>
      GROUP BY pr.nome, l.nome, pit.meta, EXTRACT(MONTH FROM sit.data_fim)
      ORDER BY pr.nome, l.nome, EXTRACT(MONTH FROM sit.data_fim)
  )
  SELECT plm.projeto, plm.lote, plm.meta, m.month, COALESCE(d.finalizadas, 0) AS finalizadas
  FROM projects_lotes_meta AS plm
  CROSS JOIN months AS m
  LEFT JOIN data AS d ON d.projeto = plm.projeto AND d.lote = plm.lote AND d.month = m.month
  WHERE plm.meta is not null
  ORDER BY plm.projeto, plm.lote, m.month
  `,
    { ano }
  )

}

controller.getQuantidadeAno = async ano => {
  return await db.sapConn.any(
    `
    SELECT l.nome AS lote, lote_id, sum(meta) AS quantidade
    FROM macrocontrole.pit
	  INNER JOIN macrocontrole.lote AS l ON l.id = pit.lote_id
    GROUP BY ano, lote_id, l.nome
    HAVING ano = $<ano>
  `,
    { ano }
  )

}

controller.getFinalizadasAno = async ano => {
  return await db.sapConn.any(
    `
    WITH ut_fin AS (
      SELECT ut.id, (CASE WHEN count(*) - count(a.data_fim) = 0 THEN TRUE ELSE FALSE END) AS finalizada, max(a.data_fim) AS data_fim
      FROM macrocontrole.unidade_trabalho AS ut 
      INNER JOIN macrocontrole.atividade AS a ON a.unidade_trabalho_id = ut.id
      GROUP BY ut.id
    ),
    prod_fin AS (
      SELECT p.id, bool_and(ut.finalizada) AS finalizada, max(ut.data_fim) AS data_fim
      FROM macrocontrole.produto AS p
      INNER JOIN macrocontrole.relacionamento_produto AS rp ON rp.p_id = p.id
      INNER JOIN ut_fin AS ut ON ut.id = rp.ut_id
      GROUP BY p.id
    )
    SELECT l.nome AS lote, pr.lote_id, COUNT(DISTINCT p.id) AS finalizadas
    FROM prod_fin AS p
    INNER JOIN macrocontrole.produto AS pr ON pr.id = p.id
	  INNER JOIN macrocontrole.lote AS l ON l.id = pr.lote_id
    WHERE p.finalizada IS TRUE AND EXTRACT(YEAR FROM p.data_fim) = $<ano>
    GROUP BY pr.lote_id, l.nome
  `,
    { ano }
  )

}

controller.getExecucao = async () => {
  return await db.sapConn.any(
    `
    WITH ut_exec AS (
      SELECT ut.id, (CASE WHEN count(*) - count(a.data_fim) = 0 THEN TRUE ELSE FALSE END) AS finalizada, min(data_inicio) IS NOT NULL iniciada
      FROM macrocontrole.unidade_trabalho AS ut 
      INNER JOIN macrocontrole.atividade AS a ON a.unidade_trabalho_id = ut.id
      GROUP BY ut.id
    )
    SELECT l.nome AS lote, p.lote_id, COUNT(DISTINCT p.id)
    FROM macrocontrole.produto AS p
	INNER JOIN macrocontrole.lote AS l ON l.id = p.lote_id
    INNER JOIN macrocontrole.relacionamento_produto AS rp ON rp.p_id = p.id
    INNER JOIN ut_exec AS ut ON ut.id = rp.ut_id
    WHERE ut.iniciada IS TRUE and ut.finalizada IS FALSE
	GROUP BY p.lote_id, l.nome
  `
  )

}

controller.getLayerGeoJSON = async layerName => {
  return db.sapConn.any(
    `SELECT row_to_json(fc) as geojson
    FROM (
        SELECT 'FeatureCollection' as type, array_to_json(array_agg(f)) as features
        FROM (
            SELECT 'Feature' as type,
            ST_AsGeoJSON(d.geom)::json as geometry,
            to_jsonb(lg) - 'geom' - 'name' AS properties
            FROM acompanhamento.$<layerName:raw> as lg,
            LATERAL ST_Dump(lg.geom) as d
        ) as f
    ) as fc;
    `,
    { layerName }
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
