BEGIN;

-- Atualizacao 2.2.3 -> 2.3.0
-- Habilita o SAP a gerar o JSON de edicao da carta (plugin Ferramentas de Edicao)
-- e permite preencher os metadados POR LOTE (conjunto homogeneo de folhas, mesma
-- escala e linha de producao), com excecao POR PRODUTO. Em cada tabela de metadado
-- de carta, exatamente um de (produto_id, lote_id) deve estar preenchido.

-- 1) informacoes_edicao: campos de saida que o JSON de edicao precisa
ALTER TABLE metadado.informacoes_edicao
	ADD COLUMN IF NOT EXISTS tipo_produto VARCHAR(255),
	ADD COLUMN IF NOT EXISTS versao_produto VARCHAR(255),
	ADD COLUMN IF NOT EXISTS licenca_produto VARCHAR(255),
	ADD COLUMN IF NOT EXISTS observacoes text ARRAY,
	ADD COLUMN IF NOT EXISTS dpi INTEGER NOT NULL DEFAULT 300;

-- 2) sensores da carta ortoimagem (array "sensores" do JSON)
CREATE TABLE IF NOT EXISTS metadado.sensor_carta_ortoimagem(
	id SERIAL NOT NULL PRIMARY KEY,
	produto_id INTEGER REFERENCES macrocontrole.produto (id),
	lote_id INTEGER REFERENCES macrocontrole.lote (id),
	tipo VARCHAR(255) NOT NULL,
	plataforma VARCHAR(255) NOT NULL,
	nome VARCHAR(255) NOT NULL,
	resolucao VARCHAR(255) NOT NULL,
	bandas VARCHAR(255) NOT NULL,
	nivel_produto VARCHAR(255) NOT NULL
);

-- 3) metadados por lote: produto_id deixa de ser obrigatorio e entra lote_id
ALTER TABLE metadado.palavra_chave_produto ALTER COLUMN produto_id DROP NOT NULL;
ALTER TABLE metadado.palavra_chave_produto ADD COLUMN IF NOT EXISTS lote_id INTEGER REFERENCES macrocontrole.lote (id);

ALTER TABLE metadado.responsavel_fase_produto ALTER COLUMN produto_id DROP NOT NULL;
ALTER TABLE metadado.responsavel_fase_produto ADD COLUMN IF NOT EXISTS lote_id INTEGER REFERENCES macrocontrole.lote (id);

ALTER TABLE metadado.informacoes_produto ALTER COLUMN produto_id DROP NOT NULL;
ALTER TABLE metadado.informacoes_produto ADD COLUMN IF NOT EXISTS lote_id INTEGER REFERENCES macrocontrole.lote (id);

ALTER TABLE metadado.informacoes_edicao ALTER COLUMN produto_id DROP NOT NULL;
ALTER TABLE metadado.informacoes_edicao ADD COLUMN IF NOT EXISTS lote_id INTEGER REFERENCES macrocontrole.lote (id);

ALTER TABLE metadado.sensor_carta_ortoimagem ADD COLUMN IF NOT EXISTS lote_id INTEGER REFERENCES macrocontrole.lote (id);

ALTER TABLE metadado.imagens_carta_ortoimagem ALTER COLUMN produto_id DROP NOT NULL;
ALTER TABLE metadado.imagens_carta_ortoimagem ADD COLUMN IF NOT EXISTS lote_id INTEGER REFERENCES macrocontrole.lote (id);

ALTER TABLE metadado.perfil_classes_complementares_orto ALTER COLUMN produto_id DROP NOT NULL;
ALTER TABLE metadado.perfil_classes_complementares_orto ADD COLUMN IF NOT EXISTS lote_id INTEGER REFERENCES macrocontrole.lote (id);

-- CHECK "produto_id XOR lote_id" em cada tabela (idempotente)
DO $$
DECLARE
	t text;
	tabelas text[] := ARRAY[
		'palavra_chave_produto', 'responsavel_fase_produto', 'informacoes_produto',
		'informacoes_edicao', 'sensor_carta_ortoimagem', 'imagens_carta_ortoimagem',
		'perfil_classes_complementares_orto'
	];
