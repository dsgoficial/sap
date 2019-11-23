"use strict";

const { loginRoute, loginMiddleware, verifyAdmin } = require("./login");
const { distribuicaoRoute } = require("./distribuicao_atividades");
const { gerenciaRoute } = require("./gerencia");
const { microcontroleRoute } = require("./microcontrole");
const { estatisticasRoute } = require("./estatisticas");

const routes = app => {
  app.use("/login", loginRoute);

  app.use("/estatisticas", estatisticasRoute);

  //Todas as requisições abaixo necessitam Token
  app.use(loginMiddleware);

  app.use("/distribuicao", distribuicaoRoute);

  app.use("/microcontrole", microcontroleRoute);

  //Todas as requisições abaixo necessitam de admin (e token)
  app.use(verifyAdmin);

  app.use("/gerencia", gerenciaRoute);
};
module.exports = routes;
