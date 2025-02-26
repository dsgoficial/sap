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
  idioma VARCHAR(255) NOT NULL,
  atalho VARCHAR(255),
  owner varchar(255) NOT NULL,
	update_time timestamp without time zone NOT NULL DEFAULT now()
);

INSERT INTO dgeo.qgis_shortcuts (ferramenta, idioma, atalho, owner) VALUES
('Sair do QGIS','português','', 'sap'),
('Exit QGIS','inglês','', 'sap'),
('Mesclar feições selecionadas','português','M', 'sap'),
('Merge Selected Features','inglês','M', 'sap'),
('Quebrar Feições','português','C', 'sap'),
('Split Features','inglês','C', 'sap'),
('Identificar feições','português','I', 'sap'),
('Identify Features','inglês','I', 'sap'),
('Adicionar Polígono','português','A', 'sap'),
('Add Polygon','inglês','A', 'sap'),
('Desfazer seleção de feições em todas as camadas','português','D', 'sap'),
('Deselect Features from All Layers','inglês','D', 'sap'),
('Ferramenta Vértice (Todas as Camadas)','português','N', 'sap'),
('Vertex Tool (All Layers)','inglês','N', 'sap'),
('Salvar para todas as camadas','português','Ctrl+S', 'sap'),
('Save for All Layers','inglês','Ctrl+S', 'sap'),
('Habilitar traçar','português','T', 'sap'),
('Enable Tracing','inglês','T', 'sap'),
('Remodelar feições','português','R', 'sap'),
('Reshape Features','inglês','R', 'sap'),
('Área','português','Z', 'sap'),
('Measure Area','inglês','Z', 'sap'),
('Linha','português','X', 'sap'),
('Measure Line','inglês','X', 'sap'),
('DSGTools: Seletor Genérico','português','S', 'sap'),
('DSGTools: Generic Selector','inglês','S', 'sap'),
('DSGTools: Ferramenta de aquisição com ângulos retos','português','E', 'sap'),
('DSGTools: Right Degree Angle Digitizing','inglês','E', 'sap'),
('Edição Topológica','português','H', 'sap'),
('Topological Editing','inglês','H', 'sap'),
('Salvar','português','', 'sap'),
('Save','inglês','', 'sap'),
('Select Feature(s)','inglês','V', 'sap'),
('Feição(s)','português','V', 'sap'),
('DSGTools: Inspecionar anterior','português','Q', 'sap'),
('DSGTools: Back Inspect','inglês','Q', 'sap'),
('DSGTools: Inspecionar próximo','português','W', 'sap'),
('DSGTools: Next Inspect','inglês','W', 'sap'),
('DSGTools: Desenhar Forma','português','G', 'sap'),
('DSGTools: Draw Shape','inglês','G', 'sap'),
('Desfazer','português','', 'sap'),
('Undo','inglês','', 'sap'),
('Mostrar camadas selecionadas','português','', 'sap'),
('Show Selected Layers','inglês','', 'sap'),
('Esconder camadas selecionadas','português','', 'sap'),
('Hide Selected Layers','inglês','', 'sap'),
('Alternar Aderência','português','', 'sap'),
('Toggle Snapping','inglês','', 'sap'),
('DSGTools: Alterna a visibilidade de todos os textos','português','L', 'sap'),
('DSGTools: Toggle all labels visibility','inglês','L', 'sap'),
('DSGTools: Ferramenta de Aquisição à Mão Livre','português','F', 'sap'),
('DSGTools: Free Hand Acquisition','inglês','F', 'sap'),
('DSGTools: Ferramenta de remodelagem à mão livre','português','Shift+R', 'sap'),
('DSGTools: Free Hand Reshape','inglês','Shift+R', 'sap'),
('Mostrar/Esconder marcadores para feições selecionadas','português','B', 'sap'),
('Mostrar/Esconder marcadores para feições selecionadas','inglês','B', 'sap'),
('DSGTools: Active Layer Visibility','português','Y', 'sap'),
('DSGTools: Active Layer Visibility','inglês','Y', 'sap'),
('Próximo estilo','português','Shift+W', 'sap'),
('Próximo estilo','inglês','Shift+W', 'sap'),
('Último estilo','português','Shift+Q', 'sap'),
('Último estilo','inglês','Shift+Q', 'sap'),
('DSGTools: Select Raster','português',E'\'', 'sap'),
('DSGTools: Select Raster','inglês',E'\'', 'sap'),
('Remover camada/grupo','português','Ctrl+D', 'sap'),
('Remove Layer/Group','inglês','Ctrl+D', 'sap'),
('Adicionar Linha','português','A', 'sap'),
('Add Line','inglês','A', 'sap'),
('Adicionar Ponto','português','A', 'sap'),
('Add Point','inglês','A', 'sap'),
('DSGTools: Go to next tile','inglês','Shift+S', 'sap'),
('DSGTools: Go to previous tile','inglês','Shift+A', 'sap'),
('DSGTools: Mark tile as done','inglês','Shift+D', 'sap'),
('DSGTools: Go to next tile','português','Shift+S', 'sap'),
('DSGTools: Go to previous tile','português','Shift+A', 'sap'),
('DSGTools: Mark tile as done','português','Shift+D', 'sap');

