
const { sendJsonAndLog } = require("../utils");
const {serializeError} = require('serialize-error');

//middleware para verificar se o usuário é administrador
const verifyAdmin = function(req, res, next) {
  try{
    if(!("usuario" in req.body && req.body.usuario)){
      return sendJsonAndLog(
        false,
        "Falta informação de usuário.",
        "admin_middleware",
        {
          url: req.protocol + "://" + req.get("host") + req.originalUrl
        },
        res,
        500,
        null
      );
    }
    const { administrador } = await db.one(
      "SELECT administrador FROM dgeo.usuario WHERE login = $1 and ativo IS TRUE",
      [req.body.usuario]
    );
    if(!administrador){
      return sendJsonAndLog(
        false,
        "Usuário necessita ser um administrador.",
        "admin_middleware",
        {
          url: req.protocol + "://" + req.get("host") + req.originalUrl,
          usuario_id: req.body.usuario_id
        },
        res,
        401,
        null
      );
    }
    next();
  } catch (error) {
    return sendJsonAndLog(
      false,
      "Erro ao verificar administrador.",
      "admin_middleware",
      {
        url: req.protocol + "://" + req.get("host") + req.originalUrl,
        usuario_id: req.body.usuario_id,
        trace: serializeError(error)
      },
      res,
      500,
      null
    );
  }
};

module.exports = verifyAdmin;
