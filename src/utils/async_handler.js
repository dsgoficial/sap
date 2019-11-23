"use strict";

/**
 * Função para facilitar a sintaxe de try/catch com funções assíncronas
 *
 * @description 
 * 
 * Utilizar esta função sempre utilizar uma função assíncrona em uma rota, 
 * não havendo necessidade de try/catch e já enviando o erro para `next`.
 * 
 * @param {Function} fn - Função assincrona
 * @returns {RequestHandler} Função que retorna um Promise da execução de fn
 */
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);


module.exports = asyncHandler;
