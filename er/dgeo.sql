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
  code SMALLINT NOT NULL PRIMARY KEY,
  ferramenta VARCHAR(255) NOT NULL,
  idioma VARCHAR(255) NOT NULL,
  atalho VARCHAR(255),
  owner varchar(255) NOT NULL,
	update_time timestamp without time zone NOT NULL DEFAULT now()
);

INSERT INTO dgeo.qgis_shortcuts (code, ferramenta, idioma, atalho, owner) VALUES
(1,'Ligar/Desligar camada','português','Y', 'sap'),
(2,'Ligar/Desligar camada','inglês','Y', 'sap'),
(3,'Sair do QGIS','português','', 'sap'),
(4,'Exit QGIS','inglês','', 'sap'),
(5,'Mesclar feições selecionadas','português','M', 'sap'),
(6,'Merge Selected Features','inglês','M', 'sap'),
(7,'Quebrar Feições','português','C', 'sap'),
(8,'Split Features','inglês','C', 'sap'),
(9,'Identificar feições','português','I', 'sap'),
(10,'Identify Features','inglês','I', 'sap'),
(11,'Adicionar Polígono','português','A', 'sap'),
(12,'Add Polygon','inglês','A', 'sap'),
(13,'Desfazer seleção de feições em todas as camadas','português','D', 'sap'),
(14,'Deselect Features from All Layers','inglês','D', 'sap'),
(15,'Ferramenta Vértice (Todas as Camadas)','português','N', 'sap'),
(16,'Vertex Tool (All Layers)','inglês','N', 'sap'),
(17,'Salvar para todas as camadas','português','Ctrl+S', 'sap'),
(18,'Save for All Layers','inglês','Ctrl+S', 'sap'),
(19,'Habilitar traçar','português','T', 'sap'),
(20,'Enable Tracing','inglês','T', 'sap'),
(21,'Remodelar feições','português','R', 'sap'),
(22,'Reshape Features','inglês','R', 'sap'),
(23,'Área','português','Z', 'sap'),
(24,'Measure Area','inglês','Z', 'sap'),
(25,'Linha','português','X', 'sap'),
(26,'Measure Line','inglês','X', 'sap'),
(27,'DSGTools: Seletor Genérico','português','S', 'sap'),
(28,'DSGTools: Generic Selector','inglês','S', 'sap'),
(29,'DSGTools: Ferramenta de aquisição com ângulos retos','português','E', 'sap'),
(30,'DSGTools: Right Degree Angle Digitizing','inglês','E', 'sap'),
(31,'Edição Topológica','português','H', 'sap'),
(32,'Topological Editing','inglês','H', 'sap'),
(33,'Salvar','português','', 'sap'),
(34,'Save','inglês','', 'sap'),
(35,'Select Feature(s)','inglês','V', 'sap'),
(36,'Feição(s)','português','V', 'sap'),
(37,'DSGTools: Inspecionar anterior','português','Q', 'sap'),
(38,'DSGTools: Back Inspect','inglês','Q', 'sap'),
(39,'DSGTools: Inspecionar próximo','português','W', 'sap'),
(40,'DSGTools: Next Inspect','inglês','W', 'sap'),
(41,'DSGTools: Desenhar Forma','português','G', 'sap'),
(42,'DSGTools: Draw Shape','inglês','G', 'sap'),
(43,'Desfazer','português','', 'sap'),
(44,'Undo','inglês','', 'sap'),
(45,'Mostrar camadas selecionadas','português','', 'sap'),
(46,'Show Selected Layers','inglês','', 'sap'),
(47,'Esconder camadas selecionadas','português','', 'sap'),
(48,'Hide Selected Layers','inglês','', 'sap'),
(49,'Alternar Aderência','português','', 'sap'),
(50,'Toggle Snapping','inglês','', 'sap'),
(51,'DSGTools: Alterna a visibilidade de todos os textos','português','L', 'sap'),
(52,'DSGTools: Toggle all labels visibility','inglês','L', 'sap'),
(53,'DSGTools: Ferramenta de Aquisição à Mão Livre','português','F', 'sap'),
(54,'DSGTools: Free Hand Acquisition','inglês','F', 'sap'),
(55,'DSGTools: Ferramenta de remodelagem à mão livre','português','Shift+R', 'sap'),
(56,'DSGTools: Free Hand Reshape','inglês','Shift+R', 'sap'),
(57,'Mostrar/Esconder marcadores para feições selecionadas','português','B', 'sap'),
(58,'Mostrar/Esconder marcadores para feições selecionadas','inglês','B', 'sap'),
(59,'Próximo estilo','português','Shift+W', 'sap'),
(60,'Próximo estilo','inglês','Shift+W', 'sap'),
(61,'Último estilo','português','Shift+Q', 'sap'),
(62,'Último estilo','inglês','Shift+Q', 'sap'),
(63,'DSGTools: Select Raster','português',E'\'', 'sap'),
(64,'DSGTools: Select Raster','inglês',E'\'', 'sap'),
(65,'Remover camada/grupo','português','Ctrl+D', 'sap'),
(66,'Remove Layer/Group','inglês','Ctrl+D', 'sap'),
(67,'Adicionar Linha','português','A', 'sap'),
(68,'Add Line','inglês','A', 'sap'),
(69,'Adicionar Ponto','português','A', 'sap'),
(70,'Add Point','inglês','A', 'sap'),
(71,'DSGTools: Go to next tile','inglês','Shift+S', 'sap'),
(72,'DSGTools: Go to previous tile','inglês','Shift+A', 'sap'),
(73,'DSGTools: Mark tile as done','inglês','Shift+D', 'sap');

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


COMMIT;
