"use strict";

const fs = require("fs");
const inquirer = require("inquirer");
const colors = require("colors"); //colors for console
const pgtools = require("pgtools");
const path = require("path");
const promise = require("bluebird");

const initOptions = {
  promiseLib: promise
};

const pgp = require("pg-promise")(initOptions);

const readSqlFile = file => {
  const fullPath = path.join(__dirname, file);
  return new pgp.QueryFile(fullPath, { minify: true });
};

const sql0 = readSqlFile("./er/versao.sql");
const sql1 = readSqlFile("./er/dominio.sql");
const sql2 = readSqlFile("./er/dgeo.sql");
const sql3 = readSqlFile("./er/macrocontrole.sql");
const sql4 = readSqlFile("./er/acompanhamento.sql");

const createConfig = () => {
  console.log("Sistema de Apoio a Produção".blue);
  console.log("Criação do arquivo de configuração".blue);

  const exists = fs.existsSync("config.env");
  if (exists) {
    console.log(
        "Arquivo config.env já existe, apague antes de iniciar a configuração.".red
    );
    process.exit(0);
  }

  const questions = [
    {
      type: "input",
      name: "dbServer",
      message: "Qual o endereço de IP do servidor do banco de dados PostgreSQL?"
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
      message: "Qual a senha do usuário do PostgreSQL para interação com o SAP?"
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

  inquirer.prompt(questions).then(async answers => {
    const config = {
      user: answers.dbUser,
      password: answers.dbPassword,
      port: answers.dbPort,
      host: answers.dbServer
    };

    try {
      if (answers.dbCreate) {
        await pgtools.createdb(config, answers.dbName);

        const connectionString =
          "postgres://" +
          answers.dbUser +
          ":" +
          answers.dbPassword +
          "@" +
          answers.dbServer +
          ":" +
          answers.dbPort +
          "/" +
          answers.dbName;

        const db = pgp(connectionString);

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
          [answers.dbUser]
        );
        console.log("Banco de dados do SAP criado com sucesso!".blue);
      }

      const secret = require("crypto")
        .randomBytes(64)
        .toString("hex");

      const env = `PORT=${answers.port}
dbServer=${answers.dbServer}
dbPort=${answers.dbPort}
dbName=${answers.dbName}
dbUser=${answers.dbUser}
dbPassword=${answers.dbPassword}
JWT_SECRET=${secret}`;

      fs.writeFileSync("config.env", env);
      console.log(
        "Arquivo de configuração (config.env) criado com sucesso!".blue
      );
    } catch (error) {
      if (
        error.message ===
        "Postgres error. Cause: permission denied to create database"
      ) {
        console.log(
          "O usuário informado não é superusuário. Sem permissão para criar bancos de dados.".red
        );
      } else if (
        error.message === 'permission denied to create extension "postgis"'
      ) {
        console.log(
            "O usuário informado não é superusuário. Sem permissão para criar a extensão 'postgis'.".red
        );
        console.log(
            "Delete o banco de dados criado antes de executar a configuração novamente.".red
        );
      } else if (
        error.message ===
        'Attempted to create a duplicate database. Cause: database "' +
          answers.dbName +
          '" already exists'
      ) {
        console.log(`O banco ${answers.dbName} já existe.`.red);
      } else if (
        error.message ===
        'password authentication failed for user "' + answers.dbUser + '"'
      ) {
        console.log(
          `Senha inválida para o usuário ${answers.dbUser}`.red
        );
      } else {
        console.log(error.message.red);
        console.log("-------------------------------------------------");
        console.log(error.red);
      }
    }
  });
};

createConfig();
