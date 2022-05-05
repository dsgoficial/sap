import React from 'react'
import { Route, Navigate } from 'react-router-dom'
import { useAPI } from '../contexts/apiContext'

const PrivateRoute = ({ role, children }) => {
  
  const {
    isAuthenticated,
    getAuthorization
  } = useAPI()

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const userRole = getAuthorization()

  if (role && role !== userRole) {
    return <Navigate to="/login" />
  }

  return children
}

export default PrivateRoute