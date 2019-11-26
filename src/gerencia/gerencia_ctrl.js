"use strict";

const { db } = require("../database");

const { AppError, httpCode, qgisProject } = require("../utils");

const { distribuicaoCtrl } = require("../distribuicao_atividades");

const controller = {};

const getUsuarioNomeById = async usuarioId => {
  const usuario = await t.one(
    `SELECT tpg.nome_abrev || ' ' || u.nome_guerra as posto_nome FROM dgeo.usuario as u
    INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
    WHERE u.id = $<usuarioId>`,
    { usuarioId }
  );
  return usuario.posto_nome;
};

controller.getAtividade = async (atividadeId, gerenteId) => {
  const atividade = await db.oneOrNone(
    `SELECT a.etapa_id, a.unidade_trabalho_id
    FROM macrocontrole.atividade AS a
    WHERE a.id = $<atividadeId>`,
    { atividadeId }
  );
  if (!atividade) {
    throw new AppError("Atividadade não encontrada", httpCode.NotFound);
  }

  return distribuicaoCtrl.getDadosAtividade(atividadeId, gerenteId);
};

controller.getAtividadeUsuario = async (usuarioId, proxima, gerenteId) => {
  let atividadeId;

  if (proxima) {
    const prioridade = await distribuicaoCtrl.calculaFila(usuario_id);
    atividadeId = prioridade;
  } else {
    const emAndamento = await db.oneOrNone(
      `SELECT a.id FROM macrocontrole.atividade AS a
      INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id
      WHERE a.usuario_id = $<usuarioId> and ut.disponivel IS TRUE and a.tipo_situacao_id = 2`,
      { usuarioId }
    );
    if (!emAndamento) {
      return null;
    }
    atividadeId = emAndamento.id;
  }

  return distribuicaoCtrl.getDadosAtividade(atividadeId, gerenteId);
};

controller.getEstilos = async () => {
  return await db.any(`SELECT * FROM dgeo.layer_styles`);
};

controller.getRegras = async () => {
  return await db.any(`SELECT * FROM dgeo.layer_rules`);
};

controller.getModelos = async () => {
  return await db.any(`SELECT * FROM dgeo.layer_qgis_models`);
};

controller.getMenus = async () => {
  return await db.any(`SELECT * FROM dgeo.layer_menus`);
};

controller.gravaEstilos = async (estilos, usuarioId) => {
  const dataGravacao = new Date();
  await db.tx(async t => {
    const usuarioPostoNome = getUsuarioNomeById(usuarioId);

    await t.none(`TRUNCATE dgeo.layer_styles RESTART IDENTITY`);

    const table = new db.helpers.TableName({
      table: "layer_styles",
      schema: "dgeo"
    });

    const cs = new db.helpers.ColumnSet(
      [
        "f_table_schema",
        "f_table_name",
        "f_geometry_column",
        "stylename",
        "styleqml",
        "stylesld",
        "ui",
        "owner",
        "update_time"
      ],
      { table }
    );

    const values = [];
    estilos.forEach(d => {
      values.push({
        f_table_schema: d.f_table_schema,
        f_table_name: d.f_table_name,
        f_geometry_column: d.f_geometry_column,
        stylename: d.stylename,
        styleqml: d.styleqml,
        stylesld: stylesld,
        ui: ui,
        owner: usuarioPostoNome,
        update_time: dataGravacao
      });
    });

    const query = db.helpers.insert(values, cs);

    await t.none(query);
  });
};

controller.grava_regras = async (regras, usuarioId) => {
  const dataGravacao = new Date();
  await db.tx(async t => {
    const usuarioPostoNome = getUsuarioNomeById(usuarioId);

    await t.none(`TRUNCATE dgeo.layer_rules RESTART IDENTITY`);

    const table = new db.helpers.TableName({
      table: "layer_rules",
      schema: "dgeo"
    });

    const cs = new db.helpers.ColumnSet(
      [
        "grupo_regra",
        "tipo_regra",
        "schema",
        "camada",
        "atributo",
        "regra",
        "cor_rgb",
        "descricao",
        "ordem",
        "owner",
        "update_time"
      ],
      { table }
    );

    const values = [];
    regras.forEach(d => {
      values.push({
        grupo_regra: d.grupo_regra,
        tipo_regra: d.tipo_regra,
        schema: d.schema,
        camada: d.camada,
        atributo: d.atributo,
        regra: d.regra,
        cor_rgb: d.cor_rgb,
        descricao: d.descricao,
        ordem: d.ordem,
        owner: usuarioPostoNome,
        update_time: dataGravacao
      });
    });

    const query = db.helpers.insert(values, cs);

    await t.none(query);
  });
};

