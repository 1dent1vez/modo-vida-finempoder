import { useMemo } from 'react';
import { BADGES, serieTitulo } from '../../../data/badges';
import { useBadgeCelebration } from '../../../hooks/gamification/useBadgeCelebration';
import { fraseParaSerie } from '../../../lib/finniFrases';
import { Button } from '../ui/button';
import FinniMessage from '../FinniMessage';

/**
 * Modal global de celebración de logros (F2-GAMIFICACION).
 * Overlay no bloqueante, una celebración a la vez; "¡Seguir!" marca el tier
 * como visto y avanza la cola. Sin confetti (la lección ya lo tiene).
 */
export function AchievementModal() {
  const { current, acknowledge } = useBadgeCelebration();
  const frase = useMemo(
    () => (current ? fraseParaSerie(current.serieId) : ''),
    [current]
  );

  if (!current) return null;
  const serie = BADGES.find((s) => s.id === current.serieId);
  if (!serie) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Logro desbloqueado"
      className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/30 p-4 backdrop-blur-[2px]"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-[var(--shadow-lg)]">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-brand-accentBg)] text-[var(--color-brand-accent)]">
            <serie.icon className="h-9 w-9" aria-hidden="true" />
          </span>

          <h2 className="text-lg font-extrabold">{serieTitulo(serie, current.nivel)}</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">{serie.descripcion}</p>

          <FinniMessage variant="coach" message={frase} className="w-full text-left" />

          <Button className="min-h-11 w-full" onClick={acknowledge}>
            ¡Seguir!
          </Button>
        </div>
      </div>
    </div>
  );
}
