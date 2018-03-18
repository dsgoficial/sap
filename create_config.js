"use strict";

const fs = require("fs");
const inquirer = require("inquirer");
const chalk = require("chalk");

const createConfig = async () => {
  console.log(chalk.blue("Sistema de Apoio a Produção"));
  console.log(chalk.blue("Criação do arquivo de configuração"));

  var questions = [
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
        "Qual o nome do usuário administrador do SAP (já existente no banco de dados)?",
      default: "controle_app"
    },
    {
      type: "password",
      name: "db_password",
      message: "Qual a senha do usuário administrador do SAP?"
    },
    {
      type: "input",
      name: "db_name",
      message: "Qual o nome do banco de dados do SAP?",
      default: "sap"
    },
    {
      type: "confirm",
      name: "databaseCreation",
      message: "Deseja criar o banco de dados do SAP?",
      default: false
    },
    {
      type: "input",
      name: "port",
      message: "Qual a porta do serviço do SAP?",
      default: 3013
    },
    {
      type: "password",
      name: "jwt_secret",
      message: "Defina um Seed para geração do token de autenticação."
    }
  ];

  await inquirer
    .prompt(questions)
    .then(answers => {
      let env = `
PORT=${answers.port}
DB_SERVER=${answers.db_server}
DB_PORT=${answers.db_port}
DB_NAME=${answers.db_name}
DB_USER=${answers.db_user}
DB_PASSWORD=${answers.db_password}
JWT_SECRET=${answers.jwt_secret}
    `;

      fs.writeFileSync("./src/.env", env, "utf-8");
      console.log(chalk.blue("Arquivo de configuração criado com sucesso"));

      //TODO criação do banco de dados
    })
    .catch(err => console.log(err));
};

createConfig();
