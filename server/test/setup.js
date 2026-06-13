import { vi, beforeAll, afterAll } from 'vitest'

// Garante o ambiente de teste antes de qualquer require de src/config.
process.env.NODE_ENV = 'test'

// Blinda process.exit: errorHandler.critical() chama process.exit(1), o que
// mataria o runner silenciosamente. Em teste, transformamos em erro visível.
let exitSpy
beforeAll(() => {
  exitSpy = vi.spyOn(process, 'exit').mockImplementation((code) => {
    throw new Error(`process.exit(${code}) chamado durante o teste`)
  })
})
afterAll(() => {
  exitSpy?.mockRestore()
})

// Silencia o logger (Winston) para não poluir a saída nem escrever em logs/.
vi.mock('../src/utils/logger', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}))
