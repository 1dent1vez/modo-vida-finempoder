import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '../../hooks/auth/useLogin';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import AuthLayout from './AuthLayout';
import { Input } from '../../shared/components/ui/input';
import { gradientButtonClass } from './authStyles';

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
        <Link to="/signup" className="text-sm font-bold text-[var(--color-brand-secondary-dark)] hover:underline">
          Registrarse
        </Link>
      }
    >
      <h1 className="text-center text-lg font-extrabold text-[var(--color-brand-secondary-dark)]">
        Bienvenido de nuevo
      </h1>
      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        Inicia sesión para continuar tu aprendizaje y sincronizar tu progreso.
      </p>

      {login.isError && (
        <div role="alert" className="rounded-xl bg-[var(--color-brand-error-bg)] border border-[var(--color-brand-error)] px-4 py-3 text-sm text-[var(--color-brand-error)]">
          {(login.error as Error)?.message ?? 'Error al iniciar sesión'}
        </div>
      )}

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          leftIcon={<Mail />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Contraseña"
          type={showPass ? 'text' : 'password'}
          autoComplete="current-password"
          leftIcon={<Lock />}
          error={errors.password?.message}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              aria-label="mostrar u ocultar contraseña"
              className="text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
            >
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          {...register('password')}
        />

        <button
          type="submit"
          disabled={login.isPending || !isValid}
          className={gradientButtonClass}
        >
          {login.isPending ? 'Conectando…' : 'Iniciar sesión'}
        </button>
      </form>
    </AuthLayout>
  );
}
