BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SCHEMA dgeo;

CREATE TABLE dgeo.usuario(
  id SERIAL NOT NULL PRIMARY KEY,
  login VARCHAR(255) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  nome_guerra VARCHAR(255) NOT NULL,
  tipo_turno_id SMALLINT NOT NULL REFERENCES dominio.tipo_turno (code),
  tipo_posto_grad_id SMALLINT NOT NULL REFERENCES dominio.tipo_posto_grad (code),
  administrador BOOLEAN NOT NULL DEFAULT FALSE,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  uuid UUID NOT NULL UNIQUE
);

CREATE TABLE dgeo.login_temporario(
  id SERIAL NOT NULL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
  configuracao VARCHAR(255) NOT NULL,
  login VARCHAR(255) NOT NULL,
  senha VARCHAR(255) NOT NULL,
  UNIQUE(login,configuracao)
);

CREATE TABLE dgeo.plugin(
  id SERIAL NOT NULL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  versao_minima TEXT,
  CHECK (versao_minima ~ '^\d+(\.\d+){0,2}$')
);

CREATE TABLE dgeo.versao_qgis(
  code SMALLINT NOT NULL PRIMARY KEY,
  versao_minima TEXT,
  CHECK (versao_minima ~ '^\d+(\.\d+){0,2}$')
);
INSERT INTO dgeo.versao_qgis (code, versao_minima) VALUES
(1, '3.22.2');

CREATE TABLE dgeo.qgis_shortcuts(
  id SERIAL NOT NULL PRIMARY KEY,
  ferramenta VARCHAR(255) NOT NULL,
  idioma VARCHAR(255),
  atalho VARCHAR(255),
  owner varchar(255) NOT NULL,
	update_time timestamp without time zone NOT NULL DEFAULT now()
);

INSERT INTO dgeo.qgis_shortcuts (ferramenta, idioma, atalho, owner) VALUES
('Mesclar feições selecionadas', 'português', 'M', 'sap'),
('Merge Selected Features', 'inglês', 'M', 'sap');


CREATE TABLE dgeo.gerenciador_fme(
  id SERIAL NOT NULL PRIMARY KEY,
	servidor VARCHAR(255) NOT NULL,
	porta VARCHAR(255) NOT NULL,
  UNIQUE(servidor,porta)
);

CREATE TABLE dgeo.qgis_menus(
	  id SERIAL NOT NULL PRIMARY KEY,
    nome text NOT NULL,
    definicao_menu text NOT NULL,
    owner varchar(255) NOT NULL,
	  update_time timestamp without time zone NOT NULL DEFAULT now(),
    CONSTRAINT unique_menus UNIQUE (nome)
);

CREATE TABLE dgeo.group_styles(
  	id SERIAL NOT NULL PRIMARY KEY,
    nome varchar(255) NOT NULL,
    UNIQUE(nome)
);

CREATE TABLE dgeo.layer_styles(
	id SERIAL NOT NULL PRIMARY KEY,
	f_table_schema varchar(255) NOT NULL,
	f_table_name varchar(255) NOT NULL,
	f_geometry_column varchar(255) NOT NULL,
	grupo_estilo_id INTEGER NOT NULL REFERENCES dgeo.group_styles (id),
	styleqml text,
  stylesld text,
	ui text,
  owner varchar(255) NOT NULL,
	update_time timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT unique_styles UNIQUE (f_table_schema,f_table_name,grupo_estilo_id)
);

CREATE TABLE dgeo.group_rules(
  	id SERIAL NOT NULL PRIMARY KEY,
    grupo_regra varchar(255) NOT NULL,
    cor_rgb varchar(255) NOT NULL,
    ordem integer NOT NULL,
    UNIQUE(grupo_regra)
);

CREATE TABLE dgeo.layer_rules(
	id SERIAL NOT NULL PRIMARY KEY,
  grupo_regra_id INTEGER NOT NULL REFERENCES dgeo.group_rules (id),
  schema varchar(255) NOT NULL,
  camada varchar(255) NOT NULL,
  atributo varchar(255) NOT NULL,
  regra TEXT NOT NULL,
  descricao TEXT NOT NULL,
  owner varchar(255) NOT NULL,
	update_time timestamp without time zone NOT NULL DEFAULT now()
);


CREATE TABLE dgeo.qgis_models(
	id SERIAL NOT NULL PRIMARY KEY,
  nome varchar(255) NOT NULL UNIQUE,
  descricao TEXT NOT NULL,
  model_xml TEXT NOT NULL,
  owner varchar(255) NOT NULL,
	update_time timestamp without time zone NOT NULL DEFAULT now()
);

COMMIT;
