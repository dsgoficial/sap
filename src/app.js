"use strict";

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");

const { VERSION } = require("./config");

const {
  AppError,
  errorHandler,
  sendJsonAndLog,
  asyncHandler
} = require("./utils");

const { databaseVersion } = require("./database");

const routes = require("./routes");

const app = express();

app.use(bodyParser.json()); //parsear POST em JSON
app.use(xss()); //sanitize body input
app.use(hpp()); //protection against parameter polution

//CORS middleware
app.use(cors());

//Helmet Protection
app.use(helmet());
//Disables cache https://helmetjs.github.io/docs/nocache/
app.use(helmet.noCache());

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30 // limit each IP to 30 requests per windowMs
});

//apply limit all requests
app.use(limiter);

//Add sendJsonAndLog to res object
app.use(sendJsonAndLog);

//prevent browser from request favicon
app.get("/favicon.ico", function(req, res) {
  res.status(204);
});

//informa que o serviço de dados do SAP está operacional
app.get(
  "/",
  asyncHandler(async (req, res, next) => {
    const dbVersion = await databaseVersion.get();
    res.status(200).json({
      version: VERSION,
      database_version: dbVersion,
      sucess: true,
      message: "Sistema de Apoio a produção operacional"
    });
  })
);

//Serve APIDoc
app.use("/apidoc", express.static(path.join(__dirname, "apidoc")));

//All routes used by the App
routes(app);

//Handle missing URL
app.use((req, res, next) => {
  const err = new AppError("Não encontrado", 404);
  return next(err);
});

//Error handling
app.use((err, req, res, next) => {
  errorHandler(err, req, res, next);
});

module.exports = app;
