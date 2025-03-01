// Path: features\auth\components\LoginForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Box, 
  Avatar, 
  Alert, 
  InputAdornment, 
  IconButton 
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../../../hooks/useAuth';

// Form validation schema
const loginSchema = z.object({
  usuario: z.string().min(1, 'Preencha seu usuário'),
  senha: z.string().min(1, 'Preencha sua senha'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const { login, error, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });
  
  const onSubmit = (data: LoginFormValues) => {
    login(data);
  };
  
  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
        <Avatar sx={{ bgcolor: 'primary.main', mb: 2 }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sistema de Apoio à Produção
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
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
          loading={isLoading}
          sx={{ mt: 3, mb: 2 }}
        >
          Entrar
        </LoadingButton>
      </form>
    </Paper>
  );
};