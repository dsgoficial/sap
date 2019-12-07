"use strict";

const { loginRoute } = require("../login");
const { producaoRoute } = require("../producao");
const { gerenciaRoute } = require("../gerencia");
const { projetoRoute } = require("../projeto");
const { microcontroleRoute } = require("../microcontrole");
const { estatisticasRoute } = require("../estatisticas");

const routes = app => {
  app.use("/login", loginRoute);

  app.use("/estatisticas", estatisticasRoute);

  app.use("/distribuicao", producaoRoute);

  app.use("/microcontrole", microcontroleRoute);

  app.use("/gerencia", gerenciaRoute);

  app.use("/projeto", projetoRoute);
};
module.exports = routes;