controller.grava_modelos = async (modelos, usuarioId) => {
  const dataGravacao = new Date();
  await db.tx(async t => {
    const usuarioPostoNome = getUsuarioNomeById(usuarioId);

    await t.none(`TRUNCATE dgeo.layer_qgis_models RESTART IDENTITY`);

    const table = new db.helpers.TableName({
      table: "layer_qgis_models",
      schema: "dgeo"
    });

    const cs = new db.helpers.ColumnSet(
      ["nome", "descricao", "model_xml", "owner", "update_time"],
      { table }
    );

    const values = [];
    modelos.forEach(d => {
      values.push({
        nome: d.nome,
        descricao: d.descricao,
        model_xml: d.model_xml,
        owner: usuarioPostoNome,
        update_time: dataGravacao
      });
    });

    const query = db.helpers.insert(values, cs);

    await t.none(query);
  });
};

controller.grava_menus = async (menus, usuarioId) => {
  const dataGravacao = new Date();
  await db.tx(async t => {
    const usuarioPostoNome = getUsuarioNomeById(usuarioId);

    await t.none(`TRUNCATE dgeo.layer_menus RESTART IDENTITY`);

    const table = new db.helpers.TableName({
      table: "layer_menus",
      schema: "dgeo"
    });

    const cs = new db.helpers.ColumnSet(
      ["nome_menu", "definicao_menu", "ordem_menu", "owner", "update_time"],
      { table }
    );

    const values = [];
    menus.forEach(d => {
      values.push({
        nome_menu: d.nome_menu,
        definicao_menu: d.definicao_menu,
        ordem_menu: d.ordem_menu,
        owner: usuarioPostoNome,
        update_time: dataGravacao
      });
    });

    const query = db.helpers.insert(values, cs);

    await t.none(query);
  });
};

controller.getBancoDados = async () => {
  return await db.any(
    `SELECT nome, servidor, porta FROM macrocontrole.banco_dados`
  );
};

controller.getUsuario = async () => {
  return await db.any(
    `SELECT u.id, tpg.nome_abrev || ' ' || u.nome_guerra AS nome
      FROM dgeo.usuario AS u INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id WHERE u.ativo IS TRUE`
  );
};

controller.getPerfilProducao = async () => {
  await db.any(`SELECT id, nome FROM macrocontrole.perfil_producao`);
};

const pausaAtividadeMethod = async (unidadeTrabalhoIds, connection) => {
  const dataFim = new Date();

  const updatedIds = await connection.any(
    `
  UPDATE macrocontrole.atividade SET
  data_fim = $<dataFim>, tipo_situacao_id = 5, tempo_execucao_microcontrole = macrocontrole.tempo_execucao_microcontrole(id), tempo_execucao_estimativa = macrocontrole.tempo_execucao_estimativa(id)
  WHERE id in (
    SELECT a.id FROM macrocontrole.atividade AS a
    INNER JOIN macrocontrole.unidade_trabalho AS ut ON a.unidade_trabalho_id = ut.id
    WHERE ut.id in ($<unidadeTrabalhoIds>:csv) AND a.tipo_situacao_id = 2
    ) RETURNING id, usuario_id
  `,
    { dataFim, unidadeTrabalhoIds }
  );
  if (updatedIds.length === 0) {
    return false;
  }
  const updatedIdsFixed = [];
  updatedIds.forEach(u => {
    updatedIdsFixed.push(u.id);
  });
  const atividades = await connection.any(
    `SELECT etapa_id, unidade_trabalho_id, usuario_id FROM macrocontrole.atividade WHERE id in ($<updatedIdsFixed>:csv)`,
    { updatedIdsFixed }
  );

  const table = new db.helpers.TableName({
    table: "atividade",
    schema: "macrocontrole"
  });

  const cs = new db.helpers.ColumnSet(
    ["etapa_id", "unidade_trabalho_id", "usuario_id", "tipo_situacao_id"],
    { table }
  );

  const values = [];
  atividades.forEach(d => {
    values.push({
      etapa_id: d.etapa_id,
      unidade_trabalho_id: d.unidade_trabalho_id,
      usuario_id: d.usuario_id,
      tipo_situacao_id: 3
    });
  });

  const query = db.helpers.insert(values, cs);

  await connection.none(query);

  updatedIds.forEach(u => {
    temporaryLogin.resetPassword(u.id, u.usuario_id)
  })

  return true;
};

