"use strict";

const inquirer = require("inquirer");
const chalk = require("chalk");
const promise = require("bluebird");

const initOptions = {
  promiseLib: promise
};

const pgp = require("pg-promise")(initOptions);

const createConfig = () => {
  console.log(chalk.blue("Importação em lote do DSGDocs"));

  let questions = [
    {
      type: "input",
      name: "docs_url",
      message: "Qual o endereço do DSGDocs?"
    },
    {
      type: "input",
      name: "categoria",
      message: "Qual a categoria de arquivos que se deseja importar?"
    }
  ];

  inquirer.prompt(questions).then(async answers => {

    try {

        console.log(chalk.blue("Arquivos importados com sucesso!"));

    } catch (error) {
      console.log(chalk.red(error.message));
      console.log("-------------------------------------------------");
      console.log(chalk.red(error));
    }
  });
};

createConfig();
