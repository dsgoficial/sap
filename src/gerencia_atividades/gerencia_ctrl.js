"use strict";

const { db } = require("../database");

const controller = {};

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

module.exports = controller;
