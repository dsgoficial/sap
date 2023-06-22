'use strict'

const { db, temporaryLogin, disableTriggers } = require('../database')

const { AppError, httpCode } = require('../utils')

const prepared = require('./prepared_statements')

const controller = {}

controller.calculaFila = async (usuarioId) => {
  const prioridade = await db.sapConn.task(async t => {
    const filaPrioritaria = await t.oneOrNone(prepared.calculaFilaPrioritaria, [
      usuarioId
    ])

    if (filaPrioritaria) {
      return filaPrioritaria.id
    }

    const filaPrioritariaGrupo = await t.oneOrNone(
      prepared.calculaFilaPrioritariaGrupo,
      [usuarioId]
    )

    if (filaPrioritariaGrupo) {
      return filaPrioritariaGrupo.id
    }

    const cartasPausadas = await t.oneOrNone(prepared.calculaFilaPausada, [
      usuarioId
    ])

    if (cartasPausadas) {
      return cartasPausadas.id
    }

    const prioridadeOperador = await t.oneOrNone(prepared.calculaFila, [
      usuarioId
    ])

    if (prioridadeOperador) {
      return prioridadeOperador.id
    }

    return null
  })
  return prioridade
}

const getAlias = async (connection, subfaseId, loteId) => {
  return connection.any(
    `SELECT la.nome, la.definicao_alias FROM macrocontrole.perfil_alias AS pa
      INNER JOIN dgeo.layer_alias AS la On la.id = pa.alias_id
      WHERE pa.subfase_id = $1 AND pa.lote_id = $2`,
    [subfaseId, loteId]
  )
}

const getInfoCamadas = async (connection, etapaCode, subfaseId) => {
  let camadas

  if (etapaCode === 1 || etapaCode === 4) {
    camadas = await connection.any(
      `SELECT c.schema, c.nome, pc.atributo_filtro_subfase
        FROM macrocontrole.propriedades_camada AS pc
        INNER JOIN macrocontrole.camada AS c ON c.id = pc.camada_id
        WHERE pc.subfase_id = $1 and pc.camada_apontamento IS FALSE`,
      [subfaseId]
    )
  } else {
    camadas = await connection.any(
      `SELECT c.schema, c.nome, pc.atributo_filtro_subfase, pc.camada_apontamento, pc.atributo_justificativa_apontamento, pc.atributo_situacao_correcao
        FROM macrocontrole.propriedades_camada AS pc
        INNER JOIN macrocontrole.camada AS c ON c.id = pc.camada_id
        WHERE pc.subfase_id = $1`,
      [subfaseId]
    )
  }

  const result = []

  camadas.forEach((r) => {
    const aux = { nome: r.nome, schema: r.schema }
    if (r.atributo_filtro_subfase) {
      aux.atributo_filtro_subfase = r.atributo_filtro_subfase
    }
    if (r.camada_apontamento) {
      aux.camada_apontamento = r.camada_apontamento
      aux.atributo_situacao_correcao = r.atributo_situacao_correcao
      aux.atributo_justificativa_apontamento =
        r.atributo_justificativa_apontamento
    }

    result.push(aux)
  })

  return result
}

const getInfoMenus = async (connection, etapaCode, subfaseId, loteId) => {
  if (etapaCode === 2 || etapaCode === 5) {
    return connection.any(
      `SELECT mp.nome, mp.definicao_menu FROM macrocontrole.perfil_menu AS pm
        INNER JOIN dgeo.qgis_menus AS mp On mp.id = pm.menu_id
        WHERE subfase_id = $1 AND lote_id = $2`,
      [subfaseId, loteId]
    )
  }
  return connection.any(
    `SELECT mp.nome, mp.definicao_menu FROM macrocontrole.perfil_menu AS pm
        INNER JOIN dgeo.qgis_menus AS mp On mp.id = pm.menu_id
        WHERE subfase_id = $1 AND lote_id = $2 AND NOT menu_revisao`,
    [subfaseId, loteId]
  )
}

