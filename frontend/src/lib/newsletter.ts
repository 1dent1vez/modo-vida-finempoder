// FinEmpoder — Lógica de captura de email (F3-CRECIMIENTO).
// Trigger: al sumar 3+ tiers VISTOS en 'fe_badges_state' se ofrece el
// newsletter UNA sola vez; 'fe_newsletter_asked' lo desactiva para siempre.

import { readSeenBadges } from './badgeCelebration';

export const NEWSLETTER_ASKED_KEY = 'fe_newsletter_asked';
export const NEWSLETTER_TRIGGER_TIERS = 3;

/** Suma de tiers vistos en 'fe_badges_state' (fuente estable del disparo). */
export function sumaTiersExplorados(): number {
  return Object.values(readSeenBadges()).reduce((total, tier) => total + tier, 0);
}

/** true si el usuario ya vio (y cerró/suscribió) el prompt del newsletter. */
export function newsletterAsked(): boolean {
  if (typeof window === 'undefined') return true;
  return window.localStorage.getItem(NEWSLETTER_ASKED_KEY) === '1';
}

/** Marca el prompt como visto; nunca vuelve a aparecer. */
export function markNewsletterAsked(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(NEWSLETTER_ASKED_KEY, '1');
  } catch {
    // localStorage no disponible: el prompt podría repetirse, no bloquea la app.
  }
}

/** Validación básica de email (misma del input type="email"). */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}
