"use strict";

const { AppError, asyncHandler, httpCode } = require("../utils");

//middleware para verificar se o usuário é administrador
const verifyAdmin = asyncHandler(async (req, res, next) => {
  if (!("usuarioId" in req.body && req.body.usuarioId)) {
    throw new AppError("Falta informação de usuário");
  }
  const {
    administrador
  } = await db.conn.oneOrNone(
    `SELECT administrador FROM dgeo.usuario WHERE id = $<usuarioId> and ativo IS TRUE`,
    { usuarioId: req.body.usuarioId }
  );
  if (!administrador) {
    throw new AppError(
      "Usuário necessita ser um administrador",
      httpCode.Forbidden
    );
  }
  next();
});

module.exports = verifyAdmin;
