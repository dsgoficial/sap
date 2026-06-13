import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/utils/render'
import { PieChart } from './PieChart'

// M4 — proteção contra divisão por zero (0/0 = NaN%) e estado "sem dados".
describe('PieChart (M4)', () => {
  it('mostra empty state quando TODOS os valores são 0 (não renderiza NaN%)', () => {
    renderWithProviders(
      <PieChart
        title="Status"
        data={[
          { label: 'Finalizado', value: 0 },
          { label: 'Em execução', value: 0 },
        ]}
      />,
    )
    expect(screen.getByText('Sem dados disponíveis')).toBeInTheDocument()
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument()
  })

  it('mostra empty state quando data é vazia', () => {
    renderWithProviders(<PieChart title="Status" data={[]} />)
    expect(screen.getByText('Sem dados disponíveis')).toBeInTheDocument()
  })

  it('NÃO mostra empty state quando há ao menos um valor positivo', () => {
    renderWithProviders(
      <PieChart
        title="Status"
        data={[
          { label: 'Finalizado', value: 5 },
          { label: 'Em execução', value: 0 },
        ]}
      />,
    )
    expect(screen.queryByText('Sem dados disponíveis')).not.toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })
})