const getInfoEstilos = async (connection, subfaseId, loteId) => {
  return connection.any(
    `SELECT ls.f_table_schema, ls.f_table_name, ls.f_geometry_column, gs.nome AS stylename, ls.styleqml, ls.ui FROM macrocontrole.perfil_estilo AS pe
      INNER JOIN dgeo.group_styles AS gs ON gs.id = pe.grupo_estilo_id
      INNER JOIN dgeo.layer_styles AS ls ON ls.grupo_estilo_id = gs.id
      INNER JOIN macrocontrole.camada AS c ON c.nome = ls.f_table_name AND c.schema = ls.f_table_schema
      INNER JOIN macrocontrole.propriedades_camada AS pc ON pc.camada_id = c.id AND pe.subfase_id = pc.subfase_id
      WHERE pe.subfase_id = $1 AND pe.lote_id = $2`,
    [subfaseId, loteId]
  )
}

const getInfoRegras = async (connection, subfaseId, loteId) => {
  return connection.any(
    `SELECT lr.nome, lr.regra
      FROM macrocontrole.perfil_regras as pr
      INNER JOIN dgeo.layer_rules AS lr ON lr.id = pr.layer_rules_id
      WHERE pr.subfase_id = $1 AND pr.lote_id = $2`,
    [subfaseId, loteId]
  )
}

const getInfoFME = async (connection, subfaseId, loteId) => {
  return connection.any(
    `SELECT gf.url, pf.rotina, pf.tipo_rotina_id, tr.nome as tipo_rotina, pf.requisito_finalizacao, pf.ordem FROM macrocontrole.perfil_fme AS pf
    INNER JOIN dgeo.gerenciador_fme AS gf ON gf.id = pf.gerenciador_fme_id
    INNER JOIN dominio.tipo_rotina AS tr ON tr.code = pf.tipo_rotina_id
    WHERE subfase_id = $<subfaseId> AND lote_id = $<loteId>`,
    { subfaseId, loteId }
  )
}

const getInfoConfigQGIS = async (connection, subfaseId, loteId) => {
  return connection.any(
    'SELECT tipo_configuracao_id, parametros FROM macrocontrole.perfil_configuracao_qgis WHERE subfase_id = $<subfaseId> AND lote_id = $<loteId>',
    { subfaseId, loteId }
  )
}
/**
const getInfoMonitoramento = async (connection, subfaseId, loteId) => {
  return connection.any(
    `SELECT pm.tipo_monitoramento_id, tm.nome as tipo_monitoramento
      FROM macrocontrole.perfil_monitoramento AS pm
      INNER JOIN dominio.tipo_monitoramento AS tm ON tm.code = pm.tipo_monitoramento_id
      WHERE subfase_id = $1 AND lote_id = $2`,
    [subfaseId, loteId]
  )
}
 */
const getInfoInsumos = async (connection, unidadeTrabalhoId) => {
  return connection.any(
    `SELECT i.id, i.nome, i.caminho, i.epsg, i.tipo_insumo_id, iut.caminho_padrao
      FROM macrocontrole.insumo AS i
      INNER JOIN macrocontrole.insumo_unidade_trabalho AS iut ON i.id = iut.insumo_id
      WHERE iut.unidade_trabalho_id = $1`,
    [unidadeTrabalhoId]
  )
}

const getInfoModelsQGIS = async (connection, subfaseId, loteId) => {
  return connection.any(
    `SELECT lqm.nome, lqm.descricao, lqm.model_xml, pmq.parametros, pmq.tipo_rotina_id, tr.nome as tipo_rotina, pmq.requisito_finalizacao, pmq.ordem
      FROM macrocontrole.perfil_model_qgis AS pmq
      INNER JOIN dgeo.qgis_models AS lqm ON pmq.qgis_model_id = lqm.id
      INNER JOIN dominio.tipo_rotina AS tr on tr.code = pmq.tipo_rotina_id
      WHERE pmq.subfase_id = $1 AND pmq.lote_id = $2`,
    [subfaseId, loteId]
  )
}

const getInfoWorkflow = async (connection, subfaseId, loteId) => {
  return connection.any(
    `SELECT wd.nome, wd.descricao, wd.workflow_json
      FROM macrocontrole.perfil_workflow_dsgtools AS pwd
      INNER JOIN dgeo.workflow_dsgtools AS wd ON pwd.workflow_dsgtools_id = wd.id
      WHERE pwd.subfase_id = $1 AND pwd.lote_id = $2`,
    [subfaseId, loteId]
  )
}

