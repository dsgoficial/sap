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
CREATE TABLE metadado.palavra_chave_produto(
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

CREATE TABLE metadado.informacoes_lote(
	id SERIAL NOT NULL PRIMARY KEY,
 	lote_id INTEGER NOT NULL REFERENCES macrocontrole.lote (id),
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
	responsavel_lote_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
	declaracao_linhagem TEXT
);

CREATE TABLE metadado.informacoes_imagem_insumo(
	id SERIAL NOT NULL PRIMARY KEY,
 	insumo_id INTEGER NOT NULL REFERENCES macrocontrole.insumo (id),
	data_insumo_primeira timestamp with time zone NOT NULL,
	data_insumo_ultima timestamp with time zone NOT NULL,
	nome_sensor VARCHAR(255) NOT NULL,
	tipo_sensor VARCHAR(255) NOT NULL,
	plataforma_sensor VARCHAR(255) NOT NULL,
	resolucao VARCHAR(255) NOT NULL,
	bandas VARCHAR(255) NOT NULL,
	nivel_produto VARCHAR(255) NOT NULL,
	geom geometry(POLYGON, 4326) NOT NULL -- geometria para indicar a região subregião se for necessário
);

COMMIT;