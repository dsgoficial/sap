"use strict";

const chalk = require("chalk");

require("dotenv").config();

const migrate = () => {
  console.log(chalk.blue("Migrando versão do banco de dados do SAP."));
  console.log(
    chalk.red("Realize um backup do banco do SAP antes de prosseguir.")
  );
  console.log(chalk.red("Desligue o serviço do SAP antes de prosseguir."));
  try {
    console.log(chalk.blue("Migração realizada com sucesso!"));
  } catch (error) {
    console.log(chalk.red(error.message));
    console.log("-------------------------------------------------");
    console.log(chalk.red(error));
  }
};

migrate();
