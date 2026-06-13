import { describe, it, expect, vi } from 'vitest'
import sendJsonAndLogMiddleware from '../../src/utils/send_json_and_log.js'

function setup(body) {
  const req = { protocol: 'http', get: () => 'host', originalUrl: '/api/x', body }
  const json = vi.fn()
  const res = { status: vi.fn(() => res), json }
  sendJsonAndLogMiddleware(req, res, () => {})
  return { req, res, json }
}

describe('sendJsonAndLog', () => {
  // O truncate (usado no log) NÃO deve mutar o req.body original.
  it('não muta o req.body ao logar', () => {
    const { req, res } = setup({ senha: 'secret', nome: 'fulano' })
    res.sendJsonAndLog(true, 'ok', 200, { a: 1 })
    expect(req.body.senha).toBe('secret')
    expect(req.body.nome).toBe('fulano')
  })

  it('monta a resposta com version/success/message/dados', () => {
    const { res, json } = setup({})
    res.sendJsonAndLog(true, 'ok', 200, { a: 1 })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, message: 'ok', dados: { a: 1 } }),
    )
  })

  // Em 500, a mensagem interna é trocada por uma genérica (não vaza detalhe).
  it('troca a mensagem por genérica em status 500', () => {
    const { res, json } = setup({})
    res.sendJsonAndLog(false, 'detalhe interno do servidor', 500, null)
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Erro no servidor' }),
    )
  })

  it('não quebra quando req.body não é objeto', () => {
    const { res } = setup(undefined)
    expect(() => res.sendJsonAndLog(true, 'ok', 200, null)).not.toThrow()
  })
})
