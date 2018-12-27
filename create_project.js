"use strict";

const fs = require("fs");
const path = require("path"); 
const chalk = require("chalk");

require("dotenv").config();

const createProject = () => {
  console.log(chalk.blue("Criando arquivo de projeto"));

  try {

    let proj = fs.readFileSync(path.resolve("./templates/sap_config_template.qgs"), "utf-8")
      .replace(/{{DATABASE}}/g, process.env.DB_NAME)
      .replace(/{{HOST}}/g, process.env.DB_SERVER)
      .replace(/{{PORT}}/g, process.env.DB_PORT)
      .replace(/{{USER}}/g, process.env.DB_USER)
      .replace(/{{PASSWORD}}/g, process.env.DB_PASSWORD);

    let exists = fs.existsSync("sap_config.qgs");
    if (exists) {
      throw Error(
        "Arquivo sap_config.qgs já existe, apague antes de iniciar a criação de projeto."
      );
    }
    fs.writeFileSync("sap_config.qgs", proj);
    console.log(chalk.blue("Arquivo de projeto (sap_config.qgs) criado com sucesso!"));
  } catch (error) {
    if (
      error.message ===
      "Arquivo sap_config.qgs já existe, apague antes de iniciar a criação de projeto."
    ) {
      console.log(
        chalk.red(
          "Arquivo sap_config.qgs já existe, apague antes de iniciar a criação de projeto."
        )
      );
    } else {
      console.log(chalk.red(error.message));
      console.log("-------------------------------------------------");
      console.log(chalk.red(error));
    }
  }
};

createProject();
