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

/**
 * Captura de la tarjeta como PNG (F3-01).
 *
 * Mecanismo elegido: la opción `style` de html-to-image (v1.11.13:
 * apply-style.js copia las claves de `options.style` al nodo CLONADO justo
 * antes de serializar). El nodo real vive en left:-9999 (invisible, sin
 * parpadeo) y el override corrige la geometría del clon dentro del canvas
 * 1080x1080. Detalle crítico detectado en Chromium real: el clon hereda el
 * `inset` COMPUTADO del nodo real (right:10199px/bottom:-360px por el
 * left:-9999 + viewport), y en el SVG rasterizado esos valores re-posicionan
 * el clon fuera del canvas → PNG transparente. Por eso el override fija
 * right/bottom a 'auto' además de left/top a 0. Alternativa manual (clon +
 * append al DOM real) descartada: montaría el nodo visible un frame.
 */
export const CARD_SIZE = { width: 1080, height: 1080, pixelRatio: 1 } as const;

/** Override aplicado AL CLON que captura html-to-image (no al nodo real). */
export const CAPTURE_CLONE_STYLE = {
  position: 'fixed',
  left: '0',
  top: '0',
  right: 'auto',
  bottom: 'auto',
  margin: '0',
  opacity: '1',
  transform: 'none',
} as const;

/** Genera el PNG 1080x1080 de la tarjeta (blob image/png). */
export async function captureCardPng(node: HTMLElement): Promise<Blob> {
  const { toBlob } = await import('html-to-image');
  const blob = await toBlob(node, { ...CARD_SIZE, style: CAPTURE_CLONE_STYLE });
  if (!blob) throw new Error('html-to-image no devolvió un blob');
  return blob;
}
