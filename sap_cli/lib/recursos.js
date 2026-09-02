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
  },

  // -------------------------------------------------------------------------
  // Modulo metadados: o que alimenta o XML (ISO 19115) e o JSON de edicao.
  //
  // Familia COLECAO, como a do modulo projeto: POST, PUT e DELETE todos no
  // caminho da colecao, com array no corpo, inclusive no DELETE. Nenhuma rota
  // aceita id na URL. Todas exigem admin.
  //
  // Duas armadilhas do contrato, que o schema do server ja diz e vale repetir
  // porque custam caro:
  //   - informacoes_produto e responsavel_fase_produto tem .xor(produto_id,
  //     lote_id): exatamente UM dos dois, nunca os dois nem nenhum. Na pratica
  //     a DGEO cadastra por LOTE.
  //   - palavra_chave_produto NAO aceita lote_id. E por produto, sempre, porque
  //     o toponimo e da folha.
  // -------------------------------------------------------------------------
  metadado_produto: {
    nome: 'metadado do produto (resumo, sigilo, especificacao) - por lote ou por produto',
    modulo: 'metadados',
    caminho: '/metadados/informacoes_produto',
    schema: carregar('metadados/metadados_schema'),
    colunas: ['id', 'lote_id', 'produto_id', 'resumo', 'especificacao_id', 'grau_sigilo_id', 'projeto_bdgex'],
    operacoes: [
      { acao: 'listar', metodo: 'GET', sufixo: '' },
      { acao: 'criar', metodo: 'POST', sufixo: '', body: 'informacoesProduto' },
      { acao: 'atualizar', metodo: 'PUT', sufixo: '', body: 'informacoesProdutoAtualizacao' },
      { acao: 'deletar', metodo: 'DELETE', sufixo: '', body: 'informacoesProdutoIds' }
    ]
  },

  metadado_responsavel: {
    nome: 'responsavel por fase do produto (vira a linhagem do XML)',
    modulo: 'metadados',
    caminho: '/metadados/responsavel_fase_produto',
    schema: carregar('metadados/metadados_schema'),
    colunas: ['id', 'lote_id', 'produto_id', 'fase_id', 'usuario_id'],
    operacoes: [
      { acao: 'listar', metodo: 'GET', sufixo: '' },
      { acao: 'criar', metodo: 'POST', sufixo: '', body: 'responsavelFaseProduto' },
      { acao: 'atualizar', metodo: 'PUT', sufixo: '', body: 'responsavelFaseProdutoAtualizacao' },
      { acao: 'deletar', metodo: 'DELETE', sufixo: '', body: 'responsavelFaseProdutoIds' }
    ]
  },

  metadado_palavra_chave: {
    nome: 'palavra-chave do produto (toponimo da folha) - SO por produto',
    modulo: 'metadados',
    caminho: '/metadados/palavra_chave_produto',
    schema: carregar('metadados/metadados_schema'),
    colunas: ['id', 'produto_id', 'nome', 'tipo_palavra_chave_id'],
    operacoes: [
      { acao: 'listar', metodo: 'GET', sufixo: '' },
      { acao: 'criar', metodo: 'POST', sufixo: '', body: 'palavraChaveProduto' },
      { acao: 'atualizar', metodo: 'PUT', sufixo: '', body: 'palavraChaveProdutoAtualizacao' },
      { acao: 'deletar', metodo: 'DELETE', sufixo: '', body: 'palavraChaveProdutoIds' }
    ]
  },

  metadado_edicao: {
    nome: 'informacoes de edicao do lote (alimenta o JSON de edicao da carta)',
    modulo: 'metadados',
    caminho: '/metadados/informacoes_edicao',
    schema: carregar('metadados/metadados_schema'),
    colunas: ['id', 'lote_id', 'produto_id', 'tipo_produto', 'versao_produto', 'pec_planimetrico', 'pec_altimetrico', 'licenca_produto'],
    operacoes: [
      { acao: 'listar', metodo: 'GET', sufixo: '' },
      { acao: 'criar', metodo: 'POST', sufixo: '', body: 'informacoesEdicao' },
      { acao: 'atualizar', metodo: 'PUT', sufixo: '', body: 'informacoesEdicaoAtualizacao' },
      { acao: 'deletar', metodo: 'DELETE', sufixo: '', body: 'informacoesEdicaoIds' }
    ]
  },

  metadado_creditos_qpt: {
    nome: 'creditos do QPT (quadro de pessoal do produto)',
    modulo: 'metadados',
    caminho: '/metadados/creditos_qpt',
    schema: carregar('metadados/metadados_schema'),
    colunas: ['id', 'lote_id', 'produto_id'],
    operacoes: [
      { acao: 'listar', metodo: 'GET', sufixo: '' },
      { acao: 'criar', metodo: 'POST', sufixo: '', body: 'creditosQpt' },
      { acao: 'atualizar', metodo: 'PUT', sufixo: '', body: 'creditosQptAtualizacao' },
      { acao: 'deletar', metodo: 'DELETE', sufixo: '', body: 'creditosQptIds' }
    ]
  },

  // A organizacao produtora/distribuidora. E dominio (o organizacao_id de
  // informacoes_produto) e tambem registro EDITAVEL: nome, sigla, endereco,
  // telefone e site dela vao para o XML de metadados de TODO produto dela.
  // Chave e o `code`, nao um id serial, e o recurso so tem listar e atualizar.
  metadado_organizacao: {
    nome: 'organizacao produtora/distribuidora (contato que vai ao XML de todo produto dela)',
    modulo: 'metadados',
    caminho: '/metadados/organizacao',
    schema: carregar('metadados/metadados_schema'),
    colunas: ['code', 'nome', 'sigla', 'endereco', 'telefone', 'site'],
    operacoes: [
      { acao: 'listar', metodo: 'GET', sufixo: '' },
      { acao: 'atualizar', metodo: 'PUT', sufixo: '', body: 'organizacao' }
    ]
  },

  metadado_usuario: {
    nome: 'pessoa que assina o metadado (responsavel e processor da linhagem)',
    modulo: 'metadados',
    caminho: '/metadados/usuario',
    schema: carregar('metadados/metadados_schema'),
    colunas: ['id', 'nome', 'nome_guerra', 'funcao', 'seguranca'],
    operacoes: [
      { acao: 'listar', metodo: 'GET', sufixo: '' },
      { acao: 'criar', metodo: 'POST', sufixo: '', body: 'usuario' },
      { acao: 'atualizar', metodo: 'PUT', sufixo: '', body: 'usuarioAtualizacao' },
      { acao: 'deletar', metodo: 'DELETE', sufixo: '', body: 'usuarioIds' }
    ]
  },

  // Os dois EXPORTADORES. Nao sao CRUD: devolvem o documento pronto de UM
  // produto, pelo uuid. Sao a razao de existir de todo o resto deste modulo.
  xml_metadado: {
    nome: 'XML de metadados (ISO 19115) de um produto, pelo uuid',
    modulo: 'metadados',
    caminho: '/metadados/xml/produto',
    schema: carregar('metadados/metadados_schema'),
    colunas: [],
    operacoes: [
      { acao: 'obter', metodo: 'GET', sufixo: '/:uuid', chave: 'uuid' }
    ]
  },

  json_edicao: {
    nome: 'JSON de edicao da carta de um produto, pelo uuid',
    modulo: 'metadados',
    caminho: '/metadados/json_edicao/produto',
    schema: carregar('metadados/metadados_schema'),
    colunas: [],
    operacoes: [
      { acao: 'obter', metodo: 'GET', sufixo: '/:uuid', chave: 'uuid' }
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
  extra_pit_situacao: '/extra_pit/situacao',
  // Dominios do modulo metadados. Sao os *_id que informacoes_produto exige.
  metadado_organizacao: '/metadados/organizacao',
  metadado_especificacao: '/metadados/especificacao',
  metadado_datum_vertical: '/metadados/datum_vertical',
  metadado_codigo_restricao: '/metadados/codigo_restricao',
  metadado_codigo_classificacao: '/metadados/codigo_classificacao',
  metadado_tipo_palavra_chave: '/metadados/tipo_palavra_chave',
  metadado_usuario: '/metadados/usuario'
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
