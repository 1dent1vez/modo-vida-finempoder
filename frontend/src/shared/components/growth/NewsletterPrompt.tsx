// FinEmpoder — Captura de email tras el 3er logro (F3-CRECIMIENTO).
// Modal suave no bloqueante, UNA sola vez. Al suscribirse guarda el email en
// Dexie (local, synced:false) y muestra una confirmación honesta: el
// newsletter aún no arranca, no se promete nada falso (ver F3_CRECIMIENTO.md).

import { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import { newsletterRepository } from '../../../db/newsletter.repository';
import {
  isValidEmail,
  markNewsletterAsked,
  newsletterAsked,
  NEWSLETTER_TRIGGER_TIERS,
  sumaTiersExplorados,
} from '../../../lib/newsletter';
import { track, EVENTOS } from '../../../lib/analytics';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export const CONSENT_TEXT =
  'Sí, quiero recibir tips semanales gratis. Sin spam, puedes darte de baja cuando quieras.';

/** Confirmación honesta: describe el estado real (captura local, backend pendiente). */
export const CONFIRMATION_TEXT =
  '¡Listo! Cuando arranquemos el newsletter, tus tips llegarán aquí.';

export function NewsletterPrompt() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const maybeOpen = () => {
      if (newsletterAsked()) return;
      if (sumaTiersExplorados() >= NEWSLETTER_TRIGGER_TIERS) setOpen(true);
    };
    maybeOpen();
    window.addEventListener('fe:badges-state-updated', maybeOpen);
    return () => window.removeEventListener('fe:badges-state-updated', maybeOpen);
  }, []);

  const dismiss = () => {
    markNewsletterAsked();
    setOpen(false);
  };

  const subscribe = async () => {
    if (!isValidEmail(email) || !consent || status === 'saving') return;
    setStatus('saving');
    setError(null);
    try {
      await newsletterRepository.subscribe(email.trim().toLowerCase());
      track(EVENTOS.NEWSLETTER_SUBSCRIBED, { source: 'app' });
      markNewsletterAsked();
      setStatus('done');
    } catch {
      setError('No pudimos guardar tu correo. Inténtalo de nuevo.');
      setStatus('idle');
    }
  };

  if (!open) return null;

  const validEmail = isValidEmail(email);

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Newsletter FinEmpoder"
      className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/30 p-4 backdrop-blur-[2px]"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-[var(--shadow-lg)]">
        {status === 'done' ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand-success-bg)] text-[var(--color-brand-success)]">
              <Mail className="h-7 w-7" aria-hidden="true" />
            </span>
            <h2 className="text-lg font-extrabold">Listo</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">{CONFIRMATION_TEXT}</p>
            <Button className="min-h-11 w-full" onClick={dismiss}>
              Cerrar
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-extrabold">¿Un tip financiero cada semana?</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Cada semana, un consejo práctico para tu dinero, directo en tu correo.
            </p>

            <Input
              type="email"
              label="Tu correo"
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={
                email.trim().length > 0 && !validEmail
                  ? 'Escribe un correo válido, por ejemplo nombre@correo.com'
                  : undefined
              }
            />

            <label className="flex items-start gap-2 text-xs leading-snug text-[var(--color-text-secondary)]">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-brand-primary)]"
              />
              <span>{CONSENT_TEXT}</span>
            </label>

            {error ? <p className="text-xs text-[var(--color-brand-error)]">{error}</p> : null}

            <Button
              className="min-h-11 w-full"
              disabled={!validEmail || !consent || status === 'saving'}
              onClick={subscribe}
            >
              {status === 'saving' ? 'Guardando...' : 'Suscribirme'}
            </Button>

            <button
              type="button"
              onClick={dismiss}
              className="min-h-10 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              Ahora no
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
