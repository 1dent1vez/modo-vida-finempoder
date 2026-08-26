// FinEmpoder — Onboarding de nombre post-login (F4-NOMBRE-PERFIL).
// Se muestra tras login con Magic Link/OTP (el usuario se crea solo con
// email, sin name). Guarda con supabase.auth.updateUser y el store se
// rehidrata solo vía onAuthStateChange (main.tsx): no hay tabla profiles.
// Modal suave NO bloqueante (mismo patrón que AchievementModal y
// NewsletterPrompt): aria-modal=false, fondo translúcido y overlay con
// pointer-events-none para poder navegar la app con el diálogo abierto.

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { isValidName, markNameAsked, nameAsked } from '@/lib/namePrompt';
import { useAuth } from '@/store/auth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const SAVE_ERROR = 'No pudimos guardar tu nombre. Inténtalo de nuevo.';
const INVALID_HINT = 'Usa solo letras, espacios, guiones y apóstrofos.';

export function NamePromptDialog() {
  const token = useAuth((s) => s.token);
  const user = useAuth((s) => s.user);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token && user && !user.name && !nameAsked()) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [token, user]);

  if (!open) return null;

  const valid = isValidName(name);

  const close = () => {
    markNameAsked();
    setOpen(false);
  };

  const save = async () => {
    if (!valid || status === 'saving') return;
    setStatus('saving');
    setError(null);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { name: name.trim() },
      });
      if (updateError) throw updateError;
      markNameAsked();
      setOpen(false);
    } catch {
      setError(SAVE_ERROR);
      setStatus('idle');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="¿Cómo te llamas?"
      className="pointer-events-none fixed inset-0 z-[1500] flex items-center justify-center bg-black/30 p-4 backdrop-blur-[2px]"
    >
      <div className="pointer-events-auto relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-[var(--shadow-lg)]">
        <button
          type="button"
          onClick={close}
          aria-label="Cerrar"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-text-primary)]"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <h2 className="text-lg font-extrabold">¿Cómo te llamas?</h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Así te saludamos en la app. Puedes omitirlo si prefieres.
        </p>

        <div className="mt-4 flex flex-col gap-3">
          <Input
            label="Tu nombre"
            placeholder="Tu nombre"
            maxLength={60}
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={name.trim().length > 0 && !valid ? INVALID_HINT : undefined}
          />

          {error ? <p className="text-xs text-[var(--color-brand-error)]">{error}</p> : null}

          <Button
            className="min-h-11 w-full"
            disabled={!valid || status === 'saving'}
            onClick={save}
          >
            {status === 'saving' ? 'Guardando...' : 'Guardar'}
          </Button>

          <button
            type="button"
            onClick={close}
            className="min-h-10 text-sm font-semibold text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
          >
            Omitir
          </button>
        </div>
      </div>
    </div>
  );
}
