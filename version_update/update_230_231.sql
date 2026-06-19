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

-- ==========================================================================
-- Fontes do RPCMTec no SAP: capacitacao (2.5/5.2), extra_pit (2.6) e o
-- aproveitamento do efetivo (5.1, schema recurso_humano refeito do zero).
-- ==========================================================================

-- 4) Capacitacao (2.5 ministrada / 5.2 recebida)
CREATE SCHEMA IF NOT EXISTS controle_capacitacao;

CREATE TABLE IF NOT EXISTS controle_capacitacao.situacao(
    code SMALLINT NOT NULL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE
);
INSERT INTO controle_capacitacao.situacao (code, nome) VALUES
(1, 'Prevista'), (2, 'Em Execução'), (3, 'Concluída'), (4, 'Cancelada')
ON CONFLICT (code) DO NOTHING;

DO $$ BEGIN
    CREATE TYPE controle_capacitacao.tipo_capacitacao AS ENUM ('Ministrada', 'Recebida');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS controle_capacitacao.capacitacao(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    tipo controle_capacitacao.tipo_capacitacao NOT NULL,
    instituicoes TEXT,
    local VARCHAR(255),
    inicio timestamp with time zone,
    fim timestamp with time zone,
    efetivo_capacitado INTEGER,
    militares TEXT,
    plano_codigo VARCHAR(255),
    ano SMALLINT NOT NULL,
    situacao_id SMALLINT NOT NULL REFERENCES controle_capacitacao.situacao (code),
    documento VARCHAR(255)
);

-- 5) Extra-PIT (2.6)
CREATE TABLE IF NOT EXISTS macrocontrole.situacao_extra_pit(
    code SMALLINT NOT NULL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE
);
INSERT INTO macrocontrole.situacao_extra_pit (code, nome) VALUES
(1, 'Previsto'), (2, 'Em Produção'), (3, 'Enviado'), (4, 'Concluído'), (5, 'Cancelado')
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS macrocontrole.extra_pit(
    id SERIAL NOT NULL PRIMARY KEY,
    ano INTEGER NOT NULL,
    demandante VARCHAR(255) NOT NULL,
    tipo_produto VARCHAR(255) NOT NULL,
    quantidade INTEGER NOT NULL,
    situacao_id SMALLINT NOT NULL REFERENCES macrocontrole.situacao_extra_pit (code),
    documento_autorizacao VARCHAR(255) NOT NULL,
    descricao TEXT,
    lote_id INTEGER REFERENCES macrocontrole.lote (id)
);
CREATE INDEX IF NOT EXISTS extra_pit_ano ON macrocontrole.extra_pit (ano);

-- 6) Aproveitamento do efetivo (5.1) - retrato mensal congelado, uma linha por
--    militar por mes (posto da epoca + atividade principal).
CREATE SCHEMA IF NOT EXISTS recurso_humano;

CREATE TABLE IF NOT EXISTS recurso_humano.aproveitamento_mes(
    id SERIAL NOT NULL PRIMARY KEY,
    ano SMALLINT NOT NULL,
    mes SMALLINT NOT NULL,
    usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
    tipo_posto_grad_id SMALLINT NOT NULL REFERENCES dominio.tipo_posto_grad (code),
    atividades TEXT,
    UNIQUE (ano, mes, usuario_id)
);

-- 7) Remove "Capacitação em Geoinformação" do enum de campo (passou para
--    controle_capacitacao). Postgres nao remove valor de enum direto.
-- 7a) PASSAGEM: move os campos dessa categoria para a nova tabela capacitacao
--     (tipo Ministrada; orgao -> instituicoes; equipe da DGEO -> militares;
--     situacao Concluida). O efetivo_capacitado nao existia em campo, fica NULL.
INSERT INTO controle_capacitacao.capacitacao (nome, tipo, instituicoes, inicio, fim, militares, ano, situacao_id)
SELECT c.nome, 'Ministrada', c.orgao, c.inicio, c.fim, c.militares,
       EXTRACT(YEAR FROM COALESCE(c.inicio, now()))::smallint, 3
