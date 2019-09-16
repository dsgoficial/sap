"use strict";

const { db } = require("../database");

const { distribuicaoCtrl } = require("../distribuicao_atividades");

const controller = {};

controller.get_atividade = async atividade_id => {
  try {
    let atividade = await db.oneOrNone(
      `SELECT a.etapa_id, a.unidade_trabalho_id
      FROM macrocontrole.atividade AS a
      WHERE a.id = $1 LIMIT 1`,
      [atividade_id]
    );

    if (atividade) {
      const { erro, dados } = await distribuicaoCtrl.dados_producao(
        atividade_id
      );
      if (erro) {
        return { verificaError: erro, dados: null };
      }
      return { verificaError: null, dados: dados };
    } else {
      const err = new Error("ID inválido.");
      err.status = 404;
      err.context = "gerencia_ctrl";
      err.information = {};
      err.information.atividade_id = atividade_id;
      err.information.trace = error;
      return { verificaError: err, dados: null };
    }
  } catch (error) {
    const err = new Error("Falha durante retorno dos dados da atividade.");
    err.status = 500;
    err.context = "gerencia_ctrl";
    err.information = {};
    err.information.atividade_id = atividade_id;
    err.information.trace = error;
    return { verificaError: err, dados: null };
  }
};

controller.get_atividade_usuario = async usuario_id => {
  try {
    const { erro, prioridade } = await distribuicaoCtrl.calcula_fila(
      usuario_id
    );
    if (erro) {
      return { erro: erro, dados: null };
    }

    const { erro, dados } = await distribuicaoCtrl.dados_producao(prioridade);
    if (erro) {
      return { erro: erro, dados: null };
    }
    return { erro: null, dados: dados };
  } catch (error) {
    const err = new Error(
      "Falha durante retorno dos dados da atividade de um usuário."
    );
    err.status = 500;
    err.context = "gerencia_ctrl";
    err.information = {};
    err.information.usuario_id = usuario_id;
    err.information.trace = error;
    return { erro: err, dados: null };
  }
};

