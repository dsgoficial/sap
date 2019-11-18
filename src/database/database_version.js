"use strict";

const semver = require("semver");

const db = require("./main_db");

const { MIN_DATABASE_VERSION } = require("../config");

const { AppError } = require("../utils");

const get = async () => {
  const databaseVersion = await db.oneOrNone(
    `SELECT nome FROM public.versao`
  );

  if (!databaseVersion) {
    throw AppError(
      `O banco de dados não não é compatível com a versão do SAP.`
    );
  }

  return databaseVersion.nome;
};

const validate = async () => {
  const database_version = await get();

  if (
    semver.lt(
      semver.coerce(database_version),
      semver.coerce(MIN_DATABASE_VERSION)
    )
  ) {
    throw AppError(
      `Versão do banco de dados (${database_version}) não compatível com a versão do SAP. A versão deve ser superior a ${MIN_DATABASE_VERSION}.`
    );
  }

  return database_version;
};

module.exports = { validate, get };