const getInfoLinhagem = async (
  connection,
  subfaseId,
  atividadeId,
  etapaCode,
  loteId
) => {
  const perfilLinhagem = await connection.oneOrNone(
    'SELECT tipo_exibicao_id FROM macrocontrole.perfil_linhagem WHERE subfase_id = $1 AND lote_id = $2 LIMIT 1',
    [subfaseId, loteId]
  )
  let linhagem
  if (
    perfilLinhagem &&
    ((perfilLinhagem.tipo_exibicao_id === 2 && (etapaCode === 2 || etapaCode === 5)) ||
      perfilLinhagem.tipo_exibicao_id === 3)
  ) {
    linhagem = await connection.any(
      `SELECT a.data_inicio, a.data_fim, u.nome_guerra, tpg.nome_abrev AS posto_grad,
      tf.nome AS fase, sf.nome AS subfase, ut.lote_id,
      replace(te.nome || ' - ' || e.ordem, 'Execução - 1', 'Execução') as etapa, ts.nome as situacao
      FROM macrocontrole.atividade AS a
      INNER JOIN dominio.tipo_situacao AS ts ON ts.code = a.tipo_situacao_id
      INNER JOIN dgeo.usuario AS u ON u.id = a.usuario_id
      INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
      INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
      INNER JOIN macrocontrole.etapa AS e ON a.etapa_id = e.id
      INNER JOIN dominio.tipo_etapa AS te ON te.code = e.tipo_etapa_id
      INNER JOIN macrocontrole.subfase AS sf ON sf.id = e.subfase_id
      INNER JOIN macrocontrole.fase AS f ON f.id = sf.fase_id
      INNER JOIN dominio.tipo_fase AS tf ON tf.code = f.tipo_fase_id
      INNER JOIN (
        SELECT ut.geom, ut.lote_id
        FROM macrocontrole.atividade AS a
        INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
        WHERE a.id = $1
      ) AS ut_ref ON ut_ref.lote_id = ut.lote_id AND ut.geom && ut_ref.geom AND st_relate(ut.geom, ut_ref.geom, '2********')
      WHERE ts.code != 5
      ORDER BY f.ordem, sf.nome, a.data_fim
        `,
      [atividadeId]
    )
  } else {
    linhagem = await connection.any(
      `SELECT a.data_inicio, a.data_fim,
      tf.nome AS fase, sf.nome AS subfase, ut.lote_id,
      replace(te.nome || ' - ' || e.ordem, 'Execução - 1', 'Execução') as etapa, ts.nome as situacao
      FROM macrocontrole.atividade AS a
      INNER JOIN dominio.tipo_situacao AS ts ON ts.code = a.tipo_situacao_id
      INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
      INNER JOIN macrocontrole.etapa AS e ON a.etapa_id = e.id
      INNER JOIN dominio.tipo_etapa AS te ON te.code = e.tipo_etapa_id
      INNER JOIN macrocontrole.subfase AS sf ON sf.id = e.subfase_id
      INNER JOIN macrocontrole.fase AS f ON f.id = sf.fase_id
      INNER JOIN dominio.tipo_fase AS tf ON tf.code = f.tipo_fase_id
      INNER JOIN (
        SELECT ut.geom, ut.lote_id
        FROM macrocontrole.atividade AS a
        INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
        WHERE a.id = $1
      ) AS ut_ref ON ut_ref.lote_id = ut.lote_id AND ut.geom && ut_ref.geom AND st_relate(ut.geom, ut_ref.geom, '2********')
      WHERE ts.code != 5
      ORDER BY f.ordem, sf.nome, a.data_fim
        `,
      [atividadeId]
    )
  }
  linhagem.forEach((r) => {
    if (r.data_inicio) {
      r.data_inicio = new Date(r.data_inicio).toLocaleString()
    }
    if (r.data_fim) {
      r.data_fim = new Date(r.data_fim).toLocaleString()
    }
  })
  return linhagem
}

const getInfoRequisitos = async (connection, subfaseId, loteId) => {
  return connection.any(
    `SELECT r.descricao
      FROM macrocontrole.perfil_requisito_finalizacao AS r
      WHERE r.subfase_id = $1 AND r.lote_id = $2 ORDER BY r.ordem`,
    [subfaseId, loteId]
  )
}

const getAtalhos = async (connection) => {
  return connection.any(
    `SELECT ferramenta, idioma, atalho
      FROM dgeo.qgis_shortcuts`
  )
}

