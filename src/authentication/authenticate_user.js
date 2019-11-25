"use strict";

const axios = require("axios");

const { AUTH_SERVER } = require("../config");

const AppError = require("../utils/app_error");

const http_code = require("../utils/http_code");

const authorization = async (usuario, senha) => {
  const response = await axios.post(`${AUTH_SERVER}/login`, {
    usuario,
    senha
  });
  if (!response || response.status !== 200 || !("data" in response)) {
    throw new AppError(
      "Erro ao se comunicar com o servidor de autenticação",
      http_code.InternalError
    );
  }
  return response.data.success || false;
};

module.exports = authorization;