BEGIN
	FOREACH t IN ARRAY tabelas LOOP
		IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = t || '_xor_lote') THEN
			EXECUTE format(
				'ALTER TABLE metadado.%I ADD CONSTRAINT %I CHECK ((produto_id IS NOT NULL AND lote_id IS NULL) OR (produto_id IS NULL AND lote_id IS NOT NULL))',
				t, t || '_xor_lote'
			);
		END IF;
	END LOOP;
END $$;

-- atualiza o seed "Padrão DSG" das classes complementares para o conjunto atual
-- (24 classes em uso na producao 2026), se ainda estiver no conjunto antigo.
UPDATE metadado.classes_complementares_orto
SET classes = ARRAY[
	'llp_unidade_federacao_a', 'elemnat_curva_nivel_l', 'elemnat_ponto_cotado_p',
	'infra_pista_pouso_p', 'infra_pista_pouso_l', 'infra_pista_pouso_a',
	'elemnat_toponimo_fisiografico_natural_p', 'elemnat_toponimo_fisiografico_natural_l',
	'elemnat_ilha_p', 'elemnat_ilha_a', 'llp_aglomerado_rural_p', 'llp_area_pub_militar_a',
	'infra_elemento_energia_p', 'infra_elemento_energia_l', 'infra_elemento_energia_a',
	'constr_extracao_mineral_p', 'constr_extracao_mineral_a', 'llp_nome_local_p',
	'infra_elemento_infraestrutura_p', 'infra_elemento_infraestrutura_l', 'infra_elemento_infraestrutura_a',
	'elemnat_elemento_hidrografico_p', 'elemnat_elemento_hidrografico_l', 'elemnat_elemento_hidrografico_a'
]
WHERE nome = 'Padrão DSG' AND 'constr_extracao_mineral' = ANY(classes);

-- organizacao: campos de contato para o XML de metadados (produtor/distribuidor nao-fixo,
-- para outros CGEO conseguirem exportar). O gerador passa a ler organizacao_responsavel/distribuicao.
ALTER TABLE metadado.organizacao
	ADD COLUMN IF NOT EXISTS sigla VARCHAR(255),
	ADD COLUMN IF NOT EXISTS endereco VARCHAR(255),
	ADD COLUMN IF NOT EXISTS telefone VARCHAR(255),
	ADD COLUMN IF NOT EXISTS site VARCHAR(255);

UPDATE metadado.organizacao SET sigla = '1º CGEO', endereco = 'Rua Cleveland, nº 250 Morro Menino de Deus - CEP:90.850-240 - Porto Alegre - RS', telefone = '(51)3232-0749', site = 'http://www.1cgeo.eb.mil.br/' WHERE code = 1 AND site IS NULL;
UPDATE metadado.organizacao SET sigla = '2º CGEO', endereco = 'EPCT DF 001 - Km 4,5 Setor Habitacional Taquari - CEP:71.559-901 - Brasília - DF', telefone = '(61)3415-3853', site = 'http://www.2cgeo.eb.mil.br/' WHERE code = 2 AND site IS NULL;
UPDATE metadado.organizacao SET sigla = '3º CGEO', endereco = 'Avenida Doutor Joaquim Nabuco, 1687 - CEP:53.240-650 - Olinda - PE', telefone = '(81)3439-3033', site = 'https://3cgeo.eb.mil.br/' WHERE code = 3 AND site IS NULL;
UPDATE metadado.organizacao SET sigla = '4º CGEO', endereco = 'Avenida Marechal Bittencourt, 97 Santo Antônio - CEP:69.029-160 - Manaus - AM', telefone = '(92)3625-1461', site = 'https://4cgeo.eb.mil.br/' WHERE code = 4 AND site IS NULL;
UPDATE metadado.organizacao SET sigla = '5º CGEO', endereco = 'Rua Major Daemon, 81 Centro - CEP:20.081-190 - Rio de Janeiro - RJ', telefone = '(21)2223-2177', site = 'http://www.5cgeo.eb.mil.br/' WHERE code = 5 AND site IS NULL;
UPDATE metadado.organizacao SET sigla = code || 'º CGEO' WHERE sigla IS NULL;

UPDATE public.versao
SET nome = '2.3.0' WHERE code = 1;

COMMIT;
