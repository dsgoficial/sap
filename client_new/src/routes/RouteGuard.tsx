// Path: routes\RouteGuard.tsx
import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuthStore } from '../stores/authStore';
import { UserRole } from '../types/auth';
import { validateToken } from '../services/authService';

interface RouteGuardProps {
  children: ReactNode;
  requiredRole?: UserRole;
  fallbackPath?: string;
}

/**
 * Componente que verifica a autenticação do usuário e os papéis necessários
 * para acessar uma rota, com validação de token e redirecionamento
 */
export const RouteGuard = ({ 
  children, 
  requiredRole,
  fallbackPath = '/login'
}: RouteGuardProps) => {
  const { isAuthenticated, getRole, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Verificar token e autenticação ao montar o componente
  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        // Redirecionar para login se não estiver autenticado
        navigate(fallbackPath, { 
          state: { from: location.pathname },
          replace: true 
        });
        return;
      }
      
      try {
        // Validar o token com o servidor
        const isValid = await validateToken();
        
        if (!isValid) {
          // Token inválido, fazer logout
          logout();
          navigate(fallbackPath, { 
            state: { from: location.pathname },
            replace: true 
          });
          return;
        }
        
        // Verificar papel necessário
        if (requiredRole) {
          const userRole = getRole();
          
          if (userRole !== requiredRole) {
            // Sem permissão, redirecionar para página inicial
            navigate('/', { replace: true });
            return;
          }
        }
      } catch (error) {
        console.error('Error validating token:', error);
        logout();
        navigate(fallbackPath, { 
          state: { from: location.pathname },
          replace: true 
        });
      }
    };
    
    checkAuth();
  }, [isAuthenticated, getRole, requiredRole, navigate, location.pathname, logout, fallbackPath]);
  
  // Mostrar carregamento enquanto verifica autenticação
  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return <>{children}</>;
};