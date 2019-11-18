"use strict";

const { AppError, asyncHandler } = require("../utils");

//middleware para verificar se o usuário é administrador
const verifyAdmin = asyncHandler(async (req, res, next) => {
    if (!("usuario" in req.body && req.body.usuario)) {
      throw new AppError("Falta informação de usuário");
    }
    const { administrador } = await db.one(
      `SELECT administrador FROM dgeo.usuario WHERE login = $<usuario> and ativo IS TRUE`,
      {usuario: req.body.usuario}
    );
    if (!administrador) {
      throw new AppError("Usuário necessita ser um administrador", 401);
    }
    next();
});

module.exports = verifyAdmin;
