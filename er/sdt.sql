BEGIN;

--Usuário que será utilizado pela API. Substituir senha conforme necessidade.
--CREATE USER controle_app WITH PASSWORD 'controle_app';

CREATE SCHEMA sdt;

CREATE TABLE sdt.posto_grad(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	nome_abrev VARCHAR(255) NOT NULL
);

INSERT INTO sdt.posto_grad (code, nome,nome_abrev) VALUES
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
(17, 'General', 'Gen');

-- Células 1CGEO
CREATE TABLE sdt.celula(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
	UNIQUE (nome)
);

INSERT INTO sdt.celula (nome) VALUES
('Célula de Desenvolvimento'),
('Célula de Validação e Edição'),
('Célula de Avaliação'),
('Célula de Fotogrametria'),
('Célula de Digitalização'),
('Célula Administrativa');

--Valores padrão para turno de trabalho
CREATE TABLE sdt.turno(
	code SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL
);

INSERT INTO sdt.turno (code, nome) VALUES
(1, 'Manhã'),
(2, 'Tarde'),
(3, 'Integral');

--Usuários do sistema
--Login deve ser o mesmo do banco de dados de produção
--Senha do usuário vem do banco de dados
CREATE TABLE sdt.usuario(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL,
  nome_guerra VARCHAR(255) NOT NULL,
  login VARCHAR(255) UNIQUE NOT NULL,
  celula INTEGER REFERENCES sdt.celula (id),
  turno INTEGER NOT NULL REFERENCES sdt.turno (code),
  posto_grad INTEGER NOT NULL REFERENCES sdt.posto_grad (code)
);

INSERT INTO sdt.usuario (id, nome, nome_guerra, login, turno, posto_grad) VALUES
(1, 'Administrador', 'Administrador', 'controle_app', 3, 13);

GRANT USAGE ON SCHEMA sdt TO controle_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA sdt TO controle_app;
GRANT ALL ON ALL SEQUENCES IN SCHEMA sdt TO controle_app;

COMMIT;
