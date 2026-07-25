// Path: lib\http.js
'use strict'

const http = require('http')
const https = require('https')
const zlib = require('zlib')
const fs = require('fs')
const { URL } = require('url')

const { caminhoSessao } = require('./config')

// O SAP faz operacoes de lote pesadas (criar milhares de atividades a partir de
// um lote inteiro). 2 min nao basta: o `atividades/todas` de um lote grande ja
// passou disso. 10 min e o teto.
const TIMEOUT_MS = 600000

// Margem de seguranca antes da expiracao do JWT. O SAP assina com 10h
// (login_ctrl.js, expiresIn '10h'); 5 min de folga sobra para um encadeamento.
const FOLGA_EXPIRACAO_S = 300

class ErroHttp extends Error {
  constructor (status, mensagem, payload) {
    super(`HTTP ${status}: ${mensagem}`)
    this.name = 'ErroHttp'
    this.status = status
    this.mensagem = mensagem
    this.payload = payload
  }
}

/** Descomprime o corpo conforme o content-encoding, se houver. */
function descomprimir (bruto, codificacao) {
  try {
    if (codificacao === 'gzip') return zlib.gunzipSync(bruto)
    if (codificacao === 'deflate') return zlib.inflateSync(bruto)
    if (codificacao === 'br') return zlib.brotliDecompressSync(bruto)
  } catch (e) {
    // Cabecalho mentiu sobre a compressao: melhor devolver os bytes crus e
    // deixar o JSON.parse falhar com o texto real do que estourar aqui.
  }
  return bruto
}

/**
 * Faz uma requisicao ao backend e desembrulha o envelope padrao do SAP
 * ({ version, success, message, dados }), montado em utils/send_json_and_log.js.
 *
 * Devolve { status, message, dados } no sucesso; lanca ErroHttp no erro, ja com
 * a mensagem que o AppError do servidor produz (as validacoes de Joi chegam aqui
 * prontas, campo a campo: nao reembrulhar, so propagar).
 */
function requisitar (cfg, metodo, caminho, opcoes = {}) {
  const { corpo, token, binario } = opcoes
  const url = new URL(cfg.server + '/api' + caminho)
  const cliente = url.protocol === 'https:' ? https : http

  const cabecalhos = {
    Accept: 'application/json',
    // O SAP gzipa resposta grande. Pedir 'identity' evita depender da
    // descompressao, mas o servidor pode ignorar: por isso a defesa em
    // descomprimir() continua existindo.
    'Accept-Encoding': 'identity'
  }
  let dados = null

  if (corpo !== undefined && corpo !== null) {
    dados = Buffer.from(JSON.stringify(corpo), 'utf8')
    cabecalhos['Content-Type'] = 'application/json'
    cabecalhos['Content-Length'] = dados.length
  }
  // O SAP le o token cru de req.headers.authorization; validate_token.js tambem
  // aceita o prefixo 'Bearer ' (fatia os 7 primeiros caracteres). Mandamos cru,
  // que e a forma que todos os clients do repo usam.
  if (token) cabecalhos.authorization = token

  const opcoesReq = { method: metodo, headers: cabecalhos, timeout: TIMEOUT_MS }
  // Servidor HTTPS com certificado self-signed na rede interna.
  if (cfg.insecure && url.protocol === 'https:') {
    opcoesReq.rejectUnauthorized = false
  }

  return new Promise((resolve, reject) => {
    const req = cliente.request(url, opcoesReq, res => {
      const pedacos = []
      res.on('data', d => pedacos.push(d))
      res.on('end', () => {
        const bruto = descomprimir(
          Buffer.concat(pedacos), res.headers['content-encoding']
        )

        if (binario && res.statusCode >= 200 && res.statusCode < 300) {
          return resolve({ status: res.statusCode, bytes: bruto })
        }

        const texto = bruto.toString('utf8')
        let payload = null
        try {
          payload = JSON.parse(texto)
        } catch (e) {
          payload = texto
        }

        if (res.statusCode >= 200 && res.statusCode < 300) {
          const message = payload && typeof payload === 'object' ? payload.message : null
          const conteudo = payload && typeof payload === 'object' && 'dados' in payload
            ? payload.dados
            : payload
          return resolve({ status: res.statusCode, message, dados: conteudo })
        }

        const mensagem = (payload && typeof payload === 'object'
          ? payload.message || payload.error
          : null) || texto.slice(0, 300) || 'sem corpo na resposta'
        reject(new ErroHttp(res.statusCode, mensagem, payload))
      })
    })

    req.on('timeout', () => {
      req.destroy(new Error(`tempo esgotado (${TIMEOUT_MS} ms)`))
    })
    req.on('error', err => {
      reject(new Error(
        `Nao foi possivel falar com ${cfg.server}: ${err.message}. ` +
        'O SAP pode estar fora do ar ou inacessivel desta maquina (verifique o ' +
        'alcance de rede). Se a resposta vier como HTML em vez de JSON, e o ' +
        'proxy da rede interceptando: exporte NO_PROXY com o host do SAP.'
      ))
    })

    if (dados) req.write(dados)
    req.end()
  })
}

