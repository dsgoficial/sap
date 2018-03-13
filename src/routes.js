const sendJsonAndLog = require("./logger/sendJsonAndLog");
const loginRoute = require("./login/login_route");
const loginMiddleware = require("./login/login_middleware");
const distribuicaoRoute = require("./distribuicao_atividades/distribuicao_route");

const routes = app => {
  app.use("/login", loginRoute);

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
