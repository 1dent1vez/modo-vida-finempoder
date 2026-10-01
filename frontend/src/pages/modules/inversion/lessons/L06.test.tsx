// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import { db } from '../../../../db/finempoderDb';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import { useAuth } from '../../../../store/auth';
import { useLessons } from '../../../../store/lessons';
import { useProgress } from '../../../../store/progress';
import L06 from './L06';
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
async function c(n: string | RegExp) {
  const b = await screen.findByRole('button', { name: n });
  await waitFor(() => expect(b).toBeEnabled());
  fireEvent.click(b);
}
beforeEach(async () => {
  useAuth.getState().clearAuth();
  useLessons.getState().reset();
  useProgress.getState().reset();
  await Promise.all(db.tables.map((t) => t.clear()));
  await db.lessonProgress.add({
    userId: 'local',
    moduleId: 'inversion',
    lessonId: 'L05',
    completed: true,
    completedAt: new Date().toISOString(),
  });
});
describe('L06', () => {
  it('separa simulación hipotética y oferta', async () => {
    render(
      <MemoryRouter>
        <L06 />
      </MemoryRouter>,
    );
    for (const n of ['Emisor', 'Plazo', 'Tasa', 'Costos e impuestos', 'Liquidez', 'Riesgos'])
      await c(new RegExp(n));
    await c('Abrir simulador');
    expect(await screen.findByText(/no representa una oferta/i)).toBeInTheDocument();
    await c('Preparar verificación');
    for (const n of [
      'Leer el documento vigente',
      'Confirmar al emisor y su registro',
      'Comparar costos, liquidez y riesgos',
    ])
      await c(n);
    await c('Revisar ficha');
    await c('Guardar y terminar');
    await waitFor(async () =>
      expect(await lessonDataRepository.load('inversion', 'l06_debt_reading')).not.toBeNull(),
    );
    expect(screen.queryByText(/cetesdirecto|IPAB|retención automática/)).not.toBeInTheDocument();
  });
});
