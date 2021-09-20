import axios from 'axios'
import auth from './auth'
import history from './history'

const APLICACAO = 'sap_web'

const axiosInstance = axios.create()

axiosInstance.defaults.headers.common['Content-Type'] = 'application/json'

axiosInstance.interceptors.request.use(async config => {
  const token = auth.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const errorHandler = error => {
  if (error.response && [401, 403].indexOf(error.response.status) !== -1) {
    auth.logout()
    history.push('/')
    throw new axios.Cancel('Operation canceled by redirect due 401/403.')
  }
  if (error.response && [500].indexOf(error.response.status) !== -1) {
    history.push('/erro')
    throw new axios.Cancel('Operation canceled by redirect due 500.')
  }
  return Promise.reject(error)
}

axiosInstance.interceptors.response.use(
  response => response,
  error => errorHandler(error)
)

const api = {}

api.APLICACAO = APLICACAO

api.axios = axios

api.axiosAll = async requestsObject => {
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

api.post = handleCancel('post')
api.get = handleCancel('get')
api.put = handleCancel('put')
api.delete = handleCancel('delete')

api.getData = async (url, params) => {
  const response = await api.get(url, params)
  if (!response) return false

  if (
    !('status' in response) ||
    response.status !== 200 ||
    !('data' in response) ||
    !('dados' in response.data)
  ) {
    throw new Error()
  }
  return response.data.dados
}

export default api
