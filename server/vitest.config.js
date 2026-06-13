import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup.js'],
    include: ['test/**/*.{test,spec}.js'],
    // Garante que config.js carregue config_testing.env (e não config.env real).
    env: { NODE_ENV: 'test' },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.js'],
      exclude: ['src/**/build/**', 'src/**/js_docs/**', 'src/**/*_docs.js'],
    },
  },
})
