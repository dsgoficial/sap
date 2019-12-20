"use strict";

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");

const routes = require("./routes");
const swaggerOptions = require("./swagger_options");

const swaggerSpec = swaggerJSDoc(swaggerOptions);

const {
  AppError,
  errorHandler,
  sendJsonAndLogMiddleware,
  httpCode
} = require("../utils");

const { databaseVersion } = require("../database");

const app = express();

//Add sendJsonAndLog to res object
app.use(sendJsonAndLogMiddleware);

app.use(bodyParser.json({limit: '50mb'})); //parsear POST em JSON
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

//All routes used by the App
routes(app);

//prevent browser from request favicon
app.get("/favicon.ico", function(req, res) {
  res.status(httpCode.NoContent);
});

//informa que o serviço de dados do SAP está operacional
app.get("/", (req, res, next) => {
  return res.sendJsonAndLog(
    true,
    "Sistema de Apoio a produção operacional",
    httpCode.OK,
    {
      database_version: databaseVersion.nome
    }
  );
});

//Serve SwaggerDoc
app.use("/api_docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//Serve JSDocs
app.use("/js_docs", express.static(path.join(__dirname, "js_docs")));

//Handle missing URL
app.use((req, res, next) => {
  const err = new AppError("URL não encontrada", httpCode.NotFound);
  return next(err);
});

//Error handling
app.use((err, req, res, next) => {
  return errorHandler(err, res);
});

module.exports = app;
