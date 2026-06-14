BEGIN;

CREATE SCHEMA controle_capacitacao;

CREATE TABLE controle_capacitacao.situacao
(
    code SMALLINT NOT NULL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE
);

INSERT INTO controle_capacitacao.situacao (code, nome) VALUES
(1, 'Prevista'),
(2, 'Em Execução'),
(3, 'Concluída'),
(4, 'Cancelada');

CREATE TYPE controle_capacitacao.tipo_capacitacao AS ENUM (
    'Ministrada',
    'Recebida'
);

-- Capacitacao ministrada (alimenta a 2.5 do RPCMTec) ou recebida (5.2).
-- Ministrada: efetivo_capacitado e instituicoes sao os externos treinados.
-- Recebida: militares e o militar da DGEO em capacitacao; plano_codigo e o
-- Plano/Codigo (ex.: C25/DCT003 PCE-EECN).
CREATE TABLE controle_capacitacao.capacitacao
(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    tipo controle_capacitacao.tipo_capacitacao NOT NULL,
    instituicoes TEXT,
    local VARCHAR(255),
    inicio timestamp with time zone,
    fim timestamp with time zone,
    efetivo_capacitado INTEGER,
    militares TEXT,
    plano_codigo VARCHAR(255),
    ano SMALLINT NOT NULL,
    situacao_id SMALLINT NOT NULL REFERENCES controle_capacitacao.situacao (code),
    documento VARCHAR(255)
);

COMMIT;