CREATE TABLE dgeo.gerenciador_fme(
  id SERIAL NOT NULL PRIMARY KEY,
	url VARCHAR(255) NOT NULL,
  UNIQUE(url)
);

CREATE TABLE dgeo.qgis_menus(
	  id SERIAL NOT NULL PRIMARY KEY,
    nome text NOT NULL,
    definicao_menu text NOT NULL,
    owner varchar(255) NOT NULL,
	  update_time timestamp without time zone NOT NULL DEFAULT now(),
    CONSTRAINT unique_menus UNIQUE (nome)
);

CREATE TABLE dgeo.qgis_themes(
	  id SERIAL NOT NULL PRIMARY KEY,
    nome text NOT NULL,
    definicao_tema text NOT NULL,
    owner varchar(255) NOT NULL,
	  update_time timestamp without time zone NOT NULL DEFAULT now(),
    CONSTRAINT unique_themes UNIQUE (nome)
);

CREATE TABLE dgeo.layer_alias(
	  id SERIAL NOT NULL PRIMARY KEY,
    nome text NOT NULL,
    definicao_alias text NOT NULL,
    owner varchar(255) NOT NULL,
	  update_time timestamp without time zone NOT NULL DEFAULT now(),
    CONSTRAINT unique_alias UNIQUE (nome)
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

CREATE TABLE dgeo.layer_rules(
  	id SERIAL NOT NULL PRIMARY KEY,
    nome varchar(255) NOT NULL,
    regra TEXT NOT NULL,
    owner varchar(255) NOT NULL,
    update_time timestamp without time zone NOT NULL DEFAULT now(),
    UNIQUE(nome)
);

CREATE TABLE dgeo.qgis_models(
	id SERIAL NOT NULL PRIMARY KEY,
  nome varchar(255) NOT NULL UNIQUE,
  descricao TEXT NOT NULL,
  model_xml TEXT NOT NULL,
  owner varchar(255) NOT NULL,
	update_time timestamp without time zone NOT NULL DEFAULT now()
);

CREATE TABLE dgeo.workflow_dsgtools(
	id SERIAL NOT NULL PRIMARY KEY,
  nome varchar(255) NOT NULL UNIQUE,
  descricao TEXT NOT NULL,
  workflow_json TEXT NOT NULL,
  owner varchar(255) NOT NULL,
	update_time timestamp without time zone NOT NULL DEFAULT now()
);

CREATE TABLE dgeo.plugin_path(
  code SMALLINT NOT NULL PRIMARY KEY,
  path TEXT,
  CHECK (code = 1)
);
INSERT INTO dgeo.plugin_path (code, path) VALUES
(1, '');


COMMIT;
