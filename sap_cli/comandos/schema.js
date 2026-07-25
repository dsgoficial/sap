// Path: comandos\schema.js
'use strict'

// `sap schema [recurso]` - imprime o contrato de um recurso, montado de duas
// fontes vivas do server/: a FORMA vem do Joi (joi.describe) e a DESCRICAO de
// cada rota vem dos blocos @swagger. Nenhuma das duas e copiada.
//
// E o comando que substitui a leitura preventiva de documentacao. Sem ele, um
// agente que vai lancar uma atividade de campo precisa carregar um catalogo de
// rotas para descobrir onze campos. Com ele, le so o recurso que vai usar, e
// sem gastar rede nem credencial.

const { RECURSOS, obter } = require('../lib/recursos')
const esquema = require('../lib/schema')
const spec = require('../lib/spec')
const { GERAL, VERBOS } = require('../lib/regras')

function executar (args) {
  const chave = args._[1]

  if (!chave) {
    const linhas = [
      'Recursos do SAP. Detalhe de um deles: sap schema <recurso>',
      '',
      esquema.indice(RECURSOS),
      '',
      'verbos de intencao (contrato proprio, veja sap <verbo> --ajuda)',
      '  producao   estado do PIT do ano, producao e nao-producao juntas',
      '  secao2     Secao 2 do RPCMTec em markdown',
      '  finalizar  lancamento retroativo de atividade (modo local)',
      '  lote       fechar / pipeline de configuracao de lote novo',
      '  dominio    tabelas de dominio (os codigos de status, fase, situacao...)',
      '',
      'geral',
      ...GERAL.map(l => (l ? '  ' + l : ''))
    ]
    return { texto: linhas.join('\n') }
  }

  if (VERBOS[chave]) {
    return {
      texto: [`${chave}  -  verbo de intencao`, '', ...VERBOS[chave].map(l => '  ' + l)].join('\n')
    }
  }

  // O login nao e um recurso (nao tem CRUD), mas o contrato dele e a primeira
  // coisa que quebra numa integracao nova: o Joi.when() de plugins/qgis.
  if (chave === 'login') {
    const modulo = require(require('path').join(
      require('../lib/recursos').RAIZ_SERVER, 'login', 'login_schema'
    ))
    const linhas = ['login  -  autenticacao', '']
    const p = spec.prosa('login', 'POST', '/api/login')
    linhas.push('operacoes')
    linhas.push('  POST   /api/login')
    if (p && p.summary) linhas.push('           ' + p.summary)
    linhas.push('')
    linhas.push('corpo  (* = obrigatorio)')
    linhas.push(...esquema.alinhar(esquema.camposDe(modulo.login)))
    linhas.push('')
    linhas.push('regras de negocio')
    linhas.push(...require('../lib/regras').REGRAS.login.map(l => '  ' + l))
    return { texto: linhas.join('\n') }
  }

  const recurso = obter(chave)
  return { texto: esquema.contrato(chave, recurso) }
}

module.exports = { executar, precisaServidor: false }
