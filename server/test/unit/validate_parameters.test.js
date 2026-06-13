import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import database from '../../src/database/index.js'
import { patchDb } from '../helpers/databaseMock.js'
import { httpClient } from '../../src/utils/index.js'
import validadeParameters from '../../src/gerenciador_fme/validate_parameters.js'

// M8 (regressão): a query de getRotinas seleciona apenas `url`. A versão antiga
// montava a URL com serverInfo.servidor/.porta (colunas inexistentes) → resultava
// em 'undefined:undefined/...' e o getRotinas SEMPRE falhava. Este teste fixa que
// a URL é montada a partir de `url` e que o fluxo de validação completa funciona.
let conn
let getSpy
beforeEach(() => {
  conn = patchDb(database)
  getSpy = vi.spyOn(httpClient, 'get')
})
afterEach(() => {
  getSpy.mockRestore()
})

describe('validate_parameters.getRotinas (M8)', () => {
  it('monta a URL das rotinas a partir de serverInfo.url', async () => {
    conn.oneOrNone.mockResolvedValue({ url: 'http://fme.local:9999' })
    getSpy.mockResolvedValue({
      status: 200,
      data: { dados: [{ parametros: ['dbname', 'dbhost'] }] },
    })

    const ok = await validadeParameters([{ servidor: 7, rotina: 'r1' }])

    expect(ok).toBe(true)
    expect(getSpy).toHaveBeenCalledWith('http://fme.local:9999/api/rotinas')
    // Guarda contra o bug antigo: a URL não pode conter 'undefined'.
    expect(getSpy.mock.calls[0][0]).not.toContain('undefined')
  })

  it('lança erro de domínio quando o gerenciador do FME não está cadastrado', async () => {
    conn.oneOrNone.mockResolvedValue(null)

    await expect(
      validadeParameters([{ servidor: 99, rotina: 'r1' }]),
    ).rejects.toThrow(/não está cadastrado/i)
    expect(getSpy).not.toHaveBeenCalled()
  })

  it('rejeita rotina com parâmetro incompatível com o SAP', async () => {
    conn.oneOrNone.mockResolvedValue({ url: 'http://fme.local:9999' })
    getSpy.mockResolvedValue({
      status: 200,
      data: { dados: [{ parametros: ['parametro_invalido'] }] },
    })

    await expect(
      validadeParameters([{ servidor: 7, rotina: 'r1' }]),
    ).rejects.toThrow(/não é compatível com o SAP/i)
  })
})
