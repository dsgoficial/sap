"use strict";
const path = require("path");
const { createPS } = require("../../database");

/**
 * Returns the full path of a file
 * @param {string} p - file path
 * @returns {string} Full path of a file
 */
const fp = p => {
  return path.join(__dirname, p);
};

module.exports = {
  calculaFilaPrioritaria: createPS(fp("calcula_fila_prioritaria.sql")),
  calculaFilaPrioritariaGrupo: createPS(
    fp("calcula_fila_prioritaria_grupo.sql")
  ),
  calculaFilaPausada: createPS(fp("calcula_fila_pausada.sql")),
  calculaFila: createPS(fp("calcula_fila.sql")),
  retornaDadosProducao: createPS(fp("retorna_dados_producao.sql"))
};
