'use strict'

const { db } = require('../database')

// AppError/httpCode eram usados em deletePerfilMonitoramento sem import
// (ReferenceError → 500 em vez de 400 na validação).
const { AppError, httpCode } = require('../utils')

const controller = {}

controller.getTipoMonitoramento = async () => {
  return db.sapConn
    .any('SELECT code, nome FROM microcontrole.tipo_monitoramento')
}

controller.getTipoOperacao = async () => {
  return db.microConn
    .any('SELECT code, nome FROM microcontrole.tipo_operacao')
}

controller.armazenaFeicao = async (atividadeId, usuarioId, dados) => {
  const cs = new db.pgp.helpers.ColumnSet(
    [
      'tipo_operacao_id',
      'camada',
      'quantidade',
      {
        name: 'comprimento',
        def: 0
      },
      {
        name: 'vertices',
        def: 0
      },
      { name: 'data', mod: ':raw', init: () => 'NOW()' },
      { name: 'atividade_id', init: () => atividadeId },
      { name: 'usuario_id', init: () => usuarioId }
    ]
  )

  const query = db.pgp.helpers.insert(dados, cs, { table: 'monitoramento_feicao', schema: 'microcontrole' })

  return db.microConn.none(query)
}

controller.armazenaTela = async (atividadeId, usuarioId, dados) => {
  const cs = new db.pgp.helpers.ColumnSet(
    [{ name: 'geom', mod: ':raw' }, 'zoom', 'data', { name: 'atividade_id', init: () => atividadeId }, { name: 'usuario_id', init: () => usuarioId }]
  )

  // geom é a envelope retangular da extensão de tela (x_min,y_min,x_max,y_max).
  // Coluna `:raw` porque o valor é uma expressão SQL (ST_MakeEnvelope), montada
  // com pgp.as.format para escapar as coordenadas — mesmo padrão de campo_ctrl.
  // Bugs corrigidos aqui: `dados.foreach` (typo → TypeError, rota /tela 100%
  // quebrada); geom sem `:raw` (entrava como texto literal → cast text→geometry
  // falhava); e falta de `return` (insert não aguardado → sucesso falso).
  dados.forEach(d => {
    d.geom = db.pgp.as.format('ST_MakeEnvelope($1, $2, $3, $4, 4326)', [d.x_min, d.y_min, d.x_max, d.y_max])
  })

  const query = db.pgp.helpers.insert(dados, cs, { table: 'monitoramento_tela', schema: 'microcontrole' })

  return db.microConn.none(query)
}

controller.getPerfilMonitoramento = async () => {
  return db.sapConn.any(
    `SELECT pm.id, pm.tipo_monitoramento_id, pm.subfase_id, pm.lote_id,
    tm.nome AS tipo_monitoramento
    FROM microcontrole.perfil_monitoramento AS pm
    INNER JOIN microcontrole.tipo_monitoramento AS tm
    ON tm.code = pm.tipo_monitoramento_id
    `)
}

controller.criaPerfilMonitoramento = async perfisMonitoramento => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'subfase_id',
      'lote_id',
      'tipo_monitoramento_id'
    ])

    const query = db.pgp.helpers.insert(perfisMonitoramento, cs, {
      table: 'perfil_monitoramento',
      schema: 'microcontrole'
    })

    await t.none(query)
  })
}

