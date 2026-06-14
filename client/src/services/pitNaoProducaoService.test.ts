import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import {
  getMetasNaoProducao,
  criarMeta,
  salvarExecucao,
  MetaNaoProducaoInput,
  ExecucaoInput,
} from './pitNaoProducaoService';

describe('pitNaoProducaoService', () => {
  it('getMetasNaoProducao chama /pit_nao_producao/:ano e retorna dados', async () => {
    server.use(
      http.get('*/pit_nao_producao/2026', () =>
        HttpResponse.json({
          success: true,
          message: 'ok',
          dados: [
            { id: 1, numero_meta: 4, item: '4.1', descricao: 'Sulfite', meta: 327 },
          ],
        }),
      ),
    );
    const r = await getMetasNaoProducao(2026);
    expect(r[0].item).toBe('4.1');
  });

  it('criarMeta envia { pit } no corpo', async () => {
    let body: unknown;
    server.use(
      http.post('*/pit_nao_producao', async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ success: true, message: 'ok', dados: null });
      }),
    );
    const input: MetaNaoProducaoInput = {
      ano: 2026,
      numero_meta: 4,
      item: '4.1',
      descricao: 'Impressão em sulfite',
      unidade: 'produtos',
      meta: 327,
      prazo: null,
    };
    await criarMeta(input);
    expect(body).toHaveProperty('pit');
    expect((body as { pit: MetaNaoProducaoInput }).pit.item).toBe('4.1');
  });

  it('salvarExecucao envia { execucao } no corpo', async () => {
    let body: unknown;
    server.use(
      http.post('*/pit_nao_producao/execucao', async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ success: true, message: 'ok', dados: null });
      }),
    );
    const input: ExecucaoInput = {
      pit_id: 1,
      mes: 5,
      quantidade: 10,
      data_conclusao: null,
      observacao: null,
    };
    await salvarExecucao(input);
    expect(body).toHaveProperty('execucao');
    expect((body as { execucao: ExecucaoInput }).execucao.quantidade).toBe(10);
  });
});
