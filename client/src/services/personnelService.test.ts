import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import {
  getAproveitamento,
  criarLinha,
  copiarMesAnterior,
  AproveitamentoInput,
} from './personnelService';

describe('personnelService', () => {
  it('getAproveitamento bate em /rh/aproveitamento/:ano/:mes (Secao 5.1)', async () => {
    server.use(
      http.get('*/rh/aproveitamento/2026/1', () =>
        HttpResponse.json({
          success: true,
          message: 'ok',
          dados: [
            {
              id: 1,
              usuario_id: 1,
              tipo_posto_grad_id: 14,
              posto: 'Maj',
              nome_guerra: 'DINIZ',
              atividades: null,
            },
          ],
        }),
      ),
    );
    const r = await getAproveitamento(2026, 1);
    expect(r[0].posto).toBe('Maj');
  });

  it('criarLinha envia { aproveitamento } no corpo', async () => {
    let body: unknown;
    server.use(
      http.post('*/rh/aproveitamento', async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ success: true, message: 'ok', dados: null });
      }),
    );
    const input: AproveitamentoInput = {
      ano: 2026,
      mes: 1,
      usuario_id: 1,
      atividades: 'Chefe da 5ª seção',
    };
    await criarLinha(input);
    expect((body as { aproveitamento: AproveitamentoInput }).aproveitamento.usuario_id).toBe(1);
  });

  it('copiarMesAnterior chama /rh/aproveitamento/copiar e retorna a contagem', async () => {
    server.use(
      http.post('*/rh/aproveitamento/copiar', () =>
        HttpResponse.json({ success: true, message: 'ok', dados: { copiados: 23 } }),
      ),
    );
    const r = await copiarMesAnterior(2026, 2);
    expect(r.copiados).toBe(23);
  });
});
