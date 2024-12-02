BEGIN;

CREATE TABLE dominio.status(	
	code SMALLINT NOT NULL PRIMARY KEY,	
	nome VARCHAR(255) NOT NULL	
);	

INSERT INTO dominio.status (code, nome) VALUES	
(1, 'Previsto / Em Execução'),	
(2, 'Finalizado'),	
(3, 'Abandonado');

DROP MATERIALIZED VIEW IF EXISTS acompanhamento.bloco;

ALTER TABLE macrocontrole.projeto
DROP COLUMN finalizado;

ALTER TABLE macrocontrole.projeto
ADD COLUMN status_id SMALLINT NOT NULL REFERENCES dominio.status (code) DEFAULT 1;

ALTER TABLE macrocontrole.lote
ADD COLUMN status_id SMALLINT NOT NULL REFERENCES dominio.status (code) DEFAULT 1;

ALTER TABLE macrocontrole.bloco
ADD COLUMN status_id SMALLINT NOT NULL REFERENCES dominio.status (code) DEFAULT 1;

CREATE OR REPLACE FUNCTION acompanhamento.cria_view_acompanhamento_bloco()
  RETURNS void AS
$$
  DECLARE view_txt text;
  DECLARE jointxt text := '';
  DECLARE nome_fixed text;
  DECLARE r record;
  BEGIN
      view_txt := 'CREATE MATERIALIZED VIEW acompanhamento.bloco AS 
      SELECT b.id, b.nome, b.prioridade, l.nome AS lote, st_projeto.nome AS projeto_status, st_lote.nome AS lote_status, st_bloco.nome AS bloco_status, b.geom';

      FOR r in SELECT pf.id, pf.nome FROM macrocontrole.perfil_producao AS pf
      LOOP

        nome_fixed := translate(replace(lower(r.nome),' ', '_'),  
              'àáâãäéèëêíìïîóòõöôúùüûçÇ/-|/\,.;:<>?!`{}[]()~`@#$%^&*+=''',  
              'aaaaaeeeeiiiiooooouuuucc________________________________');

        view_txt := view_txt || ',  operadores_' || r.id || '.operadores AS  ' || nome_fixed || '_operadores';
        view_txt := view_txt || ',  atividades_' || r.id || '.atividades AS  ' || nome_fixed || '_atividades';

        jointxt := jointxt || ' INNER JOIN 
            (SELECT b.id, COUNT(pbo.id) AS operadores
            FROM macrocontrole.bloco AS b
            LEFT JOIN (
              SELECT pbo.id, pbo.bloco_id
              FROM macrocontrole.perfil_bloco_operador AS pbo
              INNER JOIN macrocontrole.perfil_producao_operador AS ppo ON ppo.usuario_id = pbo.usuario_id AND ppo.perfil_producao_id = ' || r.id ||'
            ) AS pbo ON pbo.bloco_id = b.id
            GROUP BY b.id) AS operadores_' || r.id || ' ON operadores_' || r.id || '.id = b.id';

        jointxt := jointxt || ' INNER JOIN 
            (SELECT b.id, COUNT(a.id) AS atividades
            FROM macrocontrole.bloco AS b
            LEFT JOIN macrocontrole.unidade_trabalho AS ut ON ut.bloco_id = b.id
            LEFT JOIN (
              SELECT a.id, a.unidade_trabalho_id
              FROM macrocontrole.atividade AS a
              INNER JOIN macrocontrole.etapa AS e ON e.id = a.etapa_id
              INNER JOIN macrocontrole.perfil_producao_etapa AS ppe ON ppe.subfase_id = e.subfase_id AND ppe.tipo_etapa_id = e.tipo_etapa_id
              WHERE a.tipo_situacao_id = 1 AND ppe.perfil_producao_id = ' || r.id ||'
            ) AS a ON a.unidade_trabalho_id = ut.id
            GROUP BY b.id) AS atividades_' || r.id || ' ON atividades_' || r.id || '.id = b.id';

      END LOOP;

      view_txt := view_txt || ' FROM (SELECT b.id, b.nome, b.lote_id, b.prioridade, b.status_id, ST_Collect(ut.geom) as geom 
                                FROM macrocontrole.bloco AS b
                                INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.bloco_id = b.id 
                                GROUP BY b.id) AS b
                                INNER JOIN macrocontrole.lote AS l ON l.id = b.lote_id
                                INNER JOIN macrocontrole.projeto AS proj ON proj.id = l.projeto_id
                                INNER JOIN dominio.status AS st_projeto ON proj.status_id = st_projeto.code
                                INNER JOIN dominio.status AS st_lote ON l.status_id = st_lote.code
                                INNER JOIN dominio.status AS st_bloco ON b.status_id = st_bloco.code';
      view_txt := view_txt || jointxt;

      EXECUTE view_txt;
      EXECUTE 'ALTER TABLE acompanhamento.bloco OWNER TO postgres';
      EXECUTE 'GRANT SELECT ON TABLE acompanhamento.bloco TO PUBLIC';
      EXECUTE 'CREATE INDEX bloco_geom ON acompanhamento.bloco USING gist (geom);';
      EXECUTE 'CREATE UNIQUE INDEX bloco_id ON acompanhamento.bloco (id);';
      EXECUTE 'REFRESH MATERIALIZED VIEW CONCURRENTLY acompanhamento.bloco';

  END;
