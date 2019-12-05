BEGIN;

CREATE SCHEMA dgeo;

CREATE TABLE dgeo.usuario(
  id SERIAL NOT NULL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  nome_guerra VARCHAR(255) NOT NULL,
  administrador BOOLEAN NOT NULL DEFAULT FALSE,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  tipo_turno_id INTEGER NOT NULL REFERENCES dominio.tipo_turno (code),
  tipo_posto_grad_id INTEGER NOT NULL REFERENCES dominio.tipo_posto_grad (code)
);

CREATE TABLE dgeo.login_temporario(
  id SERIAL NOT NULL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
  servidor VARCHAR(255) NOT NULL,
  porta VARCHAR(255) NOT NULL,
  login VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL
);

CREATE TABLE dgeo.plugin(
  id SERIAL NOT NULL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  versao_minima TEXT,
  CHECK (versao_minima ~ '^\d+(\.\d+){0,2}$')
);

CREATE TABLE dgeo.versao_qgis(
  id SERIAL NOT NULL PRIMARY KEY,
  versao_minima TEXT,
  CHECK (versao_minima ~ '^\d+(\.\d+){0,2}$')
);

CREATE TABLE dgeo.gerenciador_fme(
  id SERIAL NOT NULL PRIMARY KEY,
	servidor VARCHAR(255) NOT NULL,
	porta VARCHAR(255) NOT NULL
);

CREATE TABLE dgeo.layer_menus(
	  id SERIAL NOT NULL PRIMARY KEY,
    nome text NOT NULL,
    definicao_menu text NOT NULL,
    ordem_menu text NOT NULL,
    owner varchar(255) NOT NULL,
	  update_time timestamp without time zone NOT NULL DEFAULT now(),
    CONSTRAINT unique_menus UNIQUE (nome)
);

CREATE TABLE dgeo.layer_styles(
	id SERIAL NOT NULL PRIMARY KEY,
	f_table_schema varchar(255) NOT NULL,
	f_table_name varchar(255) NOT NULL,
	f_geometry_column varchar(255) NOT NULL,
	stylename varchar(255) NOT NULL,
	styleqml text,
  stylesld text,
	ui text,
  owner varchar(255) NOT NULL,
	update_time timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT unique_styles UNIQUE (f_table_schema,f_table_name,stylename)
);

CREATE TABLE dgeo.layer_rules(
	id SERIAL NOT NULL PRIMARY KEY,
  grupo_regra varchar(255) NOT NULL,
  tipo_regra varchar(255) NOT NULL,
  schema varchar(255) NOT NULL,
  camada varchar(255) NOT NULL,
  atributo varchar(255) NOT NULL,
  regra TEXT NOT NULL,
  cor_rgb varchar(255) NOT NULL,
  descricao TEXT NOT NULL,
  ordem INTEGER NOT NULL,
  owner varchar(255) NOT NULL,
	update_time timestamp without time zone NOT NULL DEFAULT now()
);

CREATE TABLE dgeo.layer_qgis_models(
	id SERIAL NOT NULL PRIMARY KEY,
  nome varchar(255) NOT NULL UNIQUE,
  descricao TEXT NOT NULL,
  model_xml TEXT NOT NULL,
  owner varchar(255) NOT NULL,
	update_time timestamp without time zone NOT NULL DEFAULT now()
);

CREATE VIEW dgeo.menus AS
SELECT nome FROM dgeo.layer_menus;

CREATE VIEW dgeo.styles AS
SELECT DISTINCT(stylename) AS nome FROM dgeo.layer_styles;

CREATE VIEW dgeo.rules AS
SELECT DISTINCT(grupo_regra) AS nome FROM dgeo.layer_rules;

CREATE VIEW dgeo.qgis_models AS
SELECT nome FROM dgeo.layer_qgis_models;

COMMIT;
