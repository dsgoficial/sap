BEGIN;

-- Atualizacao 2.3.5 -> 2.3.6
--
-- Colunas ocultas na tabela de atributos do QGIS. O operador recebe a camada
-- da atividade com filtro espacial, mas colunas de controle (visivel,
-- operador_criacao, data_atualizacao...) so atrapalham a edicao. Ate aqui a
-- lista morava fixa no SAP_Operador; passa a ser dado, configurado por
-- subfase e lote, no mesmo molde dos temas e menus:
--
--   dgeo.layer_colunas_ocultas            catalogo: nome + JSON da definicao
--   macrocontrole.perfil_colunas_ocultas  vinculo catalogo x subfase x lote
--
-- A definicao e um objeto JSON {"<tabela>": ["<coluna>", ...]}. A chave "*"
-- vale para toda camada da atividade. O SAP so guarda e valida o formato; a
-- aplicacao no QGIS e do SAP_Operador (setAttributeTableConfig).

CREATE TABLE IF NOT EXISTS dgeo.layer_colunas_ocultas(
    id SERIAL NOT NULL PRIMARY KEY,
    nome text NOT NULL,
    definicao_colunas text NOT NULL,
    owner varchar(255) NOT NULL,
    update_time timestamp without time zone NOT NULL DEFAULT now(),
    CONSTRAINT unique_colunas_ocultas UNIQUE (nome)
);

CREATE TABLE IF NOT EXISTS macrocontrole.perfil_colunas_ocultas(
    id SERIAL NOT NULL PRIMARY KEY,
    colunas_ocultas_id INTEGER NOT NULL REFERENCES dgeo.layer_colunas_ocultas (id),
    subfase_id INTEGER NOT NULL REFERENCES macrocontrole.subfase (id),
    lote_id INTEGER NOT NULL REFERENCES macrocontrole.lote (id),
    UNIQUE(colunas_ocultas_id,subfase_id,lote_id)
);

-- bump da versao do banco
UPDATE public.versao SET nome = '2.3.6' WHERE code = 1;

COMMIT;
