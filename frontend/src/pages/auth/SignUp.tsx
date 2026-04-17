import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  MobileStepper,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Person,
  School,
  CalendarToday,
  Email,
  Phone,
  Lock,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegister } from '../../hooks/auth/useRegister';
import AuthLayout from './AuthLayout';
import { gradientButtonSx } from './authStyles';

const schema = z.object({
  name: z.string().min(3, 'Nombre muy corto'),
  career: z.string().min(2, 'Selecciona una carrera'),
  age: z.number().min(17, 'Edad mínima 17'),
  email: z.string().email('Correo inválido'),
  phone: z.string().min(10, 'Teléfono inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  acceptTerms: z
    .boolean()
    .refine((v) => v, { message: 'Debes aceptar los Términos y Condiciones' }),
});
type FormData = z.infer<typeof schema>;

const STEP1_FIELDS: (keyof FormData)[] = ['name', 'career', 'age'];

export default function SignUpPage() {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const [showPass, setShowPass] = useState(false);
  const [step, setStep] = useState(0); // 0 = datos de perfil, 1 = acceso

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      career: '',
      age: 18,
      email: '',
      phone: '',
      password: '',
      acceptTerms: false,
    },
  });

  useEffect(() => {
    if (registerMutation.isSuccess) {
      navigate('/app', { replace: true });
    }
  }, [registerMutation.isSuccess, navigate]);

  const handleNext = async () => {
    const valid = await trigger(STEP1_FIELDS);
    if (valid) setStep(1);
  };

  const onSubmit = (data: FormData) => {
    registerMutation.mutate(data);
  };

  const accepted = watch('acceptTerms');
  const globalError = registerMutation.isError
    ? registerMutation.error instanceof Error
      ? registerMutation.error.message
      : 'No se pudo crear la cuenta'
    : null;

  return (
    <AuthLayout
      headerLink={
        <Link
          component={RouterLink}
          to="/login"
          underline="none"
          sx={{ color: 'warning.dark', fontWeight: 700 }}
        >
          Acceder
        </Link>
      }
    >
      <Typography variant="h6" fontWeight={800} sx={{ color: 'warning.dark', textAlign: 'center' }}>
        Crear una cuenta
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        {step === 0
          ? 'Cuéntanos un poco sobre ti para personalizar tu experiencia.'
          : 'Ya casi terminas — solo faltan tus datos de acceso.'}
      </Typography>

      {/* Indicador de pasos con dots */}
      <MobileStepper
        variant="dots"
        steps={2}
        position="static"
        activeStep={step}
        nextButton={null}
        backButton={null}
        sx={{ justifyContent: 'center', bgcolor: 'transparent', p: 0 }}
      />

      {globalError && <Alert severity="error">{globalError}</Alert>}

      <Stack component="form" spacing={1.5} onSubmit={handleSubmit(onSubmit)} noValidate>

        {/* ── Paso 1: Datos de perfil ── */}
        {step === 0 && (
          <>
            <TextField
              label="Nombre completo"
              fullWidth
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Carrera"
              select
              fullWidth
              defaultValue=""
              {...register('career')}
              error={!!errors.career}
              helperText={errors.career?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <School />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="ITI">Ing. Tecnologías de la Información</MenuItem>
              <MenuItem value="IGE">Ing. Gestión Empresarial</MenuItem>
              <MenuItem value="II">Ing. Industrial</MenuItem>
              <MenuItem value="ISC">Ing. Sistemas Computacionales</MenuItem>
            </TextField>
            <TextField
              label="Edad"
              type="number"
              fullWidth
              {...register('age', { valueAsNumber: true })}
              error={!!errors.age}
              helperText={errors.age?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday />
                  </InputAdornment>
                ),
              }}
            />
            <Button size="large" onClick={handleNext} sx={gradientButtonSx}>
              Siguiente
            </Button>
          </>
        )}

        {/* ── Paso 2: Datos de acceso ── */}
        {step === 1 && (
          <>
            <TextField
              label="Email"
              type="email"
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
              label="Número de teléfono"
              type="tel"
              fullWidth
              {...register('phone')}
              error={!!errors.phone}
              helperText={errors.phone?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Contraseña"
              type={showPass ? 'text' : 'password'}
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

            <FormControlLabel
              control={<Checkbox {...register('acceptTerms')} />}
              label={
                <Typography variant="body2" color="text.secondary">
                  Acepto los{' '}
                  <Link component={RouterLink} to="/terms" underline="none" sx={{ color: 'warning.dark' }}>
                    Términos y Condiciones
                  </Link>{' '}
                  y la{' '}
                  <Link component={RouterLink} to="/privacy" underline="none" sx={{ color: 'warning.dark' }}>
                    Política de Privacidad
                  </Link>
                  .
                </Typography>
              }
            />
            {errors.acceptTerms && (
              <Typography variant="caption" color="error">
                {errors.acceptTerms.message}
              </Typography>
            )}

            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setStep(0)}
                sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700 }}
              >
                Atrás
              </Button>
              <Button
                type="submit"
                size="large"
                fullWidth
                disabled={!accepted || registerMutation.isPending}
                sx={gradientButtonSx}
              >
                {registerMutation.isPending ? 'Creando cuenta…' : 'Crear cuenta'}
              </Button>
            </Stack>
          </>
        )}
      </Stack>
    </AuthLayout>
  );
}