controller.unidadeTrabalhoDisponivel = async (
  unidadeTrabalhoIds,
  disponivel
) => {
  const table = new db.helpers.TableName({
    table: "unidade_trabalho",
    schema: "macrocontrole"
  });

  const cs = new db.helpers.ColumnSet(["?id", "disponivel"], { table });

  const values = [];
  unidadeTrabalhoIds.forEach(d => {
    values.push({
      id: d,
      disponivel
    });
  });

  const query =
    db.helpers.update(values, cs, null, {
      tableAlias: "X",
      valueAlias: "Y"
    }) + "WHERE Y.id = X.id";

  await db.tx(async t => {
    await t.none(query);
    if (!disponivel) {
      await pausaAtividadeMethod(unidadeTrabalhoIds, t);
    }
  });
};

controller.pausaAtividade = async unidadeTrabalhoIds => {
  await db.tx(async t => {
    const changed = await pausaAtividadeMethod(unidadeTrabalhoIds, t);
    if (!changed) {
      throw new AppError(
        "Unidades de trabalho não possuem atividades em execução",
        httpCode.NotFound
      );
    }
  });
};

controller.reiniciaAtividade = async unidadeTrabalhoIds => {
  const dataFim = new Date();
  await db.tx(async t => {
    const usersResetPassword = await t.any(
      `
      SELECT DISTINCT ON (ut.id) a.id, a.usuario_id FROM macrocontrole.atividade AS a
      INNER JOIN macrocontrole.unidade_trabalho AS ut ON a.unidade_trabalho_id = ut.id
      INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
      WHERE ut.id in ($<unidadeTrabalhoIds>:csv) AND a.tipo_situacao_id in (2)
      ORDER BY ut.id, e.ordem
    `,
      { unidadeTrabalhoIds }
    );

    const updatedIds = await t.any(
      `
    UPDATE macrocontrole.atividade SET
    data_inicio = COALESCE(data_inicio, $<dataFim>), data_fim = COALESCE(data_fim, $<dataFim>), tipo_situacao_id = 5, tempo_execucao_microcontrole = macrocontrole.tempo_execucao_microcontrole(id), tempo_execucao_estimativa = macrocontrole.tempo_execucao_estimativa(id)
    WHERE id in (
      SELECT DISTINCT ON (ut.id) a.id FROM macrocontrole.atividade AS a
      INNER JOIN macrocontrole.unidade_trabalho AS ut ON a.unidade_trabalho_id = ut.id
      INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
      WHERE ut.id in ($<unidadeTrabalhoIds>:csv) AND a.tipo_situacao_id in (2,3)
      ORDER BY ut.id, e.ordem
      ) RETURNING id
    `,
      { dataFim, unidadeTrabalhoIds }
    );
    if (updatedIds.length === 0) {
      throw new AppError(
        "Unidades de trabalho não possuem atividades em execução ou pausadas",
        httpCode.NotFound
      );
    }
    const updatedIdsFixed = [];
    updatedIds.forEach(u => {
      updatedIdsFixed.push(u.id);
    });
    const atividades = await t.any(
      `SELECT etapa_id, unidade_trabalho_id FROM macrocontrole.atividade WHERE id in ($<updatedIdsFixed>:csv)`,
      { updatedIdsFixed }
    );
    const table = new db.helpers.TableName({
      table: "atividade",
      schema: "macrocontrole"
    });
    const cs = new db.helpers.ColumnSet(
      ["etapa_id", "unidade_trabalho_id", "tipo_situacao_id"],
      { table }
    );

    const values = [];
    atividades.forEach(d => {
      values.push({
        etapa_id: d.etapa_id,
        unidade_trabalho_id: d.unidade_trabalho_id,
        tipo_situacao_id: 1
      });
    });

    const query = db.helpers.insert(values, cs);

    await t.none(query);

    usersResetPassword.forEach(u => {
      temporaryLogin.resetPassword(u.id, u.usuario_id)
    })
  });
};

