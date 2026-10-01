// FinEmpoder — Hook de compartir logros (F3-CRECIMIENTO).
// Genera el PNG de la tarjeta con html-to-image (import dinámico, solo cuando
// se comparte) y sigue el flujo: share nativo (móvil) → opciones visibles de
// inmediato (Descargar imagen / WhatsApp / Copiar mensaje). En desktop nunca
// se queda sin camino al PNG: "Descargar imagen" existe siempre.

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import type { BadgeSeries, BadgeStats, TierLevel } from '../../data/badges';
import { serieTitulo } from '../../data/badges';
import {
  buildAchievementShareMessage,
  captureCardPng,
  serieDatoReal,
} from '../../lib/shareAchievement';

export type ShareStatus = 'shared' | 'fallback' | 'error';
export type DownloadStatus = 'downloaded' | 'error';

export interface UseShareableAchievementResult {
  /** Ref para el nodo 1080x1080 de la tarjeta (ShareableAchievementCard). */
  cardRef: RefObject<HTMLDivElement | null>;
  /** true mientras html-to-image genera el PNG. */
  generating: boolean;
  /** Blob URL del PNG generado (lo crea "Descargar imagen"; se reusa). */
  pngUrl: string | null;
  /** Mensaje de invitación para WhatsApp / copiar. */
  message: string;
  /** Dato real del usuario para la serie (se muestra en la tarjeta). */
  dato: string;
  /** Genera el PNG y comparte: 'shared' | 'fallback' | 'error'. Sin share
   *  nativo (o si falla) devuelve 'fallback': las opciones quedan visibles. */
  share: () => Promise<ShareStatus>;
  /** Genera el PNG (o reusa el último) y dispara la descarga directa. */
  download: () => Promise<DownloadStatus>;
  /** Limpia el fallback (pngUrl). */
  reset: () => void;
}

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
  const fileName = `finempoder-logro-${serie.id}.png`;

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
      const blob = await captureCardPng(node);
      const file = new File([blob], fileName, { type: 'image/png' });

      const canNativeShare =
        typeof navigator !== 'undefined' &&
        'share' in navigator &&
        !!navigator.canShare?.({ files: [file] });

      if (canNativeShare) {
        try {
          await navigator.share({ files: [file], title: message, text: message });
          return 'shared';
        } catch {
          // AbortError (usuario canceló) o PermissionDenied: 'fallback' y las
          // opciones de la UI quedan visibles.
          return 'fallback';
        }
      }
      return 'fallback';
    } catch {
      return 'error';
    } finally {
      setGenerating(false);
    }
  }, [fileName, message]);

  const download = useCallback(async (): Promise<DownloadStatus> => {
    const node = cardRef.current;
    if (!node) return 'error';
    setGenerating(true);
    try {
      let url = pngUrl;
      if (!url) {
        const blob = await captureCardPng(node);
        url = URL.createObjectURL(blob);
        setPngUrl(url);
      }
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      return 'downloaded';
    } catch {
      return 'error';
    } finally {
      setGenerating(false);
    }
  }, [fileName, pngUrl]);

  const reset = useCallback(() => setPngUrl(null), []);

  return { cardRef, generating, pngUrl, message, dato, share, download, reset };
}
