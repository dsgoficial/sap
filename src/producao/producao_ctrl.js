"use strict";

const { db, temporaryLogin } = require("../database");

const { AppError, httpCode } = require("../utils");

const prepared = require("./prepared_statements");

const controller = {};

controller.calculaFila = async usuarioId => {
  const prioridade = await db.sapConn.task(async t => {
    const fila_prioritaria = await t.oneOrNone(
      prepared.calculaFilaPrioritaria,
      [usuarioId]
    );

    if (fila_prioritaria) {
      return fila_prioritaria.id;
    }

    const fila_prioritaria_grupo = await t.oneOrNone(
      prepared.calculaFilaPrioritariaGrupo,
      [usuarioId]
    );

    if (fila_prioritaria_grupo) {
      return fila_prioritaria_grupo.id;
    }

    const cartas_pausadas = await t.oneOrNone(prepared.calculaFilaPausada, [
      usuarioId
    ]);

    if (cartas_pausadas) {
      return cartas_pausadas.id;
    }

    const prioridade_operador = await t.oneOrNone(prepared.calculaFila, [
      usuarioId
    ]);

    if (prioridade_operador) {
      return prioridade_operador.id;
    }

    return null;
  });
  return prioridade;
};

const getInfoCamadas = async (connection, etapaCode, subfaseId) => {
  let camadas;
  let atributos;

  if (etapaCode == 1 || etapaCode == 4) {
    camadas = await connection.any(
      `SELECT c.schema, c.nome, c.alias, c.documentacao, pc.escala_trabalho, pc.atributo_filtro_subfase
        FROM macrocontrole.perfil_propriedades_camada AS pc
        INNER JOIN macrocontrole.camada AS c ON c.id = pc.camada_id
        WHERE pc.subfase_id = $1 and not pc.camada_apontamento`,
      [subfaseId]
    );
    atributos = await connection.any(
      `SELECT a.nome, a.alias, c.nome as camada, c.schema
        FROM macrocontrole.atributo AS a
        INNER JOIN macrocontrole.perfil_propriedades_camada AS pc ON pc.camada_id = a.camada_id
        INNER JOIN macrocontrole.camada AS c ON c.id = pc.camada_id
        WHERE pc.subfase_id = $1 and not pc.camada_apontamento`,
      [subfaseId]
    );
  } else {
    camadas = await connection.any(
      `SELECT c.schema, c.nome, c.alias, c.documentacao, pc.escala_trabalho, pc.atributo_filtro_subfase, pc.camada_apontamento, pc.atributo_justificativa_apontamento, pc.atributo_situacao_correcao
        FROM macrocontrole.perfil_propriedades_camada AS pc
        INNER JOIN macrocontrole.camada AS c ON c.id = pc.camada_id
        WHERE pc.subfase_id = $1`,
      [subfaseId]
    );
    atributos = await connection.any(
      `SELECT a.nome, a.alias, c.nome as camada, c.schema
        FROM macrocontrole.atributo AS a
        INNER JOIN macrocontrole.perfil_propriedades_camada AS pc ON pc.camada_id = a.camada_id
        INNER JOIN macrocontrole.camada AS c ON c.id = pc.camada_id
        WHERE pc.subfase_id = $1`,
      [subfaseId]
    );
  }

  const result = [];

  camadas.forEach(r => {
    const aux = { nome: r.nome, schema: r.schema };
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
    const aux_att = [];
    atributos.forEach(a => {
      if (a.camada === r.nome && a.schema === r.schema) {
        aux_att.push({ nome: a.nome, alias: a.alias });
      }
    });
    if (aux_att.length > 0) {
      aux.atributos = aux_att;
    }
    result.push(aux);
  });

  return result;
};

const getInfoMenus = async (connection, etapaCode, subfaseId) => {
  if (etapaCode == 2) {
    return connection.any(
      `SELECT mp.nome, mp.definicao_menu, mp.ordem_menu FROM macrocontrole.perfil_menu AS pm
        INNER JOIN dgeo.layer_menus AS mp On mp.nome = pm.nome
        WHERE subfase_id = $1`,
      [subfaseId]
    );
  }
  return connection.any(
    `SELECT mp.nome, mp.definicao_menu, mp.ordem_menu FROM macrocontrole.perfil_menu AS pm
        INNER JOIN dgeo.layer_menus AS mp On mp.nome = pm.nome
        WHERE subfase_id = $1 and not menu_revisao`,
    [subfaseId]
  );
};

