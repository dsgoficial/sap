
const express = require("express");
const path = require("path");

const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const xss = require('xss-clean')
const hpp = require('hpp');
const rateLimit = require("express-rate-limit");

const routes = require("./routes");
const { sendJsonAndLog } = require("./utils");

const app = express();

const { VERSION, DATABASE_VERSION } = require('./config');

app.use(bodyParser.json()); //parsear POST em JSON
app.use(xss()) //sanitize body input
app.use(hpp())

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
 
//  apply limit all requests
app.use(limiter);

//Lower case query parameters
app.use((req, res, next) => {
  for (let key in req.query) {
    req.query[key.toLowerCase()] = req.query[key];
  }
  next();
});

//informa que o serviço de dados do SAP está operacional
app.get("/", (req, res, next) => {
  res.status(200).json({
    version: VERSION,
    database_version: DATABASE_VERSION,
    sucess: true,
    message: "Sistema de Apoio a produção operacional"
  });
});

//prevent browser from request favicon
app.get("/favicon.ico", function(req, res) {
  res.status(204);
});

//Serve APIDoc
app.use("/docs", express.static(path.join(__dirname, "apidoc")));

routes(app);

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
  const status = err.status || 500;
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

module.exports = app;
