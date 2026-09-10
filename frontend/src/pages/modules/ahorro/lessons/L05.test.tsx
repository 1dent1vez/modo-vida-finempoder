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
import L05 from './L05';
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
beforeEach(async () => {
  useAuth.getState().clearAuth();
  useLessons.getState().reset();
  useProgress.getState().reset();
  await Promise.all(db.tables.map((t) => t.clear()));
  for (const lessonId of ['L01', 'L02', 'L03', 'L04'])
    await db.lessonProgress.add({
      userId: 'local',
      moduleId: 'ahorro',
      lessonId,
      completed: true,
      completedAt: new Date().toISOString(),
    });
});
async function click(name: string) {
  const b = await screen.findByRole('button', { name });
  await waitFor(() => expect(b).toBeEnabled());
  fireEvent.click(b);
}
describe('Ahorro L05', () => {
  it('define, revisa y guarda una meta', async () => {
    render(
      <MemoryRouter>
        <L05 />
      </MemoryRouter>,
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Fondo para imprevistos' }));
    await click('Definir monto y ritmo');
    expect(await screen.findByText('Convierte el propósito en números.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Monto de la meta'), { target: { value: '6000' } });
    fireEvent.change(screen.getByLabelText('Aportación mensual'), { target: { value: '500' } });
    expect(screen.getByText(/12 meses/)).toBeInTheDocument();
    await click('Revisar mi meta');
    expect(await screen.findByText('Revisa una meta que puedas ajustar.')).toBeInTheDocument();
    expect(
      await db.lessonProgress.where({ moduleId: 'ahorro', lessonId: 'L05' }).first(),
    ).toBeUndefined();
    await click('Guardar y terminar');
    await waitFor(async () =>
      expect(
        (await db.lessonProgress.where({ moduleId: 'ahorro', lessonId: 'L05' }).first())?.completed,
      ).toBe(true),
    );
    expect(await screen.findByText(/Desbloqueaste L06/)).toBeInTheDocument();
    expect(await lessonDataRepository.load('ahorro', 'l5_meta')).toMatchObject({
      monto: 6000,
      aportacionMensual: 500,
    });
  });
});
