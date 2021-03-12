"use strict";

const { AppError, asyncHandler, httpCode } = require("../utils");

const { db } = require("../database");

const validateToken = require("./validate_token");

// middleware para verificar o JWT
const verifyLogin = asyncHandler(async (req, res, next) => {
  // verifica o header authorization para pegar o token
  const token = req.headers.authorization;

  const decoded = await validateToken(token);

  if (!("id" in decoded && decoded.id && "uuid" in decoded && decoded.uuid)) {
    throw new AppError("Falta informação de usuário");
  }

  if (req.params.usuario_uuid && decoded.uuid !== req.params.usuario_uuid) {
    throw new AppError(
      "Usuário só pode acessar sua própria informação",
      httpCode.Unauthorized
    );
  }
  const response = await db.sapConn.oneOrNone(
    "SELECT ativo FROM dgeo.usuario WHERE uuid = $<usuarioUuid>",
    { usuarioUuid: decoded.uuid }
  );
  if (!response.ativo) {
    throw new AppError("Usuário não está ativo", httpCode.Forbidden);
  }

  req.usuarioUuid = decoded.uuid;
  req.usuarioId = decoded.id;

  next();
});

module.exports = verifyLogin;
