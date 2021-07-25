BEGIN;

CREATE SCHEMA metadado;

CREATE TABLE metadado.responsavel_fase(
  id SERIAL NOT NULL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
  fase_id INTEGER NOT NULL REFERENCES macrocontrole.fase (id),
  lote_id INTEGER NOT NULL REFERENCES macrocontrole.lote (id)
);

CREATE TABLE metadado.insumo_interno(
	id SERIAL NOT NULL PRIMARY KEY,
 	produto_id INTEGER NOT NULL REFERENCES macrocontrole.produto (id),
 	insumo_id INTEGER NOT NULL REFERENCES macrocontrole.produto (id)
);

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
CREATE TABLE metadado.palavra_chave(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
 	tipo_palavra_chave_id SMALLINT NOT NULL REFERENCES metadado.tipo_palavra_chave (code),
 	produto_id INTEGER NOT NULL REFERENCES macrocontrole.produto (id)
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
(1, 'Datum de Imbituba - SC'),
(2, 'Datum de Santana - AP'),
(3, 'Marégrafo de Torres - RS'),
(0, 'Sem datum vertical');


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
	nome VARCHAR(255) NOT NULL,
	endereco TEXT NOT NULL,
	telefone VARCHAR(255) NOT NULL,
	site VARCHAR(255) NOT NULL
);

INSERT INTO metadado.organizacao (id, nome, endereco, telefone, site) VALUES
(1, '1º Centro de Geoinformação', 'Rua Cleveland, nº 250 Morro Menino de Deus - CEP:90.850-240 - Porto Alegre - RS', '(51)3232-0749', 'http://www.1cgeo.eb.mil.br/'),
(2, '2º Centro de Geoinformação', 'EPTC Km 4,5 DF 001 - Setor Habitacional Taquari - Lago Norte - Brasília - DF Setor Habitacional Taquari - CEP:71.559-901 - Brasília - DF', '(61)3415-3855', 'http://www.2cgeo.eb.mil.br'),
(3, '3º Centro de Geoinformação', 'Avenida Joaquim Nabuco, nº 1687 Guadalupe - CEP:53.240-650 - Olinda - PE', '(81)3439-3033', 'http://www.3cgeo.eb.mil.br/'),
(4, '4º Centro de Geoinformação', 'Avenida Marechal Bittencourt, nº 97 Compensa - CEP:69.027-140 - Manaus - AM', '(92)3625-1585', 'http://www.4cgeo.eb.mil.br/'),
(5, '5º Centro de Geoinformação', 'Rua Major Daemon, nº 81 Morro da Conceição - CEP:20.081-190 - Rio de Janeiro - RJ', '(21)2263-9664', 'http://www.5cgeo.eb.mil.br/');

CREATE TABLE metadado.informacoes_produto(
	id SERIAL NOT NULL PRIMARY KEY,
 	lote_id INTEGER NOT NULL REFERENCES macrocontrole.lote (id),
	resumo TEXT,
	proposito TEXT,
	creditos TEXT,
	informacoes_complementares TEXT,
	limitacao_acesso_id SMALLINT NOT NULL REFERENCES metadado.codigo_restricao (code),
	restricao_uso_id SMALLINT NOT NULL REFERENCES metadado.codigo_restricao (code),
	grau_sigilo_id SMALLINT NOT NULL REFERENCES metadado.codigo_classificacao (code),
	organizacao_responsavel_id  INTEGER NOT NULL REFERENCES metadado.organizacao (id),
	organizacao_distribuicao_id  INTEGER NOT NULL REFERENCES metadado.organizacao (id),
	datum_vertical_id SMALLINT NOT NULL REFERENCES metadado.datum_vertical (code),
	especificacao_id SMALLINT NOT NULL REFERENCES metadado.especificacao (code),
	responsavel_produto_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
	declaracao_linhagem TEXT
);

COMMIT;