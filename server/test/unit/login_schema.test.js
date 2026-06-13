import { describe, it, expect } from 'vitest'
import loginSchema from '../../src/login/login_schema.js'

// Valida como o middleware (stripUnknown:true) — espelha o uso real.
function validate(body) {
  return loginSchema.login.validate(body, { stripUnknown: true, abortEarly: false })
}

describe('login schema', () => {
  it('aceita login web (cliente sap) e descarta campos desconhecidos', () => {
    const { error, value } = validate({
      usuario: 'fulano',
      senha: 'segredo',
      cliente: 'sap',
      aplicacao: 'sap_web', // não está no schema → deve ser removido
    })
    expect(error).toBeUndefined()
    expect(value).not.toHaveProperty('aplicacao')
  })

  it('exige usuario e senha', () => {
    expect(validate({ cliente: 'sap' }).error).toBeTruthy()
    expect(validate({ usuario: 'x', cliente: 'sap' }).error).toBeTruthy()
  })

  it('rejeita cliente fora do enum', () => {
    const { error } = validate({ usuario: 'u', senha: 's', cliente: 'hacker' })
    expect(error).toBeTruthy()
  })

  it('proíbe plugins/qgis quando cliente é sap', () => {
    const { error } = validate({
      usuario: 'u',
      senha: 's',
      cliente: 'sap',
      plugins: [{ nome: 'p', versao: '1' }],
    })
    expect(error).toBeTruthy()
  })

  it('exige plugins e qgis quando cliente é sap_fp (plugin QGIS)', () => {
    // sem plugins/qgis → inválido
    expect(
      validate({ usuario: 'u', senha: 's', cliente: 'sap_fp' }).error,
    ).toBeTruthy()
    // completo → válido
    expect(
      validate({
        usuario: 'u',
        senha: 's',
        cliente: 'sap_fp',
        plugins: [{ nome: 'ferramentas_producao', versao: '1.0' }],
        qgis: '3.34',
      }).error,
    ).toBeUndefined()
  })

  it('rejeita plugins duplicados (unique por nome)', () => {
    const { error } = validate({
      usuario: 'u',
      senha: 's',
      cliente: 'sap_fp',
      qgis: '3.34',
      plugins: [
        { nome: 'dup', versao: '1' },
        { nome: 'dup', versao: '2' },
      ],
    })
    expect(error).toBeTruthy()
  })
})
