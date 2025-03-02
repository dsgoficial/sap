// Path: features\auth\routes\Login.tsx
import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {
  Box,
  TextField,
  Avatar,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Container,
  Paper,
  useMediaQuery,
  useTheme,
  Button
} from '@mui/material';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import Page from '@/components/Page/Page';
import { useAuth } from '@/hooks/useAuth';

// Form validation schema
const loginSchema = z.object({
  usuario: z.string().min(1, 'Preencha seu usuário'),
  senha: z.string().min(1, 'Preencha sua senha'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const location = useLocation();
  const { isAuthenticated, login, error: authError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Get the random image number (1-5) for consistent layout with the original
  const [randomImageNumber] = useState(() => Math.floor(Math.random() * 5) + 1);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usuario: '',
      senha: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    login(data);
  };

  // Redirect if already authenticated
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return (
    <Page title="Login | Sistema de Apoio à Produção">
      {/* Use AuthLayout with our random background image number */}
      <AuthLayout backgroundImageNumber={randomImageNumber}>
        <Container maxWidth="xs" sx={{ py: isMobile ? 2 : 8 }}>
          <Paper
            elevation={3}
            sx={{
              p: isMobile ? 2 : 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 2,
              boxShadow: theme.shadows[2],
              backdropFilter: 'blur(5px)',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            }}
          >
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Avatar
                sx={{ bgcolor: 'primary.main', mb: 2, width: 56, height: 56 }}
              >
                <AutoGraphIcon fontSize={isMobile ? 'medium' : 'large'} />
              </Avatar>
              <Typography
                component="h1"
                variant={isMobile ? 'h5' : 'h4'}
                align="center"
                sx={{ mb: 1 }}
              >
                Sistema de Apoio à Produção
              </Typography>
            </Box>

            {authError && (
              <Alert
                severity="error"
                sx={{ mb: 2, width: '100%' }}
                variant="filled"
              >
                {authError}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              sx={{ width: '100%', mt: 1 }}
              noValidate
            >
              <TextField
                margin="normal"
                fullWidth
                id="usuario"
                label="Usuário"
                autoComplete="username"
                autoFocus
                {...register('usuario')}
                error={!!errors.usuario}
                helperText={errors.usuario?.message}
                variant={isMobile ? 'outlined' : 'standard'}
                sx={{ mb: 2 }}
                InputProps={{
                  sx: { fontSize: isMobile ? '0.9rem' : '1rem' },
                }}
              />

              <TextField
                margin="normal"
                fullWidth
                id="senha"
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                {...register('senha')}
                error={!!errors.senha}
                helperText={errors.senha?.message}
                variant={isMobile ? 'outlined' : 'standard'}
                InputProps={{
                  sx: { fontSize: isMobile ? '0.9rem' : '1rem' },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        aria-label={
                          showPassword ? 'Hide password' : 'Show password'
                        }
                      >
                        {showPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                loading={isSubmitting}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: isMobile ? 1 : 1.5,
                  fontSize: isMobile ? '0.9rem' : '1rem',
                }}
              >
                Entrar
              </Button>
            </Box>
          </Paper>
        </Container>
      </AuthLayout>
    </Page>
  );
};

export default Login;
