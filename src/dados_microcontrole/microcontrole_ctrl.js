"use strict";

const { db } = require("../database");

const controller = {};

controller.armazenaFeicao = async (
  usuario_id,
  etapa_id,
  unidade_trabalho_id,
  data,
  dados
) => {
  try {
    const table = new pgp.helpers.TableName(
      "monitoramento_feicao",
      "microcontrole"
    );

    const cs = new pgp.helpers.ColumnSet(
      [
        "operacao",
        "camada",
        "usuario_id",
        "quantidade",
        "comprimento",
        "vertices",
        "data",
        "etapa_id",
        "unidade_trabalho_id"
      ],
      { table }
    );

    const values = [];
    dados.foreach(d => {
      values.push({
        operacao: d.operacao,
        camada: d.camada,
        usuario_id: usuario_id,
        quantidade: d.quantidade,
        comprimento: d.comprimento,
        vertices: d.vertices,
        data: data,
        etapa_id: etapa_id,
        unidade_trabalho_id: unidade_trabalho_id
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
    err.information.usuario_id = usuario_id;
    err.information.etapa_id = etapa_id;
    err.information.unidade_trabalho_id = unidade_trabalho_id;
    err.information.data = data;
    err.information.dados = dados;
    err.information.trace = error;
    return { error: err };
  }
};

controller.armazenaApontamento = async (
  usuario_id,
  etapa_id,
  unidade_trabalho_id,
  data,
  dados
) => {
  try {
    const table = new pgp.helpers.TableName(
      "monitoramento_apontamento",
      "microcontrole"
    );

    const cs = new pgp.helpers.ColumnSet(
      [
        "usuario_id",
        "quantidade",
        "categoria",
        "data",
        "etapa_id",
        "unidade_trabalho_id"
      ],
      { table }
    );

    const values = [];
    dados.foreach(d => {
      values.push({
        usuario_id: usuario_id,
        quantidade: d.quantidade,
        categoria: d.categoria,
        data: data,
        etapa_id: etapa_id,
        unidade_trabalho_id: unidade_trabalho_id
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
    err.information.usuario_id = usuario_id;
    err.information.etapa_id = etapa_id;
    err.information.unidade_trabalho_id = unidade_trabalho_id;
    err.information.data = data;
    err.information.dados = dados;
    err.information.trace = error;
    return { error: err };
  }
};

controller.armazenaTela = async (
  usuario_id,
  etapa_id,
  unidade_trabalho_id,
  dados
) => {
  try {
    const table = new pgp.helpers.TableName(
      "monitoramento_tela",
      "microcontrole"
    );

    const cs = new pgp.helpers.ColumnSet(
      ["usuario_id", "geom", "data", "etapa_id", "unidade_trabalho_id"],
      { table }
    );

    const values = [];

    dados.foreach(d => {
      // prettier-ignore
      let geom = `ST_GeomFromEWKT('SRID=4674;POLYGON(${d.x_min} ${d.y_min},${d.x_min} ${d.y_max},${d.x_max} ${d.y_max}, ${d.x_max} ${d.y_min}, ${d.x_min} ${d.y_min})')`;
      values.push({
        usuario_id: usuario_id,
        geom: geom,
        data: d.data,
        etapa_id: etapa_id,
        unidade_trabalho_id: unidade_trabalho_id
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
    err.information.usuario_id = usuario_id;
    err.information.etapa_id = etapa_id;
    err.information.unidade_trabalho_id = unidade_trabalho_id;
    err.information.data = data;
    err.information.dados = dados;
    err.information.trace = error;
    return { error: err };
  }
};

module.exports = controller;
