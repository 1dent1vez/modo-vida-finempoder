// FinEmpoder — Onboarding de nombre post-login (F4-NOMBRE-PERFIL).
// El nombre vive SOLO en user_metadata de Supabase (auth.updateUser) y se
// rehidrata al store vía onAuthStateChange (main.tsx): no hay tabla profiles.
// Aquí vive la lógica pura: el flag "una sola vez" y la validación del input.

export const NAME_ASKED_KEY = 'fe_name_asked';

/** Patrón de emojis del repo (misma regla de la réplica del mockup:
 *  pictogramas extendidos, flags, tonos de piel, ZWJ y variación). */
export const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

/** Letras (incluye acentos y ñ), marcas, espacios, guiones y apóstrofos. */
export const NAME_RE = /^[\p{L}\p{M}'\-\s]+$/u;

/** true si el nombre (tras trim) es válido: no vacío, sin emojis y solo
 *  caracteres permitidos. Sirve para apellidos compuestos en México. */
export function isValidName(raw: string): boolean {
  const name = raw.trim();
  return name.length > 0 && !EMOJI_RE.test(name) && NAME_RE.test(name);
}

/** true si ya se preguntó el nombre (omitido o guardado); nunca reaparece. */
export function nameAsked(): boolean {
  if (typeof window === 'undefined') return true;
  return window.localStorage.getItem(NAME_ASKED_KEY) === '1';
}

/** Marca que ya se preguntó el nombre; persiste entre sesiones. */
export function markNameAsked(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(NAME_ASKED_KEY, '1');
  } catch {
    // localStorage no disponible: el prompt podría repetirse, no bloquea la app.
  }
}
