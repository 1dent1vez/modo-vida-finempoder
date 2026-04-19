import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, GraduationCap, Calendar, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { useRegister } from '../../hooks/auth/useRegister';
import AuthLayout from './AuthLayout';
import { Input } from '../../shared/components/ui/input';
import { gradientButtonClass } from './authStyles';
import { cn } from '@/lib/utils';

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

const CAREERS = [
  { value: 'ITI', label: 'Ing. Tecnologías de la Información' },
  { value: 'IGE', label: 'Ing. Gestión Empresarial' },
  { value: 'II', label: 'Ing. Industrial' },
  { value: 'ISC', label: 'Ing. Sistemas Computacionales' },
];

export default function SignUpPage() {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const [showPass, setShowPass] = useState(false);
  const [step, setStep] = useState(0);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { name: '', career: '', age: 18, email: '', phone: '', password: '', acceptTerms: false },
  });

  useEffect(() => {
    if (registerMutation.isSuccess) navigate('/app', { replace: true });
  }, [registerMutation.isSuccess, navigate]);

  const handleNext = async () => {
    const valid = await trigger(STEP1_FIELDS);
    if (valid) setStep(1);
  };

  const onSubmit = (data: FormData) => { registerMutation.mutate(data); };

  const accepted = watch('acceptTerms');
  const globalError = registerMutation.isError
    ? registerMutation.error instanceof Error
      ? registerMutation.error.message
      : 'No se pudo crear la cuenta'
    : null;

  return (
    <AuthLayout
      headerLink={
        <Link to="/login" className="text-sm font-bold text-[var(--color-brand-secondary-dark)] hover:underline">
          Acceder
        </Link>
      }
    >
      <h1 className="text-center text-lg font-extrabold text-[var(--color-brand-secondary-dark)]">
        Crear una cuenta
      </h1>
      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        {step === 0
          ? 'Cuéntanos un poco sobre ti para personalizar tu experiencia.'
          : 'Ya casi terminas — solo faltan tus datos de acceso.'}
      </p>

      {/* Step dots */}
      <div className="flex justify-center gap-2">
        {[0, 1].map((s) => (
          <div key={s} className={cn('h-2 w-2 rounded-full transition-colors', step === s ? 'bg-[var(--color-brand-secondary-dark)]' : 'bg-black/25')} />
        ))}
      </div>

      {globalError && (
        <div role="alert" className="rounded-xl bg-[var(--color-brand-error-bg)] border border-[var(--color-brand-error)] px-4 py-3 text-sm text-[var(--color-brand-error)]">
          {globalError}
        </div>
      )}

      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)} noValidate>
        {step === 0 && (
          <>
            <Input label="Nombre completo" leftIcon={<User />} error={errors.name?.message} {...register('name')} />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-[var(--color-text-primary)]">Carrera</label>
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute left-3 flex items-center text-[var(--color-neutral-400)] [&_svg]:h-4 [&_svg]:w-4">
                  <GraduationCap className="h-4 w-4" />
                </span>
                <select
                  {...register('career')}
                  className={cn(
                    'w-full appearance-none rounded-xl border bg-white pl-10 pr-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent',
                    errors.career ? 'border-[var(--color-brand-error)]' : 'border-[var(--color-neutral-200)]'
                  )}
                >
                  <option value="">Selecciona una carrera</option>
                  {CAREERS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              {errors.career && <p className="text-xs text-[var(--color-brand-error)]">{errors.career.message}</p>}
            </div>

            <Input label="Edad" type="number" leftIcon={<Calendar />} error={errors.age?.message} {...register('age', { valueAsNumber: true })} />

            <button type="button" onClick={handleNext} className={gradientButtonClass}>
              Siguiente
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <Input label="Email" type="email" leftIcon={<Mail />} error={errors.email?.message} {...register('email')} />
            <Input label="Número de teléfono" type="tel" leftIcon={<Phone />} error={errors.phone?.message} {...register('phone')} />

            <Input
              label="Contraseña"
              type={showPass ? 'text' : 'password'}
              leftIcon={<Lock />}
              error={errors.password?.message}
              rightElement={
                <button type="button" onClick={() => setShowPass((v) => !v)} aria-label="mostrar u ocultar contraseña" className="text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              {...register('password')}
            />

            <div className="flex items-start gap-3">
              <input
                id="acceptTerms"
                type="checkbox"
                {...register('acceptTerms')}
                className="mt-0.5 h-4 w-4 rounded accent-[var(--color-brand-primary)]"
              />
              <label htmlFor="acceptTerms" className="text-sm text-[var(--color-text-secondary)]">
                Acepto los{' '}
                <Link to="/terms" className="font-semibold text-[var(--color-brand-secondary-dark)] hover:underline">Términos y Condiciones</Link>{' '}
                y la{' '}
                <Link to="/privacy" className="font-semibold text-[var(--color-brand-secondary-dark)] hover:underline">Política de Privacidad</Link>.
              </label>
            </div>
            {errors.acceptTerms && <p className="text-xs text-[var(--color-brand-error)]">{errors.acceptTerms.message}</p>}

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(0)} className="flex-1 rounded-2xl border border-[var(--color-neutral-200)] py-3 text-sm font-bold transition-colors hover:bg-[var(--color-neutral-50)]">
                Atrás
              </button>
              <button type="submit" disabled={!accepted || registerMutation.isPending} className={cn('flex-1', gradientButtonClass)}>
                {registerMutation.isPending ? 'Creando cuenta…' : 'Crear cuenta'}
              </button>
            </div>
          </>
        )}
      </form>
    </AuthLayout>
  );
}
