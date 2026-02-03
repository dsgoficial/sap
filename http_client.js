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
  const proxyUrl = process.env.HTTPS_PROXY ||
                   process.env.https_proxy ||
                   process.env.HTTP_PROXY ||
                   process.env.http_proxy

  const config = {
    timeout: 30000, // 30 segundos de timeout padrão
    ...options
  }

  // Se há proxy configurado, adiciona o agente
  if (proxyUrl) {
    const httpsAgent = new HttpsProxyAgent(proxyUrl)
    config.httpsAgent = httpsAgent
    config.httpAgent = httpsAgent
    // Desabilita o proxy nativo do axios para usar o agente
    config.proxy = false
  }

  return axios.create(config)
}

/**
 * Instância padrão do httpClient para uso geral
 * Configurada automaticamente com proxy se as variáveis de ambiente estiverem definidas
 */
const httpClient = createHttpClient()

/**
 * Verifica se uma URL deve ignorar o proxy baseado em NO_PROXY
 * @param {string} url - URL a ser verificada
 * @returns {boolean} true se deve ignorar o proxy
 */
const shouldBypassProxy = (url) => {
  const noProxy = process.env.NO_PROXY || process.env.no_proxy
  if (!noProxy) return false

  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname
    const noProxyList = noProxy.split(',').map(h => h.trim().toLowerCase())

    return noProxyList.some(pattern => {
      if (pattern === '*') return true
      if (pattern.startsWith('.')) {
        // Wildcard domain (e.g., .example.com)
        return hostname.endsWith(pattern) || hostname === pattern.slice(1)
      }
      return hostname === pattern || hostname.endsWith('.' + pattern)
    })
  } catch {
    return false
  }
}

/**
 * Faz uma requisição GET com suporte a proxy
 * @param {string} url - URL para requisição
 * @param {Object} config - Configurações adicionais do axios
 * @returns {Promise} Promise com a resposta
 */
const get = async (url, config = {}) => {
  if (shouldBypassProxy(url)) {
    return axios.get(url, { timeout: 30000, ...config })
  }
  return httpClient.get(url, config)
}

/**
 * Faz uma requisição POST com suporte a proxy
 * @param {string} url - URL para requisição
 * @param {Object} data - Dados a serem enviados
 * @param {Object} config - Configurações adicionais do axios
 * @returns {Promise} Promise com a resposta
 */
const post = async (url, data, config = {}) => {
  if (shouldBypassProxy(url)) {
    return axios.post(url, data, { timeout: 30000, ...config })
  }
  return httpClient.post(url, data, config)
}

module.exports = {
  httpClient,
  createHttpClient,
  get,
  post,
  shouldBypassProxy
}
