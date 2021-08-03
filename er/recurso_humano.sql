CREATE TABLE recurso_humano.perda_recurso_humano(
	id SERIAL NOT NULL PRIMARY KEY,	
 	usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),	
 	tipo_perda_recurso_humano_id SMALLINT NOT NULL REFERENCES dominio.tipo_perda_recurso_humano (code),	
	horas REAL,
	data_inicio timestamp with time zone NOT NULL,
	data_fim timestamp with time zone NOT NULL,	
	observacao TEXT	
);

CREATE TABLE recurso_humano.ganho_recurso_humano(--horas além do expediente
	id SERIAL NOT NULL PRIMARY KEY,	
 	usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),	
	horas REAL,
	data_inicio timestamp with time zone NOT NULL,
	data_fim timestamp with time zone NOT NULL,	
	observacao TEXT	
);

CREATE TABLE recurso_humano.funcao_especial(
	id SERIAL NOT NULL PRIMARY KEY,
 	usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
	funcao VARCHAR(255) NOT NULL,
	data_inicio timestamp with time zone NOT NULL,
	data_fim timestamp with time zone
);

CREATE TABLE recurso_humano.expediente(
	id SERIAL NOT NULL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
	segunda_feira REAL NOT NULL,
	terca_feira REAL NOT NULL,
	quarta_feira REAL NOT NULL,
	quinta_feira REAL NOT NULL,
	sexta_feira REAL NOT NULL,
	sabado REAL NOT NULL,
	domingo REAL NOT NULL
);

CREATE TABLE recurso_humano.perfil_expediente(
	id SERIAL NOT NULL PRIMARY KEY,
 	usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
 	expediente_id INTEGER NOT NULL REFERENCES recurso_humano.expediente (id),
	data_inicio timestamp with time zone NOT NULL,
	data_fim timestamp with time zone
);

CREATE TABLE recurso_humano.informacoes_usuario(
	id SERIAL NOT NULL PRIMARY KEY,
 	usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
 	turma_promocao INTEGER,
    antiguidade_turma INTEGER,
    data_nascimento DATE,
    telefone VARCHAR(255),
    identidade VARCHAR(255),
    cpf VARCHAR(255),
    email VARCHAR(255),
    codigo_banco VARCHAR(255),
    banco VARCHAR(255),
    agencia_bancaria VARCHAR(255),
    conta_bancaria VARCHAR(255),
    UNIQUE(usuario_id)
);

CREATE TABLE recurso_humano.banco_dispensas(
	id SERIAL NOT NULL PRIMARY KEY,
 	usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
 	motivo_dispensa TEXT NOT NULL,
	dias_totais INTEGER NOT NULL,
    dias_restantes INTEGER NOT NULL
);