// Path: lib\regras.js
'use strict'

// O que nem o joi.describe() nem os blocos @swagger conseguem contar.
//
// A FORMA de cada recurso (campos, tipos, obrigatorios, condicionais) e lida ao
// vivo do Joi do server/ e nunca copiada. A DESCRICAO de cada rota e lida ao
// vivo dos blocos @swagger. Sobra uma terceira camada, que nao esta em lugar
// nenhum legivel por maquina: a invariante de banco (trigger, UNIQUE), o custo
// operacional, a idempotencia e a ordem entre chamadas. Nao saber que
// finalizar_modo_local com data a meia-noite UTC grava o dia ANTERIOR custa um
// mes de producao lancado errado, nao um 400.
//
// Este arquivo e a UNICA prosa curada do CLI. Regra aqui vale por ser curta e
// por explicar o PORQUE; o que o Joi ja diz (tipo, tamanho, obrigatoriedade) NAO
// entra, para nao criar uma segunda fonte de verdade.
//
// Cada afirmacao abaixo foi conferida na fonte primaria em 2026-07-25: no DDL
// (er/*.sql), no controller ou no proprio schema, e nao em prosa que descreve o
// codigo. Ao mudar a regra no server/, atualize a linha correspondente.

const GERAL = [
  'Envelope de toda resposta: {version, success, message, dados}. O util e `dados`.',
  'POST de escrita quase sempre devolve dados:null (so a mensagem). Para descobrir o',
  'id do que voce acabou de criar, LISTE de novo. O sap ja faz isso onde da.',
  'Token: o SAP le req.headers.authorization CRU; validate_token.js tambem aceita o',
  'prefixo "Bearer ". Validade de 10h (login_ctrl, expiresIn).',
  'Quase toda rota de escrita exige administrador (verifyAdmin).',
  'Cliente do login: use "sap". Com sap_fp ou sap_fg o schema EXIGE plugins e a versao',
  'do QGIS, que um agente nao tem. Ver: sap schema login.',
  '',
  'DEFEITO VIVO no /acompanhamento (conferido no codigo em 2026-07-25): quatro rotas',
  'declaram params: anoParam num caminho que nao tem esse parametro, entao o Joi recusa',
  'ANTES do controller e elas respondem 400 SEMPRE:',
  '  GET /api/acompanhamento/projetos',
  '  GET /api/acompanhamento/projeto/:id/informacao_anual/:ano',
  '  GET /api/acompanhamento/projeto/:id/informacao_detalhada',
  '  GET /api/acompanhamento/projeto/:id/informacao_detalhada/:ano',
  'Nao ha o que ajustar no corpo: o conserto e no server/. O `sap producao` nao as usa.'
]

