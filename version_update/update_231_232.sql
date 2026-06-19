BEGIN;

-- Atualizacao 2.3.1 -> 2.3.2
-- A tabela controle_campo.imagem passa a guardar tambem VIDEOS (alem de fotos).
-- O binario continua em imagem_bin (bytea); duas colunas novas distinguem o
-- tipo de midia e o mime_type para o client web e o plugin do QGIS renderizarem
-- corretamente (<img> x <video>). Os registros existentes sao todos fotos.

ALTER TABLE controle_campo.imagem
    ADD COLUMN IF NOT EXISTS tipo VARCHAR(10) NOT NULL DEFAULT 'foto'
        CHECK (tipo IN ('foto', 'video'));

ALTER TABLE controle_campo.imagem
    ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100);

-- bump da versao do banco
UPDATE public.versao SET nome = '2.3.2' WHERE code = 1;

COMMIT;
