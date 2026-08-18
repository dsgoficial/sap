// Path: lib\basePath.ts

/**
 * Prefixo de deploy do frontend, vindo do `base` do Vite (VITE_BASE_PATH).
 *
 * É "/" quando o app é servido na raiz e "/sap/" quando está atrás de um proxy
 * reverso em subcaminho (ex.: http://host/sap/). Sempre com barra no fim — o
 * Vite normaliza o `base` dessa forma.
 */
const BASE = import.meta.env.BASE_URL || '/';

/** O mesmo prefixo sem a barra final: "" na raiz, "/sap" no subcaminho. */
const PREFIXO = BASE.replace(/\/+$/, '');

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

/**
 * O documento está sendo servido SOB o prefixo?
 *
 * O mesmo build atende em dois endereços: atrás do proxy reverso o navegador
 * está em "/sap/...", e direto na porta do serviço ele pode estar em "/sap/..."
 * ou na raiz nua ("/"), porque o servidor remove o prefixo quando não há proxy
 * na frente (chave PUBLIC_PATH). O basename precisa acompanhar o endereço REAL
 * do documento: fixo em "/sap/", a raiz nua não casava rota nenhuma e a tela não
 * abria.
 */
const servidoSobPrefixo = (): boolean => {
  if (!PREFIXO || typeof window === 'undefined') return false;
  const { pathname } = window.location;
  return pathname === PREFIXO || pathname.startsWith(`${PREFIXO}/`);
};

/** Basename do React Router, decidido pelo endereço em que a página abriu. */
export const ROUTER_BASENAME = servidoSobPrefixo() ? BASE : '/';

/**
 * Converte um caminho do NAVEGADOR em caminho do APP, removendo o prefixo.
 *
 * Existe porque `window.location.pathname` inclui o basename e as rotas do
 * router não: passar o caminho do navegador para `redirect()` ou `navigate()`
 * faz o prefixo ser aplicado DUAS vezes ("/sap/sap/"), que não casa rota e cai
 * no 404. Foi exatamente o que quebrou o login em 2026-08-18.
 */
export const appPath = (browserPath: string): string => {
  if (!PREFIXO) return browserPath || '/';
  if (browserPath === PREFIXO) return '/';
  if (browserPath.startsWith(`${PREFIXO}/`)) {
    return browserPath.slice(PREFIXO.length) || '/';
  }
  return browserPath || '/';
};
