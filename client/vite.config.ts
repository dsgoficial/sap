// vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: ['@emotion/babel-plugin']
        }
      }),
      viteCompression()
    ],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3013',
          changeOrigin: true,
          secure: false
        }
      }
    },
    build: {
      outDir: 'build',
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Evita dependências circulares usando função ao invés de objeto estático
            if (id.includes('node_modules')) {
              // MUI e Emotion juntos (MUI depende de Emotion)
              if (id.includes('@mui') || id.includes('@emotion')) {
                return 'vendor-mui';
              }
              // Charts - separado (recharts + d3)
              if (id.includes('recharts') || id.includes('d3')) {
                return 'vendor-charts';
              }
              // Data fetching e state
              if (id.includes('@tanstack') || id.includes('axios') || id.includes('zustand')) {
                return 'vendor-data';
              }
              // Forms
              if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
                return 'vendor-form';
              }
              // MapLibre separado (é muito grande)
              if (id.includes('maplibre')) {
                return 'vendor-maplibre';
              }
              // Core React e demais dependências básicas
              if (
                id.includes('/react/') ||
                id.includes('react-dom') ||
                id.includes('react-router') ||
                id.includes('scheduler')
              ) {
                return 'vendor-core';
              }
            }
          }
        }
      },
      sourcemap: mode === 'development',
      chunkSizeWarningLimit: 1000,
      target: 'esnext',
      minify: 'esbuild'
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@features': path.resolve(__dirname, './src/features'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@lib': path.resolve(__dirname, './src/lib'),
        '@services': path.resolve(__dirname, './src/services'),
        '@stores': path.resolve(__dirname, './src/stores'),
        '@types': path.resolve(__dirname, './src/types'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@routes': path.resolve(__dirname, './src/routes'),
        '@assets': path.resolve(__dirname, './src/assets')
      }
    }
  }
})