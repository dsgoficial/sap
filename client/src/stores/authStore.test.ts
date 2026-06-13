import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAuthActions, isTokenExpired } from './authStore'
import queryClient from '@/lib/queryClient'
import { UserRole } from '@/types/auth'

// Monta um JWT NÃO assinado com o payload dado (getTokenExpiry só decodifica o
// payload, não verifica assinatura) — suficiente para exercitar o claim `exp`.
function makeJwt(payload: Record<string, unknown>): string {
  const b64 = (o: unknown) =>
    btoa(JSON.stringify(o))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.sig`
}

function getActions() {
  return renderHook(() => useAuthActions()).result.current
}

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  // M3 — expiração derivada do claim `exp` do JWT, não fabricada (24h hardcoded).
  describe('expiração derivada do JWT (M3)', () => {
    it('usa o claim exp do token para definir a expiração', () => {
      const expSeconds = Math.floor(Date.now() / 1000) + 3600 // +1h
      getActions().setUser({
        token: makeJwt({ exp: expSeconds }),
        administrador: false,
        uuid: 'u1',
        username: 'fulano',
      })
      const stored = localStorage.getItem('@sap_web-Token-Expiry')
      expect(stored).toBeTruthy()
      // expiry deve bater (~) com o exp do JWT, não com now+24h.
      expect(new Date(stored as string).getTime()).toBeCloseTo(
        expSeconds * 1000,
        -3, // tolerância de ~1s
      )
      expect(isTokenExpired()).toBe(false)
    })

    it('reporta expirado quando o exp do JWT já passou', () => {
      getActions().setUser({
        token: makeJwt({ exp: Math.floor(Date.now() / 1000) - 60 }), // -1min
        administrador: false,
        uuid: 'u1',
        username: 'fulano',
      })
      expect(isTokenExpired()).toBe(true)
    })

    it('considera expirado quando não há token', () => {
      expect(isTokenExpired()).toBe(true)
    })
  })

  // M5 — logout limpa o cache do React Query (não vaza dados entre usuários).
  it('logout chama queryClient.clear() (M5)', () => {
    const clearSpy = vi.spyOn(queryClient, 'clear')
    getActions().setUser({
      token: makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 }),
      administrador: false,
      uuid: 'u1',
      username: 'fulano',
    })
    getActions().logout()
    expect(clearSpy).toHaveBeenCalledTimes(1)
  })

  // L47 — token não é persistido dentro de `user` no blob do Zustand.
  it('não persiste o token no blob auth-storage (L47)', () => {
    getActions().setUser({
      token: makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 }),
      administrador: true,
      uuid: 'u1',
      username: 'fulano',
    })
    const blob = JSON.parse(localStorage.getItem('auth-storage') as string)
    expect(blob.state.user).toBeTruthy()
    expect(blob.state.user.token).toBe('') // token zerado no persist
    // ...mas a chave legada usada pelo interceptor continua com o token real:
    expect(localStorage.getItem('@sap_web-Token')).not.toBe('')
  })

  // L45 — username vem da resposta de login (não relê chave vazia do storage).
  it('usa o username vindo na resposta (L45)', () => {
    getActions().setUser({
      token: makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 }),
      administrador: true,
      uuid: 'u1',
      username: 'mapeador01',
    })
    const blob = JSON.parse(localStorage.getItem('auth-storage') as string)
    expect(blob.state.user.username).toBe('mapeador01')
    expect(blob.state.user.role).toBe(UserRole.ADMIN)
  })
})
