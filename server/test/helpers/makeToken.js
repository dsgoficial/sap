import jwt from 'jsonwebtoken'
import config from '../../src/config.js'

// Assina um JWT válido com o JWT_SECRET de teste. Use administrador:true para
// exercitar rotas que exigem verifyAdmin.
export function makeToken({
  id = 1,
  uuid = '00000000-0000-0000-0000-000000000001',
  administrador = false,
  expiresIn = '10h',
} = {}) {
  return jwt.sign({ id, uuid, administrador }, config.JWT_SECRET, { expiresIn })
}

export function makeAdminToken(overrides = {}) {
  return makeToken({ administrador: true, ...overrides })
}
