// Path: lib\recursos.js
'use strict'

const path = require('path')

// Registro dos recursos da API. Cada entrada aponta para o MODULO DE SCHEMA da
// feature no server/, e o CLI le dali o contrato (campos, tipos, obrigatorios,
// filtros). Nada de contrato e copiado para ca: se o schema mudar, o CLI muda no
// mesmo commit. Este arquivo so guarda o que NAO esta no schema: o caminho da
// rota, o nome do model Joi que aquela rota exige e a escolha de apresentacao.
//
// Por que uma registry de OPERACOES e nao de "recurso CRUD". O SAP tem duas
// familias de rota que nao se parecem, e um crud.js generico mentiria sobre uma
// delas:
//   - familia REST por uuid (campo, capacitacao, extra_pit, pit_nao_producao,
//     rh/aproveitamento): POST na colecao, PUT e DELETE em /:uuid ou /:id;
//   - familia LOTE do modulo projeto (lote, bloco, produto, unidade de
//     trabalho, dado de producao): POST, PUT e DELETE todos na COLECAO, com
//     array no corpo. Ate o DELETE leva corpo ({lote_ids: [...]}), e nao id na
//     URL. Modelar isso como "deletar --id" produziria um mapa falso.
// Por isso cada operacao declara explicitamente metodo, sufixo, chave de
// caminho e model Joi de corpo/query.
//
// O require e preguicoso (funcao) para que um recurso com schema faltando
// quebre so o comando daquele recurso, e nao o CLI inteiro.

const RAIZ_SERVER = path.join(__dirname, '..', '..', 'server', 'src')

function carregar (relativo) {
  return () => require(path.join(RAIZ_SERVER, relativo))
}

