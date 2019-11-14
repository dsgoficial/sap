
const jwt = require("jsonwebtoken");

const { sendJsonAndLog } = require("../utils");

const { JWT_SECRET } = require('./config');

//middleware para verificar o JWT
const verifyToken = function(req, res, next) {
  //verifica o header authorization para pegar o token
  const token = req.headers["authorization"];
  //decode token
  if (token === null) {
    return sendJsonAndLog(
      false,
      "Nenhum token fornecido.",
      "login_middleware",
      { url: req.protocol + "://" + req.get("host") + req.originalUrl },
      res,
      401,
      null
    );
  }
  if (token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }

  //verifica se o token é valido
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return sendJsonAndLog(
        false,
        "Falha ao autenticar token.",
        "login_middleware",
        {
          url: req.protocol + "://" + req.get("host") + req.originalUrl,
          token: token
        },
        res,
        403,
        null
      );
    }
    // se tudo estiver ok segue para a próxima rota com o atributo id e informa se é administrador ou não
    req.body.usuario_id = decoded.id;
    next();

  });

};

module.exports = verifyToken;
