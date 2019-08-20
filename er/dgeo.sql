BEGIN;

CREATE SCHEMA dgeo;

--Usuários do sistema
--Login deve ser o mesmo do banco de dados de produção
--Senha do usuário vem do banco de dados
CREATE TABLE dgeo.usuario(
  id SERIAL NOT NULL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  nome_guerra VARCHAR(255) NOT NULL,
  login VARCHAR(255) UNIQUE NOT NULL,
  administrador BOOLEAN NOT NULL DEFAULT FALSE,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  tipo_turno_id INTEGER NOT NULL REFERENCES dominio.tipo_turno (code),
  tipo_posto_grad_id INTEGER NOT NULL REFERENCES dominio.tipo_posto_grad (code)
);

CREATE TABLE dgeo.plugin(
  id SERIAL NOT NULL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  versao_minima TEXT,
  CHECK (versao_minima ~ '^\d+(\.\d+){0,2}$')
);

CREATE TABLE dgeo.layer_menus(
	  id SERIAL NOT NULL PRIMARY KEY,
    nome_do_perfil text NOT NULL,
    descricao text,
    perfil json NOT NULL,
    ordem_menu json NOT NULL
);

CREATE TABLE dgeo.layer_styles(
	id SERIAL NOT NULL PRIMARY KEY,
	f_table_schema character varying,
	f_table_name character varying,
	f_geometry_column character varying,
	stylename character varying(255),
	styleqml text,
	ui xml,
	update_time timestamp without time zone DEFAULT now()
);

CREATE TABLE dgeo.layer_rules(
	id SERIAL NOT NULL PRIMARY KEY,
  tipo_regra TEXT NOT NULL,
  camada TEXT NOT NULL,
  atributo TEXT NOT NULL,
  regra TEXT NOT NULL,
  nome TEXT NOT NULL,
  cor_rgb TEXT NOT NULL,
  tipo_estilo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  ordem INTEGER NOT NULL
);

COMMIT;
