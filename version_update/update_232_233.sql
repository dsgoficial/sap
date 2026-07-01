BEGIN;

-- Atualizacao 2.3.2 -> 2.3.3
-- A tabela macrocontrole.extra_pit passa a registrar a DATA DE ENTREGA da
-- demanda Extra-PIT. Ela define em qual mes a demanda entra na Secao 2.6 do
-- RPCMTec (Extra-PIT do mes). Coluna nullable: demandas ainda nao entregues
-- ficam com data_entrega NULL e nao aparecem na 2.6 de nenhum mes ate a entrega.

ALTER TABLE macrocontrole.extra_pit
    ADD COLUMN IF NOT EXISTS data_entrega DATE;

-- bump da versao do banco
UPDATE public.versao SET nome = '2.3.3' WHERE code = 1;

COMMIT;
