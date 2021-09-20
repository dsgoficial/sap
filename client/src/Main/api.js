import { auth } from '../services'

const handleLogout = async () => {
  auth.logout()
}

export { handleLogout }
