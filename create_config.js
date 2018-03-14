const inquirer = require("inquirer");
const chalk = require("chalk");
const log = console.log;

log(chalk.blue("Sistema de Apoio a Produção"));
log(chalk.blue("Criação do arquivo de configuração"));

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
    message: "Qual o nome do usuário administrador do SAP?",
    default: "controle_app"
  },
  {
    type: "password",
    name: "db_password",
    message: "Qual a senha do usuário administrador do SAP?",
  },
  {
    type: "input",
    name: "port",
    message: "Porta do serviço do SAP?",
    default: 3012
  },
  {
    type: "input",
    name: "db_name",
    message: "Banco de dados do SAP?",
    default: 'sap'
  },
  {
    type: "confirm",
    name: "databaseCreation",
    message: "Deseja criar o banco de dados do SAP?",
    default: false
  },
  {
    type: "password",
    name: "secret",
    message: "Seed para geração do token de autenticação?",
  }
];

inquirer.prompt(questions).then(answers => {
  log("\nTest");
  log(JSON.stringify(answers, null, "  "));
});
