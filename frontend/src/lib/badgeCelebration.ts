// FinEmpoder — Logros vistos (F2-GAMIFICACION).
// Persistencia local de "qué tier viste": key 'fe_badges_state' →
// Record<serieId, tier> (máximo VISTO por serie). La EVALUACIÓN de tiers
// sigue siendo derivada del progreso real en el momento (ver data/badges.ts).
//
// Migración (legado): usuarios sin key → {} — sus tiers actuales se evalúan
// en vivo y la celebración aparece una vez por serie recién alcanzada
// (aceptado y documentado en F2_GAMIFICACION.md).

import { BADGES, maxTier, type BadgeStats, type TierLevel } from '../data/badges';

export const SEEN_BADGES_KEY = 'fe_badges_state';

/** tier máximo visto por serie (ausente = nunca visto). */
export type SeenBadges = Record<string, TierLevel>;

export type BadgeUnlock = { serieId: string; nivel: TierLevel };

/** Delay del modal cuando el unlock coincide con la celebración de una
 *  lección (confetti + XP del LessonShell). Post-celebración. */
export const LESSON_COMPLETION_DELAY_MS = 2500;

export function readSeenBadges(): SeenBadges {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(SEEN_BADGES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    return parsed as SeenBadges;
  } catch {
    return {};
  }
}

export function writeSeenBadge(serieId: string, nivel: TierLevel): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SEEN_BADGES_KEY, JSON.stringify({ ...readSeenBadges(), [serieId]: nivel }));
  } catch {
    // localStorage no disponible (modo privado/SR): la celebración no
    // persiste, pero nunca bloquea la app.
  }
}

/** Unlocks pendientes: tier logrado > tier visto (nunca se re-celebran). */
export function computeUnlocks(stats: BadgeStats, seen: SeenBadges): BadgeUnlock[] {
  const unlocks: BadgeUnlock[] = [];
  for (const serie of BADGES) {
    const logrado = maxTier(serie, stats);
    const visto = seen[serie.id] ?? 0;
    if (logrado !== 0 && logrado > visto) unlocks.push({ serieId: serie.id, nivel: logrado });
  }
  return unlocks;
}
