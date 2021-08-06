BEGIN;

CREATE SCHEMA edicao;

CREATE TABLE edicao.informacao_edicao(
    id SERIAL NOT NULL PRIMARY KEY,
    pec_planimetrico VARCHAR(1) NOT NULL,
    pec_altimetrico VARCHAR(1) NOT NULL,
    origem_dados_altimetricos VARCHAR(255) NOT NULL,
    territorio_internacional BOOLEAN NOT NULL,
    acesso_restrito BOOLEAN NOT NULL,
    lote_id INTEGER NOT NULL REFERENCES macrocontrole.lote (id)
);
--dados de terceiro tabela a mais
--outras chaves do json de edção

-- quadro de fases vs informação de edição, reambulação e imageamento
--associação de insumo (imageamento) ao produto. Insumo deve ter informação de metadado. Para carta orto será usada estas imagens. Para topográfica
--será somente o quadro. Informação do sensor no metadado da imagem.

COMMIT;