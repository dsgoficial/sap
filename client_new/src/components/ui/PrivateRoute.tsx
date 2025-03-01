// Path: components\ui\PrivateRoute.tsx
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { UserRole } from '../../types/auth';

interface PrivateRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

export const PrivateRoute = ({ 
  children, 
  requiredRole 
}: PrivateRouteProps) => {
  const { isAuthenticated, getRole } = useAuthStore();
  const location = useLocation();
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    // Redirect to login page with redirect back to current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check if specific role is required
  if (requiredRole) {
    const userRole = getRole();
    
    if (userRole !== requiredRole) {
      // Redirect to unauthorized page or dashboard
      return <Navigate to="/" replace />;
    }
  }
  
  // User is authenticated and has proper role, render children
  return <>{children}</>;
};