// FinEmpoder — Hook de compartir logros (F3-CRECIMIENTO).
// Genera el PNG de la tarjeta con html-to-image (import dinámico, solo cuando
// se comparte) y sigue el flujo: share nativo (móvil) → fallback de descarga
// automática + acciones WhatsApp/Copiar en la UI.

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import type { BadgeSeries, BadgeStats, TierLevel } from '../../data/badges';
import { serieTitulo } from '../../data/badges';
import { buildAchievementShareMessage, serieDatoReal } from '../../lib/shareAchievement';

export type ShareStatus = 'shared' | 'fallback' | 'error';

export interface UseShareableAchievementResult {
  /** Ref para el nodo 1080x1080 de la tarjeta (ShareableAchievementCard). */
  cardRef: RefObject<HTMLDivElement | null>;
  /** true mientras html-to-image genera el PNG. */
  generating: boolean;
  /** Blob URL del PNG generado cuando el share nativo no aplica (fallback). */
  pngUrl: string | null;
  /** Mensaje de invitación para WhatsApp / copiar. */
  message: string;
  /** Dato real del usuario para la serie (se muestra en la tarjeta). */
  dato: string;
  /** Genera el PNG y comparte: 'shared' | 'fallback' | 'error'. */
  share: () => Promise<ShareStatus>;
  /** Limpia el fallback (pngUrl). */
  reset: () => void;
}

const CARD_SIZE = { width: 1080, height: 1080, pixelRatio: 1 } as const;

export function useShareableAchievement(
  serie: BadgeSeries,
  nivel: TierLevel,
  stats: BadgeStats,
): UseShareableAchievementResult {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [generating, setGenerating] = useState(false);
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const message = useMemo(
    () => buildAchievementShareMessage(serieTitulo(serie, nivel)),
    [serie, nivel],
  );
  const dato = useMemo(() => serieDatoReal(serie.id, stats), [serie.id, stats]);

  // Revoca el blob URL anterior al generar otro (y el último al desmontar).
  useEffect(
    () => () => {
      if (pngUrl) {
        try {
          URL.revokeObjectURL(pngUrl);
        } catch {
          // jsdom/tests: revoke no disponible, no bloquea.
        }
      }
    },
    [pngUrl],
  );

  const share = useCallback(async (): Promise<ShareStatus> => {
    const node = cardRef.current;
    if (!node) return 'error';
    setGenerating(true);
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(node, CARD_SIZE);
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `finempoder-logro-${serie.id}.png`, { type: 'image/png' });

      const supportsNativeShare =
        typeof navigator !== 'undefined' &&
        'share' in navigator &&
        !!navigator.canShare?.({ files: [file] });

      if (supportsNativeShare) {
        try {
          await navigator.share({ files: [file], title: message, text: message });
          return 'shared';
        } catch {
          // AbortError (usuario canceló) o PermissionDenied: se va al fallback.
        }
      }

      const url = URL.createObjectURL(blob);
      setPngUrl(url);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = file.name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      return 'fallback';
    } catch {
      return 'error';
    } finally {
      setGenerating(false);
    }
  }, [serie.id, message]);

  const reset = useCallback(() => setPngUrl(null), []);

  return { cardRef, generating, pngUrl, message, dato, share, reset };
}
