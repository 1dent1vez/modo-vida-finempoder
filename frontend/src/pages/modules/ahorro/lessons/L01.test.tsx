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
  await Promise.all(db.tables.map((table) => table.clear()));
});
async function click(name: string) {
  const button = await screen.findByRole('button', { name });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
}
describe('Ahorro L01', () => {
  it('explica, permite reconsiderar y cierra después de revisar', async () => {
    render(
      <MemoryRouter>
        <L01 />
      </MemoryRouter>,
    );
    await click('Explorar una aportación');
    fireEvent.change(await screen.findByLabelText(/Aportación semanal/), {
      target: { value: '250' },
    });
    await click('Comprobar lo aprendido');
    await click('Guardar únicamente lo que sobre');
    expect(await screen.findByText(/intención es asignar/)).toBeInTheDocument();
    await click('Separar una cantidad planeada antes de otros gastos ajustables');
    await click('Confirmar respuesta');
    await click('Una suma simple si se mantiene la aportación');
    await click('Confirmar y revisar');
    expect(
      await db.lessonProgress.where({ moduleId: 'ahorro', lessonId: 'L01' }).first(),
    ).toBeUndefined();
    await click('Guardar y terminar');
    await waitFor(async () =>
      expect(
        (await db.lessonProgress.where({ moduleId: 'ahorro', lessonId: 'L01' }).first())?.completed,
      ).toBe(true),
    );
    expect(await lessonDataRepository.load('ahorro', 'l1_savings_first')).toEqual({
      weekly: 250,
      answers: { 0: 1, 1: 1 },
      projectionType: 'simple-contributions',
    });
    expect(await screen.findByText(/Desbloqueaste L02/)).toBeInTheDocument();
  });
});
