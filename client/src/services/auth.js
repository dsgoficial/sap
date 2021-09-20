const TOKEN_KEY = '@sap_web-Token'

const USER_AUTHORIZATION_KEY = '@sap_web-User-Authorization'

const USER_UUID_KEY = '@sap_web-User-uuid'

const auth = {}

auth.isAuthenticated = () => window.localStorage.getItem(TOKEN_KEY) !== null &&
  window.localStorage.getItem(USER_UUID_KEY) !== null &&
  window.localStorage.getItem(USER_AUTHORIZATION_KEY) !== null

auth.getToken = () => window.localStorage.getItem(TOKEN_KEY)

auth.setToken = token => window.localStorage.setItem(TOKEN_KEY, token)

auth.logout = () => {
  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(USER_UUID_KEY)
  window.localStorage.removeItem(USER_AUTHORIZATION_KEY)
}

auth.getAuthorization = () => window.localStorage.getItem(USER_AUTHORIZATION_KEY)

auth.setAuthorization = admin => {
  admin ? window.localStorage.setItem(USER_AUTHORIZATION_KEY, 'ADMIN') : window.localStorage.setItem(USER_AUTHORIZATION_KEY, 'USER')
}

auth.getUUID = () => window.localStorage.getItem(USER_UUID_KEY)

auth.setUUID = uuid => window.localStorage.setItem(USER_UUID_KEY, uuid)

auth.ROLES = {
  Admin: 'ADMIN',
  User: 'USER'
}

export default auth