// ---------------------------------------------------------------------------
// Sessao (cache do token entre invocacoes)
// ---------------------------------------------------------------------------

/** Le o `exp` do JWT sem validar assinatura: so queremos saber quando expira. */
function expiracaoDoToken (token) {
  try {
    const parte = String(token).split('.')[1]
    if (!parte) return null
    const json = Buffer.from(parte.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
      .toString('utf8')
    const payload = JSON.parse(json)
    return typeof payload.exp === 'number' ? payload.exp : null
  } catch (e) {
    return null
  }
}

function lerSessao (cfg) {
  const { arquivo } = caminhoSessao(cfg.server)
  try {
    const dados = JSON.parse(fs.readFileSync(arquivo, 'utf8'))
    const agora = Math.floor(Date.now() / 1000)
    if (!dados.token || !dados.exp || dados.exp - FOLGA_EXPIRACAO_S <= agora) {
      return null
    }
    return dados.token
  } catch (e) {
    return null
  }
}

function gravarSessao (cfg, token) {
  const { dir, arquivo } = caminhoSessao(cfg.server)
  const exp = expiracaoDoToken(token) || Math.floor(Date.now() / 1000) + 35700
  try {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 })
    // mode 0600: credencial e so do dono. No Windows o modo e ignorado pelo SO,
    // mas o arquivo fica no perfil do usuario, que ja e o escopo dele.
    fs.writeFileSync(arquivo, JSON.stringify({ token, exp }), { mode: 0o600 })
  } catch (e) {
    // Cache e otimizacao, nunca requisito: se nao der para gravar, seguimos
    // autenticando a cada chamada em vez de falhar.
  }
}

function limparSessao (cfg) {
  const { arquivo } = caminhoSessao(cfg.server)
  try {
    fs.unlinkSync(arquivo)
    return true
  } catch (e) {
    return false
  }
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

async function autenticar (cfg) {
  if (!cfg.usuario || !cfg.senha) {
    throw new Error(
      'Faltam credenciais. Defina SAP_USER e SAP_SENHA no ambiente (preferido, ' +
      'mantem a senha fora da linha de comando), ou passe --user e --senha, ou ' +
      'um --token pronto.'
    )
  }

  // Corpo montado conforme login_schema.login: com cliente 'sap' os campos
  // plugins e qgis sao Joi.forbidden(), entao mandar qualquer um deles daria 400.
  let resposta
  try {
    resposta = await requisitar(cfg, 'POST', '/login', {
      corpo: { usuario: cfg.usuario, senha: cfg.senha, cliente: cfg.cliente }
    })
  } catch (err) {
    if (err instanceof ErroHttp) {
      throw new Error(
        `Falha no login (HTTP ${err.status}): ${err.mensagem}. ` +
        `Confira o usuario, a senha e se a aplicacao "${cfg.cliente}" esta ` +
        'cadastrada e ativa no servico de autenticacao (o SAP delega a ' +
        'verificacao). Outro cliente aceito: --cliente sap_fg.'
      )
    }
    throw err
  }

  const dados = resposta.dados || {}
  if (!dados.token) throw new Error('O login respondeu sem token.')
  return { token: dados.token, administrador: !!dados.administrador }
}

/**
 * Devolve um token valido, reusando o cache quando possivel.
 * Ordem: --token/SAP_TOKEN > cache em disco > login novo.
 */
async function obterToken (cfg) {
  if (cfg.token) return cfg.token

  if (!cfg.semCache) {
    const emCache = lerSessao(cfg)
    if (emCache) return emCache
  }

  const { token } = await autenticar(cfg)
  if (!cfg.semCache) gravarSessao(cfg, token)
  return token
}

/** Requisicao autenticada: resolve o token (cache ou login) e chama. */
async function autenticada (cfg, metodo, caminho, opcoes = {}) {
  const token = await obterToken(cfg)
  try {
    return await requisitar(cfg, metodo, caminho, { ...opcoes, token })
  } catch (err) {
    // Token em cache rejeitado (expirou antes da folga, ou o servidor reiniciou
    // com outro JWT_SECRET): descarta e tenta uma vez com token novo.
    if (err instanceof ErroHttp && err.status === 401 && !cfg.token) {
      limparSessao(cfg)
      const { token: novo } = await autenticar(cfg)
      if (!cfg.semCache) gravarSessao(cfg, novo)
      return requisitar(cfg, metodo, caminho, { ...opcoes, token: novo })
    }
    throw err
  }
}

/** Monta a query string, omitindo chaves nulas/indefinidas. */
function query (params) {
  const partes = Object.entries(params || {})
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
  return partes.length ? '?' + partes.join('&') : ''
}

module.exports = {
  ErroHttp,
  requisitar,
  autenticada,
  autenticar,
  obterToken,
  limparSessao,
  lerSessao,
  gravarSessao,
  expiracaoDoToken,
  descomprimir,
  query
}
