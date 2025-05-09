BEGIN;

CREATE SCHEMA controle_campo;

CREATE TABLE controle_campo.situacao
(
    code SMALLINT NOT NULL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE
);

INSERT INTO controle_campo.situacao (code, nome) VALUES
(1, 'Previsto'),
(2, 'Em Execução'),
(3, 'Finalizado'),
(4, 'Cancelado');

CREATE TYPE controle_campo.categoria_campo AS ENUM (
    'Reambulação',
    'Modelos 3D',
    'Imagens Panorâmicas em 360º',
    'Pontos de Controle',
    'Capacitação em Geoinformação'
    'Ortoimagens de Drone',
);

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
    categorias controle_campo.categoria_campo[] NOT NULL DEFAULT '{}',
    situacao_id SMALLINT NOT NULL REFERENCES controle_campo.situacao (code),
    geom geometry(MULTIPOLYGON, 4326)
);

CREATE TABLE controle_campo.relacionamento_campo_produto
(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    campo_id uuid NOT NULL REFERENCES controle_campo.campo (id),
    produto_id SERIAL NOT NULL REFERENCES macrocontrole.produto (id),
    UNIQUE (campo_id, produto_id)
);

CREATE TABLE controle_campo.imagem
(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    descricao text,
    data_imagem timestamp with time zone,
    imagem_bin bytea,
    campo_id uuid NOT NULL REFERENCES controle_campo.campo (id)
);

CREATE TABLE controle_campo.track
(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    chefe_vtr VARCHAR(255) NOT NULL,
    motorista VARCHAR(255) NOT NULL,
    placa_vtr VARCHAR(255) NOT NULL,
    dia date NOT NULL,
    campo_id uuid NOT NULL REFERENCES controle_campo.campo (id)
);

CREATE TABLE controle_campo.track_p
(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id uuid NOT NULL REFERENCES controle_campo.track (id),
    x_ll real,
    y_ll real,
    track_id_garmin text,
    track_segment integer,
    track_segment_point_index integer,
    elevation real,
    creation_time timestamp with time zone,
    geom geometry(Point,4326),
    data_importacao timestamp(6) without time zone
);

CREATE INDEX track_p_geom_idx ON controle_campo.track_p USING gist (geom);

CREATE MATERIALIZED VIEW controle_campo.track_l
AS
 SELECT row_number() OVER () AS id,
    p.track_id,
    p.track_id_garmin,
    min(p.creation_time) AS min_t,
    max(p.creation_time) AS max_t,
    st_makeline(st_setsrid(st_makepointm(st_x(p.geom), st_y(p.geom), date_part('epoch'::text, p.creation_time)), 4326) ORDER BY p.creation_time)::geometry(LineStringM, 4326) AS geom
   FROM controle_campo.track_p AS p
  GROUP BY p.track_id_garmin, p.track_id
WITH DATA;

CREATE INDEX track_l_geom_idx ON controle_campo.track_l USING gist (geom);

UPDATE public.versao
SET nome = '2.2.3' WHERE code = 1;

COMMIT;