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
import L01 from './L01';
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
beforeEach(async () => {
  useAuth.getState().clearAuth();
  useLessons.getState().reset();
  useProgress.getState().reset();
  await Promise.all(db.tables.map((t) => t.clear()));
});
async function click(name: string | RegExp) {
  const b = await screen.findByRole('button', { name });
  await waitFor(() => expect(b).toBeEnabled());
  fireEvent.click(b);
}
describe('Inversión L01', () => {
  it('presenta escenarios hipotéticos y guarda una definición prudente', async () => {
    render(
      <MemoryRouter>
        <L01 />
      </MemoryRouter>,
    );
    await click('Nunca he invertido');
    await click('Explorar un escenario');
    expect(await screen.findByText(/Modelo simplificado con tasas constantes/)).toBeInTheDocument();
    await click('Conectar las variables');
    for (const name of [/RendimientoToca/, /RiesgoToca/, /PlazoToca/, /LiquidezToca/])
      await click(name);
    await click('Rendimiento, riesgo, plazo, liquidez y costos');
    await click('Revisar definición');
    expect(await lessonDataRepository.load('inversion', 'l01_foundations')).toBeNull();
    await click('Guardar y terminar');
    await waitFor(async () =>
      expect(
        (await db.lessonProgress.where({ moduleId: 'inversion', lessonId: 'L01' }).first())
          ?.completed,
      ).toBe(true),
    );
    expect(await lessonDataRepository.load('inversion', 'l01_foundations')).toMatchObject({
      experience: 'Nunca he invertido',
    });
    expect(screen.queryByText(/CETES|\$100|ventaja al invertir/)).not.toBeInTheDocument();
  });
});
