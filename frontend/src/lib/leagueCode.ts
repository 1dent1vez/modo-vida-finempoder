// FinEmpoder — Códigos de invitación y semana local de las ligas (F4-LIGAS).
// Sin librerías: crypto.getRandomValues del navegador y getters LOCALES.
import { localDayKey } from '@/lib/localDate';

/**
 * Alfabeto de códigos SIN caracteres ambiguos: sin O/0/I/1 para que los
 * códigos sean fáciles de dictar y escribir. 32 símbolos, divisor exacto de
 * 2^32 → el módulo de Uint32 no introduce sesgo.
 */
export const INVITE_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const INVITE_CODE_LENGTH = 6;

/** Genera un código de invitación de 6 caracteres (criptográficamente aleatorio). */
export function generateInviteCode(): string {
  const bytes = new Uint32Array(INVITE_CODE_LENGTH);
  crypto.getRandomValues(bytes);
  let code = '';
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    code += INVITE_CODE_ALPHABET[bytes[i] % INVITE_CODE_ALPHABET.length];
  }
  return code;
}

/** Normaliza la entrada del usuario: recorta espacios y pasa a mayúsculas. */
export function normalizeInviteCode(raw: string): string {
  return raw.trim().toUpperCase();
}

/** Valida un código: exactamente 6 caracteres del alfabeto sin ambiguos. */
export function isValidInviteCode(code: string): boolean {
  if (code.length !== INVITE_CODE_LENGTH) return false;
  for (const ch of code) {
    if (!INVITE_CODE_ALPHABET.includes(ch)) return false;
  }
  return true;
}

/**
 * Lunes de la semana (lunes a domingo) en hora LOCAL, como 'YYYY-MM-DD'.
 * DECISIÓN F4-LIGAS: la semana de la liga es local (America/Mexico_City,
 * UTC-6), igual que el day key de racha. NUNCA toISOString (UTC): un lunes
 * local a las 00:30 no debe leerse como el domingo UTC anterior.
 */
export function weekStartISO(date: Date): string {
  const day = date.getDay(); // 0 = domingo
  const diff = (day + 6) % 7; // días transcurridos desde el lunes
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - diff);
  return localDayKey(monday);
}
