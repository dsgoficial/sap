'use strict'

const { db } = require('../database')

const { AppError, httpCode } = require('../utils')

const controller = {}

// ==========================================================================
// Estatisticas de producao (alimentam o acompanhamento e a Secao 2.1 do
// RPCMTec via skill consultar-sap). NAO alterar sem rever a consultar-sap.
// ==========================================================================

controller.getDiasLogadosUsuario = async usuarioId => {
  return db.sapConn.any(
    `SELECT DISTINCT l.data_login::date AS dias_logados
    FROM acompanhamento.login AS l
    WHERE l.usuario_id = $<usuarioId>
    `,
    {usuarioId}
  )
}

controller.getAtividadesPorPeriodo = async (dataInicio, dataFim) => {
  return db.sapConn.any(
    `SELECT
      u.id AS usuario_id,
      u.nome AS nome_usuario,
      b.nome AS nome_bloco,
      COUNT(DISTINCT ut.id) AS qtd_ut
      FROM macrocontrole.atividade a
      JOIN dgeo.usuario u ON a.usuario_id = u.id
      JOIN macrocontrole.unidade_trabalho ut ON a.unidade_trabalho_id = ut.id
      JOIN macrocontrole.bloco b ON ut.bloco_id = b.id
    WHERE a.tipo_situacao_id = 4
      AND a.data_fim BETWEEN $<dataInicio>::timestamptz AND $<dataFim>::timestamptz
    GROUP BY u.id, u.nome, b.nome
    ORDER BY u.nome, b.nome;`,
    { dataInicio: `${dataInicio} 00:00:00`, dataFim: `${dataFim} 23:59:59` }
  );
};

controller.getAtividadesPorUsuarioEPeriodo = async (usuarioId, dataInicio, dataFim) => {
  return db.sapConn.any(
    `SELECT
      u.nome AS nome_usuario,
      sf.nome AS nome_subfase,
      b.nome AS nome_bloco,
      COUNT(DISTINCT ut.id) AS qtd_ut
      FROM macrocontrole.atividade a
      JOIN dgeo.usuario u ON a.usuario_id = u.id
      JOIN macrocontrole.unidade_trabalho ut ON a.unidade_trabalho_id = ut.id
      JOIN macrocontrole.bloco b ON ut.bloco_id = b.id
      JOIN macrocontrole.subfase sf ON ut.subfase_id = sf.id
    WHERE a.usuario_id = $<usuarioId>
      AND a.tipo_situacao_id = 4
      AND a.data_fim BETWEEN $<dataInicio>::timestamptz AND $<dataFim>::timestamptz
    GROUP BY u.nome, sf.nome, b.nome
    ORDER BY u.nome, sf.nome;`,
    { usuarioId, dataInicio: `${dataInicio} 00:00:00`, dataFim: `${dataFim} 23:59:59` }
  );
};

