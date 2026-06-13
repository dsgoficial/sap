import { ReactElement, ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SnackbarProvider } from 'notistack'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'

// QueryClient de teste: sem retry e sem cache persistente, para os testes serem
// determinísticos (um erro de rede falha na hora em vez de re-tentar).
export function makeTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  })
}

function AllProviders({
  children,
  queryClient,
  route,
}: {
  children: ReactNode
  queryClient: QueryClient
  route: string
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SnackbarProvider maxSnack={3}>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </SnackbarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

interface ProviderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
  route?: string
}

// Render de componente com todos os providers da app.
export function renderWithProviders(
  ui: ReactElement,
  { queryClient = makeTestQueryClient(), route = '/', ...rest }: ProviderOptions = {},
) {
  return {
    queryClient,
    ...render(ui, {
      wrapper: ({ children }) => (
        <AllProviders queryClient={queryClient} route={route}>
          {children}
        </AllProviders>
      ),
      ...rest,
    }),
  }
}

// Wrapper para renderHook (hooks que dependem de React Query / Snackbar / Router).
export function createHookWrapper(queryClient: QueryClient = makeTestQueryClient()) {
  return function HookWrapper({ children }: { children: ReactNode }) {
    return (
      <AllProviders queryClient={queryClient} route="/">
        {children}
      </AllProviders>
    )
  }
}

export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
