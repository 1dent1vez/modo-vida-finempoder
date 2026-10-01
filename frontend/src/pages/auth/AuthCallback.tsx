import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/auth';
import { Spinner } from '@/shared/components/Spinner';

export default function AuthCallback() {
  const navigate = useNavigate();
  const token = useAuth((s) => s.token);
  const hasHydrated = useAuth((s) => s.hydrated);
  const [timedOut, setTimedOut] = useState(false);

  // supabase-js detecta la sesión en el hash de la URL (detectSessionInUrl) y
  // dispara onAuthStateChange, que hidrata el store en main.tsx. Solo
  // esperamos a que token + hydrated estén listos antes de navegar.
  useEffect(() => {
    if (token && hasHydrated) {
      navigate('/app', { replace: true });
    }
  }, [token, hasHydrated, navigate]);

  // Timeout defensivo: si Supabase no detecta sesión en ~10s, ofrecer reintentar.
  useEffect(() => {
    const id = window.setTimeout(() => setTimedOut(true), 10_000);
    return () => window.clearTimeout(id);
  }, []);

  if (timedOut) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-[var(--color-text-secondary)]">Algo salió mal, intenta de nuevo.</p>
        <Link to="/auth" className="text-sm font-bold text-[var(--color-brand-secondary-dark)] hover:underline">
          Volver a entrar
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-sm text-[var(--color-text-secondary)]">Entrando…</p>
    </div>
  );
}
