import { describe, it, expect } from 'vitest'
import jwt from 'jsonwebtoken'
import validateToken from '../../src/login/validate_token.js'
import { makeToken } from '../helpers/makeToken.js'

// validateToken precisa aceitar OS DOIS formatos de header authorization:
//  - "Bearer <jwt>"  (client web)
//  - "<jwt>"          (plugins QGIS enviam o token cru)
// Qualquer mudança aqui quebra um dos clientes — daí o teste.
describe('validateToken', () => {
  it('aceita token cru (formato dos plugins QGIS)', async () => {
    const decoded = await validateToken(makeToken({ id: 7, uuid: 'u7' }))
    expect(decoded.id).toBe(7)
    expect(decoded.uuid).toBe('u7')
  })

  it('aceita "Bearer <token>" (formato do web)', async () => {
    const decoded = await validateToken('Bearer ' + makeToken({ id: 7, uuid: 'u7' }))
    expect(decoded.id).toBe(7)
  })

  it('rejeita quando nenhum token é fornecido', async () => {
    await expect(validateToken(undefined)).rejects.toThrow('Nenhum token fornecido')
  })

  it('rejeita token malformado', async () => {
    await expect(validateToken('Bearer not.a.jwt')).rejects.toBeTruthy()
  })

  it('rejeita token assinado com outro segredo (forjado)', async () => {
    const forged = jwt.sign({ id: 1, uuid: 'u' }, 'segredo-errado')
    await expect(validateToken(forged)).rejects.toBeTruthy()
  })

  it('rejeita token expirado', async () => {
    const expired = makeToken({ expiresIn: '-1h' })
    await expect(validateToken(expired)).rejects.toBeTruthy()
  })
})
