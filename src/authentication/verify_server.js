"use strict";

const axios = require("axios");

const { AppError } = require("../utils");

const { AUTH_SERVER } = require("../config");

const verifyAuthServer = async () => {
  try{
    const response = await axios.get(AUTH_SERVER);
    const test = !response || response.status !== 200 || !("data" in response) || response.data.message !== "Serviço de autenticação operacional"
    if (test) {
      throw new Error();
    }
  } catch(e){
    throw new AppError("Erro ao se comunicar com o servidor de autenticação");

  }

};

module.exports = verifyAuthServer;

  