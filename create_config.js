"use strict";

const fs = require("fs");
const inquirer = require("inquirer");
const colors = require("colors"); //colors for console
const pgtools = require("pgtools");
const path = require("path");
const promise = require("bluebird");
const crypto = require("crypto");

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

const createDotEnv = (port, dbServer, dbPort, dbName, dbUser, dbPassword) => {
  const secret = crypto.randomBytes(64).toString("hex");

  const env = `PORT=${port}
dbServer=${dbServer}
dbPort=${dbPort}
dbName=${dbName}
dbUser=${dbUser}
dbPassword=${dbPassword}
JWT_SECRET=${secret}`;

  fs.writeFileSync("config.env", env);
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

  const sql0 = readSqlFile("./er/versao.sql");
  const sql1 = readSqlFile("./er/dominio.sql");
  const sql2 = readSqlFile("./er/dgeo.sql");
  const sql3 = readSqlFile("./er/macrocontrole.sql");
  const sql4 = readSqlFile("./er/acompanhamento.sql");

  await db.none(sql0);
  await db.none(sql1);
  await db.none(sql2);
  await db.none(sql3);
  await db.none(sql4);

  await db.none(
    `
  GRANT USAGE ON schema public TO $1:name;
  GRANT SELECT ON ALL TABLES IN SCHEMA public TO $1:name;

  GRANT USAGE ON schema dominio TO $1:name;
  GRANT SELECT ON ALL TABLES IN SCHEMA dominio TO $1:name;

  GRANT USAGE ON SCHEMA dgeo TO $1:name;
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA dgeo TO $1:name;
  GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA dgeo TO $1:name;

  GRANT USAGE ON SCHEMA macrocontrole TO $1:name;
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA macrocontrole TO $1:name;
  GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA macrocontrole TO $1:name;
  GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA macrocontrole TO $1:name;

  GRANT USAGE ON schema acompanhamento TO $1:name;
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA acompanhamento TO $1:name;
  GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA acompanhamento TO $1:name;
  GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA acompanhamento TO $1:name;
  `,
    [dbUser]
  );
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
      }
    ];

    const {
      port,
      dbServer,
      dbPort,
      dbName,
      dbUser,
      dbPassword,
      dbCreate
    } = await inquirer.prompt(questions);

    if (dbCreate) {
      await createDatabase(dbUser, dbPassword, dbPort, dbServer, dbName);

      console.log("Banco de dados do SAP criado com sucesso!".blue);
    }

    createDotEnv(port, dbServer, dbPort, dbName, dbUser, dbPassword);

    console.log(
      "Arquivo de configuração (config.env) criado com sucesso!".blue
    );
  } catch (e) {
    handleError(e);
  }
};

createConfig();
