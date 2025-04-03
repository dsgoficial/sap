// Path: features\auth\components\AuthStatus.tsx
import { useMemo } from 'react';
import { Box, Chip, styled } from '@mui/material';
import { useIsAuthenticated, useUser } from '@/stores/authStore';

interface AuthStatusProps {
  showRole?: boolean;
  vertical?: boolean;
}

const StatusContainer = styled(Box, {
  shouldForwardProp: prop => prop !== 'vertical',
})<{ vertical: boolean }>(({ theme, vertical }) => ({
  display: 'flex',
  flexDirection: vertical ? 'column' : 'row',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

export const AuthStatus = ({
  showRole = true,
  vertical = false,
}: AuthStatusProps) => {
  // Use custom hooks for better performance
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();

  const roleColor = useMemo(() => {
    if (!user?.role) return 'default';
    return user.role === 'ADMIN' ? 'primary' : 'success';
  }, [user?.role]);

  const roleName = useMemo(() => {
    if (!user?.role) return 'Não autenticado';
    return user.role === 'ADMIN' ? 'Administrador' : 'Usuário';
  }, [user?.role]);

  if (!isAuthenticated) {
    return (
      <StatusContainer vertical={vertical}>
        <Chip label="Não autenticado" color="error" size="small" />
      </StatusContainer>
    );
  }

  return (
    <StatusContainer vertical={vertical}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
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