controller.voltaAtividade = async (atividadeIds, manterUsuarios) => {
  const dataFim = new Date();
  await db.tx(async t => {
    const ativEmExec = await t.any(
      `SELECT a_ant.id
        FROM macrocontrole.atividade AS a
        INNER JOIN macrocontrole.atividade AS a_ant ON a_ant.unidade_trabalho_id = a.unidade_trabalho_id
        INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
        INNER JOIN macrocontrole.etapa AS e_ant ON e_ant.id = a_ant.etapa_id
        WHERE a.id in ($<atividadeIds>:csv) AND e_ant.ordem >= e.ordem AND a_ant.tipo_situacao_id IN (2)`,
      { atividadeIds }
    );
    if(ativEmExec){
      throw new AppError("Não se pode voltar atividades em execução. Pause a atividade primeiro", httpCode.BadRequest);
    }

    const atividadesUpdates = await t.any(
      `UPDATE macrocontrole.atividade SET
    tipo_situacao_id = 5, data_inicio = COALESCE(data_inicio, $<dataFim>), data_fim = COALESCE(data_fim, $<dataFim>), tempo_execucao_microcontrole = macrocontrole.tempo_execucao_microcontrole(id), tempo_execucao_estimativa = macrocontrole.tempo_execucao_estimativa(id)
    WHERE id IN (
        SELECT a_ant.id
        FROM macrocontrole.atividade AS a
        INNER JOIN macrocontrole.atividade AS a_ant ON a_ant.unidade_trabalho_id = a.unidade_trabalho_id
        INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
        INNER JOIN macrocontrole.etapa AS e_ant ON e_ant.id = a_ant.etapa_id
        WHERE a.id in ($<atividadeIds>:csv) AND e_ant.ordem >= e.ordem AND a_ant.tipo_situacao_id IN (3,4)
    ) RETURNING id`,
      { atividadeIds, dataFim }
    );
    const ids = [];
    atividadesUpdates.forEach(i => {
      ids.push(i.id);
    });
    if (ids.length == 0) {
      throw new AppError(
        "Atividades não encontradas ou não podem ser retornadas para etapas anteriores",
        httpCode.NotFound
      );
    }
    if (manterUsuarios) {
      await t.none(
        `INSERT INTO macrocontrole.atividade(etapa_id, unidade_trabalho_id, usuario_id, tipo_situacao_id, observacao)
      (
        SELECT etapa_id, unidade_trabalho_id, usuario_id, 3 AS tipo_situacao_id, observacao
        FROM macrocontrole.atividade
        WHERE id in ($<ids>:csv)
      )`,
        { ids }
      );
    } else {
      await t.none(
        `
        INSERT INTO macrocontrole.atividade(etapa_id, unidade_trabalho_id, tipo_situacao_id, observacao)
        (
          SELECT etapa_id, unidade_trabalho_id, 1 AS tipo_situacao_id, observacao
          FROM macrocontrole.atividade
          WHERE id in ($<ids>:csv)
        )`,
        { ids }
      );
    }
  });
};

controller.avancaAtividade = async (atividadeIds, concluida) => {
  let comparisonOperator = concluida ? "<=" : "=";

  await db.tx(async t => {
    const ativEmExec = await t.any(
      `SELECT a_ant.id
      FROM macrocontrole.atividade AS a
      INNER JOIN macrocontrole.atividade AS a_ant ON a_ant.unidade_trabalho_id = a.unidade_trabalho_id
      INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
      INNER JOIN macrocontrole.etapa AS e_ant ON e_ant.id = a_ant.etapa_id
      WHERE a.id in ($<atividadeIds>:csv) AND e_ant.ordem $<comparisonOperator>:raw e.ordem AND a_ant.tipo_situacao_id IN (2)`,
      { atividadeIds, comparisonOperator }
    );
    if(ativEmExec){
      throw new AppError("Não se pode avançar atividades em execução. Pause a atividade primeiro", httpCode.BadRequest);
    }

    await t.none(
      `
        DELETE FROM macrocontrole.atividade
        WHERE id IN (
            SELECT a_ant.id
            FROM macrocontrole.atividade AS a
            INNER JOIN macrocontrole.atividade AS a_ant ON a_ant.unidade_trabalho_id = a.unidade_trabalho_id
            INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
            INNER JOIN macrocontrole.etapa AS e_ant ON e_ant.id = a_ant.etapa_id
            WHERE a.id in ($<atividadeIds>:csv) AND e_ant.ordem $<comparisonOperator>:raw e.ordem AND a_ant.tipo_situacao_id IN (1,3)
        )
        `,
      { atividadeIds, comparisonOperator }
    );
  });
};

