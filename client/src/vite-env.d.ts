// Path: vite-env.d.ts

/**
 * Declarações de variáveis de ambiente para o Vite
 */
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
