// @vitest-environment jsdom
/** Render del nodo 1080x1080 de la tarjeta compartible (F3-CRECIMIENTO):
 *  texto del logro, frase de la serie y dato real del usuario. */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { BADGES } from '../../../data/badges';
import { ShareableAchievementCard } from './ShareableAchievementCard';

afterEach(() => {
  cleanup();
});

describe('ShareableAchievementCard', () => {
  it('muestra el título del logro, la frase de la serie y el dato real', () => {
    const serie = BADGES.find((s) => s.id === 'lecciones')!;
    const frase = 'Cada lección te acerca más a dueño de tu dinero.';

    render(
      <ShareableAchievementCard
        serie={serie}
        nivel={1}
        stats={{
          totalCompleted: 12,
          presupuestoProgress: 40,
          ahorroProgress: 40,
          inversionProgress: 0,
          streakBest: 1,
          streakCurrent: 1,
        }}
        frase={frase}
      />,
    );

    const card = screen.getByTestId('shareable-achievement-card');
    expect(card).toHaveTextContent('Lecciones completadas · Bronce');
    expect(card).toHaveTextContent(frase);
    expect(card).toHaveTextContent('12 lecciones');
    expect(card).toHaveTextContent('FinEMPODER');
  });

  it('la corona muestra su dato de 3 módulos completos', () => {
    const serie = BADGES.find((s) => s.id === 'finempoder_pro')!;
    render(
      <ShareableAchievementCard
        serie={serie}
        nivel={3}
        stats={{
          totalCompleted: 45,
          presupuestoProgress: 100,
          ahorroProgress: 100,
          inversionProgress: 100,
          streakBest: 14,
          streakCurrent: 14,
        }}
      />,
    );
    expect(screen.getByTestId('shareable-achievement-card')).toHaveTextContent(
      '3 módulos completos',
    );
  });
});