controller.criaRevisao = async unidadeTrabalhoIds => {
  await db.tx(async t => {
    for (const unidadeTrabalhoId of unidadeTrabalhoIds) {
      //refactor to batch
      const ordemEtapa = await t.one(
        `SELECT ut.subfase_id, max(e.ordem) AS ordem 
        FROM macrocontrole.unidade_trabalho AS ut
        INNER JOIN macrocontrole.etapa AS e ON e.subfase_id = ut.subfase_id
        WHERE ut.id = $<unidadeTrabalhoId>
        GROUP BY ut.subfase_id`,
        { unidadeTrabalhoId }
      );
      const etapaRev = await t.oneOrNone(
        `SELECT e.id FROM macrocontrole.unidade_trabalho AS ut
        INNER JOIN macrocontrole.etapa AS e ON e.subfase_id = ut.subfase_id
        LEFT JOIN macrocontrole.atividade AS a ON a.unidade_trabalho_id = ut.id AND a.etapa_id = e.id
        WHERE ut.id = $<unidadeTrabalhoId> AND a.id IS NULL AND e.tipo_etapa_id = 2
        ORDER BY e.ordem
        LIMIT 1`,
        { unidadeTrabalhoId }
      );
      const etapaCorr = await t.oneOrNone(
        `SELECT e.id FROM macrocontrole.unidade_trabalho AS ut
        INNER JOIN macrocontrole.etapa AS e ON e.subfase_id = ut.subfase_id
        LEFT JOIN macrocontrole.atividade AS a ON a.unidade_trabalho_id = ut.id AND a.etapa_id = e.id
        WHERE ut.id = $<unidadeTrabalhoId> AND a.id IS NULL AND e.tipo_etapa_id = 3
        ORDER BY e.ordem
        LIMIT 1`,
        { unidadeTrabalhoId }
      );
      let ids;
      if (etapaRev && etapaCorr) {
        ids = [];
        ids.push(etapaRev);
        ids.push(etapaCorr);
      } else {
        // cria novas etapas
        ids = await t.any(
          `
        INSERT INTO macrocontrole.etapa(tipo_etapa_id, subfase_id, ordem)
        VALUES(2,$<subfaseId>,$<ordem1>),(3,$<subfaseId>,$<ordem2>) RETURNING id
        `,
          {
            subfaseId: ordemEtapa.subfase_id,
            ordem1: ordemEtapa.ordem + 1,
            ordem2: ordemEtapa.ordem + 2
          }
        );
      }
      await t.none(
        `
      INSERT INTO macrocontrole.atividade(etapa_id, unidade_trabalho_id, tipo_situacao_id)
      VALUES ($<idRev>,$<unidadeTrabalhoId>,1),($<idCorr>,$<unidadeTrabalhoId>,1)
      `,
        { idRev: ids[0].id, idCorr: ids[1].id, unidadeTrabalhoId }
      );
    }
  });
};

