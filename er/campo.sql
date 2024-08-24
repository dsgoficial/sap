BEGIN;

CREATE SCHEMA controle_campo;

CREATE TABLE controle_campo.campo
(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL UNIQUE,
    descricao text,
    pit SMALLINT NOT NULL,
    orgao VARCHAR(255) NOT NULL,
    militares text,
    placas_vtr text,
    inicio timestamp with time zone,
    fim timestamp with time zone,
    situacao_id SMALLINT NOT NULL REFERENCES controle_campo.situacao (code)
);

CREATE TABLE controle_campo.relacionamento_campo_produto
(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    campo_id SMALLINT NOT NULL REFERENCES controle_campo.campo (id),
    produto_id SMALLINT NOT NULL REFERENCES macrocontrole.produto (id)
);


CREATE TABLE controle_campo.imagem
(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL UNIQUE,
    campo_id SMALLINT NOT NULL REFERENCES controle_campo.campo (id)
);

CREATE TABLE controle_campo.situacao
(
    code SMALLINT NOT NULL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE
);

INSERT INTO controle_campo.situacao (code, nome) VALUES
(1, 'Previsto'),
(2, 'Em Execução'),
(3, 'Finalizado');

CREATE TABLE controle_campo.track
(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    militar VARCHAR(255) NOT NULL,
    placa_vtr VARCHAR(255) NOT NULL,
    dia date NOT NULL,
    inicio time without time zone NOT NULL,
    fim time without time zone NOT NULL,
    campo_id SMALLINT NOT NULL REFERENCES controle_campo.campo (id),
    geom geometry(MultiLineString,4674) NOT NULL
);



COMMIT;