const dadosProducao = async (atividadeId) => {
  const results = await db.sapConn.task(async t => {
    const dadosut = await t.one(prepared.retornaDadosProducao, [atividadeId])

    const info = {}
    info.usuario_id = dadosut.usuario_id
    info.login = dadosut.login
    info.usuario_nome = dadosut.nome_guerra

    info.atividade = {}
    info.atividade.id = atividadeId
    info.atividade.epsg = dadosut.epsg
    info.atividade.projeto = dadosut.projeto
    info.atividade.lote = dadosut.lote
    info.atividade.bloco = dadosut.bloco
    info.atividade.tipo_produto = dadosut.tipo_produto
    info.atividade.denominador_escala = dadosut.denominador_escala
    info.atividade.dificuldade = dadosut.dificuldade
    info.atividade.observacao_atividade = dadosut.observacao_atividade
    info.atividade.observacao_unidade_trabalho =
      dadosut.observacao_unidade_trabalho
    info.atividade.geom = dadosut.unidade_trabalho_geom
    info.atividade.unidade_trabalho_id = dadosut.unidade_trabalho_id
    info.atividade.lote_id = dadosut.lote_id
    info.atividade.fase_id = dadosut.fase_id
    info.atividade.subfase_id = dadosut.subfase_id
    info.atividade.etapa_id = dadosut.etapa_id
    info.atividade.tipo_etapa_id = dadosut.tipo_etapa_id
    info.atividade.nome =
      dadosut.subfase_nome +
      ' - ' +
      dadosut.etapa_nome +
      ' - ' +
      dadosut.ut_id
    info.atividade.dado_producao = {
      configuracao_producao: dadosut.configuracao_producao,
      tipo_dado_producao_id: dadosut.tipo_dado_producao_id
    }

    info.atividade.camadas = await getInfoCamadas(
      t,
      dadosut.tipo_etapa_id,
      dadosut.subfase_id
    )

    info.atividade.alias = await getAlias(
      t,
      dadosut.subfase_id,
      dadosut.lote_id
    )

    info.atividade.menus = await getInfoMenus(
      t,
      dadosut.tipo_etapa_id,
      dadosut.subfase_id,
      dadosut.lote_id
    )

    info.atividade.estilos = await getInfoEstilos(t, dadosut.subfase_id, dadosut.lote_id)

    info.atividade.regras = await getInfoRegras(t, dadosut.subfase_id, dadosut.lote_id)

    info.atividade.fme = await getInfoFME(t, dadosut.subfase_id, dadosut.lote_id)

    info.atividade.configuracao_qgis = await getInfoConfigQGIS(
      t,
      dadosut.subfase_id,
      dadosut.lote_id
    )

    /*
    info.atividade.monitoramento = await getInfoMonitoramento(
      t,
      dadosut.subfase_id,
      dadosut.lote_id
    )*/

    info.atividade.insumos = await getInfoInsumos(
      t,
      dadosut.unidade_trabalho_id
    )

    info.atividade.models_qgis = await getInfoModelsQGIS(t, dadosut.subfase_id, dadosut.lote_id)

    info.atividade.workflow_dsgtools = await getInfoWorkflow(t, dadosut.subfase_id, dadosut.lote_id)

    info.atividade.linhagem = await getInfoLinhagem(
      t,
      dadosut.subfase_id,
      atividadeId,
      dadosut.tipo_etapa_id,
      dadosut.lote_id
    )

    info.atividade.requisitos = await getInfoRequisitos(t, dadosut.subfase_id, dadosut.lote_id)

    info.atividade.atalhos = await getAtalhos(t)

    //TODO infoEdicao se fase for de edição

    return info
  })

  return results
}

controller.getDadosAtividade = async (
  atividadeId,
  usuarioId,
  grant
) => {
  const dados = await dadosProducao(atividadeId)
  dados.login_info = await temporaryLogin.getLogin(
    atividadeId,
    usuarioId,
    grant
  )
  return dados
}

controller.getDadosAtividadeAdmin = async (
  atividadeId,
  adminId
) => {
  const dados = await dadosProducao(atividadeId)
  dados.login_info = await temporaryLogin.getLoginAdmin(
    atividadeId,
    adminId
  )
  return dados
}

controller.verifica = async (usuarioId) => {
  const emAndamento = await db.sapConn.oneOrNone(
    `SELECT a.id
      FROM macrocontrole.atividade AS a
      INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
      WHERE a.usuario_id = $<usuarioId> AND ut.disponivel IS TRUE AND a.tipo_situacao_id = 2
      LIMIT 1`,
    { usuarioId }
  )
  if (!emAndamento) {
    return null
  }

  return controller.getDadosAtividade(emAndamento.id, usuarioId, false)
}