controller.criaRevcorr = async unidadeTrabalhoIds => {
  await db.tx(async t => {
    for (const unidadeTrabalhoId of unidadeTrabalhoIds) {
      //refactor to batch
      const ordemEtapa = await t.one(
        `SELECT ut.subfase_id, max(e.ordem) AS ordem 
        FROM macrocontrole.unidade_trabalho AS ut
        INNER JOIN macrocontrole.etapa AS e ON e.subfase_id = ut.subfase_id
        WHERE ut.id = $<unidadeTrabalhoId>
        GROUP BY ut.subfase_id`,
        { unidadeTrabalhoId }
      );
      const etapaRevcorr = await t.oneOrNone(
        `SELECT e.id FROM macrocontrole.unidade_trabalho AS ut
        INNER JOIN macrocontrole.etapa AS e ON e.subfase_id = ut.subfase_id
        LEFT JOIN macrocontrole.atividade AS a ON a.unidade_trabalho_id = ut.id AND a.etapa_id = e.id
        WHERE ut.id = $<unidadeTrabalhoId> AND a.id IS NULL AND e.tipo_etapa_id = 4
        ORDER BY e.ordem
        LIMIT 1`,
        { unidadeTrabalhoId }
      );
      const revcorr =
        etapaRevcorr ||
        (await t.one(
          `
        INSERT INTO macrocontrole.etapa(tipo_etapa_id, subfase_id, ordem)
        VALUES(4,$<subfaseId>,$<ordem>) RETURNING id
        `,
          { subfaseId: ordemEtapa.subfase_id, ordem: ordemEtapa.ordem + 1 }
        ));
      await t.none(
        `
      INSERT INTO macrocontrole.atividade(etapa_id, unidade_trabalho_id, tipo_situacao_id)
      VALUES ($<idRevCorr>,$<unidadeTrabalhoId>,1)
      `,
        { idRevCorr: revcorr.id, unidadeTrabalhoId }
      );
    }
  });
};

controller.criaFilaPrioritaria = async (
  atividadeIds,
  usuarioPrioridadeId,
  prioridade
) => {
  await db.none(
    `
      INSERT INTO macrocontrole.fila_prioritaria(atividade_id, usuario_id, prioridade)
      (
        SELECT id, $<usuarioPrioridadeId> as usuario_id, row_number() over(order by id) + $<prioridade>-1 as prioridade
        FROM macrocontrole.atividade
        WHERE id in ($<atividadeIds>:csv)
      )
      `,
    { atividadeIds, usuarioPrioridadeId, prioridade }
  );
};

controller.criaFilaPrioritariaGrupo = async (
  atividadeIds,
  perfilProducaoId,
  prioridade
) => {
  await db.none(
    `
    INSERT INTO macrocontrole.fila_prioritaria_grupo(atividade_id, perfil_producao_id, prioridade)
    (
      SELECT id, $<perfilProducaoId> as perfil_producao_id, row_number() over(order by id) + $<prioridade>-1 as prioridade
      FROM macrocontrole.atividade
      WHERE id in ($<atividadeIds>:csv)
    )
    `,
    { atividadeIds, perfilProducaoId, prioridade }
  );
};

controller.criaObservacao = async (
  atividadeIds,
  observacaoAtividade,
  observacaoEtapa,
  observacaoSubfase,
  observacaoUnidadeTrabalho,
  observacaoLote
) => {
  await db.tx(async t => {
    await t.any(
      `
      UPDATE macrocontrole.atividade SET
      observacao = $<observacaoAtividade> WHERE id in ($<atividadeIds>:csv)
      `,
      [atividadeIds, observacaoAtividade]
    );
    await t.any(
      `
      UPDATE macrocontrole.etapa SET
      observacao = $<observacaoEtapa> WHERE id in (
        SELECT DISTINCT e.id FROM macrocontrole.atividade AS a
        INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id WHERE a.id in ($<atividadeIds>:csv)
      )
      `,
      [atividadeIds, observacaoEtapa]
    );

    await t.any(
      `
      UPDATE macrocontrole.subfase SET
      observacao = $<observacaoSubfase> WHERE id in (
        SELECT DISTINCT e.subfase_id FROM macrocontrole.atividade AS a
        INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id WHERE a.id in ($<atividadeIds>:csv)
      )
      `,
      [atividadeIds, observacaoSubfase]
    );

    await t.any(
      `
      UPDATE macrocontrole.unidade_trabalho SET
      observacao = $<observacaoUnidadeTrabalho> WHERE id in (
        SELECT DISTINCT a.unidade_trabalho_id FROM macrocontrole.atividade AS a
        WHERE a.id in ($<atividadeIds>:csv)
      )
      `,
      [atividadeIds, observacaoUnidadeTrabalho]
    );

    await t.any(
      `
      UPDATE macrocontrole.lote SET
      observacao = $<observacaoLote> WHERE id in (
        SELECT DISTINCT ut.lote_id FROM macrocontrole.atividade AS a
        INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = a.unidade_trabalho_id WHERE a.id in ($<atividadeIds>:csv)
      )
      `,
      [atividadeIds, observacaoLote]
    );
  });
};

controller.getProject = async () => {
  return qgisProject;
};

module.exports = controller;
