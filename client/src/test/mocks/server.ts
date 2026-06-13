import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Servidor MSW compartilhado (iniciado/parado no setup.ts).
export const server = setupServer(...handlers)
