BEGIN;

UPDATE public.versao
SET nome = '2.3.0' WHERE code = 1;

COMMIT;