controller.finaliza = async (
  usuarioId,
  atividadeId,
  semCorrecao,
  alterarFluxo,
  infoEdicao,
  observacaoProximaAtividade
) => {
  const dataFim = new Date()
  let ativ
  await disableTriggers.disableAllTriggersInTransaction(db.sapConn, async t => {
    // Usuário é passado como uma medida de segurança para garantir que quem está finalizando é o usuário da atividade
    const result = await t.any(
      `UPDATE macrocontrole.atividade SET
        data_fim = $<dataFim>, tipo_situacao_id = 4
        WHERE id = $<atividadeId> AND usuario_id = $<usuarioId> AND tipo_situacao_id in (2) RETURNING id`,
      { dataFim, atividadeId, usuarioId }
    )

    if (!(result && result.length > 0)) {
      throw new AppError(
        'Erro ao finalizar atividade. Atividade não encontrada ou não corresponde a este operador',
        httpCode.BadRequest
      )
    }
    ativ = result.map(d => d.id)

    if (observacaoProximaAtividade) {
      const obsResult = await t.result(
        `UPDATE macrocontrole.atividade SET
          observacao = concat_ws(' | ', observacao, $<observacaoProximaAtividade>)
          WHERE id IN (
            SELECT aprox.id FROM macrocontrole.atividade AS a
            INNER JOIN macrocontrole.atividade AS aprox ON aprox.unidade_trabalho_id = a.unidade_trabalho_id
            INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
            INNER JOIN macrocontrole.etapa AS eprox ON eprox.id = aprox.etapa_id
            WHERE a.id = $<atividadeId> AND eprox.ordem > e.ordem
            ORDER BY eprox.ordem
            LIMIT 1
          )`,
        { atividadeId, observacaoProximaAtividade }
      )

      if (!obsResult.rowCount || obsResult.rowCount !== 1) {
        throw new AppError(
          'Erro ao finalizar atividade. Não foi encontrada uma próxima atividade para preencher a observação.',
          httpCode.BadRequest
        )
      }
    }

    if (infoEdicao) {
      // TODO
    }

    if (semCorrecao) {
      const result = await t.result(
        `DELETE FROM macrocontrole.atividade 
          WHERE id in (
            with prox as (select e.id, lead(e.id, 1) OVER(PARTITION BY e.subfase_id ORDER BY e.ordem) as prox_id
            from macrocontrole.atividade as a
            inner join macrocontrole.etapa as erev on erev.id = a.etapa_id
            inner join macrocontrole.etapa as e on e.subfase_id = erev.subfase_id AND e.lote_id = erev.lote_id
            where erev.tipo_etapa_id in (2,5) and a.id = $<atividadeId>)
            select a.id
            from macrocontrole.atividade as a
            inner join macrocontrole.atividade as arev on arev.unidade_trabalho_id = a.unidade_trabalho_id
            inner join prox as p on p.prox_id = a.etapa_id and p.id = arev.etapa_id
            where arev.id=$<atividadeId>
          )`,
        { atividadeId }
      )

      if (!result.rowCount || result.rowCount === 0) {
        throw new AppError('Erro ao bloquear correção')
      }
    }
    if (alterarFluxo) {
      await t.none(
        `
        INSERT INTO macrocontrole.alteracao_fluxo(atividade_id, descricao, geom)
        SELECT a.id, $<alterarFluxo> AS descricao, ut.geom FROM macrocontrole.atividade AS a
        INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
        WHERE a.id = $<atividadeId>
        `,
        { atividadeId, alterarFluxo }
      )
      await t.none(
        `
        UPDATE macrocontrole.unidade_trabalho SET
        disponivel = FALSE
        WHERE id IN (
          SELECT unidade_trabalho_id FROM macrocontrole.atividade
          WHERE id = $<atividadeId>
        )
        `,
        { atividadeId }
      )
    }

    await temporaryLogin.resetPassword(atividadeId, usuarioId)
  })
  //nonblocking call
  disableTriggers.refreshMaterializedViewFromAtivs(db.sapConn, ativ)
}

