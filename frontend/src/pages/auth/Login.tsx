import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useLogin } from '../../hooks/auth/useLogin';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Alert,
  Button,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import AuthLayout from './AuthLayout';
import { gradientButtonSx } from './authStyles';

const schema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const [showPass, setShowPass] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (login.isSuccess) navigate('/app');
  }, [login.isSuccess, navigate]);

  const onSubmit = (values: FormData) => {
    login.mutate({ email: values.email, password: values.password });
  };

  return (
    <AuthLayout
      headerLink={
        <Link
          component={RouterLink}
          to="/signup"
          underline="none"
          sx={{ color: 'warning.dark', fontWeight: 700 }}
        >
          Registrarse
        </Link>
      }
    >
      <Typography variant="h6" fontWeight={800} sx={{ color: 'warning.dark', textAlign: 'center' }}>
        Bienvenido de nuevo
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        Inicia sesión para continuar tu aprendizaje y sincronizar tu progreso.
      </Typography>

      {login.isError && (
        <Alert severity="error">
          {(login.error as Error)?.message ?? 'Error al iniciar sesión'}
        </Alert>
      )}

      <Stack component="form" noValidate onSubmit={handleSubmit(onSubmit)} spacing={1.5}>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          fullWidth
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Contraseña"
          type={showPass ? 'text' : 'password'}
          autoComplete="current-password"
          fullWidth
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password?.message}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label="mostrar u ocultar contraseña"
                >
                  {showPass ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          size="large"
          disabled={login.isPending || !isValid}
          sx={gradientButtonSx}
        >
          {login.isPending ? 'Conectando…' : 'Iniciar sesión'}
        </Button>
      </Stack>
    </AuthLayout>
  );
}
