import { describe, it, expect, beforeEach } from 'vitest'
import database from '../../src/database/index.js'
import { patchDb } from '../helpers/databaseMock.js'
import loginCtrl from '../../src/login/login_ctrl.js'

// Gate de versão do login (QGIS/plugins) — lógica de comparação semver sobre os
// mínimos cadastrados no banco. Exposto via _helpers para teste.
const { verificaQGIS, verificaPlugins } = loginCtrl._helpers

let conn
beforeEach(() => {
  conn = patchDb(database)
})

describe('login.verificaQGIS', () => {
  it('passa quando a versão é >= mínima', async () => {
    conn.oneOrNone.mockResolvedValue({ versao_minima: '3.22' })
    await expect(verificaQGIS('3.28')).resolves.toBeUndefined()
  })
  it('lança quando a versão é menor que a mínima', async () => {
    conn.oneOrNone.mockResolvedValue({ versao_minima: '3.28' })
    await expect(verificaQGIS('3.22')).rejects.toThrow(/Versão incorreta do QGIS/)
  })
  it('sem mínimo cadastrado, não bloqueia', async () => {
    conn.oneOrNone.mockResolvedValue(null)
    await expect(verificaQGIS('3.0')).resolves.toBeUndefined()
  })
})

describe('login.verificaPlugins', () => {
  it('passa quando os plugins exigidos estão presentes e atualizados', async () => {
    conn.any.mockResolvedValue([{ nome: 'ferramentas_producao', versao_minima: '1.0' }])
    await expect(
      verificaPlugins([{ nome: 'ferramentas_producao', versao: '1.5' }]),
    ).resolves.toBeUndefined()
  })
  it('lança quando um plugin exigido está desatualizado', async () => {
    conn.any.mockResolvedValue([{ nome: 'ferramentas_producao', versao_minima: '2.0' }])
    await expect(
      verificaPlugins([{ nome: 'ferramentas_producao', versao: '1.0' }]),
    ).rejects.toThrow(/necessários/i)
  })
  it('lança quando um plugin exigido está ausente', async () => {
    conn.any.mockResolvedValue([{ nome: 'ferramentas_producao', versao_minima: '1.0' }])
    await expect(verificaPlugins([])).rejects.toThrow(/necessários/i)
  })
})