controller.gravaEstilos = async (estilos, usuario_id) => {
  const data_gravacao = new Date();
  try {
    let usuario = await t.one(
      `SELECT tpg.nome_abrev || ' ' || u.nome_guerra as posto_nome FROM dgeo.usuario as u
      INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
      WHERE u.id = $1`,
      [usuario_id]
    );

    const table = new pgp.helpers.TableName("layer_styles", "dgeo");

    const cs = new pgp.helpers.ColumnSet(
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
    estilos.foreach(d => {
      values.push({
        f_table_schema: d.f_table_schema,
        f_table_name: d.f_table_name,
        f_geometry_column: d.f_geometry_column,
        stylename: d.stylename,
        styleqml: d.styleqml,
        stylesld: stylesld,
        ui: ui,
        owner: usuario.posto_nome,
        update_time: data_gravacao
      });
    });

    const query =
      pgp.helpers.insert(values, cs) +
      " ON CONFLICT ON CONSTRAINT unique_styles DO UPDATE SET f_geometry_column = layer_styles.f_geometry_column, styleqml = layer_styles.styleqml, stylesld = layer_styles.stylesld, ui = layer_styles.ui, owner = layer_styles.owner, update_time = layer_styles.update_time";

    let result = db.result(query);

    if (!result.rowCount || result.rowCount != 1) {
      throw new Error("Erro ao inserir/atualizar estilo.");
    }

    return { error: null };
  } catch (error) {
    const err = new Error("Falha durante tentativa de gravar estilos.");
    err.status = 500;
    err.context = "gerencia_ctrl";
    err.information = {};
    err.information.usuario_id = usuario_id;
    err.information.estilos = estilos;
    err.information.trace = error;
    return { error: err };
  }
};

controller.gravaRegras = async (regras, usuario_id) => {
  const data_gravacao = new Date();
  try {
    let usuario = await t.one(
      `SELECT tpg.nome_abrev || ' ' || u.nome_guerra as posto_nome FROM dgeo.usuario as u
      INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
      WHERE u.id = $1`,
      [usuario_id]
    );

    const table = new pgp.helpers.TableName("layer_rules", "dgeo");

    const cs = new pgp.helpers.ColumnSet(
      [
        "grupo_regra",
        "tipo_regra",
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
    regras.foreach(d => {
      values.push({
        grupo_regra: d.grupo_regra,
        tipo_regra: d.tipo_regra,
        camada: d.camada,
        atributo: d.atributo,
        regra: d.regra,
        cor_rgb: d.cor_rgb,
        descricao: d.descricao,
        ordem: d.ordem,
        owner: usuario.posto_nome,
        update_time: data_gravacao
      });
    });

    const query = pgp.helpers.insert(values, cs);

    let result = db.result(query);

    if (!result.rowCount || result.rowCount != 1) {
      throw new Error("Erro ao inserir/atualizar regra.");
    }

    return { error: null };
  } catch (error) {
    const err = new Error("Falha durante tentativa de gravar regras.");
    err.status = 500;
    err.context = "gerencia_ctrl";
    err.information = {};
    err.information.usuario_id = usuario_id;
    err.information.regras = regras;
    err.information.trace = error;
    return { error: err };
  }
};

controller.gravaMenus = async (menus, usuario_id) => {
  const data_gravacao = new Date();
  try {
    let usuario = await t.one(
      `SELECT tpg.nome_abrev || ' ' || u.nome_guerra as posto_nome FROM dgeo.usuario as u
      INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
      WHERE u.id = $1`,
      [usuario_id]
    );

    const table = new pgp.helpers.TableName("layer_menus", "dgeo");

    const cs = new pgp.helpers.ColumnSet(
      ["nome_menu", "definicao_menu", "ordem_menu", "owner", "update_time"],
      { table }
    );

    const values = [];
    menus.foreach(d => {
      values.push({
        nome_menu: d.nome_menu,
        definicao_menu: d.definicao_menu,
        ordem_menu: d.ordem_menu,
        owner: usuario.posto_nome,
        update_time: data_gravacao
      });
    });

    const query =
      pgp.helpers.insert(values, cs) +
      " ON CONFLICT ON CONSTRAINT unique_menus DO UPDATE SET definicao_menu = layer_menus.definicao_menu, ordem_menu = layer_menus.ordem_menu, owner = layer_menus.owner, update_time = layer_menus.update_time";

    let result = db.result(query);

    if (!result.rowCount || result.rowCount != 1) {
      throw new Error("Erro ao inserir/atualizar menu.");
    }

    return { error: null };
  } catch (error) {
    const err = new Error("Falha durante tentativa de gravar menus.");
    err.status = 500;
    err.context = "gerencia_ctrl";
    err.information = {};
    err.information.usuario_id = usuario_id;
    err.information.menus = menus;
    err.information.trace = error;
    return { error: err };
  }
};

controller.get_usuario = async () => {
  try {
    let usuarios = await db.any(
      `SELECT tpg.nome_abrev || ' ' || u.nome_guerra AS nome
      FROM dgeo.usuario AS u INNER JOIN dominio.tipo_posto_graduacao AS tpg ON tpg.code = u.tipo_posto_grad_id WHERE u.disponivel IS TRUE`
    );
    return { error: null, dados: usuarios };
  } catch (error) {
    const err = new Error("Falha durante tentativa de retornar tipo problema.");
    err.status = 500;
    err.context = "gerencia_ctrl";
    err.information = {};
    err.information.trace = error;
    return { error: err, dados: null };
  }
};

controller.unidade_trabalho_disponivel = async (
  unidade_trabalho_ids,
  disponivel
) => {
  try {
    const table = new pgp.helpers.TableName(
      "macrocontrole",
      "unidade_trabalho"
    );

    const cs = new pgp.helpers.ColumnSet(["?id", "disponivel"], { table });

    const values = [];
    unidade_trabalho_ids.foreach(d => {
      values.push({
        id: d,
        disponivel: disponivel
      });
    });

    const query =
      pgp.helpers.update(values, cs, { tableAlias: "X", valueAlias: "Y" }) +
      "WHERE Y.id = X.id";

    db.none(query);

    return { error: null };
  } catch (error) {
    const err = new Error("Falha durante atualização de unidades de trabalho.");
    err.status = 500;
    err.context = "gerencia_ctrl";
    err.information = {};
    err.information.unidade_trabalho_ids = unidade_trabalho_ids;
    err.information.disponivel = disponivel;
    return { error: err };
  }
};

controller.pausa_atividade = async atividade_id => {
  try {
    const data_fim = new Date();
    await db.tx(async t => {
      await t.any(
        `
      UPDATE macrocontrole.atividade SET
      data_fim = $1, tipo_situacao_id = 6
      WHERE id = $2
      `,
        [data_fim, atividade_id]
      );
      let atividade = await t.one(
        `SELECT etapa_id, unidade_trabalho_id, usuario_id FROM macrocontrole.atividade WHERE id = $1`,
        [atividade_id]
      );

      await t.none(
        `
      INSERT INTO macrocontrole.atividade(etapa_id, unidade_trabalho_id, usuario_id, tipo_situacao_id)
      VALUES($1,$2,$3,3)
      `,
        [
          atividade.etapa_id,
          atividade.unidade_trabalho_id,
          atividade.usuario_id
        ]
      );
    });
    return { error: null };
  } catch (error) {
    const err = new Error("Falha durante pausa atividade.");
    err.status = 500;
    err.context = "gerencia_ctrl";
    err.information = {};
    err.information.atividade_id = atividade_id;
    err.information.trace = error;
    return { error: err };
  }
};

controller.reinicia_atividade = async atividade_id => {
  try {
    const data_fim = new Date();
    await db.tx(async t => {
      await t.any(
        `
      UPDATE macrocontrole.atividade SET
      data_fim = $1, tipo_situacao_id = 6
      WHERE id = $2
      `,
        [data_fim, atividade_id]
      );
      let atividade = await t.one(
        `SELECT etapa_id, unidade_trabalho_id FROM macrocontrole.atividade WHERE id = $1`,
        [atividade_id]
      );

      await t.none(
        `
      INSERT INTO macrocontrole.atividade(etapa_id, unidade_trabalho_id, tipo_situacao_id)
      VALUES($1,$2,$3,1)
      `,
        [
          atividade.etapa_id,
          atividade.unidade_trabalho_id,
          atividade.usuario_id
        ]
      );
    });
    return { error: null };
  } catch (error) {
    const err = new Error("Falha durante reiniciar atividade.");
    err.status = 500;
    err.context = "gerencia_ctrl";
    err.information = {};
    err.information.atividade_id = atividade_id;
    err.information.trace = error;
    return { error: err };
  }
};

controller.cria_fila_prioritaria = async (
  atividade_id,
  usuario_id,
  prioridade
) => {
  try {
    await db.none(
      `
      INSERT INTO macrocontrole.fila_prioritaria(atividade_id, usuario_id, prioridade)
      VALUES($1,$2,$3)
      `,
      [atividade_id, usuario_id, prioridade]
    );
    return { error: null };
  } catch (error) {
    const err = new Error("Falha durante criação da fila prioritária.");
    err.status = 500;
    err.context = "distribuicao_ctrl";
    err.information = {};
    err.information.atividade_id = atividade_id;
    err.information.usuario_id = usuario_id;
    err.information.prioridade = prioridade;
    err.information.trace = error;
    return { error: err };
  }
};

controller.cria_fila_prioritaria_grupo = async (
  atividade_id,
  perfil_producao_id,
  prioridade
) => {
  try {
    await db.none(
      `
      INSERT INTO macrocontrole.fila_prioritaria_grupo(atividade_id, perfil_producao_id, prioridade)
      VALUES($1,$2,$3)
      `,
      [atividade_id, perfil_producao_id, prioridade]
    );
    return { error: null };
  } catch (error) {
    const err = new Error("Falha durante criação da fila prioritária grupo.");
    err.status = 500;
    err.context = "distribuicao_ctrl";
    err.information = {};
    err.information.atividade_id = atividade_id;
    err.information.perfil_producao_id = perfil_producao_id;
    err.information.prioridade = prioridade;
    err.information.trace = error;
    return { error: err };
  }
};

controller.cria_observacao = async (
  atividade_id,
  observacao_atividade,
  observacao_etapa,
  observacao_subfase,
  observacao_unidade_trabalho
) => {
  try {
    await db.tx(async t => {
      if (observacao_atividade) {
        await t.any(
          `
        UPDATE macrocontrole.atividade SET
        observacao = $2 WHERE id = $1
        `,
          [atividade_id, observacao_atividade]
        );
      }
      const { etapa_id, unidade_trabalho_id, subfase_id } = await db.one(
        "SELECT a.etapa_id, a.unidade_trabalho_id, e.subfase_id FROM macrocontrole.atividade AS a INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id WHERE a.id = $1 LIMIT 1",
        [atividade_id]
      );
      if (observacao_etapa) {
        await t.any(
          `
        UPDATE macrocontrole.etapa SET
        observacao = $2 WHERE id = $1
        `,
          [etapa_id, observacao_etapa]
        );
      }
      if (observacao_subfase) {
        await t.any(
          `
        UPDATE macrocontrole.subfase SET
        observacao = $2 WHERE id = $1
        `,
          [subfase_id, observacao_subfase]
        );
      }
      if (observacao_unidade_trabalho) {
        await t.any(
          `
        UPDATE macrocontrole.unidade_trabalho SET
        observacao = $2 WHERE id = $1
        `,
          [unidade_trabalho_id, observacao_unidade_trabalho]
        );
      }
    });
    return { error: null };
  } catch (error) {
    const err = new Error("Falha durante criação de observação.");
    err.status = 500;
    err.context = "gerencia_ctrl";
    err.information = {};
    err.information.atividade_id = atividade_id;
    err.information.observacao_atividade = observacao_atividade;
    err.information.observacao_etapa = observacao_etapa;
    err.information.observacao_subfase = observacao_subfase;
    err.information.observacao_unidade_trabalho = observacao_unidade_trabalho;
    return { error: err };
  }
};

module.exports = controller;
