BEGIN;

CREATE SCHEMA metadado;

-- Tipos de palavra chave previstos na ISO19115 / PCDG
CREATE TABLE metadado.tipo_palavra_chave(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO metadado.tipo_palavra_chave (code, nome) VALUES
(1, 'disciplinar'),
(2, 'geologica'),
(3, 'tematica'),
(4, 'temporal'),
(5, 'toponimica');

-- Associa palavra chave a um produto. O produto pode ter multiplas palavras chaves de diferentes tipos.
CREATE TABLE metadado.palavra_chave_produto(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
 	tipo_palavra_chave_id SMALLINT NOT NULL REFERENCES metadado.tipo_palavra_chave (code),
 	produto_id INTEGER NOT NULL REFERENCES macrocontrole.produto (id),
	UNIQUE(nome,produto_id)
);

-- MD_ClassificationCode
CREATE TABLE metadado.codigo_classificacao(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO metadado.codigo_classificacao (code, nome) VALUES
(1, 'ostensivo'),
(2, 'reservado'),
(3, 'confidencial'),
(4, 'secreto'),
(5, 'ultraSecreto');

-- MD_RestrictionCode
CREATE TABLE metadado.codigo_restricao(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO metadado.codigo_restricao (code, nome) VALUES
(1, 'copyright'),
(2, 'patent'),
(3, 'patentPending'),
(4, 'trademark'),
(5, 'license'),
(6, 'intellectualPropertyRights'),
(7, 'restricted'),
(8, 'otherRestrictions');

CREATE TABLE metadado.datum_vertical(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO metadado.datum_vertical (code, nome) VALUES
(0, 'Sem datum vertical'),
(1, 'Datum de Imbituba - SC'),
(2, 'Datum de Santana - AP'),
(3, 'Marégrafo de Torres - RS');


CREATE TABLE metadado.especificacao(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO metadado.especificacao (code, nome) VALUES
(1, 'ET-EDGV 2.1.3'),
(2, 'ET-EDGV 3.0'),
(3, 'T34-700'),
(4, 'ET-RDG');

CREATE TABLE metadado.organizacao(
	id INTEGER NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO metadado.organizacao (id, nome) VALUES
(1, '1º Centro de Geoinformação'),
(2, '2º Centro de Geoinformação'),
(3, '3º Centro de Geoinformação'),
(4, '4º Centro de Geoinformação'),
(5, '5º Centro de Geoinformação');

CREATE TABLE metadado.usuario(
  id SERIAL NOT NULL PRIMARY KEY,
  usuario_sap_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
  nome VARCHAR(255) NOT NULL,
  funcao VARCHAR(255) NOT NULL,
  organizacao_id INTEGER NOT NULL REFERENCES metadado.organizacao (id)
);

CREATE TABLE metadado.responsavel_fase_produto(
  id SERIAL NOT NULL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES metadado.usuario (id),
  fase_id INTEGER NOT NULL REFERENCES macrocontrole.fase (id),
  produto_id INTEGER NOT NULL REFERENCES macrocontrole.produto (id)
);


CREATE TABLE metadado.informacoes_produto(
	id SERIAL NOT NULL PRIMARY KEY,
 	produto_id INTEGER NOT NULL REFERENCES macrocontrole.produto (id),
	resumo TEXT,
	proposito TEXT,
	creditos TEXT,
	informacoes_complementares TEXT,
	limitacao_acesso_id SMALLINT NOT NULL REFERENCES metadado.codigo_restricao (code),
	limitacao_uso_id SMALLINT NOT NULL REFERENCES metadado.codigo_restricao (code),
	restricao_uso_id SMALLINT NOT NULL REFERENCES metadado.codigo_restricao (code),
	grau_sigilo_id SMALLINT NOT NULL REFERENCES metadado.codigo_classificacao (code),
	organizacao_responsavel_id  INTEGER NOT NULL REFERENCES metadado.organizacao (id),
	organizacao_distribuicao_id  INTEGER NOT NULL REFERENCES metadado.organizacao (id),
	datum_vertical_id SMALLINT NOT NULL REFERENCES metadado.datum_vertical (code),
	especificacao_id SMALLINT NOT NULL REFERENCES metadado.especificacao (code),
	responsavel_produto_id INTEGER NOT NULL REFERENCES metadado.usuario (id),
	declaracao_linhagem TEXT,
	projeto_bdgex VARCHAR(255) NOT NULL
);

CREATE TABLE metadado.creditos_qpt(
	id SERIAL NOT NULL PRIMARY KEY,
	qpt text NOT NULL
);

CREATE TABLE metadado.informacoes_edicao(
	id SERIAL NOT NULL PRIMARY KEY,
 	produto_id INTEGER NOT NULL REFERENCES macrocontrole.produto (id),
	pec_planimetrico VARCHAR(255) NOT NULL,
    pec_altimetrico VARCHAR(255) NOT NULL,
    origem_dados_altimetricos VARCHAR(255) NOT NULL,
    territorio_internacional BOOLEAN NOT NULL,
    acesso_restrito BOOLEAN NOT NULL,
    carta_militar BOOLEAN NOT NULL,
	data_criacao VARCHAR(255) NOT NULL,
	creditos_id SMALLINT NOT NULL REFERENCES metadado.creditos_qpt (id),
	epsg_mde VARCHAR(255) NOT NULL,
	caminho_mde VARCHAR(255) NOT NULL,
	dados_terceiro text ARRAY,
	quadro_fases JSON NOT NULL
);

CREATE TABLE metadado.imagens_carta_ortoimagem(
	id SERIAL NOT NULL PRIMARY KEY,
    produto_id INTEGER NOT NULL REFERENCES macrocontrole.produto (id),
	caminho_imagem VARCHAR(255) NOT NULL,
	caminho_estilo VARCHAR(255),
	epsg VARCHAR(255) NOT NULL
);

CREATE TABLE metadado.classes_complementares_orto(
	id SERIAL NOT NULL PRIMARY KEY,
	nome text ARRAY NOT NULL
);

INSERT INTO metadado.classes_complementares_orto (nome)
VALUES (ARRAY [
	'llp_unidade_federacao_a',
	'elemnat_curva_nivel_l',
	'elemnat_ponto_cotado_p',
	'infra_pista_pouso_p',
	'infra_pista_pouso_l',
	'infra_pista_pouso_a',
	'elemnat_toponimo_fisiografico_natural_p',
	'elemnat_toponimo_fisiografico_natural_l',
	'elemnat_ilha_p',
	'elemnat_ilha_a',
	'llp_aglomerado_rural_p',
	'llp_area_pub_militar_a',
	'llp_terra_indigena_a',
	'llp_unidade_conservacao_a',
	'infra_elemento_energia_p',
	'infra_elemento_energia_l',
	'infra_elemento_energia_a',
	'constr_extracao_mineral'
]);

CREATE TABLE metadado.perfil_classes_complementares_orto(
	id SERIAL NOT NULL PRIMARY KEY,
    produto_id INTEGER NOT NULL REFERENCES macrocontrole.produto (id),
	classes_complementares_orto_id INTEGER NOT NULL REFERENCES metadado.classes_complementares_orto (id)
);

COMMIT;