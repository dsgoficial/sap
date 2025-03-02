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
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
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
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Avatar sx={{ bgcolor: 'primary.main', mb: 2 }}>
            <AutoGraphIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sistema de Apoio à Produção
          </Typography>
        </Box>

        {authError && (
          <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
            {authError}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ width: '100%', mt: 1 }}
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
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <LoadingButton
            type="submit"
            fullWidth
            variant="contained"
            loading={isSubmitting}
            sx={{ mt: 3, mb: 2 }}
          >
            Entrar
          </LoadingButton>
        </Box>
      </AuthLayout>
    </Page>
  );
};

export default Login;
