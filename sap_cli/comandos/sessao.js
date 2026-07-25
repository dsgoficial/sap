// Path: comandos\sessao.js
'use strict'

// `sap login`, `sap logout`, `sap status`.
//
// O token do SAP vale 10 horas (login_ctrl.js, expiresIn '10h'). Sem cache, cada
// invocacao do CLI faz um POST /api/login novo: numa sessao de fechamento de mes
// com dez lancamentos sao dez autenticacoes, e a senha precisa estar no ambiente
// o tempo todo. Com cache, autentica uma vez.
//
// Isso nao economiza contexto (o login nunca foi verboso). Economiza latencia e
// reduz a exposicao da credencial, que sao motivos suficientes por si.

const http = require('../lib/http')
const { caminhoSessao } = require('../lib/config')

async function executar (args, cfg) {
  const comando = args._[0]

  if (comando === 'logout') {
    const removeu = http.limparSessao(cfg)
    return {
      texto: removeu
        ? `Sessao encerrada para ${cfg.server}.`
        : `Nao havia sessao em cache para ${cfg.server}.`
    }
  }

  if (comando === 'status') {
    const linhas = [`servidor   ${cfg.server}`]

    // Probe publico (GET /api): nao exige credencial, so diz se o SAP esta de pe
    // e em que versao esta o banco.
    try {
      const r = await http.requisitar(cfg, 'GET', '')
      const d = r.dados || {}
      linhas.push(`backend    no ar (sap ${d.sap_version || '?'}, banco ${d.database_version || '?'}` +
        `, microcontrole ${d.microcontrole_version || '?'})`)
    } catch (err) {
      linhas.push(`backend    INACESSIVEL (${err.message})`)
      linhas.push('')
      linhas.push('O SAP pode estar fora do ar ou fora de alcance desta maquina.')
      linhas.push('Isso e transitorio: nao registre como "a ferramenta nao funciona".')
      return { texto: linhas.join('\n') }
    }

    const token = http.lerSessao(cfg)
    if (token) {
      const exp = http.expiracaoDoToken(token)
      const restante = exp ? Math.max(0, exp - Math.floor(Date.now() / 1000)) : null
      linhas.push(`sessao     em cache${restante !== null ? `, expira em ${Math.floor(restante / 60)} min` : ''}`)
    } else {
      linhas.push('sessao     nenhuma em cache (o proximo comando autenticado fara login)')
    }
    linhas.push(`cache em   ${caminhoSessao(cfg.server).arquivo}`)
    linhas.push(`usuario    ${cfg.usuario || '(nao definido; use SAP_USER)'}`)
    linhas.push(`cliente    ${cfg.cliente}`)
    return { texto: linhas.join('\n') }
  }

  // login
  const { token, administrador } = await http.autenticar(cfg)
  http.gravarSessao(cfg, token)
  const exp = http.expiracaoDoToken(token)
  const minutos = exp ? Math.floor((exp - Math.floor(Date.now() / 1000)) / 60) : 600

  const avisos = administrador
    ? []
    : ['Autenticou, porem NAO como administrador. Quase toda escrita do SAP exige ' +
       'verifyAdmin e vai voltar 403; a leitura publica continua funcionando.']

  return {
    texto: `Autenticado em ${cfg.server} como ${cfg.usuario}` +
      `${administrador ? ' (admin)' : ''}, cliente "${cfg.cliente}". ` +
      `Sessao em cache por ~${minutos} min; os proximos comandos nao pedem senha.`,
    avisos
  }
}

module.exports = { executar, precisaServidor: true }