controller.atualizaPerfilMonitoramento = async perfisMonitoramento => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'subfase_id',
      'lote_id',
      'tipo_monitoramento_id'
    ])

    const query =
      db.pgp.helpers.update(
        perfisMonitoramento,
        cs,
        { table: 'perfil_monitoramento', schema: 'microcontrole' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

// Resolve no sapConn os atividade_id de um lote. Retorna null quando loteId e
// ausente (sinaliza "todos os lotes", sem filtro de atividade no microConn).
const getAtividadesDoLote = async loteId => {
  if (!loteId) {
    return null
  }
  const atividades = await db.sapConn.any(
    `SELECT a.id
    FROM macrocontrole.atividade AS a
    INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
    WHERE ut.lote_id = $<loteId>`,
    { loteId }
  )
  return atividades.map(a => a.id)
}

// Mapa usuario_id -> nome formatado (nome_abrev || ' ' || nome_guerra), no sapConn.
const getMapaUsuarios = async usuarioIds => {
  if (!usuarioIds || usuarioIds.length === 0) {
    return {}
  }
  const usuarios = await db.sapConn.any(
    `SELECT u.id AS usuario_id, tpg.nome_abrev || ' ' || u.nome_guerra AS usuario
    FROM dgeo.usuario AS u
    INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
    WHERE u.id IN ($<usuarioIds:csv>)`,
    { usuarioIds }
  )
  const mapa = {}
  usuarios.forEach(u => {
    mapa[u.usuario_id] = u.usuario
  })
  return mapa
}

// Janela e limites nomeados (evita literais soltos espalhados pela leitura).
const JANELA_DIAS_PADRAO = 30
const LIMITE_COBERTURA = 5000
const GAP_INATIVIDADE_MIN = 3

// Projecao das 4 operacoes no microConn (tipo_operacao_id: 1=insert, 2=delete,
// 3=update atributo, 4=update geom). Compartilhada pelas tres agregacoes.
const SOMA_OPERACOES = `
      SUM(CASE WHEN tipo_operacao_id = 1 THEN quantidade ELSE 0 END)::int AS insercoes,
      SUM(CASE WHEN tipo_operacao_id = 2 THEN quantidade ELSE 0 END)::int AS delecoes,
      SUM(CASE WHEN tipo_operacao_id = 3 THEN quantidade ELSE 0 END)::int AS atualizacoes_atributo,
      SUM(CASE WHEN tipo_operacao_id = 4 THEN quantidade ELSE 0 END)::int AS atualizacoes_geometria`

const SOMA_GEOM = `
      COALESCE(SUM(comprimento), 0) AS comprimento,
      COALESCE(SUM(vertices), 0)::int AS vertices`

// Fragmento "AND atividade_id IN (...)" ja escapado, ou '' quando nao ha lote.
const filtroAtividadeSql = atividadeIds =>
  atividadeIds !== null
    ? db.pgp.as.format('AND atividade_id IN ($<atividadeIds:csv>)', { atividadeIds })
    : ''

// Datas default: ultimos JANELA_DIAS_PADRAO dias quando ausentes. Retorna
// {inicio, fim} ja como Date para passar ao microConn. data_fim e' date-only
// (YYYY-MM-DD); inclui o dia inteiro (ate 23:59:59.999), senao `data <= fim`
// cairia na meia-noite e descartaria todo o dia final.
const resolveIntervalo = (dataInicio, dataFim) => {
  const fim = dataFim
    ? new Date(new Date(dataFim).getTime() + 24 * 60 * 60 * 1000 - 1)
    : new Date()
  const inicio = dataInicio
    ? new Date(dataInicio)
    : new Date(fim.getTime() - JANELA_DIAS_PADRAO * 24 * 60 * 60 * 1000)
  return { inicio, fim }
}

controller.getResumoFeicao = async (loteId, dataInicio, dataFim) => {
  const { inicio, fim } = resolveIntervalo(dataInicio, dataFim)
  const atividadeIds = await getAtividadesDoLote(loteId)

  // Lote informado mas sem nenhuma atividade: nada a agregar.
  if (atividadeIds !== null && atividadeIds.length === 0) {
    return { por_operador: [], por_camada: [], serie_diaria: [] }
  }

  const filtroAtividade = filtroAtividadeSql(atividadeIds)

  // As tres agregacoes sao independentes e batem na mesma janela: rodam em
  // paralelo (mesmo pool, I/O sobreposto) em vez de uma de cada vez.
  const [porOperador, porCamada, serieDiaria] = await Promise.all([
    db.microConn.any(
      `SELECT usuario_id, ${SOMA_OPERACOES}, ${SOMA_GEOM}
      FROM microcontrole.monitoramento_feicao
      WHERE data >= $<inicio> AND data <= $<fim> ${filtroAtividade}
      GROUP BY usuario_id`,
      { inicio, fim }
    ),
    db.microConn.any(
      `SELECT camada, ${SOMA_OPERACOES}, ${SOMA_GEOM}
      FROM microcontrole.monitoramento_feicao
      WHERE data >= $<inicio> AND data <= $<fim> ${filtroAtividade}
      GROUP BY camada
      ORDER BY camada`,
      { inicio, fim }
    ),
    db.microConn.any(
      `SELECT to_char(data::date, 'YYYY-MM-DD') AS dia, ${SOMA_OPERACOES}
      FROM microcontrole.monitoramento_feicao
      WHERE data >= $<inicio> AND data <= $<fim> ${filtroAtividade}
      GROUP BY data::date
      ORDER BY data::date`,
      { inicio, fim }
    )
  ])

  // Resolve nomes dos operadores no sapConn e junta em JS.
  const mapaUsuarios = await getMapaUsuarios(porOperador.map(o => o.usuario_id))

  return {
    por_operador: porOperador.map(o => ({
      ...o,
      usuario: mapaUsuarios[o.usuario_id] || `Operador ${o.usuario_id}`
    })),
    por_camada: porCamada,
    serie_diaria: serieDiaria
  }
}

controller.getCoberturaTela = async (loteId, usuarioId, dataInicio, dataFim) => {
  const { inicio, fim } = resolveIntervalo(dataInicio, dataFim)
  const atividadeIds = await getAtividadesDoLote(loteId)

  if (atividadeIds !== null && atividadeIds.length === 0) {
    return { type: 'FeatureCollection', features: [], aviso: null }
  }

  // Filtros opcionais (valores escapados): atividade (via lote) + usuario.
  let filtros = filtroAtividadeSql(atividadeIds)
  if (usuarioId) {
    filtros += db.pgp.as.format(' AND usuario_id = $<usuarioId>', { usuarioId })
  }

  const registros = await db.microConn.any(
    `SELECT atividade_id, usuario_id, zoom,
      to_char(data, 'YYYY-MM-DD"T"HH24:MI:SSOF') AS data,
      ST_AsGeoJSON(geom)::json AS geometry
    FROM microcontrole.monitoramento_tela
    WHERE data >= $<inicio> AND data <= $<fim> ${filtros}
    ORDER BY data DESC
    LIMIT $<limite>`,
    { inicio, fim, limite: LIMITE_COBERTURA + 1 }
  )

  const truncou = registros.length > LIMITE_COBERTURA
  const usados = truncou ? registros.slice(0, LIMITE_COBERTURA) : registros

  const usuarioIds = [...new Set(usados.map(r => r.usuario_id))]
  const mapaUsuarios = await getMapaUsuarios(usuarioIds)

  return {
    type: 'FeatureCollection',
    aviso: truncou
      ? `Resultado truncado em ${LIMITE_COBERTURA} feicoes. Refine o filtro de lote, usuario ou periodo.`
      : null,
    features: usados.map(r => ({
      type: 'Feature',
      geometry: r.geometry,
      properties: {
        atividade_id: r.atividade_id,
        usuario_id: r.usuario_id,
        usuario: mapaUsuarios[r.usuario_id] || `Operador ${r.usuario_id}`,
        data: r.data,
        zoom: r.zoom
      }
    }))
  }
}

controller.getAproveitamentoTela = async (usuarioId, dataInicio, dataFim) => {
  // Mesma janela das demais consultas (default ultimos JANELA_DIAS_PADRAO dias),
  // para o painel respeitar o filtro de periodo da pagina.
  const { inicio, fim } = resolveIntervalo(dataInicio, dataFim)

  // A telemetria de tela guarda atividade_id/usuario_id; usuario_id ja basta
  // para filtrar no microConn (sem precisar do sapConn).
  // Analise de gaps: ordena os timestamps por dia; gap > GAP_INATIVIDADE_MIN min
  // entre amostras consecutivas conta como inativo. tempo_total = primeiro ao
  // ultimo ponto do dia; tempo_ativo = tempo_total menos a soma dos gaps.
  const linhas = await db.microConn.any(
    `WITH pontos AS (
      SELECT data::date AS dia, data,
        EXTRACT(EPOCH FROM (data - LAG(data) OVER (PARTITION BY data::date ORDER BY data))) / 60.0 AS gap_min
      FROM microcontrole.monitoramento_tela
      WHERE usuario_id = $<usuarioId>
        AND data >= $<inicio> AND data <= $<fim>
    )
    SELECT to_char(dia, 'YYYY-MM-DD') AS dia,
      EXTRACT(EPOCH FROM (MAX(data) - MIN(data))) / 60.0 AS tempo_total_min,
      COALESCE(SUM(gap_min) FILTER (WHERE gap_min > ${GAP_INATIVIDADE_MIN}), 0) AS tempo_inativo_min
    FROM pontos
    GROUP BY dia
    ORDER BY dia`,
    { usuarioId, inicio, fim }
  )

  return linhas.map(l => {
    const total = Number(l.tempo_total_min) || 0
    const inativo = Number(l.tempo_inativo_min) || 0
    const ativo = Math.max(total - inativo, 0)
    return {
      dia: l.dia,
      tempo_total_min: Math.round(total * 100) / 100,
      tempo_ativo_min: Math.round(ativo * 100) / 100,
      aproveitamento_pct: total > 0 ? Math.round((100 * ativo) / total * 100) / 100 : 0
    }
  })
}

controller.deletePerfilMonitoramento = async perfisMonitoramentoId => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM microcontrole.perfil_monitoramento
      WHERE id in ($<perfisMonitoramentoId:csv>)`,
      { perfisMonitoramentoId }
    )
    if (exists && exists.length < perfisMonitoramentoId.length) {
      throw new AppError(
        'O id informado não corresponde a um perfil monitoramento id',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM microcontrole.perfil_monitoramento
      WHERE id in ($<perfisMonitoramentoId:csv>)`,
      { perfisMonitoramentoId }
    )
  })
}

module.exports = controller
