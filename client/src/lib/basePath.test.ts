// Path: lib\basePath.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * O prefixo de deploy entra no bundle por `import.meta.env.BASE_URL`, e o módulo
 * decide o basename no LOAD, lendo o endereço da página. Cada caso reimporta o
 * módulo com o BASE_URL e o pathname que quer testar.
 *
 * O que estes testes protegem é a regressão de 2026-08-18: com o basename fixo,
 * o `from` do login levava o prefixo dentro, o `navigate` o aplicava outra vez
 * ("/sap/sap/") e o login terminava em /sap/404.
 */
const carregar = async (base: string, pathname: string) => {
  vi.resetModules();
  vi.stubEnv('BASE_URL', base);
  const url = new URL(`http://servidor${pathname}`);
  vi.stubGlobal('window', { location: url } as unknown as Window);
  return await import('./basePath');
};

describe('basePath', () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  describe('servido em subcaminho (/sap/)', () => {
    it('monta asset e API com o prefixo', async () => {
      const m = await carregar('/sap/', '/sap/');
      expect(m.asset('images/img-1.jpg')).toBe('/sap/images/img-1.jpg');
      expect(m.API_BASE_PATH).toBe('/sap/api');
    });

    it('usa o prefixo como basename quando a página abriu sob ele', async () => {
      const m = await carregar('/sap/', '/sap/relatorio');
      expect(m.ROUTER_BASENAME).toBe('/sap/');
    });

    it('appPath remove o prefixo, e a raiz do app vira "/"', async () => {
      const m = await carregar('/sap/', '/sap/');
      expect(m.appPath('/sap/')).toBe('/');
      expect(m.appPath('/sap')).toBe('/');
      expect(m.appPath('/sap/relatorio')).toBe('/relatorio');
      expect(m.appPath('/sap/login')).toBe('/login');
    });

    it('appPath não mexe em caminho que já é do app', async () => {
      const m = await carregar('/sap/', '/sap/');
      expect(m.appPath('/relatorio')).toBe('/relatorio');
      expect(m.appPath('/')).toBe('/');
    });

    it('não confunde rota que começa com o nome do prefixo', async () => {
      const m = await carregar('/sap/', '/sap/');
      expect(m.appPath('/sapiencia')).toBe('/sapiencia');
    });
  });

  describe('servido na raiz nua da porta, com build de subcaminho', () => {
    it('cai para basename "/" para a tela abrir', async () => {
      const m = await carregar('/sap/', '/');
      expect(m.ROUTER_BASENAME).toBe('/');
    });

    it('mantém asset e API sob o prefixo, que o servidor remove', async () => {
      const m = await carregar('/sap/', '/');
      expect(m.API_BASE_PATH).toBe('/sap/api');
      expect(m.asset('images/img-1.jpg')).toBe('/sap/images/img-1.jpg');
    });
  });

  describe('build sem prefixo (raiz)', () => {
    it('não mexe em nada', async () => {
      const m = await carregar('/', '/relatorio');
      expect(m.ROUTER_BASENAME).toBe('/');
      expect(m.API_BASE_PATH).toBe('/api');
      expect(m.appPath('/relatorio')).toBe('/relatorio');
    });
  });
});
