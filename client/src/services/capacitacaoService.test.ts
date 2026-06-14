import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import {
  getCapacitacoes,
  getSituacoesCapacitacao,
  criarCapacitacao,
  CapacitacaoInput,
} from './capacitacaoService';

const base: CapacitacaoInput = {
  nome: 'X',
  tipo: 'Ministrada',
  instituicoes: null,
  local: null,
  inicio: null,
  fim: null,
  efetivo_capacitado: null,
  militares: null,
  plano_codigo: null,
  ano: 2026,
  situacao_id: 1,
  documento: null,
};

describe('capacitacaoService', () => {
  it('getCapacitacoes retorna o array em dados', async () => {
    server.use(
      http.get('*/capacitacao/capacitacoes', () =>
        HttpResponse.json({
          success: true,
          message: 'ok',
          dados: [{ id: '1', nome: 'FAB', tipo: 'Ministrada' }],
        }),
      ),
    );
    const r = await getCapacitacoes();
    expect(r).toHaveLength(1);
    expect(r[0].nome).toBe('FAB');
  });

  it('getSituacoesCapacitacao bate em /capacitacao/situacao', async () => {
    server.use(
      http.get('*/capacitacao/situacao', () =>
        HttpResponse.json({
          success: true,
          message: 'ok',
          dados: [{ code: 1, nome: 'Prevista' }],
        }),
      ),
    );
    const r = await getSituacoesCapacitacao();
    expect(r[0].nome).toBe('Prevista');
  });

  it('criarCapacitacao envia { capacitacao } no corpo', async () => {
    let body: unknown;
    server.use(
      http.post('*/capacitacao/capacitacoes', async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ success: true, message: 'ok', dados: null });
      }),
    );
    await criarCapacitacao(base);
    expect(body).toHaveProperty('capacitacao');
    expect((body as { capacitacao: CapacitacaoInput }).capacitacao.nome).toBe('X');
  });
});