const REGRAS = {
  campo: [
    'campo.nome e UNIQUE no banco: repetir o mesmo campo volta erro, e esse e o unico',
    'guard de idempotencia (o POST em si nao e idempotente).',
    '`pit` e o ANO do PIT a que o campo pertence (smallint), nao um id de meta.',
    '`categorias` sai de: sap dominio campo_categoria. `situacao_id`, de campo_situacao.',
    'Para a Secao 2.5 do RPCMTec exclui-se a categoria de capacitacao: campo de',
    'capacitacao entra na 2.6, pela rota de capacitacao, e contar nos dois duplica.'
  ],

  capacitacao: [
    'tipo Ministrada alimenta a Secao 2.6; Recebida alimenta a 6.2.',
    'O POST NAO e idempotente e a tabela nao tem UNIQUE: rodar duas vezes cria duas',
    'capacitacoes iguais. Liste antes de criar.',
    'A rota de relatorio GET /api/capacitacao/rpcmtec/<inicio>/<fim> filtra por',
    'inicio::date <= dataFim: capacitacao com `inicio` nulo SOME do relatorio, mesmo',
    'sendo aceita no cadastro (o Joi permite null).'
  ],

  extra_pit: [
    'A listagem e SO DO ANO pedido, nao acumulada. O RPCMTec e cumulativo: para a',
    'Secao 3.3 de um mes, liste o ano e recorte voce mesmo.',
    'O POST nao e idempotente (id serial): repetir duplica a demanda.'
  ],

  pit: [
    'Sao as metas que o SAP NAO calcula sozinho (impressao, Programa Memoria, TI,',
    'EBGeo). Grava em macrocontrole.pit com lote_id nulo; as metas de producao, com',
    'lote, vivem em /acompanhamento/pit e nao passam por aqui.',
    'Meta de marco (data, nao quantidade) entra com meta=1 e prazo preenchido.',
    '`percentual` da listagem ja vem EM PERCENTO (100 = 100%), calculado no SQL como',
    'round(100.0*realizado/meta,1). Nao multiplique de novo.',
    '`realizado` e `percentual` chegam como STRING (numeric do Postgres).'
  ],

  pit_execucao: [
    'E o realizado de UMA meta num MES. O acumulado do ano sai da listagem de `pit`.',
    'O POST e upsert por (pit_id, mes): reenviar corrige em vez de duplicar. E a unica',
    'escrita idempotente desta familia.',
    'O pit_id nao vem do POST da meta (que devolve dados:null): liste as metas do ano',
    'e case pelo campo `item`.'
  ],

  aproveitamento: [
    'Retrato mensal do efetivo (Secao 5.1), um registro por (ano, mes, usuario).',
    'O POST tem ON CONFLICT DO NOTHING: repetir nao duplica, mas TAMBEM NAO CORRIGE a',
    'linha existente. Para corrigir, atualizar --id.',
    '`iniciar` cria a grade do mes com o efetivo atual; `copiar` traz o mes anterior.',
    'Comecar por um dos dois evita lancar militar a militar.'
  ],

  projeto: [
    'POST, PUT e DELETE operam na COLECAO, com array no corpo; nao ha rota por id.',
    'O DELETE tambem leva corpo: {"projeto_ids": [...]}.',
    'nome e nome_abrev sao UNIQUE: repetir volta erro. E o guard de idempotencia.',
    'status_id sai de: sap dominio status.'
  ],

  lote: [
    'denominador_escala do lote e INT; o do produto e STRING. Nao e capricho do',
    'schema: a trigger macrocontrole.chk_scale recusa produto cuja escala nao seja',
    'IGUAL a do lote. Escala trocada aparece como "Scale inconsistency detected".',
    'Fechar o lote = atualizar com status_id 2 (Finalizado). Como o PUT exige o objeto',
    'inteiro, use `sap lote fechar`, que le o lote atual e so troca o status.',
    'lote.nome e UNIQUE.'
  ],

  bloco: [
    'UNIQUE por (nome, lote_id): o mesmo nome de bloco pode existir em lotes diferentes.'
  ],

  produto: [
    'geom e MULTIPOLYGON em SRID 4326 (a coluna do banco e geometry(MULTIPOLYGON,4326)).',
    'Mandar POLYGON quebra. Na unidade de trabalho e o contrario: POLYGON.',
    'ASSIMETRIA REAL entre criar e atualizar, conferida no schema: o POST exige uuid',
    'v4 ESTRITO (guid version uuidv4) e o PUT aceita qualquer 8-4-4-4-12 hex. O uuid',
    'canonico do produto (planilha/BDGEx) muitas vezes nao e v4 estrito, entao ele',
    'PASSA no PUT e e RECUSADO no POST. O caminho e criar com uuid v4 e reapontar',
    'depois com atualizar.',
    'denominador_escala tem que bater com o do lote (trigger chk_scale).'
  ],

  unidade_trabalho: [
    'geom e POLYGON em SRID 4326; `epsg` e o fuso UTM de TRABALHO (ex.: "31982"), nao',
    'o 4326 da geometria.',
    'O POST NAO e idempotente e a tabela nao tem UNIQUE nenhum (nem por nome, nem por',
    'subfase): rodar duas vezes duplica em silencio, e depois so da para limpar no',
    'banco. LISTE por lote_id antes de criar; e para isso que a listagem existe.',
    'Uma chamada cria UT para cada folha x cada subfase de subfase_ids.',
    'A listagem nao devolve a geometria, de proposito.'
  ],

  dado_producao: [
    'E o banco onde a subfase edita. configuracao_producao e texto "host:porta/banco",',
    'SEM credencial: para o tipo 2 o proprio SAP injeta um login temporario.',
    'Ainda assim e informacao de conexao: nunca versione o valor, nunca o imprima em',
    'arquivo do vault. Use a chave do .env.'
  ],

  usuario: [
    'Os usuarios sao IMPORTADOS do servico de autenticacao; o SAP nao guarda senha.',
    'O casamento e pelo campo `login`, nao pelo uuid.',
    'criar recebe {"usuarios": [uuid, ...]} e importa; atualizar recebe a lista com',
    'administrador e ativo por uuid.'
  ],

  login: [
    'Com cliente "sap" os campos plugins e qgis sao PROIBIDOS (Joi.forbidden): mandar',
    'qualquer um deles da 400. Com sap_fp ou sap_fg os dois passam a ser obrigatorios.'
  ]
}

