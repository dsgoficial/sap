BEGIN;

CREATE SCHEMA dgeo;

CREATE TABLE dgeo.tipo_posto_grad(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	nome_abrev VARCHAR(255) NOT NULL
);

INSERT INTO dgeo.tipo_posto_grad (code, nome,nome_abrev) VALUES
(1, 'Civil', 'Civ'),
(2, 'Mão de Obra Temporária', 'MOT'),
(3, 'Soldado EV', 'Sd EV'),
(4, 'Soldado EP', 'Sd EP'),
(5, 'Cabo', 'Cb'),
(6, 'Terceiro Sargento', '3º Sgt'),
(7, 'Segundo Sargento', '2º Sgt'),
(8, 'Primeiro Sargento', '1º Sgt'),
(9, 'Subtenente', 'ST'),
(10, 'Aspirante', 'Asp'),
(11, 'Segundo Tenente', '2º Ten'),
(12, 'Primeiro Tenente', '1º Ten'),
(13, 'Capitão', 'Cap'),
(14, 'Major', 'Maj'),
(15, 'Tenente Coronel', 'TC'),
(16, 'Coronel', 'Cel'),
(17, 'General de Brigada', 'Gen'),
(18, 'General de Divisão', 'Gen'),
(19, 'General de Exército', 'Gen');

--Valores padrão para turno de trabalho
CREATE TABLE dgeo.tipo_turno(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO dgeo.tipo_turno (code, nome) VALUES
(1, 'Manhã'),
(2, 'Tarde'),
(3, 'Integral');

--Usuários do sistema
--Login deve ser o mesmo do banco de dados de produção
--Senha do usuário vem do banco de dados
CREATE TABLE dgeo.usuario(
  id SERIAL NOT NULL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  nome_guerra VARCHAR(255) NOT NULL,
  login VARCHAR(255) UNIQUE NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  tipo_turno_id INTEGER NOT NULL REFERENCES dgeo.tipo_turno (code),
  tipo_posto_grad_id INTEGER NOT NULL REFERENCES dgeo.tipo_posto_grad (code)
);

CREATE TABLE dgeo.login(
  id SERIAL NOT NULL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
  data_login  timestamp with time zone NOT NULL
);


COMMIT;