controller.getAllLoteStatsByDate = async (dataInicio, dataFim) => {
  return db.sapConn.any(
    `SELECT
    l.id AS lote_id,
    l.nome AS lote_nome,
    COUNT(*) AS total_atividades,
    COUNT(CASE WHEN a.tipo_situacao_id = 4 THEN 1 END) * 1.0 / NULLIF(COUNT(*), 0) AS percent_exec,
    COUNT(CASE WHEN a.tipo_situacao_id = 4
               AND a.data_fim BETWEEN $<dataInicio>::timestamptz AND $<dataFim>::timestamptz
               THEN 1 END) AS exec_no_periodo,
    COUNT(CASE WHEN a.tipo_situacao_id = 4
               AND a.data_fim BETWEEN $<dataInicio>::timestamptz AND $<dataFim>::timestamptz
               THEN 1 END) * 1.0 / NULLIF(COUNT(*), 0) AS percent_periodo,
    COUNT(CASE WHEN a.tipo_situacao_id = 4
               AND a.data_fim <= $<dataFim>::timestamptz
               THEN 1 END) AS exec_acumulado,
    COUNT(CASE WHEN a.tipo_situacao_id = 4
               AND a.data_fim <= $<dataFim>::timestamptz
               THEN 1 END) * 1.0 / NULLIF(COUNT(*), 0) AS percent_acumulado,
    AVG(EXTRACT(EPOCH FROM (a.data_fim - a.data_inicio))) / 3600 AS tempo_medio_horas,
    STDDEV(EXTRACT(EPOCH FROM (a.data_fim - a.data_inicio))) / 3600 AS desvio_padrao_tempo
FROM macrocontrole.atividade AS a
INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
INNER JOIN macrocontrole.lote AS l ON l.id = ut.lote_id
WHERE l.status_id IN (1, 2)
AND a.tipo_situacao_id BETWEEN 1 AND 5
GROUP BY l.id, l.nome
HAVING COUNT(CASE WHEN a.tipo_situacao_id = 4
                  AND a.data_fim BETWEEN $<dataInicio>::timestamptz AND $<dataFim>::timestamptz
                  THEN 1 END) > 0
ORDER BY percent_exec DESC;`,
    { dataInicio: `${dataInicio} 00:00:00`, dataFim: `${dataFim} 23:59:59` }
  );
}

controller.getAllBlocksStatsByDate = async (dataInicio, dataFim) => {
  return db.sapConn.any(
    `SELECT
    b.nome,
    COALESCE(COUNT(CASE WHEN a.tipo_situacao_id = 4 THEN 1 END) * 1.0 / NULLIF(COUNT(*), 0), 0.0) AS proporcao_4,
    COUNT(CASE WHEN a.tipo_situacao_id = 4
               AND a.data_fim BETWEEN $<dataInicio>::timestamptz AND $<dataFim>::timestamptz
               THEN 1 END) AS exec_no_periodo
FROM macrocontrole.atividade AS a
INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
INNER JOIN macrocontrole.lote AS l ON l.id = ut.lote_id
INNER JOIN macrocontrole.bloco AS b ON b.id = ut.bloco_id
WHERE b.status_id = 1
AND a.tipo_situacao_id BETWEEN 1 AND 5
GROUP BY b.id, b.nome
HAVING COUNT(CASE WHEN a.tipo_situacao_id = 4
                  AND a.data_fim BETWEEN $<dataInicio>::timestamptz AND $<dataFim>::timestamptz
                  THEN 1 END) > 0
ORDER BY proporcao_4 DESC;
`,
    { dataInicio: `${dataInicio} 00:00:00`, dataFim: `${dataFim} 23:59:59` }
  );
}

// ==========================================================================
// Aproveitamento do efetivo (Secao 5.1 do RPCMTec, padrao 2026: Militar |
// Atividades). Retrato MENSAL congelado: uma linha por militar por mes em
// recurso_humano.aproveitamento_mes. Preencher um mes novo e agilizado copiando
// o mes anterior. Serve tanto a leitura da 5.1 quanto a edicao no client web.
// ==========================================================================

// 5.1 de um mes: uma linha por militar, do mais antigo ao mais moderno
// (tipo_posto_grad.code cresce com a antiguidade -> ORDER BY ... DESC). O posto
// e o da epoca (congelado na linha), entao promocoes nao distorcem meses passados.
controller.getAproveitamento = async (ano, mes) => {
  return db.sapConn.any(
    `SELECT a.id, a.usuario_id, a.tipo_posto_grad_id, tpg.nome_abrev AS posto,
            u.nome_guerra, a.atividades
     FROM recurso_humano.aproveitamento_mes a
     JOIN dgeo.usuario u ON u.id = a.usuario_id
     JOIN dominio.tipo_posto_grad tpg ON tpg.code = a.tipo_posto_grad_id
     WHERE a.ano = $<ano> AND a.mes = $<mes>
     ORDER BY tpg.code DESC, u.nome_guerra`,
    { ano, mes }
  )
}

