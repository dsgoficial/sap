// Path: lib\config.js
'use strict'

const path = require('path')
const os = require('os')

// A aplicacao registrada no servico de autenticacao. O login_schema aceita
// 'sap_fp' (SAP_Fluxo_Producao), 'sap_fg' (SAP_Fluxo_Gerencia) e 'sap'.
//
// 'sap' e o cliente correto para um agente: o proprio schema PROIBE plugins e
// qgis nesse caso (Joi.forbidden()), enquanto sap_fp e sap_fg os EXIGEM, e ai o
// CLI teria que inventar uma versao de QGIS que nao usa. Ver `sap schema login`.
const CLIENTE_AUTH = 'sap'

// Onde o token fica em cache entre invocacoes. Fora do repo e fora do vault: e
// credencial, nunca versionada. Um arquivo por servidor, para nao misturar o
// token da instancia local com o de producao.
function caminhoSessao (server) {
  const dir = path.join(os.homedir(), '.sap')
  const chave = String(server)
    .replace(/^https?:\/\//, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
  return { dir, arquivo: path.join(dir, `sessao-${chave}.json`) }
}

/**
 * Resolve a configuracao a partir das flags e do ambiente, nesta ordem: flag
 * explicita > variavel de ambiente. Nunca de arquivo versionado.
 *
 * Chaves de ambiente (catalogo em env-guia.md do vault):
 *   SAP_SERVER  URL do backend, ex.: http://IP:PORTA
 *   SAP_USER    login de admin
 *   SAP_SENHA   senha (preferir esta a passar --senha na linha de comando)
 *   SAP_TOKEN   JWT pronto (pula o login)
 */
function resolver (flags, exigirServidor = true) {
  const server = flags.server || process.env.SAP_SERVER

  // Com --dry-run nada sai da maquina: a validacao local contra o Joi roda sem
  // servidor, sem credencial e sem rede. Exigir URL ai seria pedir configuracao
  // para uma operacao offline, e tirar do agente o jeito mais barato de conferir
  // um corpo antes de tentar de verdade.
  if (!server && exigirServidor) {
    throw new Error(
      'Informe --server ou a variavel de ambiente SAP_SERVER (ex.: http://IP:PORTA).'
    )
  }

  return {
    server: server ? String(server).replace(/\/+$/, '') : null,
    usuario: flags.user || process.env.SAP_USER || null,
    senha: flags.senha || process.env.SAP_SENHA || null,
    token: flags.token || process.env.SAP_TOKEN || null,
    insecure: flags.insecure === true,
    semCache: flags['sem-cache'] === true,
    cliente: flags.cliente && flags.cliente !== true ? flags.cliente : CLIENTE_AUTH
  }
}

module.exports = { resolver, caminhoSessao, CLIENTE_AUTH }
