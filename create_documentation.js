"use strict";

const documentation = require("documentation");
const streamArray = require("stream-array");
const vfs = require("vinyl-fs");
const colors = require("colors"); //colors for console

const buildDocumentation = async () => {
  console.log("Criação da documentação do código.".blue);

  return documentation
    .build("src/**/*.js", { shallow: false })
    .then(documentation.formats.html)
    .then(output => {
      streamArray(output).pipe(vfs.dest("./src/js_docs"));
      console.log("Documentação criada com sucesso!".blue);
    })
    .catch(e => {
      console.log("Erro ao criar documentação!".red);
      console.log("-------------------------------------------------");
      console.log(error.message.red);
      console.log("-------------------------------------------------");
      console.log(error);
      process.exit(0);
    });
};

buildDocumentation();