const RECURSOS = {
  // -------------------------------------------------------------------------
  // Secoes manuais do RPCMTec: o que o chefe LANCA todo mes.
  // -------------------------------------------------------------------------
  campo: {
    nome: 'atividade de campo (Secao 2.5 do RPCMTec)',
    modulo: 'campo',
    caminho: '/campo/campos',
    schema: carregar('campo/campo_schema'),
    colunas: ['uuid', 'nome', 'orgao', 'pit', 'inicio', 'fim', 'situacao', 'militares'],
    operacoes: [
      { acao: 'listar', metodo: 'GET', sufixo: '', admin: false },
      { acao: 'obter', metodo: 'GET', sufixo: '/:uuid', chave: 'uuid', admin: false },
      { acao: 'criar', metodo: 'POST', sufixo: '', body: 'campo' },
      { acao: 'atualizar', metodo: 'PUT', sufixo: '/:uuid', chave: 'uuid', body: 'campo' },
      { acao: 'deletar', metodo: 'DELETE', sufixo: '/:uuid', chave: 'uuid' }
    ]
  },

  capacitacao: {
    nome: 'capacitacao ministrada ou recebida (Secoes 2.6 e 6.2)',
    modulo: 'capacitacao',
    caminho: '/capacitacao/capacitacoes',
    schema: carregar('capacitacao/capacitacao_schema'),
    colunas: ['uuid', 'nome', 'tipo', 'instituicoes', 'inicio', 'fim', 'efetivo_capacitado', 'situacao'],
    operacoes: [
      { acao: 'listar', metodo: 'GET', sufixo: '', admin: false },
      { acao: 'obter', metodo: 'GET', sufixo: '/:uuid', chave: 'uuid', admin: false },
      { acao: 'criar', metodo: 'POST', sufixo: '', body: 'capacitacao' },
      { acao: 'atualizar', metodo: 'PUT', sufixo: '/:uuid', chave: 'uuid', body: 'capacitacao' },
      { acao: 'deletar', metodo: 'DELETE', sufixo: '/:uuid', chave: 'uuid' }
    ]
  },

  extra_pit: {
    nome: 'demanda Extra-PIT (Secao 3.3)',
    modulo: 'extra_pit',
    caminho: '/extra_pit',
    schema: carregar('extra_pit/extra_pit_schema'),
    colunas: ['id', 'ano', 'demandante', 'tipo_produto', 'quantidade', 'situacao', 'documento_autorizacao', 'lote_nome'],
    operacoes: [
      { acao: 'listar', metodo: 'GET', sufixo: '/:ano', chave: 'ano', params: 'anoParams', admin: false },
      { acao: 'criar', metodo: 'POST', sufixo: '', body: 'extraPit' },
      { acao: 'atualizar', metodo: 'PUT', sufixo: '/:id', chave: 'id', body: 'extraPit', params: 'idParams' },
      { acao: 'deletar', metodo: 'DELETE', sufixo: '/:id', chave: 'id', params: 'idParams' }
    ]
  },

  pit: {
    nome: 'meta do PIT que o SAP nao calcula (PIT nao-producao)',
    modulo: 'pit_nao_producao',
    caminho: '/pit_nao_producao',
    schema: carregar('pit_nao_producao/pit_nao_producao_schema'),
    colunas: ['id', 'ano', 'numero_meta', 'item', 'descricao', 'unidade', 'meta', 'realizado', 'percentual', 'prazo'],
    operacoes: [
      { acao: 'listar', metodo: 'GET', sufixo: '/:ano', chave: 'ano', params: 'anoParams', admin: false },
      { acao: 'criar', metodo: 'POST', sufixo: '', body: 'pit' },
      { acao: 'atualizar', metodo: 'PUT', sufixo: '/:id', chave: 'id', body: 'pit', params: 'idParams' },
      { acao: 'deletar', metodo: 'DELETE', sufixo: '/:id', chave: 'id', params: 'idParams' }
    ]
  },

  pit_execucao: {
    nome: 'realizado mensal de uma meta do PIT nao-producao',
    modulo: 'pit_nao_producao',
    caminho: '/pit_nao_producao/execucao',
    schema: carregar('pit_nao_producao/pit_nao_producao_schema'),
    colunas: ['id', 'pit_id', 'item', 'mes', 'quantidade', 'data_conclusao', 'observacao'],
    operacoes: [
      { acao: 'listar', metodo: 'GET', sufixo: '/:ano/:mes', params: 'anoMesParams', admin: false },
      { acao: 'criar', metodo: 'POST', sufixo: '', body: 'execucao' },
      { acao: 'deletar', metodo: 'DELETE', sufixo: '/:id', chave: 'id', params: 'idParams' }
    ]
  },

  aproveitamento: {
    nome: 'aproveitamento do efetivo (Secao 5.1)',
    modulo: 'rh',
    caminho: '/rh/aproveitamento',
    schema: carregar('rh/rh_schema'),
    colunas: ['id', 'posto', 'nome_guerra', 'atividades'],
    operacoes: [
      { acao: 'listar', metodo: 'GET', sufixo: '/:ano/:mes', params: 'anoMesParams' },
      { acao: 'criar', metodo: 'POST', sufixo: '', body: 'aproveitamento' },
      { acao: 'atualizar', metodo: 'PUT', sufixo: '/:id', chave: 'id', body: 'aproveitamentoUpdate', params: 'idParams' },
      { acao: 'deletar', metodo: 'DELETE', sufixo: '/:id', chave: 'id', params: 'idParams' },
      { acao: 'iniciar', metodo: 'POST', sufixo: '/iniciar', body: 'copiarMes' },
      { acao: 'copiar', metodo: 'POST', sufixo: '/copiar', body: 'copiarMes' }
    ]
  },

  // -------------------------------------------------------------------------
  // Modulo projeto: a familia de LOTE (array no corpo, inclusive no DELETE).
  // -------------------------------------------------------------------------
  projeto: {
    nome: 'projeto (guarda-chuva dos lotes)',
    modulo: 'projeto',
    caminho: '/projeto/projetos',
    schema: carregar('projeto/projeto_schema'),
    colunas: ['id', 'nome', 'nome_abrev', 'descricao', 'status'],
    operacoes: [
      { acao: 'listar', metodo: 'GET', sufixo: '', query: 'statusQuery' },
      { acao: 'criar', metodo: 'POST', sufixo: '', body: 'projeto' },
      { acao: 'atualizar', metodo: 'PUT', sufixo: '', body: 'projetoUpdate' },
      { acao: 'deletar', metodo: 'DELETE', sufixo: '', body: 'projetoIds' }
    ]
  },

  lote: {
    nome: 'lote de producao',
    modulo: 'projeto',
    caminho: '/projeto/lote',
    schema: carregar('projeto/projeto_schema'),
    colunas: ['id', 'nome', 'nome_abrev', 'denominador_escala', 'projeto_id', 'linha_producao_id', 'status'],
    operacoes: [
      { acao: 'listar', metodo: 'GET', sufixo: '', query: 'statusQuery' },
      { acao: 'criar', metodo: 'POST', sufixo: '', body: 'lotes' },
      { acao: 'atualizar', metodo: 'PUT', sufixo: '', body: 'loteUpdate' },
      { acao: 'deletar', metodo: 'DELETE', sufixo: '', body: 'loteIds' }
    ]
  },

  bloco: {
    nome: 'bloco (agrupa unidades de trabalho dentro do lote)',
    modulo: 'projeto',
    caminho: '/projeto/bloco',
    schema: carregar('projeto/projeto_schema'),
    colunas: ['id', 'nome', 'prioridade', 'lote_id', 'status'],
    operacoes: [
      { acao: 'listar', metodo: 'GET', sufixo: '', query: 'statusQuery' },
      { acao: 'criar', metodo: 'POST', sufixo: '', body: 'blocos' },
      { acao: 'atualizar', metodo: 'PUT', sufixo: '', body: 'blocoUpdate' },
      { acao: 'deletar', metodo: 'DELETE', sufixo: '', body: 'blocoIds' }
    ]
  },

  produto: {
    nome: 'produto (a folha) de um lote',
    modulo: 'projeto',
    caminho: '/projeto/produto',
    schema: carregar('projeto/projeto_schema'),
    colunas: ['id', 'uuid', 'nome', 'mi', 'inom', 'denominador_escala', 'edicao', 'lote_id'],
    operacoes: [
      { acao: 'listar', metodo: 'GET', sufixo: '', query: 'produtoQuery' },
      { acao: 'criar', metodo: 'POST', sufixo: '', body: 'produtos' },
      { acao: 'atualizar', metodo: 'PUT', sufixo: '', body: 'produtosUpdate' },
      { acao: 'deletar', metodo: 'DELETE', sufixo: '', body: 'produtosIds' }
    ]
  },

  unidade_trabalho: {
    nome: 'unidade de trabalho (folha x subfase)',
    modulo: 'projeto',
    caminho: '/projeto/unidade_trabalho',
    schema: carregar('projeto/projeto_schema'),
    colunas: ['id', 'nome', 'epsg', 'subfase', 'bloco', 'dado_producao_id', 'disponivel', 'prioridade'],
    operacoes: [
      { acao: 'listar', metodo: 'GET', sufixo: '', query: 'unidadeTrabalhoQuery' },
      { acao: 'criar', metodo: 'POST', sufixo: '', body: 'unidadesTrabalho' },
      { acao: 'deletar', metodo: 'DELETE', sufixo: '', body: 'unidadeTrabalhoId' }
    ]
  },

  dado_producao: {
    nome: 'dado de producao (banco onde a subfase edita)',
    modulo: 'projeto',
    caminho: '/projeto/dado_producao',
    schema: carregar('projeto/projeto_schema'),
    colunas: ['id', 'tipo_dado_producao_id', 'configuracao_producao'],
    operacoes: [
      { acao: 'listar', metodo: 'GET', sufixo: '' },
      { acao: 'criar', metodo: 'POST', sufixo: '', body: 'dadoProducao' },
      { acao: 'atualizar', metodo: 'PUT', sufixo: '', body: 'dadoProducaoUpdate' },
      { acao: 'deletar', metodo: 'DELETE', sufixo: '', body: 'dadoProducaoIds' }
    ]
  },

  usuario: {
    nome: 'usuario do SAP (importado do servico de autenticacao)',
    modulo: 'usuario',
    caminho: '/usuarios',
    schema: carregar('usuario/usuario_schema'),
    colunas: ['id', 'uuid', 'login', 'nome_guerra', 'tipo_posto_grad', 'administrador', 'ativo'],
    operacoes: [
      { acao: 'listar', metodo: 'GET', sufixo: '' },
      { acao: 'criar', metodo: 'POST', sufixo: '', body: 'listaUsuario' },
      { acao: 'atualizar', metodo: 'PUT', sufixo: '', body: 'updateUsuarioLista' }
    ]
  }
}

