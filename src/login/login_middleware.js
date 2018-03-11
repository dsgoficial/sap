const jwt = require("jsonwebtoken");
const config = require("../config.json");
const jwtSecret = config.secret;

//middleware para verificar o JWT
const verifyToken = function(req, res, next) {
  //verifica o header authorization para pegar o token
  const token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers["authorization"];
  //decode token
  if (token) {
    //verifica se o token é valido
    jwt.verify(token, jwtSecret, function(err, decoded) {
      if (err) {
        // token não é válido
        return res.status(401).send({
          success: false,
          message: "Failed to authenticate token."
        });
      } else {
        // se tudo estiver ok segue para a próxima rota com o atributo usuarioId
        req.usuarioId = decoded.id;
        next();
      }
    });
  } else {
    // se não tiver token retorna erro 403
    return res.status(403).send({
      success: false,
      message: "No token provided."
    });
  }
};

module.exports = verifyToken;
