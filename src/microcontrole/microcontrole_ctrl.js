"use strict";

const { db } = require("../database");

const { AppError, httpCode } = require("../utils");

const controller = {};

controller.armazenaFeicao = async (atividadeId, data, dados) => {
  const table = new db.pgp.helpers.TableName({
    table: "monitoramento_feicao",
    schema: "microcontrole"
  });

  const cs = new db.pgp.helpers.ColumnSet(
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
      atividade_id: atividadeId
    });
  });

  const query = db.pgp.helpers.insert(values, cs);

  db.conn.none(query);
};

controller.armazenaApontamento = async (atividadeId, data, dados) => {
  const table = new db.pgp.helpers.TableName({
    table: "monitoramento_apontamento",
    schema: "microcontrole"
  });

  const cs = new db.pgp.helpers.ColumnSet(
    ["quantidade", "categoria", "data", "atividade_id"],
    { table }
  );

  const values = [];
  dados.foreach(d => {
    values.push({
      quantidade: d.quantidade,
      categoria: d.categoria,
      data: data,
      atividade_id: atividadeId
    });
  });

  const query = db.pgp.helpers.insert(values, cs);

  db.conn.none(query);
};

controller.armazenaTela = async (atividadeId, dados) => {
  const table = new db.pgp.helpers.TableName({
    table: "monitoramento_tela",
    schema: "microcontrole"
  });

  const cs = new db.pgp.helpers.ColumnSet(["data", "atividade_id", "geom"], {
    table
  });

  const values = [];

  dados.foreach(d => {
    // prettier-ignore
    const geom = `ST_GeomFromEWKT('SRID=4674;POLYGON(${d.x_min} ${d.y_min},${d.x_min} ${d.y_max},${d.x_max} ${d.y_max}, ${d.x_max} ${d.y_min}, ${d.x_min} ${d.y_min})')`;
    values.push({
      geom: geom,
      data: d.data,
      atividade_id: atividadeId
    });
  });

  const query = db.pgp.helpers.insert(values, cs);

  db.conn.none(query);
};

controller.armazenaAcao = async atividadeId => {
  await db.conn.any(
    `
    INSERT INTO microcontrole.monitoramento_acao(atividade_id, data) VALUES($<atividadeId>, NOW())
    `,
    {atividadeId}
  );
};

module.exports = controller;
