// Path: features\auth\components\AuthStatus.tsx
import { useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Avatar,
  styled
} from '@mui/material';
import { useAuthStore } from '../../../stores/authStore';
import { formatInitials } from '../../../utils/formatters';

interface AuthStatusProps {
  showRole?: boolean;
  showAvatar?: boolean;
  vertical?: boolean;
}

const StatusContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'vertical'
})<{ vertical: boolean }>(({ theme, vertical }) => ({
  display: 'flex',
  flexDirection: vertical ? 'column' : 'row',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

export const AuthStatus = ({ 
  showRole = true, 
  showAvatar = true,
  vertical = false
}: AuthStatusProps) => {
  const { user, isAuthenticated } = useAuthStore();
  
  const roleColor = useMemo(() => {
    if (!user?.role) return 'default';
    return user.role === 'ADMIN' ? 'primary' : 'success';
  }, [user?.role]);
  
  const roleName = useMemo(() => {
    if (!user?.role) return 'Não autenticado';
    return user.role === 'ADMIN' ? 'Administrador' : 'Usuário';
  }, [user?.role]);
  
  // Fallback para nome de usuário
  const username = user?.username || 'Usuário';
  const initials = formatInitials(username);
  
  if (!isAuthenticated) {
    return (
      <StatusContainer vertical={vertical}>
        <Chip 
          label="Não autenticado" 
          color="error" 
          size="small" 
        />
      </StatusContainer>
    );
  }
  
  return (
    <StatusContainer vertical={vertical}>
      {showAvatar && (
        <Avatar 
          sx={{ 
            width: 32, 
            height: 32, 
            bgcolor: roleColor === 'primary' ? 'primary.main' : 'success.main',
            fontSize: '0.875rem'
          }}
        >
          {initials}
        </Avatar>
      )}
      
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 'medium',
            lineHeight: 1.2
          }}
        >
          {username}
        </Typography>
        
        {showRole && (
          <Chip 
            label={roleName} 
            color={roleColor} 
            size="small" 
            sx={{ height: 20 }}
          />
        )}
      </Box>
    </StatusContainer>
  );
};