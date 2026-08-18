// Path: lib\basePath.ts

/**
 * Prefixo de deploy do frontend, vindo do `base` do Vite (VITE_BASE_PATH).
 *
 * É "/" quando o app é servido na raiz e "/sap/" quando está atrás de um proxy
 * reverso em subcaminho (ex.: http://host/sap/). Sempre com barra no fim — o
 * Vite normaliza o `base` dessa forma.
 */
const BASE = import.meta.env.BASE_URL || '/';

/**
 * Caminho absoluto (mesma origem) para um arquivo estático do build/public.
 * asset('images/img-1.jpg') -> "/images/img-1.jpg" ou "/sap/images/img-1.jpg".
 */
export const asset = (p: string): string => `${BASE}${p.replace(/^\/+/, '')}`;

/**
 * Prefixo da API na mesma origem, sem barra no fim: "/api" ou "/sap/api".
 * O proxy reverso remove o prefixo antes de repassar ao backend, que continua
 * expondo as rotas em "/api".
 */
export const API_BASE_PATH = asset('api');
