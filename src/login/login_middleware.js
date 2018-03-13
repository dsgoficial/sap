const jwt = require("jsonwebtoken");
const config = require("../config.json");
const jwtSecret = config.secret;

const sendJsonAndLog = require("../logger/sendJsonAndLog");

//middleware para verificar o JWT
const verifyToken = function(req, res, next) {
  //verifica o header authorization para pegar o token
  const token =
    req.body.token ||
    req.query.token ||
    req.headers["x-access-token"] ||
    req.headers["authorization"];
  //decode token
  if (token) {
    //verifica se o token é valido
    jwt.verify(token, jwtSecret, function(err, decoded) {
      if (err) {
        let information = {
          url: req.protocol + "://" + req.get("host") + req.originalUrl,
          token: token
        };
        return sendJsonAndLog(
          false,
          "Failed to authenticate token.",
          "login_middleware",
          information,
          res,
          401,
          null
        );
      } else {
        // se tudo estiver ok segue para a próxima rota com o atributo usuarioId
        req.body.usuario_id = decoded.id;
        next();
      }
    });
  } else {
    let information = {
      url: req.protocol + "://" + req.get("host") + req.originalUrl
    };
    return sendJsonAndLog(
      false,
      "No token provided.",
      "login_middleware",
      information,
      res,
      403,
      null
    );
  }
};

module.exports = verifyToken;
