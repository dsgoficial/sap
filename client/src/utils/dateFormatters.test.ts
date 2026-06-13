import { describe, it, expect } from 'vitest'
import { formatTimestamp, formatTimestampWithTimezone } from './dateFormatters'

// formatTimestamp é a fonte única usada pelos grids (dedup do L33). Testes
// focam no tratamento de fuso e de entradas ruins — não só o caminho feliz.
describe('formatTimestamp', () => {
  it('retorna string vazia para entrada vazia/undefined', () => {
    expect(formatTimestamp('')).toBe('')
    expect(formatTimestamp(undefined)).toBe('')
  })

  it('interpreta "YYYY-MM-DD HH:MM:SS" (sem timezone) como UTC', () => {
    // Mesmo instante expresso em dois formatos deve formatar igual:
    // "2024-03-10 12:00:00" (sem tz, assumido UTC) == "2024-03-10T12:00:00Z".
    expect(formatTimestamp('2024-03-10 12:00:00')).toBe(
      formatTimestamp('2024-03-10T12:00:00Z'),
    )
  })

  it('respeita timezone explícito quando presente (Z vs +03:00 diferem)', () => {
    expect(formatTimestamp('2024-03-10T12:00:00Z')).not.toBe(
      formatTimestamp('2024-03-10T12:00:00+03:00'),
    )
  })

  it('inclui hora e segundos (difere de formatTimestampWithTimezone, sem segundos)', () => {
    const comSegundos = formatTimestamp('2024-03-10T12:00:30Z')
    const semSegundos = formatTimestampWithTimezone('2024-03-10T12:00:30Z')
    expect(comSegundos.length).toBeGreaterThan(semSegundos.length)
  })

  it('não lança para data inválida (degrada em vez de quebrar a UI)', () => {
    expect(() => formatTimestamp('not-a-date')).not.toThrow()
  })
})
