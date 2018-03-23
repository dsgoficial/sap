"use strict";

const { loginRoute, loginMiddleware } = require("./login");
const { distribuicaoRoute } = require("./distribuicao_atividades");

const routes = app => {
  app.use("/login", loginRoute);

  //Todas as requisições abaixo necessitam Token
  app.use(loginMiddleware);

  app.use("/distribuicao", distribuicaoRoute);
};
module.exports = routes;
