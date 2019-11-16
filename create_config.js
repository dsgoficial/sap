"use strict";

const fs = require("fs");
const inquirer = require("inquirer");
const chalk = require("chalk");
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
  console.log(chalk.blue("Sistema de Apoio a Produção"));
  console.log(chalk.blue("Criação do arquivo de configuração"));

  const exists = fs.existsSync("config.env");
  if (exists) {
    console.log(
      chalk.red(
        "Arquivo config.env já existe, apague antes de iniciar a configuração."
      )
    );
    process.exit(0);
  }

  const questions = [
    {
      type: "input",
      name: "db_server",
      message: "Qual o endereço de IP do servidor do banco de dados PostgreSQL?"
    },
    {
      type: "input",
      name: "db_port",
      message: "Qual a porta do servidor do banco de dados PostgreSQL?",
      default: 5432
    },
    {
      type: "input",
      name: "db_user",
      message:
        "Qual o nome do usuário do PostgreSQL para interação com o SAP (já existente no banco de dados e ser superusuario)?",
      default: "controle_app"
    },
    {
      type: "password",
      name: "db_password",
      message: "Qual a senha do usuário do PostgreSQL para interação com o SAP?"
    },
    {
      type: "input",
      name: "db_name",
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
      name: "db_create",
      message: "Deseja criar o banco de dados do SAP?",
      default: true
    }
  ];

  inquirer.prompt(questions).then(async answers => {
    const config = {
      user: answers.db_user,
      password: answers.db_password,
      port: answers.db_port,
      host: answers.db_server
    };

    try {
      if (answers.db_create) {
        await pgtools.createdb(config, answers.db_name);

        const connectionString =
          "postgres://" +
          answers.db_user +
          ":" +
          answers.db_password +
          "@" +
          answers.db_server +
          ":" +
          answers.db_port +
          "/" +
          answers.db_name;

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
          [answers.db_user]
        );
        console.log(chalk.blue("Banco de dados do SAP criado com sucesso!"));
      }

      const secret = require("crypto")
        .randomBytes(64)
        .toString("hex");

      const env = `PORT=${answers.port}
DB_SERVER=${answers.db_server}
DB_PORT=${answers.db_port}
DB_NAME=${answers.db_name}
DB_USER=${answers.db_user}
DB_PASSWORD=${answers.db_password}
JWT_SECRET=${secret}`;

      fs.writeFileSync("config.env", env);
      console.log(
        chalk.blue("Arquivo de configuração (config.env) criado com sucesso!")
      );
    } catch (error) {
      if (
        error.message ===
        "Postgres error. Cause: permission denied to create database"
      ) {
        console.log(
          chalk.red(
            "O usuário informado não é superusuário. Sem permissão para criar bancos de dados."
          )
        );
      } else if (
        error.message === 'permission denied to create extension "postgis"'
      ) {
        console.log(
          chalk.red(
            "O usuário informado não é superusuário. Sem permissão para criar a extensão 'postgis'."
          )
        );
        console.log(
          chalk.red(
            "Delete o banco de dados criado antes de executar a configuração novamente."
          )
        );
      } else if (
        error.message ===
        'Attempted to create a duplicate database. Cause: database "' +
          answers.db_name +
          '" already exists'
      ) {
        console.log(chalk.red("O banco " + answers.db_name + " já existe."));
      } else if (
        error.message ===
        'password authentication failed for user "' + answers.db_user + '"'
      ) {
        console.log(
          chalk.red("Senha inválida para o usuário " + answers.db_user)
        );
      } else if (
        error.message ===
        "Arquivo .env já existe, apague antes de iniciar a configuração."
      ) {
        console.log(
          chalk.red(
            "Arquivo .env já existe, apague antes de iniciar a configuração."
          )
        );
        if (answers.db_create) {
          console.log(
            chalk.red(
              "Delete o banco de dados criado antes de executar a configuração novamente."
            )
          );
        }
      } else {
        console.log(chalk.red(error.message));
        console.log("-------------------------------------------------");
        console.log(chalk.red(error));
      }
    }
  });
};

createConfig();
