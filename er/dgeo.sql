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
  id SERIAL NOT NULL PRIMARY KEY,
  versao_minima TEXT,
  CHECK (versao_minima ~ '^\d+(\.\d+){0,2}$')
);

CREATE TABLE dgeo.qgis_shortcuts(
  id SERIAL NOT NULL PRIMARY KEY,
  descricao VARCHAR(255) NOT NULL,
  ferramenta VARCHAR(255) NOT NULL,
  atalho VARCHAR(255) NOT NULL,
  owner varchar(255) NOT NULL,
	update_time timestamp without time zone NOT NULL DEFAULT now(),
);

INSERT INTO dgeo.qgis_shortcuts (ferramenta, descricao, atalho) VALUES
('Merge Selected Features', 'Mesclar feições selecionadas', 'M'),
('Split Features', 'Quebrar Feições', 'C'),
('Identify Features', 'Identificar feições', 'I'),
('Add Feature', 'Adicionar feições', 'A'),
('Deselect Features from All Layers', 'Desfazer seleção em todas as camadas', 'D'),
('Vertex Tool (All Layers)', 'Ferramenta Vértice (Todas as Camadas)', 'N'),
('Save for All Layers', 'Salvar para todas as camadas', 'Ctrl+S'),
('Enable Tracing', 'Habilitar traçar', 'T'),
('Reshape Features', 'Remodelar feições', 'R'),
('Measure Area', 'Medir área', 'Z'),
('Measure Line', 'Medir linha', 'X'),
('DSGTools: Generic Selector', 'Seletor Genérico', 'S'),
('DSGTools: Right Degree Angle Digitizing', 'Ferramenta de aquisição com ângulos retos', 'E'),
('opological Editing', 'Edição topológica', 'H'),
('Select Feature(s)', 'Selecionar feições', 'V'),
('DSGTools: Back Inspect', 'Inspecionar anterior', 'Q'),
('DSGTools: Next Inspect', 'Inspecionar próximo', 'W'),
('DSGTools: Draw Shape', 'Desenhar Forma', 'G'),
('Undo', 'Desfazer', 'Ctrl+Z'),
('DSGTools: Toggle all labels visibility', 'Liga/Desliga todas as labels', 'L'),
('DSGTools: Free Hand Acquisition', 'Ferramenta de Aquisição à Mão Livre', 'F'),
('DSGTools: Free Hand Reshape', 'Remodelar feições mão livre', 'Shift+R'),
('Ligar/Desligar camada.', 'Ligar/Desligar camada', 'Y'),
('Mostrar/Esconder marcadores para feições selecionadas.', 'Mostrar/Esconder marcadores para feições selecionadas ', 'B');

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
