// FinEmpoder — Lógica de compartir logros (F3-CRECIMIENTO).
// Mensajes sin emojis, sin rayas largas, voz cercana mexicana (mismas reglas
// que el banco de frases de Finni). La tarjeta PNG la genera la UI con
// html-to-image; aquí vive solo lo testeable puro.

import type { BadgeStats } from '../data/badges';

/**
 * Dato real del usuario por serie para la tarjeta compartible.
 * - presupuesto/ahorro/inversion → % del módulo
 * - lecciones → total de lecciones completadas
 * - racha → mejor racha en días
 * - finempoder_pro → 3 módulos completos
 */
export function serieDatoReal(serieId: string, stats: BadgeStats): string {
  switch (serieId) {
    case 'presupuesto':
      return `${stats.presupuestoProgress}% del módulo`;
    case 'ahorro':
      return `${stats.ahorroProgress}% del módulo`;
    case 'inversion':
      return `${stats.inversionProgress}% del módulo`;
    case 'lecciones':
      return `${stats.totalCompleted} lecciones`;
    case 'racha':
      return `Racha de ${stats.streakBest} días`;
    case 'finempoder_pro':
      return '3 módulos completos';
    default:
      return '';
  }
}

/**
 * Mensaje de invitación para WhatsApp / copiar. Recibe el título ya armado
 * ('Presupuestación · Bronce'); sin emojis ni rayas largas, suena humano.
 */
export function buildAchievementShareMessage(titulo: string): string {
  return `Acabo de completar el logro ${titulo} en FinEMPODER. Es una app gratis de finanzas personales para México, ¿la pruebas?`;
}

/** URL de WhatsApp con el texto codificado (fallback de share nativo). */
export function waMeUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