controller.criarLinha = async linha => {
  // Posto da epoca: se nao informado, congela o posto atual do militar.
  let postoId = linha.tipo_posto_grad_id
  if (postoId === null || postoId === undefined) {
    const u = await db.sapConn.oneOrNone(
      'SELECT tipo_posto_grad_id FROM dgeo.usuario WHERE id = $<usuario_id>',
      { usuario_id: linha.usuario_id }
    )
    if (!u) {
      throw new AppError('Militar não encontrado', httpCode.NotFound)
    }
    postoId = u.tipo_posto_grad_id
  }
  return db.sapConn.none(
    `INSERT INTO recurso_humano.aproveitamento_mes
       (ano, mes, usuario_id, tipo_posto_grad_id, atividades)
     VALUES ($<ano>, $<mes>, $<usuario_id>, $<tipo_posto_grad_id>, $<atividades>)
     ON CONFLICT (ano, mes, usuario_id) DO NOTHING`,
    {
      ano: linha.ano,
      mes: linha.mes,
      usuario_id: linha.usuario_id,
      tipo_posto_grad_id: postoId,
      atividades: linha.atividades ?? null
    }
  )
}

controller.atualizaLinha = async (id, linha) => {
  const result = await db.sapConn.result(
    `UPDATE recurso_humano.aproveitamento_mes
     SET atividades = $<atividades>,
         tipo_posto_grad_id = COALESCE($<tipo_posto_grad_id>, tipo_posto_grad_id)
     WHERE id = $<id>`,
    {
      id,
      atividades: linha.atividades ?? null,
      tipo_posto_grad_id: linha.tipo_posto_grad_id ?? null
    }
  )
  if (!result.rowCount) {
    throw new AppError('Linha de aproveitamento não encontrada', httpCode.NotFound)
  }
}

controller.deletaLinha = async id => {
  const result = await db.sapConn.result(
    'DELETE FROM recurso_humano.aproveitamento_mes WHERE id = $<id>',
    { id }
  )
  if (!result.rowCount) {
    throw new AppError('Linha de aproveitamento não encontrada', httpCode.NotFound)
  }
}

// Copia as linhas do mes anterior para (ano, mes), sem sobrescrever quem ja
// existe (ON CONFLICT DO NOTHING). Agiliza o preenchimento do mes novo.
controller.copiarMesAnterior = async (ano, mes) => {
  const mesAnt = mes === 1 ? 12 : mes - 1
  const anoAnt = mes === 1 ? ano - 1 : ano
  const result = await db.sapConn.result(
    `INSERT INTO recurso_humano.aproveitamento_mes
       (ano, mes, usuario_id, tipo_posto_grad_id, atividades)
     SELECT $<ano>, $<mes>, a.usuario_id, a.tipo_posto_grad_id, a.atividades
     FROM recurso_humano.aproveitamento_mes a
     WHERE a.ano = $<anoAnt> AND a.mes = $<mesAnt>
     ON CONFLICT (ano, mes, usuario_id) DO NOTHING`,
    { ano, mes, anoAnt, mesAnt }
  )
  return { copiados: result.rowCount }
}

// Alternativa para o primeiro mes: cria as linhas a partir do efetivo ativo
// atual (posto atual), com atividades vazias.
controller.iniciarDoEfetivo = async (ano, mes) => {
  const result = await db.sapConn.result(
    `INSERT INTO recurso_humano.aproveitamento_mes
       (ano, mes, usuario_id, tipo_posto_grad_id, atividades)
     SELECT $<ano>, $<mes>, u.id, u.tipo_posto_grad_id, NULL
     FROM dgeo.usuario u
     WHERE u.ativo
     ON CONFLICT (ano, mes, usuario_id) DO NOTHING`,
    { ano, mes }
  )
  return { criados: result.rowCount }
}

module.exports = controller
