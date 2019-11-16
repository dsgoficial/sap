"use strict";

const { AppError } = require("../utils");

//middleware para verificar se o usuário é administrador
const verifyAdmin = async (req, res, next) => {
  try {
    if (!("usuario" in req.body && req.body.usuario)) {
      return res.sendJsonAndLog(false, "Falta informação de usuário.", 500);
    }
    const { administrador } = await db.one(
      "SELECT administrador FROM dgeo.usuario WHERE login = $1 and ativo IS TRUE",
      [req.body.usuario]
    );
    if (!administrador) {
      return res.sendJsonAndLog(
        false,
        "Usuário necessita ser um administrador",
        401
      );
    }
    next();
  } catch (error) {
    next(new AppError("Erro ao verificar administrador", 500, null, error));
  }
};

module.exports = verifyAdmin;
