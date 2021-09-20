
import { api, auth } from '../services'

const handleLogin = async (usuario, senha) => {
  const response = await api.post('/api/login', { usuario, senha, aplicacao: api.APLICACAO })
  if (!response) return false
  if (
    !('status' in response) ||
    response.status !== 201 ||
    !('data' in response) ||
    !('dados' in response.data) ||
    !('token' in response.data.dados) ||
    !('administrador' in response.data.dados)
  ) {
    throw new Error()
  }
  auth.setToken(response.data.dados.token)
  auth.setAuthorization(response.data.dados.administrador)
  auth.setUUID(response.data.dados.uuid)

  return true
}

export { handleLogin }
