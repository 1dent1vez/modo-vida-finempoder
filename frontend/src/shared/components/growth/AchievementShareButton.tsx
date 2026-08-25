// FinEmpoder — Botón "Compartir logro" (F3-CRECIMIENTO).
// Reutiliza la tarjeta compartible + el hook de share: si el dispositivo
// soporta share nativo muestra "Compartir"; siempre ofrece "Más opciones"
// (WhatsApp + Copiar mensaje). Al no poder compartir nativo, descarga el PNG
// automáticamente y deja las acciones visibles.

import { useEffect, useMemo, useRef, useState } from 'react';
import { Copy, MessageCircle, Share2 } from 'lucide-react';
import type { BadgeSeries, BadgeStats, TierLevel } from '../../../data/badges';
import { fraseParaSerie } from '../../../lib/finniFrases';
import { waMeUrl } from '../../../lib/shareAchievement';
import { useShareableAchievement } from '../../../hooks/growth/useShareableAchievement';
import { cn } from '../../../lib/utils';
import { Button } from '../ui/button';
import { ShareableAchievementCard } from './ShareableAchievementCard';

export interface AchievementShareButtonProps {
  serie: BadgeSeries;
  nivel: TierLevel;
  stats: BadgeStats;
  /** Frase de Finni para la tarjeta (si no llega, se toma del banco de la serie). */
  frase?: string;
  /** true → botón con texto (modal); false → solo icono (Logros). */
  labeled?: boolean;
  /** Anclaje del popover dentro del contenedor relativo. */
  align?: 'left' | 'right' | 'center';
  className?: string;
}

export function AchievementShareButton({
  serie,
  nivel,
  stats,
  frase,
  labeled = false,
  align = 'left',
  className,
}: AchievementShareButtonProps) {
  const { cardRef, generating, message, share } = useShareableAchievement(serie, nivel, stats);
  const fraseFinal = useMemo(() => frase ?? fraseParaSerie(serie.id), [frase, serie.id]);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [outcome, setOutcome] = useState<'idle' | 'downloaded' | 'error'>('idle');
  const containerRef = useRef<HTMLDivElement | null>(null);

  const supportsNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

  // Cierra el popover con click fuera o Escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleNativeShare = async () => {
    const status = await share();
    if (status === 'fallback') setOutcome('downloaded');
    if (status === 'error') setOutcome('error');
    if (status === 'fallback' || status === 'error') setOpen(true);
  };

  const handleWhatsApp = () => {
    window.open(waMeUrl(message), '_blank', 'noopener,noreferrer');
  };

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(message);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Clipboard bloqueado: silencioso, las demás acciones siguen.
    }
  };

  const popoverAlign =
    align === 'right' ? 'right-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0';

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      <ShareableAchievementCard
        ref={cardRef}
        serie={serie}
        nivel={nivel}
        stats={stats}
        frase={fraseFinal}
      />

      <Button
        type="button"
        variant={labeled ? 'secondary' : 'ghost'}
        size={labeled ? 'sm' : 'icon'}
        className={cn(labeled ? 'min-h-10 w-full' : 'h-8 w-8 text-[var(--color-text-secondary)]')}
        aria-label={`Compartir logro ${serie.tituloBase}`}
        onClick={() => setOpen((v) => !v)}
      >
        <Share2 className="h-4 w-4" aria-hidden="true" />
        {labeled ? 'Compartir logro' : null}
      </Button>

      {open ? (
        <div
          role="menu"
          aria-label="Opciones para compartir el logro"
          className={cn(
            'absolute z-50 mt-2 w-64 rounded-xl border border-[var(--color-neutral-200)] bg-white p-2 shadow-[var(--shadow-lg)]',
            popoverAlign,
          )}
        >
          {supportsNativeShare ? (
            <Button
              variant="secondary"
              size="sm"
              className="w-full justify-start"
              disabled={generating}
              onClick={handleNativeShare}
            >
              <Share2 className="h-4 w-4" aria-hidden="true" />
              {generating ? 'Generando imagen...' : 'Compartir'}
            </Button>
          ) : null}

          <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
            Más opciones
          </p>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={handleWhatsApp}
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Enviar por WhatsApp
          </Button>

          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleCopy}>
            <Copy className="h-4 w-4" aria-hidden="true" />
            {copied ? 'Mensaje copiado' : 'Copiar mensaje'}
          </Button>

          {outcome === 'downloaded' ? (
            <p className="px-3 pt-2 text-xs text-[var(--color-text-secondary)]">
              La imagen del logro se descargó.
            </p>
          ) : null}
          {outcome === 'error' ? (
            <p className="px-3 pt-2 text-xs text-[var(--color-brand-error)]">
              No se pudo generar la imagen.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