FROM controle_campo.campo c
WHERE 'Capacitação em Geoinformação' = ANY (c.categorias);

-- 7b) tira o valor dos arrays (campo que era SO capacitacao fica com array
--     vazio; nao se apaga o campo para nao quebrar FKs de fotos/tracks/produtos)
ALTER TABLE controle_campo.campo ALTER COLUMN categorias DROP DEFAULT;
UPDATE controle_campo.campo
SET categorias = array_remove(categorias, 'Capacitação em Geoinformação'::controle_campo.categoria_campo)
WHERE 'Capacitação em Geoinformação' = ANY (categorias);

-- 7c) recria o enum sem o valor (rename -> novo -> cast -> drop)
ALTER TYPE controle_campo.categoria_campo RENAME TO categoria_campo_old;
CREATE TYPE controle_campo.categoria_campo AS ENUM (
    'Reambulação', 'Modelos 3D', 'Imagens Panorâmicas em 360º',
    'Pontos de Controle', 'Ortoimagens de Drone'
);
ALTER TABLE controle_campo.campo
    ALTER COLUMN categorias TYPE controle_campo.categoria_campo[]
    USING categorias::text[]::controle_campo.categoria_campo[];
ALTER TABLE controle_campo.campo ALTER COLUMN categorias SET DEFAULT '{}';
DROP TYPE controle_campo.categoria_campo_old;

-- 8) PIT: a tabela passa a servir TODAS as metas do PIT, nao so as de producao.
--    lote_id deixa de ser obrigatorio. Meta COM lote = producao (realizado calculado
--    pelo SAP, como hoje). Meta SEM lote = meta nao controlada pelo SAP (impressao,
--    Programa Memoria, TI, EBGeo), com o realizado lancado a mao em pit_execucao_manual.
ALTER TABLE macrocontrole.pit ALTER COLUMN lote_id DROP NOT NULL;
ALTER TABLE macrocontrole.pit ADD COLUMN IF NOT EXISTS numero_meta SMALLINT;
ALTER TABLE macrocontrole.pit ADD COLUMN IF NOT EXISTS item VARCHAR(10);
ALTER TABLE macrocontrole.pit ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE macrocontrole.pit ADD COLUMN IF NOT EXISTS unidade VARCHAR(50);
ALTER TABLE macrocontrole.pit ADD COLUMN IF NOT EXISTS prazo DATE;

-- Identidade das metas sem lote: a UNIQUE(lote_id, ano) ja existente cobre a producao,
-- mas como NULLs sao distintos numa UNIQUE, o indice parcial e que garante uma linha
-- por item/ano entre as metas sem lote.
CREATE UNIQUE INDEX IF NOT EXISTS pit_ano_item_uniq
    ON macrocontrole.pit (ano, item) WHERE lote_id IS NULL;

-- Meta sem lote tem de ter item (senao o indice parcial acima nao garante unicidade,
-- pois NULL != NULL). Producao (com lote) pode ter item nulo.
DO $$ BEGIN
    ALTER TABLE macrocontrole.pit
        ADD CONSTRAINT pit_item_quando_sem_lote CHECK (lote_id IS NOT NULL OR item IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Execucao mensal manual das metas sem lote (realizado por mes; o ano vem do join com pit)
CREATE TABLE IF NOT EXISTS macrocontrole.pit_execucao_manual(
    id SERIAL NOT NULL PRIMARY KEY,
    pit_id INTEGER NOT NULL REFERENCES macrocontrole.pit (id) ON DELETE CASCADE,
    mes SMALLINT NOT NULL CHECK (mes BETWEEN 1 AND 12),
    quantidade INTEGER NOT NULL DEFAULT 0,
    data_conclusao DATE,
    observacao TEXT,
    UNIQUE (pit_id, mes)
);

-- 9) Creditos do QPT deixam de ser obrigatorios na informacao de edicao: o
--    produto pode ter metadado de edicao sem credito QPT associado.
ALTER TABLE metadado.informacoes_edicao ALTER COLUMN creditos_id DROP NOT NULL;

-- 10) bump da versao do banco
UPDATE public.versao SET nome = '2.3.1' WHERE code = 1;

COMMIT;
