"use strict";

const { db } = require("../database");
const {serializeError} = require('serialize-error');

const controller = {};

controller.armazenaFeicao = async (atividade_id, data, dados) => {
  try {
    const table = new pgp.helpers.TableName(
      {
        table: "monitoramento_feicao",
        schema: "microcontrole"
      }
      );

    const cs = new pgp.helpers.ColumnSet(
      [
        "tipo_operacao_id",
        "camada_id",
        "quantidade",
        "comprimento",
        "vertices",
        "data",
        "atividade_id"
      ],
      { table }
    );

    const values = [];
    dados.foreach(d => {
      values.push({
        tipo_operacao_id: d.operacao,
        camada_id: d.camada_id,
        quantidade: d.quantidade,
        comprimento: d.comprimento,
        vertices: d.vertices,
        data: data,
        atividade_id: atividade_id
      });
    });

    const query = pgp.helpers.insert(values, cs);

    db.none(query);

    return { error: null };
  } catch (error) {
    const err = new Error(
      "Falha durante tentativa de inserção do sumário de feições."
    );
    err.status = 500;
    err.context = "microcontrole_ctrl";
    err.information = {};
    err.information.atividade_id = atividade_id;
    err.information.data = data;
    err.information.dados = dados;
    err.information.trace = serializeError(error)
    return { error: err };
  }
};

controller.armazenaApontamento = async (atividade_id, data, dados) => {
  try {
    const table = new pgp.helpers.TableName(
      {
        table: "monitoramento_apontamento",
        schema: "microcontrole"
      }
      );

    const cs = new pgp.helpers.ColumnSet(
      ["quantidade", "categoria", "data", "atividade_id"],
      { table }
    );

    const values = [];
    dados.foreach(d => {
      values.push({
        quantidade: d.quantidade,
        categoria: d.categoria,
        data: data,
        atividade_id: atividade_id
      });
    });

    const query = pgp.helpers.insert(values, cs);

    db.none(query);

    return { error: null };
  } catch (error) {
    const err = new Error(
      "Falha durante tentativa de inserção do sumário de apontamentos."
    );
    err.status = 500;
    err.context = "microcontrole_ctrl";
    err.information = {};
    err.information.atividade_id = atividade_id;
    err.information.data = data;
    err.information.dados = dados;
    err.information.trace = serializeError(error)
    return { error: err };
  }
};

controller.armazenaTela = async (atividade_id, dados) => {
  try {
    const table = new pgp.helpers.TableName(
      {
        table: "monitoramento_tela",
        schema: "microcontrole"
      }
      );

    const cs = new pgp.helpers.ColumnSet(["data", "atividade_id", "geom"], {
      table
    });

    const values = [];

    dados.foreach(d => {
      // prettier-ignore
      let geom = `ST_GeomFromEWKT('SRID=4674;POLYGON(${d.x_min} ${d.y_min},${d.x_min} ${d.y_max},${d.x_max} ${d.y_max}, ${d.x_max} ${d.y_min}, ${d.x_min} ${d.y_min})')`;
      values.push({
        geom: geom,
        data: d.data,
        atividade_id: atividade_id
      });
    });

    const query = pgp.helpers.insert(values, cs);

    db.none(query);

    return { error: null };
  } catch (error) {
    const err = new Error(
      "Falha durante tentativa de inserção do sumário de tela."
    );
    err.status = 500;
    err.context = "microcontrole_ctrl";
    err.information = {};
    err.information.atividade_id = atividade_id;
    err.information.dados = dados;
    err.information.trace = serializeError(error)
    return { error: err };
  }
};

controller.armazenaAcao = async (atividade_id) => {
  try {
    await db.any(
      `
      INSERT INTO microcontrole.monitoramento_acao(atividade_id, data) VALUES($1, NOW())
      `,
      [atividade_id]
    );
    return { error: null };
  } catch (error) {
    const err = new Error("Falha durante tentativa de inserção de ação.");
    err.status = 500;
    err.context = "microcontrole_ctrl";
    err.information = {};
    err.information.atividade_id = atividade_id;
    err.information.trace = serializeError(error)
    return { error: err };
  }
};

module.exports = controller;
