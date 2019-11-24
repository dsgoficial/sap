"use strict";

const fs = require("fs");
const inquirer = require("inquirer");
const colors = require("colors"); //colors for console
const pgtools = require("pgtools");
const path = require("path");
const promise = require("bluebird");
const crypto = require("crypto");
const axios = require("axios");

const initOptions = {
  promiseLib: promise
};

const pgp = require("pg-promise")(initOptions);

const readSqlFile = file => {
  const fullPath = path.join(__dirname, file);
  return new pgp.QueryFile(fullPath, { minify: true });
};

const verifyDotEnv = () => {
  return fs.existsSync("config.env");
};

const verifyAuthServer = authServer => {
  const response = await axios.get(authServer);
  if (!response || response.status !== 200 || !("data" in response)) {
    throw new Error("Erro ao se comunicar com o servidor de autenticação");
  }
  //test auth server version
};

const createDotEnv = (
  port,
  dbServer,
  dbPort,
  dbName,
  dbUser,
  dbPassword,
  authServer
) => {
  const secret = crypto.randomBytes(64).toString("hex");

  const env = `PORT=${port}
dbServer=${dbServer}
dbPort=${dbPort}
dbName=${dbName}
dbUser=${dbUser}
dbPassword=${dbPassword}
JWT_SECRET=${secret}
AUTH_SERVER=${authServer}`;

  fs.writeFileSync("config.env", env);
};

/**
 *
 * @async
 * @param {object} config
 * @param {string} [config.dbUser]
 * @param {string} [config.dbPassword]
 * @param {string} [config.dbPort]
 * @param {string} [config.dbServer]
 * @param {string} [config.dbName]
 * @param {*} [config.connection]
 */
const givePermission = async ({
  dbUser,
  dbPassword,
  dbPort,
  dbServer,
  dbName,
  connection
}) => {
  if (!connection) {
    const connectionString = `postgres://${dbUser}:${dbPassword}@${dbServer}:${dbPort}/${dbName}`;

    connection = pgp(connectionString);
  }
  await connection.none(readSqlFile("./er/permissao.sql"), [dbUser]);
};
const createDatabase = async (dbUser, dbPassword, dbPort, dbServer, dbName) => {
  const config = {
    user: dbUser,
    password: dbPassword,
    port: dbPort,
    host: dbServer
  };

  await pgtools.createdb(config, dbName);

  const connectionString = `postgres://${dbUser}:${dbPassword}@${dbServer}:${dbPort}/${dbName}`;

  const db = pgp(connectionString);
  await db.tx(async t => {
    await t.none(readSqlFile("./er/versao.sql"));
    await t.none(readSqlFile("./er/dominio.sql"));
    await t.none(readSqlFile("./er/dgeo.sql"));
    await t.none(readSqlFile("./er/macrocontrole.sql"));
    await t.none(readSqlFile("./er/acompanhamento.sql"));
    await givePermission({ connection: t });
  });
};

const handleError = error => {
  if (
    error.message ===
    "Postgres error. Cause: permission denied to create database"
  ) {
    console.log(
      "O usuário informado não é superusuário. Sem permissão para criar bancos de dados."
        .red
    );
  } else if (
    error.message === 'permission denied to create extension "postgis"'
  ) {
    console.log(
      "O usuário informado não é superusuário. Sem permissão para criar a extensão 'postgis'. Delete o banco de dados criado antes de executar a configuração novamente."
        .red
    );
  } else if (
    error.message.startsWith("Attempted to create a duplicate database")
  ) {
    console.log(`O banco já existe.`.red);
  } else if (
    error.message.startsWith("password authentication failed for user")
  ) {
    console.log(`Senha inválida para o usuário`.red);
  } else {
    console.log(error.message.red);
    console.log("-------------------------------------------------");
    console.log(error);
  }
  process.exit(0);
};

const createConfig = async () => {
  try {
    console.log("Sistema de Apoio a Produção".blue);
    console.log("Criação do arquivo de configuração".blue);

    const exists = verifyDotEnv();
    if (exists) {
      throw new Error(
        "Arquivo config.env já existe, apague antes de iniciar a configuração."
      );
    }

    const questions = [
      {
        type: "input",
        name: "dbServer",
        message:
          "Qual o endereço de IP do servidor do banco de dados PostgreSQL?"
      },
      {
        type: "input",
        name: "dbPort",
        message: "Qual a porta do servidor do banco de dados PostgreSQL?",
        default: 5432
      },
      {
        type: "input",
        name: "dbUser",
        message:
          "Qual o nome do usuário do PostgreSQL para interação com o SAP (já existente no banco de dados e ser superusuario)?",
        default: "controle_app"
      },
      {
        type: "password",
        name: "dbPassword",
        message:
          "Qual a senha do usuário do PostgreSQL para interação com o SAP?"
      },
      {
        type: "input",
        name: "dbName",
        message: "Qual o nome do banco de dados do SAP?",
        default: "sap"
      },
      {
        type: "input",
        name: "port",
        message: "Qual a porta do serviço do SAP?",
        default: 3013
      },
      {
        type: "confirm",
        name: "dbCreate",
        message: "Deseja criar o banco de dados do SAP?",
        default: true
      },
      {
        type: "input",
        name: "authServer",
        message: "Qual a URL do serviço de autenticação?"
      }
    ];

    const {
      port,
      dbServer,
      dbPort,
      dbName,
      dbUser,
      dbPassword,
      dbCreate,
      authServer
    } = await inquirer.prompt(questions);

    await verifyAuthServer(authServer);

    if (dbCreate) {
      await createDatabase(dbUser, dbPassword, dbPort, dbServer, dbName);

      console.log("Banco de dados do SAP criado com sucesso!".blue);
    } else {
      await givePermission({ dbUser, dbPassword, dbPort, dbServer, dbName });

      console.log(`Permissão ao usuário ${dbUser} adicionada com sucesso`.blue);
    }

    createDotEnv(
      port,
      dbServer,
      dbPort,
      dbName,
      dbUser,
      dbPassword,
      authServer
    );

    console.log(
      "Arquivo de configuração (config.env) criado com sucesso!".blue
    );
  } catch (e) {
    handleError(e);
  }
};

createConfig();
