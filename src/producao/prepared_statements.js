"use strict";

const path = require("path");
const { sqlFile } = require("../database");

/**
 * Returns the full path of a file
 * @param {string} p - file path
 * @returns {string} Full path of a file
 */
const fp = p => {
  return path.join(__dirname, "sql", p);
};

module.exports = {
  calculaFilaPrioritaria: sqlFile.createPS(fp("calcula_fila_prioritaria.sql")),
  calculaFilaPrioritariaGrupo: sqlFile.createPS(
    fp("calcula_fila_prioritaria_grupo.sql")
  ),
  calculaFilaPausada: sqlFile.createPS(fp("calcula_fila_pausada.sql")),
  calculaFila: sqlFile.createPS(fp("calcula_fila.sql")),
  retornaDadosProducao: sqlFile.createPS(fp("retorna_dados_producao.sql"))
};
