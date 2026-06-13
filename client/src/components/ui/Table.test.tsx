import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, within, userEvent } from '@/test/utils/render'
import { Table } from './Table'

interface Row {
  nome: string
  valor: number
}

const columns = [
  { id: 'nome', label: 'Nome', sortable: true },
  { id: 'valor', label: 'Valor', sortable: true },
]

const rows: Row[] = [
  { nome: 'Charlie', valor: 3 },
  { nome: 'Alpha', valor: 1 },
  { nome: 'Bravo', valor: 2 },
]

describe('Table', () => {
  // L1 — filteredRows derivado (useMemo): a busca filtra sem render extra/stale.
  it('filtra as linhas pela busca (L1)', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Table<Row> columns={columns} rows={rows} />)

    expect(screen.getByText('Charlie')).toBeInTheDocument()
    expect(screen.getByText('Alpha')).toBeInTheDocument()

    await user.type(screen.getByRole('textbox'), 'brav')

    expect(screen.getByText('Bravo')).toBeInTheDocument()
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument()
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument()
  })

  // L3 — header ordenável expõe aria-sort para leitores de tela.
  it('define aria-sort ao ordenar por uma coluna (L3)', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Table<Row> columns={columns} rows={rows} />)

    const headerNome = screen.getByRole('columnheader', { name: /Nome/i })
    expect(headerNome).not.toHaveAttribute('aria-sort', 'ascending')

    await user.click(within(headerNome).getByText('Nome'))
    expect(headerNome).toHaveAttribute('aria-sort', 'ascending')
  })

  it('mostra a mensagem de vazio quando não há linhas', () => {
    renderWithProviders(
      <Table<Row>
        columns={columns}
        rows={[]}
        emptyMessage="Nada por aqui"
      />,
    )
    expect(screen.getByText('Nada por aqui')).toBeInTheDocument()
  })

  // L4 — MobileCard não pode quebrar quando columns está vazio.
  it('não quebra com columns vazio no modo mobile (L4)', () => {
    // Força matchMedia a "casar" (mobile) para renderizar os MobileCards.
    vi.stubGlobal(
      'matchMedia',
      (query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    )
    expect(() =>
      renderWithProviders(<Table<Row> columns={[]} rows={rows} />),
    ).not.toThrow()
    vi.unstubAllGlobals()
  })
})