$$
LANGUAGE plpgsql VOLATILE
  COST 100;

SELECT acompanhamento.cria_view_acompanhamento_bloco();

-- Trigger para verificar se um lote pode ser finalizado com base no status dos blocos
CREATE OR REPLACE FUNCTION macrocontrole.chk_lote_status() RETURNS TRIGGER AS $$
BEGIN
    -- Se o lote está sendo finalizado (status_id != 1)
    IF NEW.status_id != 1 THEN
        -- Verifica se existem blocos em andamento
        IF EXISTS (
            SELECT 1
            FROM macrocontrole.bloco
            WHERE lote_id = NEW.id
            AND status_id = 1
        ) THEN
            RAISE EXCEPTION 'Cannot finalize lot while blocks are still in progress';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION macrocontrole.chk_lote_status()
    OWNER TO postgres;

CREATE TRIGGER chk_lote_status_consistency
    BEFORE INSERT OR UPDATE ON macrocontrole.lote
    FOR EACH ROW
    EXECUTE PROCEDURE macrocontrole.chk_lote_status();

-- Trigger para verificar se um projeto pode ser finalizado com base no status dos lotes
CREATE OR REPLACE FUNCTION macrocontrole.chk_projeto_status() RETURNS TRIGGER AS $$
BEGIN
    -- Se o projeto está sendo finalizado (status_id != 1)
    IF NEW.status_id != 1 THEN
        -- Verifica se existem lotes em andamento
        IF EXISTS (
            SELECT 1
            FROM macrocontrole.lote
            WHERE projeto_id = NEW.id
            AND status_id = 1
        ) THEN
            RAISE EXCEPTION 'Cannot finalize project while lots are still in progress';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION macrocontrole.chk_projeto_status()
    OWNER TO postgres;

CREATE TRIGGER chk_projeto_status_consistency
    BEFORE INSERT OR UPDATE ON macrocontrole.projeto
    FOR EACH ROW
    EXECUTE PROCEDURE macrocontrole.chk_projeto_status();

CREATE OR REPLACE FUNCTION macrocontrole.chk_bloco_status() RETURNS TRIGGER AS $$
BEGIN
    -- Verifica status do lote relacionado
    IF EXISTS (
        SELECT 1
        FROM macrocontrole.lote
        WHERE id = NEW.lote_id
        AND status_id != 1
    ) THEN
        -- Se o lote está finalizado, não permite blocos em execução ou alteração de status
        IF NEW.status_id = 1 THEN
            RAISE EXCEPTION 'Cannot create or update block in progress for finalized or abandoned lot';
        ELSE
            RAISE EXCEPTION 'Cannot modify block status for finalized or abandoned lot';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION macrocontrole.chk_bloco_status()
    OWNER TO postgres;

CREATE TRIGGER chk_bloco_status_consistency
    BEFORE INSERT OR UPDATE ON macrocontrole.bloco
    FOR EACH ROW
    EXECUTE PROCEDURE macrocontrole.chk_bloco_status();

UPDATE public.versao
SET nome = '2.2.2' WHERE code = 1;

COMMIT;