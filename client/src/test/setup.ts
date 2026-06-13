import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './mocks/server'

// O routes/index.tsx cria um createBrowserRouter no load do módulo, que dispara
// uma navegação incompatível com o fetch do Node (jsdom) e gera unhandled
// rejection. Nenhum teste usa esse router (usamos MemoryRouter no render helper),
// então stubamos o módulo globalmente.
vi.mock('@/routes', () => ({
  default: {},
  navigateToLogin: vi.fn(),
}))

// MSW: erra apenas em requisições /api não tratadas (deixa passar assets etc.).
beforeAll(() =>
  server.listen({
    onUnhandledRequest: (request, print) => {
      if (request.url.includes('/api/')) print.error()
    },
  }),
)
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())

// jsdom não implementa matchMedia (MUI useMediaQuery precisa).
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// ResizeObserver é usado por EnhancedTimeline / recharts; jsdom não tem.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
;(globalThis as unknown as { ResizeObserver: typeof ResizeObserverMock }).ResizeObserver =
  ResizeObserverMock
