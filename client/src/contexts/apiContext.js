import { useState, useEffect, createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { createBrowserHistory } from 'history'
import axios from 'axios'

//axios.defaults.baseURL = process.env.REACT_APP_BE_URL;

const APLICACAO = 'sap_web'

const APIContext = createContext('');

const customHistory = createBrowserHistory()

const TOKEN_KEY = '@sap_web-Token'

const USER_AUTHORIZATION_KEY = '@sap_web-User-Authorization'

const USER_UUID_KEY = '@sap_web-User-uuid'

const ROLES = {
  Admin: 'ADMIN',
  User: 'USER'
}

APIProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default function APIProvider({ children }) {

  const axiosInstance = axios.create()

  axiosInstance.defaults.headers.common['Content-Type'] = 'application/json'

  axiosInstance.interceptors.response.use(
    response => response,
    error => errorHandler(error)
  )

  axiosInstance.interceptors.request.use(async config => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  const isAuthenticated = () => {
    return window.localStorage.getItem(TOKEN_KEY) !== null &&
      window.localStorage.getItem(USER_UUID_KEY) !== null &&
      window.localStorage.getItem(USER_AUTHORIZATION_KEY) !== null
  }

  const getToken = () => window.localStorage.getItem(TOKEN_KEY)

  const setToken = token => window.localStorage.setItem(TOKEN_KEY, token)

  const logout = () => {
    window.localStorage.removeItem(TOKEN_KEY)
    window.localStorage.removeItem(USER_UUID_KEY)
    window.localStorage.removeItem(USER_AUTHORIZATION_KEY)
  }

  const getAuthorization = () => window.localStorage.getItem(USER_AUTHORIZATION_KEY)

  const setAuthorization = admin => {
    admin ? window.localStorage.setItem(USER_AUTHORIZATION_KEY, 'ADMIN') : window.localStorage.setItem(USER_AUTHORIZATION_KEY, 'USER')
  }

  const getUUID = () => window.localStorage.getItem(USER_UUID_KEY)

  const setUUID = uuid => window.localStorage.setItem(USER_UUID_KEY, uuid)

  const axiosAll = async requestsObject => {
    const requestsName = []
    const requests = []
    let index = 0
    for (const key in requestsObject) {
      requestsName[index] = key
      requests[index] = requestsObject[key]
      index++
    }

    return new Promise((resolve, reject) => {
      axios.all(requests)
        .then(response => {
          let cancelled = false
          response.forEach(r => {
            if (!r) {
              cancelled = true
            }
          })
          if (cancelled) {
            return resolve(false)
          }

          const responseObject = {}
          response.forEach((r, i) => {
            responseObject[requestsName[i]] = r
          })

          return resolve(responseObject)
        })
        .catch(e => {
          reject(e)
        })
    })
  }

  const handleCancel = func => {
    return async function (url, params) {
      try {
        const response = await axiosInstance[func](url, params)
        return response
      } catch (err) {
        if (!axios.isCancel(err)) {
          throw err
        }
        return false
      }
    }
  }

  const getData = async (url, params) => {
    const response = await handleCancel('get')(
      url,
      params
    )
    if (!response) return false
    if (
      !('status' in response) ||
      response.status !== 200 ||
      !('data' in response) ||
      !('dados' in response.data)
    ) {
      throw new Error()
    }
    return response.data
  }

  const postData = async (url, params) => {
    const response = await handleCancel('post')(
      url,
      params
    )
    if (!response) return false
    return response
  }

  const handleLogin = async (usuario, senha) => {
    const response = await handleCancel('post')('/api/login', { usuario, senha, aplicacao: APLICACAO, cliente: 'sap' })
    if (!response) return false
    if (
      !('status' in response) ||
      response.status !== 201 ||
      !('data' in response) ||
      !('dados' in response.data) ||
      !('token' in response.data.dados) ||
      !('administrador' in response.data.dados)
    ) {
      throw new Error()
    }
    setToken(response.data.dados.token)
    setAuthorization(response.data.dados.administrador)
    setUUID(response.data.dados.uuid)
    return true
  }

  const errorHandler = error => {
    if (error.response && [401, 403].indexOf(error.response.status) !== -1) {
      logout()
      customHistory.push('/')
      throw new axios.Cancel('Operation canceled by redirect due 401/403.')
    }
    if (error.response && [500].indexOf(error.response.status) !== -1) {
      customHistory.push('/erro')
      throw new axios.Cancel('Operation canceled by redirect due 500.')
    }
    return Promise.reject(error)
  }

  const handleApiError = (err) => {
    if (
      'response' in err &&
      'data' in err.response &&
      'message' in err.response.data
    ) {
      return { status: 'error', msg: err.response.data.message, date: new Date() }
    } else {
      return { status: 'error', msg: 'Ocorreu um erro ao se comunicar com o servidor.', date: new Date() }
    }
  }

  return (
    <APIContext.Provider
      value={{
        history: customHistory,
        handleLogin,
        logout,
        handleApiError,
        isAuthenticated,
        getAuthorization,
        history: customHistory,
        getData,
        postData
      }}>
      {children}
    </APIContext.Provider>
  );
}

export const useAPI = () => useContext(APIContext)