BEGIN;

CREATE TABLE public.versao(
  code SMALLINT NOT NULL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL
);

INSERT INTO public.versao (code, nome) VALUES
(1, '2.0.1');

CREATE TABLE public.layer_styles(
  id serial NOT NULL PRIMARY KEY,
  f_table_catalog varchar(255),
  f_table_schema varchar(255),
  f_table_name varchar(255),
  f_geometry_column varchar(255),
  stylename varchar(255),
  styleqml text,
  stylesld text,
  useasdefault boolean,
  description text,
  owner varchar(255),
  ui text,
  update_time timestamp without time zone DEFAULT now(),
  type character varying
);

COMMIT;