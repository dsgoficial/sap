// Path: vite-env.d.ts
/// <reference types="vite/client" />

/**
 * Declarações de variáveis de ambiente para o Vite.
 * A referência acima traz os tipos embutidos (DEV, PROD, MODE, BASE_URL...);
 * a interface abaixo apenas estende com as variáveis custom do projeto.
 */
interface ImportMetaEnv {
  // Usado somente pelo proxy do Vite no desenvolvimento.
  readonly VITE_PROXY_TARGET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
