// Path: features\auth\routes\Login.tsx
import { useState } from 'react';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
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
  Button,
  alpha,
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
import { useThemeMode } from '@/contexts/ThemeContext';

// Form validation schema
const loginSchema = z.object({
  usuario: z.string().min(1, 'Preencha seu usuário'),
  senha: z.string().min(1, 'Preencha sua senha'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, login, error: authError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();
  const { isDarkMode } = useThemeMode();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Get redirect path from query params (React Router v7 style)
  const from = searchParams.get('from') || '/';

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
    const loginResult = await login(data);
    // The login function now correctly returns a promise that resolves to a boolean
    if (loginResult) {
      // Use navigate in React Router v7 style
      navigate(from, { replace: true });
    }
  };

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <Page title="Login | Sistema de Apoio à Produção">
      {/* Use AuthLayout with our random background image number */}
      <AuthLayout backgroundImageNumber={randomImageNumber}>
        <Container maxWidth="xs" sx={{ py: isMobile ? 2 : 8 }}>
          <Paper
            elevation={isDarkMode ? 24 : 3}
            sx={{
              p: isMobile ? 2 : 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 2,
              // Paper styling with proper dark/light mode support
              backdropFilter: 'blur(10px)',
              backgroundColor: isDarkMode
                ? alpha(theme.palette.background.paper, 0.8)
                : 'rgba(255, 255, 255, 0.9)',
              boxShadow: isDarkMode
                ? '0 8px 32px rgba(0, 0, 0, 0.5)'
                : theme.shadows[3],
              border: `1px solid ${
                isDarkMode
                  ? alpha(theme.palette.common.white, 0.1)
                  : alpha(theme.palette.common.black, 0.05)
              }`,
              transition: theme.transitions.create(
                ['background-color', 'box-shadow', 'border'],
                { duration: theme.transitions.duration.standard },
              ),
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
                sx={{
                  bgcolor: theme.palette.primary.main,
                  mb: 2,
                  width: 56,
                  height: 56,
                  boxShadow: isDarkMode
                    ? '0 0 20px rgba(119, 176, 241, 0.5)'
                    : 'none',
                }}
              >
                <AutoGraphIcon fontSize={isMobile ? 'medium' : 'large'} />
              </Avatar>
              <Typography
                component="h1"
                variant={isMobile ? 'h5' : 'h4'}
                align="center"
                sx={{
                  mb: 1,
                  color: theme.palette.text.primary,
                  fontWeight: 500,
                }}
              >
                Sistema de Apoio à Produção
              </Typography>
            </Box>

            {authError && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  width: '100%',
                  backgroundColor: isDarkMode
                    ? alpha(theme.palette.error.dark, 0.2)
                    : undefined,
                  color: isDarkMode ? theme.palette.error.light : undefined,
                  '& .MuiAlert-icon': {
                    color: isDarkMode ? theme.palette.error.light : undefined,
                  },
                }}
                variant={isDarkMode ? 'outlined' : 'filled'}
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
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: isDarkMode
                        ? alpha(theme.palette.common.white, 0.2)
                        : alpha(theme.palette.common.black, 0.2),
                    },
                    '&:hover fieldset': {
                      borderColor: isDarkMode
                        ? alpha(theme.palette.common.white, 0.3)
                        : alpha(theme.palette.common.black, 0.3),
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.palette.text.secondary,
                  },
                  '& .MuiInputBase-input': {
                    color: theme.palette.text.primary,
                  },
                }}
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: isDarkMode
                        ? alpha(theme.palette.common.white, 0.2)
                        : alpha(theme.palette.common.black, 0.2),
                    },
                    '&:hover fieldset': {
                      borderColor: isDarkMode
                        ? alpha(theme.palette.common.white, 0.3)
                        : alpha(theme.palette.common.black, 0.3),
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.palette.text.secondary,
                  },
                  '& .MuiInputBase-input': {
                    color: theme.palette.text.primary,
                  },
                }}
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
                        sx={{
                          color: theme.palette.action.active,
                        }}
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
                disabled={isSubmitting}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: isMobile ? 1 : 1.5,
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                  boxShadow: isDarkMode
                    ? '0 4px 20px rgba(119, 176, 241, 0.3)'
                    : theme.shadows[2],
                }}
              >
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>
            </Box>
          </Paper>
        </Container>
      </AuthLayout>
    </Page>
  );
};

export default Login;
