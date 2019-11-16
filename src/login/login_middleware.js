"use strict";

const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../config");

const { AppError } = require("../utils");

//middleware para verificar o JWT
const verifyToken = async (req, res, next) => {
  try {
    //verifica o header authorization para pegar o token
    const token = req.headers["authorization"];
    //decode token
    if (!token) {
      return res.sendJsonAndLog(false, "Nenhum token fornecido.", 401);
    }
    if (token.startsWith("Bearer ")) {
      // Remove Bearer from string
      token = token.slice(7, token.length);
    }

    //verifica se o token é valido
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.sendJsonAndLog(false, "Falha ao autenticar token.", 403, {
          token: token
        });
      }
      // se tudo estiver ok segue para a próxima rota com o atributo id
      req.body.usuario_id = decoded.id;
      next();
    });
  } catch (error) {
    next(new AppError("Erro ao verificar token", 500, null, error));
  }
};

module.exports = verifyToken;
