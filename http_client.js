'use strict'

const axios = require('axios')
const { HttpsProxyAgent } = require('https-proxy-agent')

/**
 * Cria uma instância do axios configurada com suporte a proxy
 *
 * O proxy é configurado através das variáveis de ambiente:
 * - HTTP_PROXY ou http_proxy
 * - HTTPS_PROXY ou https_proxy
 * - NO_PROXY ou no_proxy (lista de hosts separados por vírgula que não devem usar proxy)
 *
 * @param {Object} options - Opções adicionais para o axios
 * @returns {import('axios').AxiosInstance} Instância do axios configurada
 */
const createHttpClient = (options = {}) => {
  const proxyUrl =
    process.env.HTTPS_PROXY ||
    process.env.https_proxy ||
    process.env.HTTP_PROXY ||
    process.env.http_proxy

  const config = {
    timeout: 30000,
    ...options
  }

  if (proxyUrl) {
    const httpsAgent = new HttpsProxyAgent(proxyUrl)
    config.httpsAgent = httpsAgent
    config.httpAgent = httpsAgent
    config.proxy = false
  }

  return axios.create(config)
}

/**
 * Instância padrão do httpClient para uso geral
 * Configurada automaticamente com proxy se as variáveis de ambiente estiverem definidas
 */
const httpClient = createHttpClient()

const isBrowser = typeof window !== 'undefined' && window && window.location

const tryParseUrl = (value) => {
  try {
    return new URL(value)
  } catch {
    return null
  }
}

const isLocalhostHost = (host) => {
  const h = String(host || '').toLowerCase()
  return h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0'
}

/**
 * Normaliza URLs absolutas incorretas (ex.: http://localhost:3013/api/...)
 * para a mesma origem do navegador, preservando path/query/hash.
 * Se a URL for relativa, retorna como está.
 * Se não for ambiente browser, retorna como está.
 *
 * @param {string} url
 * @returns {string}
 */
const normalizeClientUrl = (url) => {
  if (!isBrowser) return url

  const parsed = tryParseUrl(url)
  if (!parsed) return url

  if (isLocalhostHost(parsed.hostname)) {
    const origem = window.location.origin
    return `${origem}${parsed.pathname}${parsed.search}${parsed.hash}`
  }

  return url
}

/**
 * Verifica se uma URL deve ignorar o proxy baseado em NO_PROXY.
 * Importante: em ambiente browser, "localhost/127.0.0.1" NUNCA deve ser considerado
 * bypass seguro, porque "localhost" aponta para a máquina do usuário, não para o servidor.
 *
 * @param {string} url - URL a ser verificada
 * @returns {boolean} true se deve ignorar o proxy
 */
const shouldBypassProxy = (url) => {
  const noProxy = process.env.NO_PROXY || process.env.no_proxy
  if (!noProxy) return false

  const urlObj = tryParseUrl(url)
  if (!urlObj) return false

  if (isBrowser && isLocalhostHost(urlObj.hostname)) {
    return false
  }

  const hostname = String(urlObj.hostname || '').toLowerCase()
  const noProxyList = noProxy
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean)

  return noProxyList.some((pattern) => {
    if (pattern === '*') return true
    if (pattern.startsWith('.')) {
      return hostname.endsWith(pattern) || hostname === pattern.slice(1)
    }
    return hostname === pattern || hostname.endsWith('.' + pattern)
  })
}

/**
 * Faz uma requisição GET com suporte a proxy
 * @param {string} url - URL para requisição
 * @param {Object} config - Configurações adicionais do axios
 * @returns {Promise} Promise com a resposta
 */
const get = async (url, config = {}) => {
  const normalizedUrl = normalizeClientUrl(url)

  if (shouldBypassProxy(normalizedUrl)) {
    return axios.get(normalizedUrl, { timeout: 30000, ...config })
  }

  return httpClient.get(normalizedUrl, config)
}

/**
 * Faz uma requisição POST com suporte a proxy
 * @param {string} url - URL para requisição
 * @param {Object} data - Dados a serem enviados
 * @param {Object} config - Configurações adicionais do axios
 * @returns {Promise} Promise com a resposta
 */
const post = async (url, data, config = {}) => {
  const normalizedUrl = normalizeClientUrl(url)

  if (shouldBypassProxy(normalizedUrl)) {
    return axios.post(normalizedUrl, data, { timeout: 30000, ...config })
  }

  return httpClient.post(normalizedUrl, data, config)
}

module.exports = {
  httpClient,
  createHttpClient,
  get,
  post,
  shouldBypassProxy,
  normalizeClientUrl
}
