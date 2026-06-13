import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils/render'
import { ReportErrorDialog } from './ReportErrorDialog'
import type { ErrorType } from '@/types/activity'

const errorTypes: ErrorType[] = [
  { tipo_problema_id: 1, tipo_problema: 'Erro de extração' },
  { tipo_problema_id: 2, tipo_problema: 'Erro de validação' },
] as ErrorType[]

function setup(overrides: Partial<Parameters<typeof ReportErrorDialog>[0]> = {}) {
  const onSubmit = vi.fn()
  const onClose = vi.fn()
  renderWithProviders(
    <ReportErrorDialog
      open
      onClose={onClose}
      onSubmit={onSubmit}
      isSubmitting={false}
      currentActivityId="42"
      errorTypes={errorTypes}
      {...overrides}
    />,
  )
  return { onSubmit, onClose }
}

// M11 — o schema deve REJEITAR o placeholder tipo_problema_id: 0 (default), em
// vez de enviá-lo à API. z.number() sozinho aceita 0; o fix usa .positive().
describe('ReportErrorDialog (M11)', () => {
  it('bloqueia o envio e mostra erro quando nenhum tipo é escolhido', async () => {
    const user = userEvent.setup()
    const { onSubmit } = setup()

    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(
      await screen.findByText('Escolha o tipo de problema'),
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('exige descrição com pelo menos 5 caracteres', async () => {
    const user = userEvent.setup()
    const { onSubmit } = setup()

    await user.type(screen.getByLabelText(/Descrição/i), 'oi')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(
      await screen.findByText('A descrição deve ter pelo menos 5 caracteres'),
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('não envia se não há atividade atual (currentActivityId ausente)', async () => {
    const user = userEvent.setup()
    const { onSubmit } = setup({ currentActivityId: undefined })
    // Mesmo preenchendo a descrição, sem atividade o submit é abortado.
    await user.type(screen.getByLabelText(/Descrição/i), 'descrição válida')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
