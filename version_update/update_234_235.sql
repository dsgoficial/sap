BEGIN;

-- Atualizacao 2.3.4 -> 2.3.5
--
-- O NOME da meta do PIT passa a ser dado, e o PIT de PRODUCAO passa a preencher
-- as colunas descritivas que ja existiam so para as metas de nao-producao.
--
-- POR QUE. A subsecao 2.1 do RPCMTec ("Estado Atual do PIT") tem sete colunas:
-- Meta | Item | Produto ou servico | Quantidade | Prontos no mes | Prontos |
-- Previsao de termino. A celula da coluna Meta do documento da Divisao diz
-- "Meta 1 - Producao de Geoinformacao", e o item diz "1.1", e o produto diz
-- "Carta Topografica 1:25.000".
--
-- O SAP so sabia disso metade: as metas de nao-producao (lote_id nulo) ja
-- gravavam numero_meta, item, descricao, unidade e prazo, e as de PRODUCAO
-- (com lote) gravavam apenas lote_id, meta e ano. As colunas existiam na
-- tabela e ficavam nulas para toda meta de producao, entao a 2.1 nascia sem
-- item e sem previsao de termino para justamente as metas 1 a 3, que sao as
-- que o relatorio abre. Isso NAO exige migracao: e o CRUD de
-- gerencia_ctrl.criaPit/atualizaPit que deixava as colunas de fora.
--
-- O que exige migracao e so o nome da meta. Ele nao existia em lugar nenhum, e
-- as tres saidas possiveis eram: escrever "Meta 1" e deixar quem cola no
-- documento mestre completar a mao todo mes; guardar os sete nomes como
-- constante no gerador; ou guarda-los como dado. A constante foi recusada pelo
-- mesmo motivo que ja custou caro na mapoteca (categoria de material derivada
-- do nome do material): ela acerta o PIT de hoje e mente CALADA no ano em que
-- a meta 6 mudar de nome, num relatorio que o chefe assina.
--
-- A coluna e por LINHA de pit, e nao uma tabela de (ano, numero_meta) -> nome:
-- e a mesma granularidade de numero_meta, que ja mora aqui, e o gerador agrupa
-- por numero_meta na hora de escrever a celula (so a primeira linha de cada
-- meta a recebe, como no modelo). Uma tabela a parte cobraria um JOIN e uma
-- tela de cadastro para guardar sete strings por ano.
--
-- Nasce NULL de proposito, inclusive nas metas que ja existem: o nome do PIT
-- de um ano passado nao esta em lugar nenhum de onde deduzi-lo, e chutar
-- "Producao de Geoinformacao" para toda meta 1 gravaria um palpite como se
-- fosse registro. Sem nome, o gerador escreve "Meta N", que e o que o SAP
-- sabe.
ALTER TABLE macrocontrole.pit
    ADD COLUMN nome_meta VARCHAR(255);

COMMENT ON COLUMN macrocontrole.pit.nome_meta IS
    'Nome da meta do PIT do ano (ex.: Producao de Geoinformacao). Alimenta a coluna Meta da subsecao 2.1 do RPCMTec. Nulo quando nao informado: o gerador escreve apenas "Meta N".';

-- bump da versao do banco
UPDATE public.versao SET nome = '2.3.5' WHERE code = 1;

COMMIT;
