import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import {
  getExtraPitByAno,
  criarExtraPit,
  ExtraPitInput,
} from './extraPitService';

describe('extraPitService', () => {
  it('getExtraPitByAno chama /extra_pit/:ano e retorna dados', async () => {
    server.use(
      http.get('*/extra_pit/2026', () =>
        HttpResponse.json({
          success: true,
          message: 'ok',
          dados: [{ id: 1, demandante: 'DSG', tipo_produto: 'Super-resolução' }],
        }),
      ),
    );
    const r = await getExtraPitByAno(2026);
    expect(r[0].demandante).toBe('DSG');
  });

  it('criarExtraPit envia { extra_pit } no corpo', async () => {
    let body: unknown;
    server.use(
      http.post('*/extra_pit', async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ success: true, message: 'ok', dados: null });
      }),
    );
    const input: ExtraPitInput = {
      ano: 2026,
      demandante: 'DSG',
      tipo_produto: 'Super-resolução',
      quantidade: 12,
      situacao_id: 3,
      documento_autorizacao: 'DIEx 1455-E3/DSG',
      descricao: null,
      lote_id: null,
    };
    await criarExtraPit(input);
    expect(body).toHaveProperty('extra_pit');
    expect((body as { extra_pit: ExtraPitInput }).extra_pit.quantidade).toBe(12);
  });
});
