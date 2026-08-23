import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, KeyRound } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../store/auth';
import AuthLayout from './AuthLayout';
import { Input } from '../../shared/components/ui/input';
import { gradientButtonClass } from './authStyles';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_SECONDS = 30;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

const googleButtonClass =
  'flex w-full items-center justify-center gap-3 rounded-2xl border border-[var(--color-neutral-200)] bg-white py-3 font-bold text-[var(--color-text-primary)] transition-all hover:bg-[var(--color-neutral-50)]';

type View = 'email' | 'otp';

export default function AuthScreen() {
  const navigate = useNavigate();
  const token = useAuth((s) => s.token);
  const hasHydrated = useAuth((s) => s.hydrated);

  const [view, setView] = useState<View>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);

  // Espera a que onAuthStateChange haya rehidratado el store (token + hydrated)
  // antes de navegar, evitando la race condition que causa pantalla blanca.
  // Cubre: sesión ya activa al entrar, OTP verificado y callback de Google.
  useEffect(() => {
    if (token && hasHydrated) {
      navigate('/app', { replace: true });
    }
  }, [token, hasHydrated, navigate]);

  // Cuenta regresiva para reenviar el código mientras estamos en la vista OTP.
  useEffect(() => {
    if (view !== 'otp') return;
    setResendIn(RESEND_SECONDS);
    const id = window.setInterval(() => {
      setResendIn((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [view]);

  const handleGoogle = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback' },
    });
    if (error) {
      console.error('[auth] Google OAuth error:', error);
      setError('No pudimos conectar con Google. Inténtalo de nuevo.');
    }
  };

  const handleSendCode = async () => {
    if (!EMAIL_REGEX.test(email)) {
      setError('Escribe un correo válido.');
      return;
    }
    setError(null);
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setSending(false);
    if (error) {
      console.error('[auth] signInWithOtp error:', error);
      setError('No pudimos enviar el código. Revisa el correo e inténtalo de nuevo.');
      return;
    }
    setView('otp');
  };

  const handleResend = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) {
      setError('No pudimos reenviar el código. Inténtalo de nuevo.');
      return;
    }
    setResendIn(RESEND_SECONDS);
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setError(null);
    setVerifying(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });
    setVerifying(false);
    if (error) {
      console.error('[auth] verifyOtp error:', error);
      setError('El código no es válido o ya expiró. Revisa el correo o reenvía el código.');
    }
    // Éxito: supabase-js dispara onAuthStateChange y main.tsx hidrata el store;
    // el efecto de arriba navega a /app cuando token + hydrated estén listos.
  };

  return (
    <AuthLayout>
      <div className="space-y-5">
        <div className="text-center">
          <h1 className="text-center text-lg font-extrabold text-[var(--color-brand-secondary-dark)]">
            Bienvenido a FinEmpoder
          </h1>
          <p className="mt-1 text-center text-sm text-[var(--color-text-secondary)]">
            Sin contraseñas. Tu progreso se sincroniza solo.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-[var(--color-brand-error)] bg-[var(--color-brand-error-bg)] px-4 py-3 text-sm text-[var(--color-brand-error)]"
          >
            {error}
          </div>
        )}

        {view === 'email' ? (
          <>
            <button type="button" onClick={handleGoogle} className={googleButtonClass}>
              <GoogleIcon />
              Continuar con Google
            </button>

            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-[var(--color-neutral-200)]" />
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">o</span>
              <span className="h-px flex-1 bg-[var(--color-neutral-200)]" />
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                Entra con tu correo
              </p>
              <Input
                label="Correo electrónico"
                type="email"
                autoComplete="email"
                leftIcon={<Mail />}
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={sending}
                className={gradientButtonClass}
              >
                {sending ? 'Enviando…' : 'Enviar código'}
              </button>
            </div>

            <p className="text-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-sm text-[var(--color-text-secondary)] underline underline-offset-2 hover:text-[var(--color-brand-secondary-dark)]"
              >
                Explorar sin cuenta
              </button>
            </p>
          </>
        ) : (
          <>
            <p className="text-center text-sm text-[var(--color-text-secondary)]">
              Te enviamos un código de 6 dígitos a{' '}
              <span className="font-semibold text-[var(--color-text-primary)]">{email}</span>.
            </p>

            <div className="space-y-3">
              <Input
                label="Código de 6 dígitos"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="••••••"
                leftIcon={<KeyRound />}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
              <button
                type="button"
                onClick={handleVerify}
                disabled={verifying || code.length !== 6}
                className={gradientButtonClass}
              >
                {verifying ? 'Verificando…' : 'Entrar'}
              </button>
            </div>

            <div className="space-y-2 text-center text-sm">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendIn > 0}
                className="font-semibold text-[var(--color-brand-secondary-dark)] underline underline-offset-2 disabled:cursor-not-allowed disabled:no-underline disabled:text-[var(--color-text-secondary)]"
              >
                {resendIn > 0 ? `Reenviar código en ${resendIn}s` : 'Reenviar código'}
              </button>
              <div>
                <button
                  type="button"
                  onClick={() => setView('email')}
                  className="text-[var(--color-text-secondary)] underline underline-offset-2 hover:text-[var(--color-brand-secondary-dark)]"
                >
                  Usar otro correo
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
