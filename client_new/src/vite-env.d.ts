// Path: vite-env.d.ts

/**
 * Declarações de variáveis de ambiente para o Vite
 */
interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_APP_NAME: string;
    readonly VITE_APP_VERSION: string;
    readonly VITE_DEFAULT_LANGUAGE: string;
    readonly VITE_MAPLIBRE_API_KEY: string;
    readonly VITE_DEBUG_MODE: string;
    readonly VITE_ENABLE_MAPS: string;
    // Adicione outras variáveis de ambiente conforme necessário
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }