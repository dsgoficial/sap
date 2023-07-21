BEGIN;

CREATE TABLE public.versao(
  code SMALLINT NOT NULL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL
);

INSERT INTO public.versao (code, nome) VALUES
(1, '1.0.0');

COMMIT;