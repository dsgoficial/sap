"use strict";

const { sendJsonAndLog } = require("./logger");
const { loginRoute } = require("./login");
const { loginMiddleware } = require("./login");
const { distribuicaoRoute } = require("./distribuicao_atividades");

const routes = app => {
  app.use("/login", loginRoute);

  //Todas as requisições abaixo necessitam Token
  app.use(loginMiddleware);

  app.use("/distribuicao", distribuicaoRoute);

  app.use((req, res, next) => {
    const err = new Error("Not Found");
    err.status = 404;
    err.context = "app";
    err.information = {};
    err.information.url =
      req.protocol + "://" + req.get("host") + req.originalUrl;
    next(err);
  });

  //Error handling
  app.use((err, req, res, next) => {
    status = err.status || 500;
    sendJsonAndLog(
      false,
      err.message,
      err.context,
      err.information,
      res,
      status,
      null
    );
  });
};
module.exports = routes;
