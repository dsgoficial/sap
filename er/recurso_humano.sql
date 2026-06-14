BEGIN;

CREATE SCHEMA recurso_humano;

-- Secao 5.1 do RPCMTec (Aproveitamento do efetivo, padrao 2026: Militar |
-- Atividades). E um RETRATO MENSAL congelado: uma linha por militar por mes, com
-- o posto da epoca (tipo_posto_grad_id) e a atividade/encargo principal
-- (atividades, texto livre; vazio para quem so produziu). Guardar por mes torna
-- a situacao de RH de cada mes fiel mesmo apos promocoes e baixas, e imutavel
-- depois do relatorio assinado. O preenchimento de um mes novo e agilizado
-- copiando o mes anterior (ver rh_ctrl.copiarMesAnterior).
CREATE TABLE recurso_humano.aproveitamento_mes
(
    id SERIAL NOT NULL PRIMARY KEY,
    ano SMALLINT NOT NULL,
    mes SMALLINT NOT NULL,
    usuario_id INTEGER NOT NULL REFERENCES dgeo.usuario (id),
    tipo_posto_grad_id SMALLINT NOT NULL REFERENCES dominio.tipo_posto_grad (code),
    atividades TEXT,
    UNIQUE (ano, mes, usuario_id)
);

COMMIT;
