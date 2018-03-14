const sendJsonAndLog = require("./logger/sendJsonAndLog");
const loginRoute = require("./login/login_route");
const loginMiddleware = require("./login/login_middleware");
const distribuicaoRoute = require("./distribuicao_atividades/distribuicao_route");

const uuidv4 = require("uuid/v4");
const createNamespace = require("continuation-local-storage").createNamespace;
const request = createNamespace("request");

const routes = app => {
  //Create UUID for each request
  app.use((req, res, next) => {
    request.run(() => {
      request.set("req_id", uuidv4());
      next();
    });
  });

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
