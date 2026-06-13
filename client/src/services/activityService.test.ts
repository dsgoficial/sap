import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { startActivity } from './activityService'

// M13 — o backend responde HTTP 400 em DOIS casos diferentes:
//   (a) "sem atividades disponíveis": body { success: true, dados: null }
//   (b) erro de negócio real:        body { success: false, message: '...' }
// O serviço deve distinguir os dois — não tratar todo 400 como sucesso.
describe('activityService.startActivity (M13)', () => {
  it('trata 400 com success:true como "sem atividades" (resolve, não lança)', async () => {
    server.use(
      http.post('*/distribuicao/inicia', () =>
        HttpResponse.json(
          {
            success: true,
            message: 'Sem atividades disponíveis para iniciar',
            dados: null,
          },
          { status: 400 },
        ),
      ),
    )
    const res = await startActivity()
    expect(res.success).toBe(true)
    expect(res.dados).toBeNull()
  })

  it('LANÇA em 400 com success:false e preserva a mensagem do backend', async () => {
    server.use(
      http.post('*/distribuicao/inicia', () =>
        HttpResponse.json(
          { success: false, message: 'Usuário já possui atividade em andamento' },
          { status: 400 },
        ),
      ),
    )
    await expect(startActivity()).rejects.toMatchObject({
      message: 'Usuário já possui atividade em andamento',
    })
  })

  it('resolve normalmente quando o backend inicia a atividade (201/200)', async () => {
    server.use(
      http.post('*/distribuicao/inicia', () =>
        HttpResponse.json(
          { success: true, message: 'Atividade iniciada', dados: { atividade: { id: '42' } } },
          { status: 201 },
        ),
      ),
    )
    const res = await startActivity()
    expect(res.success).toBe(true)
    expect((res.dados as { atividade: { id: string } }).atividade.id).toBe('42')
  })
})
