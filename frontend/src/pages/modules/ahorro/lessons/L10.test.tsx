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
import L10 from './L10';
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
beforeEach(async () => {
  useAuth.getState().clearAuth();
  useLessons.getState().reset();
  useProgress.getState().reset();
  await Promise.all(db.tables.map((t) => t.clear()));
  for (const lessonId of ['L01', 'L02', 'L03', 'L04', 'L05', 'L06', 'L07', 'L08', 'L09'])
    await db.lessonProgress.add({
      userId: 'local',
      moduleId: 'ahorro',
      lessonId,
      completed: true,
      completedAt: new Date().toISOString(),
    });
});
async function click(name: string) {
  const button = await screen.findByRole('button', { name });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
}
describe('Ahorro L10', () => {
  it('guarda una ruta de verificación sin depender de una cifra estática', async () => {
    render(
      <MemoryRouter>
        <L10 />
      </MemoryRouter>,
    );
    await click('Aprender la ruta');
    for (const name of ['1. Institución', '2. Producto', '3. Límite vigente'])
      fireEvent.click(await screen.findByLabelText(new RegExp(name)));
    await click('Comprobar lo aprendido');
    await click('No, depende de la institución, el producto y las condiciones');
    await click('Confirmar respuesta');
    expect(await screen.findByText(/Dónde consultarías el límite vigente/)).toBeInTheDocument();
    await click('En los canales oficiales del IPAB');
    await click('Confirmar y revisar');
    await click('Guardar ruta y terminar');
    await waitFor(async () =>
      expect(
        (await db.lessonProgress.where({ moduleId: 'ahorro', lessonId: 'L10' }).first())?.completed,
      ).toBe(true),
    );
    expect(await screen.findByText(/Desbloqueaste L11/)).toBeInTheDocument();
    expect(await lessonDataRepository.load('ahorro', 'l10_ipab_verification')).toMatchObject({
      sourcePolicy: 'official-current',
    });
    expect(screen.queryByText(/3\.5 millones/)).not.toBeInTheDocument();
  });
});
