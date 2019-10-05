"use strict";

const { loginRoute, loginMiddleware, verifyAdmin } = require("./login");
const { distribuicaoRoute } = require("./distribuicao_atividades");
const { gerenciaRoute } = require("./gerencia");
const { microcontroleRoute } = require("./microcontrole");
const { estatisticasRoute } = require("./estatisticas");
//const { metadadosRoute } = require("./gerador_metadados");

const routes = app => {
  app.use("/login", loginRoute);

  app.use("/estatisticas", estatisticasRoute);

  //Todas as requisições abaixo necessitam Token
  app.use(loginMiddleware);

  app.use("/distribuicao", distribuicaoRoute);

  app.use("/microcontrole", microcontroleRoute);

  //Todas as requisições abaixo necessitam de admin
  app.use(verifyAdmin);

  app.use("/gerencia", gerenciaRoute);

  //app.use("/metadados", metadadosRoute);
};
module.exports = routes;
