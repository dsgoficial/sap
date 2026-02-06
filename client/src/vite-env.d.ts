// Path: vite-env.d.ts

/**
 * Declarações de variáveis de ambiente para o Vite
 */
interface ImportMetaEnv {
  // Usado somente pelo proxy do Vite no desenvolvimento.
  readonly VITE_PROXY_TARGET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