// Tabelas de dominio: GET simples que devolve os codigos aceitos por um campo
// *_id. Existem porque hoje esses enums estao TRANSCRITOS nas skills do vault
// (status_id 1/2/3, tipo_etapa 1..5, situacao_id do campo...), e transcricao
// apodrece. Aqui eles saem do servidor.
const DOMINIOS = {
  status: '/projeto/status',
  tipo_produto: '/projeto/tipo_produto',
  tipo_rotina: '/projeto/tipo_rotina',
  tipo_criacao_unidade_trabalho: '/projeto/tipo_criacao_unidade_trabalho',
  tipo_controle_qualidade: '/projeto/tipo_controle_qualidade',
  tipo_fase: '/projeto/tipo_fase',
  tipo_pre_requisito: '/projeto/tipo_pre_requisito',
  tipo_etapa: '/projeto/tipo_etapa',
  tipo_exibicao: '/projeto/tipo_exibicao',
  tipo_restricao: '/projeto/tipo_restricao',
  tipo_insumo: '/projeto/tipo_insumo',
  tipo_dado_producao: '/projeto/tipo_dado_producao',
  linha_producao: '/projeto/linha_producao',
  fases: '/projeto/fases',
  subfases: '/projeto/subfases',
  todas_subfases: '/projeto/todas_subfases',
  etapas: '/projeto/etapas',
  campo_situacao: '/campo/situacao',
  campo_categoria: '/campo/categoria',
  capacitacao_situacao: '/capacitacao/situacao',
  capacitacao_tipos: '/capacitacao/tipos',
  extra_pit_situacao: '/extra_pit/situacao'
}

function obter (chave) {
  const recurso = RECURSOS[chave]
  if (!recurso) {
    throw new Error(
      `Recurso desconhecido: "${chave}". Disponiveis: ${Object.keys(RECURSOS).join(', ')}.`
    )
  }
  return recurso
}

/** Descritor de uma acao daquele recurso, ou erro dizendo o que existe. */
function operacao (recurso, acao) {
  const op = (recurso.operacoes || []).find(o => o.acao === acao)
  if (!op) {
    throw new Error(
      `Acao "${acao}" nao existe neste recurso. Disponiveis: ` +
      (recurso.operacoes || []).map(o => o.acao).join(', ') + '.'
    )
  }
  return op
}

function listarChaves () {
  return Object.keys(RECURSOS)
}

module.exports = { RECURSOS, DOMINIOS, RAIZ_SERVER, obter, operacao, listarChaves, carregar }
