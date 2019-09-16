"use strict";

const { loginRoute, loginMiddleware, verifyAdmin } = require("./login");
const { distribuicaoRoute } = require("./distribuicao_atividades");
const { gerenciaRoute } = require("./gerencia");
//const { microcontroleRoute } = require("./dados_microcontrole");
//const { metadadosRoute } = require("./gerador_metadados");

const routes = app => {
  app.use("/login", loginRoute);

  //Todas as requisições abaixo necessitam Token
  app.use(loginMiddleware);

  app.use("/distribuicao", distribuicaoRoute);

  app.use(verifyAdmin);

  app.use("/gerencia", gerenciaRoute);

  //app.use("/microcontrole", microcontroleRoute);

  //app.use("/metadados", metadadosRoute);
};
module.exports = routes;
