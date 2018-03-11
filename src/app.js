const express = require("express");
const path = require("path");

const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
app.disable("x-powered-by");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//CORS middleware
app.use(
  cors({
    exposedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Link",
      "Location"
    ]
  })
);

//Helmet Protection
app.use(helmet());
//Disables cache
app.use(helmet.noCache());

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
    message: "Sistema de Apoio a produção operacional"
  });
});

//Serve APIDoc
app.use("/docs", express.static(path.join(__dirname, "apidoc")));

//Routes
const loginRoute = require("./login/login_route");
app.use("/login", loginRoute);

const loginMiddleware = require("./login/login_middleware");
app.use(loginMiddleware);

const distribuicaoRoute = require("./distribuicao_atividades/distribuicao_route");
app.use("/distribuicao", distribuicaoRoute);

// Catch 404 and forward to error handler //FIXME
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// Error handler
app.use((err, req, res, next) => {
  console.log(err.message); //FIXME LOG ERROR
  res.status(err.status || 500).json({
    success: false,
    message: "Error",
    error: err.message
  });
});

module.exports = app;
