CREATE TABLE recurso_humano.perda_recurso_humano(
	id SERIAL NOT NULL PRIMARY KEY,	
 	usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),	
 	tipo_perda_recurso_humano_id SMALLINT NOT NULL REFERENCES dominio.tipo_perda_recurso_humano (code),	
	horas REAL,
	data_inicio timestamp with time zone NOT NULL,
	data_fim timestamp with time zone NOT NULL,	
	observacao TEXT	
);

CREATE TABLE recurso_humano.ganho_recurso_humano(
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
	data_fim timestamp with time zone,	
);