const getInfoEstilos = async (connection, subfaseId) => {
  return await connection.any(
    `SELECT ls.f_table_schema, ls.f_table_name, ls.f_geometry_column, ls.stylename, ls.styleqml, ls.ui FROM macrocontrole.perfil_estilo AS pe
      INNER JOIN dgeo.layer_styles AS ls ON ls.stylename = pe.nome
      INNER JOIN macrocontrole.camada AS c ON c.nome = ls.f_table_name AND c.schema = ls.f_table_schema
      INNER JOIN macrocontrole.perfil_propriedades_camada AS pc ON pc.camada_id = c.id
      WHERE pe.subfase_id = $1 AND pc.subfase_id = $1`,
    [subfaseId]
  );
};

const getInfoRegras = async (connection, subfaseId) => {
  return await connection.any(
    `SELECT lr.tipo_regra, lr.schema, lr.camada, lr.atributo, lr.regra, lr.grupo_regra, lr.cor_rgb, lr.descricao, lr.ordem FROM macrocontrole.perfil_regras as pr
      INNER JOIN dgeo.layer_rules AS lr ON lr.grupo_regra = pr.nome
      INNER JOIN macrocontrole.camada AS c ON c.nome = lr.camada AND c.schema = lr.schema
      INNER JOIN macrocontrole.perfil_propriedades_camada AS pc ON pc.camada_id = c.id
      WHERE pr.subfase_id = $1 AND pc.subfase_id = $1`,
    [subfaseId]
  );
};

const getInfoFME = async (connection, subfaseId) => {
  return await connection.any(
    `SELECT gf.servidor, gf.porta, pf.rotina, pf.gera_falso_positivo, pf.requisito_finalizacao FROM macrocontrole.perfil_fme AS pf
    INNER JOIN dgeo.gerenciador_fme AS gf ON gf.id = pf.gerenciador_fme_id
    WHERE subfase_id = $<subfaseId>`,
    { subfaseId }
  );
};

const getInfoConfigQGIS = async (connection, subfaseId) => {
  return await connection.any(
    `SELECT tipo_configuracao_id, parametros FROM macrocontrole.perfil_configuracao_qgis WHERE subfase_id = $<subfaseId>`,
    { subfaseId }
  );
};

const getInfoMonitoramento = async (connection, subfaseId) => {
  return await connection.any(
    `SELECT pm.tipo_monitoramento_id, tm.nome as tipo_monitoramento
      FROM macrocontrole.perfil_monitoramento AS pm
      INNER JOIN dominio.tipo_monitoramento AS tm ON tm.code = pm.tipo_monitoramento_id
      WHERE subfase_id = $1`,
    [subfaseId]
  );
};

const getInfoInsumos = async (connection, unidadeTrabalhoId) => {
  return await connection.any(
    `SELECT i.nome, i.caminho, i.epsg, i.tipo_insumo_id, iut.caminho_padrao
      FROM macrocontrole.insumo AS i
      INNER JOIN macrocontrole.insumo_unidade_trabalho AS iut ON i.id = iut.insumo_id
      WHERE iut.unidade_trabalho_id = $1`,
    [unidadeTrabalhoId]
  );
};

const getInfoModelsQGIS = async (connection, subfaseId) => {
  return await connection.any(
    `SELECT pmq.nome, lqm.descricao, lqm.model_xml, pmq.gera_falso_positivo, pmq.requisito_finalizacao
      FROM macrocontrole.perfil_model_qgis AS pmq
      INNER JOIN dgeo.layer_qgis_models AS lqm ON pmq.nome = lqm.nome
      WHERE pmq.subfase_id = $1`,
    [subfaseId]
  );
};

