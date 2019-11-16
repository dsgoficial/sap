"use strict";

const semver = require("semver");

const db = require("./main_db");

const MIN_DATABASE_VERSION = "2.0.0";

const get = async () => {
  const { nome: databaseVersion } = await db.oneOrNone(
    `SELECT nome FROM public.versao`
  );

  if (!databaseVersion) {
    throw Error(`O banco de dados não não é compatível com a versão do SAP.`);
  }

  return databaseVersion;
};

const validate = async () => {
  try {
    const database_version = await get();

    if (
      semver.lt(
        semver.coerce(database_version),
        semver.coerce(MIN_DATABASE_VERSION)
      )
    ) {
      throw Error(
        `Versão do banco de dados (${database_version}) não compatível com a versão do SAP. A versão deve ser superior a ${MIN_DATABASE_VERSION}.`
      );
    }

    return database_version;
  } catch (err) {
    console.log(
      "Erro iniciando o SAP. Verifique a conexão com banco de dados e se o banco atende a versão mínima."
    );
    console.log(err.message);
    process.exit(1);
  }
};

module.exports = { validate, get };
