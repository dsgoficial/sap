"use strict";

const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../config");

const { AppError, asyncHandler } = require("../utils");

//middleware para verificar o JWT
const verifyToken = asyncHandler(async (req, res, next) => {
    //verifica o header authorization para pegar o token
    const token = req.headers["authorization"];
    //decode token
    if (!token) {
      throw new AppError("Nenhum token fornecido", 401);
    }
    if (token.startsWith("Bearer ")) {
      // Remove Bearer from string
      token = token.slice(7, token.length);
    }

    //verifica se o token é valido
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        throw new AppError("Falha ao autenticar token", 403);
      }
      // se tudo estiver ok segue para a próxima rota com o atributo usuarioId
      req.body.usuarioId = decoded.id;
      next();
    });
});

module.exports = verifyToken;
