BEGIN;

CREATE SCHEMA metadado;

CREATE TABLE metadado.chefe_dgeo(
  id SERIAL NOT NULL PRIMARY KEY,
	usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
	data_inicio timestamp with time zone NOT NULL,
	data_fim timestamp with time zone
);

CREATE TABLE metadado.responsavel_fase(
    id SERIAL NOT NULL PRIMARY KEY,
	usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
    fase_id INTEGER NOT NULL REFERENCES macrocontrole.fase (id),
	data_inicio timestamp with time zone NOT NULL,
	data_fim timestamp with time zone
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
 	tipo_palavra_chave_id INTEGER NOT NULL REFERENCES metadado.tipo_palavra_chave (code),
 	produto_id INTEGER NOT NULL REFERENCES macrocontrole.produto (id)
);

CREATE TABLE metadado.documento_linhagem(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
    uuid uuid NOT NULL,
    data DATE NOT NULL,
    link VARCHAR(255) NOT NULL
);

CREATE TABLE metadado.documento_linhagem_produto(
	id SERIAL NOT NULL PRIMARY KEY,
 	documento_linhagem_id INTEGER NOT NULL REFERENCES macrocontrole.documento_linhagem (id),
 	produto_id INTEGER NOT NULL REFERENCES macrocontrole.produto (id)
);

CREATE TABLE metadado.informacoes_produto(
	id SERIAL NOT NULL PRIMARY KEY,
 	produto_id INTEGER NOT NULL REFERENCES macrocontrole.produto (id),
	resumo TEXT,
	proposito TEXT,
	creditos TEXT,
	informacoes_complementares TEXT,
	limitacao_acesso VARCHAR(255),
	limitacao_uso VARCHAR(255),
	restricao_uso VARCHAR(255),
	grau_sigilo VARCHAR(255),
	organizacao_responsavel VARCHAR(255),
	organizacao_distribuicao VARCHAR(255),
	sistema_coordenadas VARCHAR(255),
	datum_vertical VARCHAR(255),
	formato_distribuicao VARCHAR(255),
	especificacao VARCHAR(255),
	declaracao_linhagem TEXT
);

COMMIT;