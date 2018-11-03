"use strict";

const { loginRoute, loginMiddleware } = require("./login");
const { distribuicaoRoute } = require("./distribuicao_atividades");
const { microcontroleRoute } = require("./dados_microcontrole");

const routes = app => {
  app.use("/login", loginRoute);

  //Todas as requisições abaixo necessitam Token
  app.use(loginMiddleware);

  app.use("/distribuicao", distribuicaoRoute);

  app.use("/microcontrole", microcontroleRoute);
};
module.exports = routes;