// Prosa dos verbos de intencao, que nao sao "um recurso" e por isso nao cabem na
// tabela acima.
const VERBOS = {
  producao: [
    'Produzido, para o PIT, e atividade com tipo_situacao_id = 4 (Finalizada) e',
    'data_fim, e nao o status do lote: lote em execucao ja conta o que finalizou.',
    'O RPCMTec e CUMULATIVO: --mes N traz de janeiro ate o fim do mes N.',
    'A producao com lote sai de /acompanhamento/pit/<ano>; a sem lote (impressao, TI,',
    'Programa Memoria) sai de /pit_nao_producao/<ano>. As duas juntas sao o PIT.'
  ],
  finalizar: [
    'Lancamento RETROATIVO de atividade ja executada (o modo local). So pega atividade',
    'em tipo_situacao_id = 1; repetir numa ja finalizada nao faz nada, entao e seguro',
    'reprocessar um lote que falhou no meio.',
    'FUSO: mande data com hora de MEIO-DIA UTC (T12:00:00.000Z). O Node renderiza em',
    'UTC-3, e meia-noite UTC vira o dia ANTERIOR: um lancamento de 01/07 aparece em',
    '30/06 e cai no mes errado do relatorio. O sap normaliza e avisa.',
    'LACUNA DE API: nao existe rota que liste as atividades de um lote, so',
    'GET /gerencia/atividade/:id. Enumerar os ids ainda exige leitura do banco.',
    'Uma requisicao HTTP por atividade: um lote de 48 folhas com 6 etapas sao 288',
    'chamadas. Rode com folga de tempo.'
  ]
}

// Campos cuja coluna e `timestamp with time zone` (conferido no DDL em er/*.sql
// em 2026-07-25). Para eles, uma data sem hora vira meia-noite UTC, que em UTC-3
// e exibida como o DIA ANTERIOR: 2026-07-01 aparece como 30/06 e cai no mes
// errado do RPCMTec. O Joi nao sabe disso (para ele e so `date`), e a spec
// tampouco. Colunas DATE puras (pit.prazo) nao entram: nelas nao ha hora.
//
//   controle_campo.campo.inicio / .fim
//   controle_capacitacao.capacitacao.inicio / .fim
//   macrocontrole.atividade.data_inicio / .data_fim
const CAMPOS_TIMESTAMPTZ = new Set([
  'inicio', 'fim', 'data_inicio', 'data_fim'
])

module.exports = { REGRAS, GERAL, VERBOS, CAMPOS_TIMESTAMPTZ }