controller.inicia = async (usuarioId) => {
  const dataInicio = new Date()
  const prioridade = await controller.calculaFila(usuarioId)
  if (!prioridade) {
    return null
  }
  let ativ
  await disableTriggers.disableAllTriggersInTransaction(db.sapConn, async t => {
    const verify = await t.oneOrNone(
      `SELECT id FROM macrocontrole.atividade
      WHERE usuario_id = $<usuarioId> AND tipo_situacao_id = 2`,
      { usuarioId }
    )

    if (verify) {
      throw new AppError(
        'O usuário já possui atividades em andamento',
        httpCode.BadRequest
      )
    }

    await t.none(
      `DELETE FROM macrocontrole.fila_prioritaria
          WHERE atividade_id IN (
          SELECT id from macrocontrole.atividade WHERE id = $<prioridade>)`,
      { prioridade }
    )
    await t.none(
      `DELETE FROM macrocontrole.fila_prioritaria_grupo
          WHERE atividade_id IN (
          SELECT id from macrocontrole.atividade WHERE id = $<prioridade>)`,
      { prioridade }
    )
    const result = await t.any(
      `UPDATE macrocontrole.atividade SET
          data_inicio = $<dataInicio>, tipo_situacao_id = 2, usuario_id = $<usuarioId>
          WHERE id = $<prioridade> and tipo_situacao_id IN (1,3) RETURNING id`,
      { dataInicio, prioridade, usuarioId }
    )

    if (!(result && result.length > 0)) {
      throw new AppError('Não pode iniciar a tarefa selecionada para a fila')
    }

    ativ = result.map(d => d.id)
  })
  //nonblocking call
  disableTriggers.refreshMaterializedViewFromAtivs(db.sapConn, ativ)

  return controller.getDadosAtividade(prioridade, usuarioId, true)
}

controller.problemaAtividade = async (
  atividadeId,
  tipoProblemaId,
  descricao,
  usuarioId
) => {
  const dataFim = new Date()
  let ativ
  await disableTriggers.disableAllTriggersInTransaction(db.sapConn, async t => {
    const result = await t.any(
      `
      UPDATE macrocontrole.atividade SET
      data_fim = $<dataFim>, tipo_situacao_id = 5
      WHERE id = $<atividadeId> AND tipo_situacao_id = 2 AND usuario_id = $<usuarioId> RETURNING id
      `,
      { dataFim, atividadeId, usuarioId }
    )
    if (!(result && result.length > 0)) {
      throw new AppError(
        'Não foi possível de reportar problema, atividade não encontrada ou não corresponde a uma atividade em execução do usuário',
        httpCode.BadRequest
      )
    }
    ativ = result.map(d => d.id)

    const atividade = await t.one(
      `SELECT a.etapa_id, a.unidade_trabalho_id, ST_AsText(ut.geom) AS geom
      FROM macrocontrole.atividade AS a
      INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
      WHERE a.id = $<atividadeId>`,
      { atividadeId }
    )

    const newId = await t.one(
      `
      INSERT INTO macrocontrole.atividade(etapa_id, unidade_trabalho_id, usuario_id, tipo_situacao_id)
      VALUES($<etapaId>,$<unidadeTrabalhoId>,$<usuarioId>,3) RETURNING id
      `,
      {
        etapaId: atividade.etapa_id,
        unidadeTrabalhoId: atividade.unidade_trabalho_id,
        usuarioId: usuarioId
      }
    )
    await t.any(
      `
      INSERT INTO macrocontrole.problema_atividade(atividade_id, tipo_problema_id, descricao, data, resolvido, geom)
      VALUES($<id>,$<tipoProblemaId>,$<descricao>, NOW(), FALSE, ST_GEOMFROMEWKT($<geom>))
      `,
      {
        id: newId.id,
        unidadeTrabalhoId: atividade.unidade_trabalho_id,
        tipoProblemaId,
        descricao,
        geom: `SRID=4326;${atividade.geom}`
      }
    )
    await t.any(
      `
        UPDATE macrocontrole.unidade_trabalho SET
        disponivel = FALSE
        WHERE id = $<unidadeTrabalhoId>
        `,
      { unidadeTrabalhoId: atividade.unidade_trabalho_id }
    )

    await temporaryLogin.resetPassword(atividadeId, usuarioId)
  })
  //nonblocking call
  disableTriggers.refreshMaterializedViewFromAtivs(db.sapConn, ativ)
}

controller.getTipoProblema = async () => {
  const tipoProblema = await db.sapConn.any(
    'SELECT code, nome FROM dominio.tipo_problema'
  )
  const dados = []
  tipoProblema.forEach((p) => {
    dados.push({ tipo_problema_id: p.code, tipo_problema: p.nome })
  })
  return dados
}

module.exports = controller
