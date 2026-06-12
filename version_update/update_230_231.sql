BEGIN;

-- Atualizacao 2.3.0 -> 2.3.1
-- Fix: a palavra-chave (keyword) volta a ser EXCLUSIVAMENTE nivel produto.
-- A 2.3.0 abriu por engano keyword tambem para nivel lote (coluna lote_id + CHECK
-- xor produto/lote). Keyword nao faz sentido por lote: toponimia e descricao sao
-- por folha, e o nome do produto ja entra como toponimo. Reverte para product-only.

-- 1) remove o CHECK xor produto/lote da palavra_chave_produto
ALTER TABLE metadado.palavra_chave_produto DROP CONSTRAINT IF EXISTS palavra_chave_produto_xor_lote;

-- 2) remove eventuais palavras-chave de nivel LOTE (produto_id NULL): elas deixam
--    de existir no modelo product-only. Avisa quantas foram removidas.
DO $$
DECLARE
	n integer;
BEGIN
	SELECT count(*) INTO n FROM metadado.palavra_chave_produto WHERE produto_id IS NULL;
	IF n > 0 THEN
		RAISE NOTICE 'update_230_231: removendo % palavra(s)-chave de nivel LOTE (keyword passa a ser exclusivamente nivel produto)', n;
		DELETE FROM metadado.palavra_chave_produto WHERE produto_id IS NULL;
	END IF;
END $$;

-- 3) descarta a coluna lote_id e restaura produto_id como obrigatorio
ALTER TABLE metadado.palavra_chave_produto DROP COLUMN IF EXISTS lote_id;
ALTER TABLE metadado.palavra_chave_produto ALTER COLUMN produto_id SET NOT NULL;

-- 4) bump da versao do banco
UPDATE public.versao SET nome = '2.3.1' WHERE code = 1;

COMMIT;
