import { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { createBrowserHistory } from 'history'
import { useSnackbar } from 'notistack';
import { useAxios } from './axiosContext';

const APLICACAO = 'sap_web'

const APIContext = createContext('');

const customHistory = createBrowserHistory()

const TOKEN_KEY = '@sap_web-Token'

const USER_AUTHORIZATION_KEY = '@sap_web-User-Authorization'

const USER_UUID_KEY = '@sap_web-User-uuid'


APIProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default function APIProvider({ children }) {

  // variant could be success, error, warning, info, or default
  const { enqueueSnackbar } = useSnackbar();

  const { callAxios } = useAxios()

  const isAuthenticated = () => {
    return window.localStorage.getItem(TOKEN_KEY) !== null &&
      window.localStorage.getItem(USER_UUID_KEY) !== null &&
      window.localStorage.getItem(USER_AUTHORIZATION_KEY) !== null
  }

  //const getToken = () => window.localStorage.getItem(TOKEN_KEY)

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

  //const getUUID = () => window.localStorage.getItem(USER_UUID_KEY)

  const setUUID = uuid => window.localStorage.setItem(USER_UUID_KEY, uuid)

  const handleError = (error) => {
    if ([401, 403].includes(error.response.status)) {
      logout()
      customHistory.go('/login')
    }
  }

  const login = async (usuario, senha) => {
    const response = await callAxios(
      '/api/login',
      "POST",
      { usuario, senha, aplicacao: APLICACAO, cliente: 'sap' }
    );
    if (response.error) {
      enqueueSnackbar('Usuário e Senha não encontrado!', { variant: 'error' });
      return
    }
    setToken(response.data.dados.token)
    setAuthorization(response.data.dados.administrador)
    setUUID(response.data.dados.uuid)
    return true
  }

  const getCurrentActivity = async (url) => {
    const response = await callAxios(
      '/api/distribuicao/verifica',
      "GET",
      {}
    );
    if (response.error) {
      handleError(response.error)
      return
    }
    return response.data
  }

  const startActivity = async (url) => {
    const response = await callAxios(
      '/api/distribuicao/inicia',
      "POST",
      {}
    );
    if (response.error) {
      handleError(response.error)
      return
    }
    return response.data
  }

  const finishActivity = async (activityId) => {
    const response = await callAxios(
      '/api/distribuicao/finaliza',
      "POST",
      {
        'atividade_id': activityId,
        'sem_correcao': false,
      }
    );
    if (response.error) {
      handleError(response.error)
      return
    }
    return response.data
  }

  const reportError = async (activityId, errorInfo) => {
    const response = await callAxios(
      '/api/distribuicao/problema_atividade',
      "POST",
      {
        'atividade_id': activityId,
        ...errorInfo
      }
    );
    if (response.error) {
      handleError(response.error)
      return
    }
    return response.data
  }

  const getErrorTypes = async () => {
    const response = await callAxios(
      '/api/distribuicao/tipo_problema',
      "GET",
      {}
    );
    if (response.error) {
      handleError(response.error)
      return
    }
    return response.data
  }

  const getStatisticsGrid = async () => {
    const response = await callAxios(
      '/api/acompanhamento/grade_acompanhamento/',
      "GET",
      {}
    );
    if (response.error) {
      handleError(response.error)
      return
    }
    return response.data
  }

  const getActivitySubphase = async () => {
    const response = await callAxios(
      '/api/acompanhamento/atividade_subfase',
      "GET",
      {}
    );
    if (response.error) {
      handleError(response.error)
      return
    }
    return response.data
  }

  const getUserActivities = async () => {
    const response = await callAxios(
      '/api/acompanhamento/atividade_usuario',
      "GET",
      {}
    );
    if (response.error) {
      handleError(response.error)
      return
    }
    return response.data
  }

  const getLots = async () => {
    const response = await callAxios(
      `/api/acompanhamento/pit/subfase/${new Date().getFullYear()}`,
      "GET",
      {}
    );
    if (response.error) {
      handleError(response.error)
      return
    }
    return response.data
  }

  const getSubphasesSituation = async () => {
    const response = await callAxios(
      `/api/acompanhamento/situacao_subfase`,
      "GET",
      {}
    );
    if (response.error) {
      handleError(response.error)
      return
    }
    return response.data
  }

  const getPIT = async () => {
    const response = await callAxios(
      `/api/acompanhamento/pit/${new Date().getFullYear()}`,
      "GET",
      {}
    );
    if (response.error) {
      handleError(response.error)
      return
    }
    return response.data
  }

  const getDashboard = async () => {
    const allReponse = await Promise.all([
      callAxios(
        `/api/acompanhamento/dashboard/quantidade/${new Date().getFullYear()}`,
        "GET",
        {}
      ),
      callAxios(
        `/api/acompanhamento/dashboard/finalizadas/${new Date().getFullYear()}`,
        "GET",
        {}
      ),
      callAxios(
        `/api/acompanhamento/dashboard/execucao`,
        "GET",
        {}
      ),
      callAxios(
        `/api/acompanhamento/pit/${new Date().getFullYear()}`,
        "GET",
        {}
      ),
    ])

    let hasError = allReponse.find(res => res.error)
    if (hasError) {
      handleError(hasError.error)
      return
    }
    return allReponse.map(res => res.data)
  }

  return (
    <APIContext.Provider
      value={{
        history: customHistory,
        login,
        logout,
        isAuthenticated,
        getAuthorization,
        getCurrentActivity,
        startActivity,
        finishActivity,
        reportError,
        getErrorTypes,
        getStatisticsGrid,
        getActivitySubphase,
        getUserActivities,
        getLots,
        getSubphasesSituation,
        getPIT,
        getDashboard
      }}>
      {children}
    </APIContext.Provider>
  );
}

export const useAPI = () => useContext(APIContext)