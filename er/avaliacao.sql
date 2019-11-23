BEGIN;

CREATE SCHEMA avaliacao;

CREATE TABLE avaliacao.questionario(
  id SERIAL NOT NULL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  subfase_id INTEGER NOT NULL REFERENCES macrocontrole.etapa (id),
  UNIQUE (subfase_id)
);

CREATE TABLE avaliacao.pergunta(
  id SERIAL NOT NULL PRIMARY KEY,
  texto VARCHAR(255) NOT NULL,
  ordem INTEGER NOT NULL, -- as perguntas são ordenadas dentro de um questionário
  questionario_id INTEGER NOT NULL REFERENCES avaliacao.questionario (id)
);

CREATE TABLE avaliacao.opcao(
  id SERIAL NOT NULL PRIMARY KEY,
  texto VARCHAR(255) NOT NULL,
  ordem INTEGER NOT NULL, -- as opções são ordenadas dentro de uma pergunta
  pergunta_id INTEGER NOT NULL REFERENCES avaliacao.pergunta (id)
);

CREATE TABLE avaliacao.resposta_questionario(
  id SERIAL NOT NULL PRIMARY KEY,
  data timestamp with time zone NOT NULL,
  atividade_id INTEGER NOT NULL REFERENCES macrocontrole.atividade (id)
);

CREATE TABLE avaliacao.resposta(
  id SERIAL NOT NULL PRIMARY KEY,
  pergunta_id INTEGER NOT NULL REFERENCES avaliacao.pergunta (id),
  opcao_id INTEGER NOT NULL REFERENCES avaliacao.opcao (id),
  resposta_questionario_id INTEGER NOT NULL REFERENCES avaliacao.resposta_questionario (id)
);

COMMIT;