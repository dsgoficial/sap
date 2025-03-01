// Path: features\auth\routes\Login.tsx
import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { 
  Container, 
  TextField, 
  Button, 
  Box, 
  Avatar, 
  Typography, 
  Alert 
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSnackbar } from 'notistack';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import Page from '@/components/Page';
import { useAuthStore } from '@/stores/authStore';

// Form validation schema
const loginSchema = z.object({
  usuario: z.string().min(1, 'Preencha seu usuário'),
  senha: z.string().min(1, 'Preencha sua senha'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();
  const { isAuthenticated, login } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  
  // Get the random image number (1-5) for consistent layout with the original
  const [randomImageNumber] = useState(() => Math.floor(Math.random() * 5) + 1);

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usuario: '',
      senha: ''
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const success = await login(data);
      if (success) {
        enqueueSnackbar('Login realizado com sucesso!', { variant: 'success' });
        // Navigate is handled by the auth store
      } else {
        setError('Usuário ou senha inválidos');
        enqueueSnackbar('Usuário e Senha não encontrados!', { variant: 'error' });
      }
    } catch (error) {
      setError('Erro ao fazer login. Tente novamente.');
      enqueueSnackbar('Falha na autenticação', { variant: 'error' });
    }
  };

  // Redirect if already authenticated
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return (
    <Page title="Sistema de Apoio à Produção">
      {/* Use AuthLayout with our random background image number */}
      <AuthLayout backgroundImageNumber={randomImageNumber}>
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mb: 2 }}>
            <AutoGraphIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sistema de Apoio à Produção
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%', mt: 1 }}>
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
            type="password"
            autoComplete="current-password"
            {...register('senha')}
            error={!!errors.senha}
            helperText={errors.senha?.message}
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