const getInfoLinhagem = async (
  connection,
  subfaseId,
  atividadeId,
  etapaCode
) => {
  const perfil_linhagem = await connection.oneOrNone(
    "SELECT tipo_exibicao_id FROM macrocontrole.perfil_linhagem WHERE subfase_id = $1 LIMIT 1",
    [subfaseId]
  );
  let linhagem;
  if (
    perfil_linhagem &&
    ((perfil_linhagem.tipo_exibicao_id == 2 && etapaCode == 2) ||
      perfil_linhagem.tipo_exibicao_id == 3)
  ) {
    linhagem = await connection.any(
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
      [atividadeId]
    );
  } else {
    linhagem = await connection.any(
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
      [atividadeId]
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

  return linhagem;
};

const getInfoRequisitos = async (connection, subfaseId) => {
  return await connection.any(
    `SELECT r.descricao
      FROM macrocontrole.requisito_finalizacao AS r
      WHERE r.subfase_id = $1 ORDER BY r.ordem`,
    [subfaseId]
  );
};

const getAtalhos = async connection => {
  return await connection.any(
    `SELECT descricao, ferramenta, atalho
      FROM dgeo.atalhos_qgis`
  );
};

const getInfoQuestionario = async (connection, subfaseId) => {
  const questionario = await connection.any(
    `SELECT q.nome AS nome_questionario, p.id AS pergunta_id, p.texto AS pergunta,
    o.id AS opcao_id, o.texto AS opcao
    FROM avaliacao.questionario AS q
    INNER JOIN avaliacao.pergunta AS p ON p.questionario_id = q.id
    INNER JOIN avaliacao.opcao AS o ON o.pergunta_id = p.id
    WHERE q.subfase_id = $1 
    ORDER BY p.ordem, o.ordem`,
    [subfaseId]
  );

  const result = {};
  result.perguntas = [];
  const perguntas = {};
  questionario.forEach(i => {
    result.nome = i.nome_questionario;

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
    result.perguntas.push(perguntas[key]);
  }

  return result;
};

const dadosProducao = async atividadeId => {
  const results = await db.sapConn.task(async t => {
    const dadosut = await t.one(prepared.retornaDadosProducao, [atividadeId]);

    const info = {};
    info.usuario_id = dadosut.usuarioId;
    info.usuario_nome = dadosut.nome_guerra;

    info.atividade = {};
    info.atividade.id = atividadeId;
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

    info.atividade.camadas = await getInfoCamadas(
      t,
      dadosut.etapa_code,
      dadosut.subfase_id
    );

    info.atividade.menus = await getInfoMenus(
      t,
      dadosut.etapa_code,
      dadosut.subfase_id
    );

    info.atividade.estilos = await getInfoEstilos(t, dadosut.subfase_id);

    info.atividade.regras = await getInfoRegras(t, dadosut.subfase_id);

    info.atividade.fme = await getInfoFME(t, dadosut.subfase_id);

    info.atividade.configuracao_qgis = await getInfoConfigQGIS(
      t,
      dadosut.subfase_id
    );

    info.atividade.monitoramento = await getInfoMonitoramento(
      t,
      dadosut.subfase_id
    );

    info.atividade.insumos = await getInfoInsumos(
      t,
      dadosut.unidade_trabalho_id
    );

    info.atividade.models_qgis = await getInfoModelsQGIS(t, dadosut.subfase_id);

    info.atividade.linhagem = await getInfoLinhagem(
      t,
      dadosut.subfase_id,
      atividadeId,
      dadosut.etapa_code
    );

    info.atividade.requisitos = await getInfoRequisitos(t, dadosut.subfase_id);

    info.atividade.atalhos = await getAtalhos(t);

    /*
    info.atividade.questionario = await getInfoQuestionario(
      t,
      dadosut.subfase_id
    );
    */
    return info;
  });

  return results;
};

controller.getDadosAtividade = async (
  atividadeId,
  usuarioId,
  resetPassword = false
) => {
  const dados = await dadosProducao(atividadeId);
  dados.login_info = await temporaryLogin.getLogin(
    atividadeId,
    usuarioId,
    resetPassword
  );
  return dados;
};

controller.verifica = async usuarioId => {
  const emAndamento = await db.sapConn.oneOrNone(
    `SELECT a.id
      FROM macrocontrole.atividade AS a
      INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
      WHERE a.usuario_id = $<usuarioId> AND ut.disponivel IS TRUE AND a.tipo_situacao_id = 2
      LIMIT 1`,
    { usuarioId }
  );
  if (!emAndamento) {
    return null;
  }

  //Medida de segurança para tornar outras atividades que estão em execução como pausadas
  await db.sapConn.none(
    `UPDATE macrocontrole.atividade SET
       tipo_situacao_id = 3 
       WHERE tipo_situacao_id = 2 AND usuario_id = $<usuarioId> AND id != $<emAndamentoId>`,
    { usuarioId, emAndamentoId: emAndamento.id }
  );

  return controller.getDadosAtividade(emAndamento.id, usuarioId);
};

controller.finaliza = async (usuarioId, atividadeId, semCorrecao) => {
  const dataFim = new Date();
  await db.sapConn.tx(async t => {
    //Usuário é passado como uma medida de segurança para garantir que quem está finalizando é o usuário da atividade
    const result = await t.result(
      `UPDATE macrocontrole.atividade SET
        data_fim = $<dataFim>, tipo_situacao_id = 4, tempo_execucao_microcontrole = macrocontrole.tempo_execucao_microcontrole($<atividadeId>), tempo_execucao_estimativa = macrocontrole.tempo_execucao_estimativa($<atividadeId>)
        WHERE id = $<atividadeId> AND usuario_id = $<usuarioId> AND tipo_situacao_id in (2)`,
      { dataFim, atividadeId, usuarioId }
    );

    if (!result.rowCount || result.rowCount != 1) {
      throw new AppError(
        "Erro ao finalizar atividade. Atividade não encontrada ou não corresponde a este operador",
        httpCode.BadRequest
      );
    }
    if (semCorrecao) {
      const result = await t.result(
        `DELETE FROM macrocontrole.atividade 
          WHERE id in (
            with prox as (select e.id, lead(e.id, 1) OVER(PARTITION BY e.subfase_id ORDER BY e.ordem) as prox_id
            from macrocontrole.atividade as a
            inner join macrocontrole.etapa as erev on erev.id = a.etapa_id
            inner join macrocontrole.etapa as e on e.subfase_id = erev.subfase_id
            where erev.tipo_etapa_id = 2 and a.id = $<atividadeId>)
            select a.id
            from macrocontrole.atividade as a
            inner join macrocontrole.atividade as arev on arev.unidade_trabalho_id = a.unidade_trabalho_id
            inner join prox as p on p.prox_id = a.etapa_id and p.id = arev.etapa_id
            where arev.id=$<atividadeId>
          )`,
        { atividadeId }
      );

      if (!result.rowCount || result.rowCount != 1) {
        throw new AppError("Erro ao bloquear correção");
      }
    }
    await temporaryLogin.resetPassword(atividadeId, usuarioId);
  });
};

controller.inicia = async usuarioId => {
  const dataInicio = new Date();
  const prioridade = await controller.calculaFila(usuarioId);
  if (!prioridade) {
    return null;
  }
  await db.sapConn.tx(async t => {
    const verify = await t.oneOrNone(
      `SELECT id FROM macrocontrole.atividade
      WHERE usuario_id = $<usuarioId> AND tipo_situacao_id = 2`,
      { usuarioId }
    );

    if (verify) {
      throw new AppError(
        "O usuário já possui atividades em andamento",
        httpCode.BadRequest
      );
    }

    await t.none(
      `DELETE FROM macrocontrole.fila_prioritaria
          WHERE atividade_id IN (
          SELECT id from macrocontrole.atividade WHERE id = $<prioridade>)`,
      { prioridade }
    );
    await t.none(
      `DELETE FROM macrocontrole.fila_prioritaria_grupo
          WHERE atividade_id IN (
          SELECT id from macrocontrole.atividade WHERE id = $<prioridade>)`,
      { prioridade }
    );
    const result = await t.result(
      `UPDATE macrocontrole.atividade SET
          data_inicio = $<dataInicio>, tipo_situacao_id = 2, usuario_id = $<usuarioId>
          WHERE id = $<prioridade> and tipo_situacao_id IN (1,3)`,
      { dataInicio, prioridade, usuarioId }
    );

    if (!result.rowCount) {
      throw new AppError("Não pode iniciar a tarefa selecionada para a fila");
    }
  });

  return controller.getDadosAtividade(prioridade, usuarioId, true);
};

controller.respondeQuestionario = async (atividadeId, respostas, usuarioId) => {
  const dataQuestionario = new Date();
  await db.sapConn.tx(async t => {
    const verify = await t.oneOrNone(
      `SELECT id FROM macrocontrole.atividade
      WHERE usuario_id = $<usuarioId> AND tipo_situacao_id = 2 AND atividade_id = $<atividadeId>`,
      { usuarioId, atividadeId }
    );

    if (!verify) {
      throw new AppError(
        "Questionário deve ser respondido de uma atividade em execução pelo usuário",
        httpCode.BadRequest
      );
    }

    const respostaQuestionario = await t.one(
      `
      INSERT INTO avaliacao.resposta_questionario(data, atividade_id) VALUES($<dataQuestionario>,$<atividadeId>) RETURNING id
      `,
      { dataQuestionario, atividadeId }
    );
    const queries = [];
    respostas.forEach(r => {
      queries.push(
        t.none(
          `
          INSERT INTO avaliacao.resposta(pergunta_id, opcao_id, resposta_questionario_id) 
          VALUES ($<perguntaId>,$<opcaoId>,$<respostaQuestionarioId>)
          `,
          {
            perguntaId: r.pergunta_id,
            opcaoId: r.opcao_id,
            respostaQuestionarioId: respostaQuestionario.id
          }
        )
      );
    });
    return await t.batch(queries);
  });
};

controller.problemaAtividade = async (
  atividadeId,
  tipoProblemaId,
  descricao,
  usuarioId
) => {
  const dataFim = new Date();
  await db.sapConn.tx(async t => {
    const result = await t.result(
      `
      UPDATE macrocontrole.atividade SET
      data_fim = $<dataFim>, tipo_situacao_id = 5, tempo_execucao_microcontrole = macrocontrole.tempo_execucao_microcontrole($<atividadeId>), tempo_execucao_estimativa = macrocontrole.tempo_execucao_estimativa($<atividadeId>)
      WHERE id = $<atividadeId> AND tipo_situacao_id = 2 AND usuario_id = $<usuarioId>
      `,
      { dataFim, atividadeId, usuarioId }
    );
    if (!result.rowCount) {
      throw new AppError(
        "Não foi possível de reportar problema, atividade não encontrada ou não corresponde a uma atividade em execução do usuário",
        httpCode.BadRequest
      );
    }
    const atividade = await t.one(
      `SELECT a.etapa_id, a.unidade_trabalho_id, ST_AsText(ut.geom) AS geom
      FROM macrocontrole.atividade AS a
      INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
      WHERE id = $<atividadeId>`,
      { atividadeId }
    );

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
    );
    await t.any(
      `
      INSERT INTO macrocontrole.problema_atividade(atividade_id, unidade_trabalho_id, tipo_problema_id, descricao, data, resolvido, geom)
      VALUES($<id>,$<unidadeTrabalhoId>,$<tipoProblemaId>,$<descricao>, NOW(), FALSE, ST_GEOMFROMEWKT($<geom>))
      `,
      {
        id: newId.id,
        unidadeTrabalhoId: atividade.unidade_trabalho_id,
        tipoProblemaId,
        descricao,
        geom: `SRID=4674;${atividade.geom}`
      }
    );
    await t.any(
      `
        UPDATE macrocontrole.unidade_trabalho SET
        disponivel = FALSE
        WHERE id = $<unidadeTrabalhoId>
        `,
      { unidadeTrabalhoId: atividade.unidade_trabalho_id }
    );

    await temporaryLogin.resetPassword(atividadeId, usuarioId);
  });
};

controller.getTipoProblema = async () => {
  const tipoProblema = await db.sapConn.any(
    `SELECT code, nome FROM dominio.tipo_problema`
  );
  const dados = [];
  tipoProblema.forEach(p => {
    dados.push({ tipo_problema_id: p.code, tipo_problema: p.nome });
  });
  return dados;
};

module.exports = controller;
