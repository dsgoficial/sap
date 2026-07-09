BEGIN;

-- Atualizacao 2.3.3 -> 2.3.4
--
-- perfil_requisito_finalizacao e perfil_fme eram as duas unicas tabelas de
-- perfil sem restricao de unicidade. Todas as outras (perfil_estilo,
-- perfil_menu, perfil_regras, perfil_model_qgis, perfil_workflow_dsgtools,
-- perfil_alias, perfil_tema, perfil_configuracao_qgis, perfil_linhagem)
-- ja tinham UNIQUE por catalogo x subfase x lote.
--
-- Consequencia: copiar a configuracao de um lote para outro
-- (POST /projeto/configuracao/lote/copiar) duas vezes DUPLICAVA as linhas
-- nessas duas tabelas, em silencio, enquanto abortava nas outras nove. Tornar
-- a copia atomica (2.3.3) nao resolveu isso: atomicidade nao e idempotencia.
--
-- A chave escolhida segue o idioma do restante do schema, catalogo x subfase
-- x lote. Para o FME o catalogo e o par (gerenciador_fme_id, rotina). Para o
-- requisito de finalizacao, que nao tem catalogo, a identidade e a descricao.
-- NAO se usa a coluna ordem em nenhuma das duas: atualizaPerfilFME e
-- atualizaPerfilRequisitoFinalizacao reordenam por UPDATE em massa dentro de
-- uma transacao, e uma restricao sobre ordem colidiria no meio da reordenacao.

-- Remove duplicatas ja existentes, preservando a linha mais antiga (menor id).
DELETE FROM macrocontrole.perfil_requisito_finalizacao AS a
USING macrocontrole.perfil_requisito_finalizacao AS b
WHERE a.id > b.id
  AND a.descricao = b.descricao
  AND a.subfase_id = b.subfase_id
  AND a.lote_id = b.lote_id;

DELETE FROM macrocontrole.perfil_fme AS a
USING macrocontrole.perfil_fme AS b
WHERE a.id > b.id
  AND a.gerenciador_fme_id = b.gerenciador_fme_id
  AND a.rotina = b.rotina
  AND a.subfase_id = b.subfase_id
  AND a.lote_id = b.lote_id;

-- ADD UNIQUE (sem nomear) gera o mesmo nome de constraint que o UNIQUE inline
-- do er/macrocontrole.sql, mantendo banco migrado e instalacao nova identicos.
ALTER TABLE macrocontrole.perfil_requisito_finalizacao
    ADD UNIQUE (descricao, subfase_id, lote_id);

ALTER TABLE macrocontrole.perfil_fme
    ADD UNIQUE (gerenciador_fme_id, rotina, subfase_id, lote_id);

-- bump da versao do banco
UPDATE public.versao SET nome = '2.3.4' WHERE code = 1;

COMMIT;
