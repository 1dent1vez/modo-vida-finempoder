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
import L09 from './L09';
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
beforeEach(async () => {
  useAuth.getState().clearAuth();
  useLessons.getState().reset();
  useProgress.getState().reset();
  await Promise.all(db.tables.map((t) => t.clear()));
  for (const lessonId of ['L01', 'L02', 'L03', 'L04', 'L05', 'L06', 'L07', 'L08'])
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
describe('Ahorro L09', () => {
  it('distingue cobertura y liquidez antes de guardar una acción', async () => {
    render(
      <MemoryRouter>
        <L09 />
      </MemoryRouter>,
    );
    await click('Practicar con casos');
    await click('Seguro');
    expect(await screen.findByText(/ahorro aporta liquidez/)).toBeInTheDocument();
    await click('Ahorro');
    await click('Confirmar caso');
    expect(await screen.findByText('Evento de alto impacto con cobertura')).toBeInTheDocument();
    await click('Ambos');
    await click('Confirmar caso');
    expect(await screen.findByText('Evento fuera de la póliza')).toBeInTheDocument();
    await click('Ahorro');
    await click('Confirmar y elegir acción');
    fireEvent.click(await screen.findByLabelText('Revisar deducible y otros costos'));
    await click('Revisar mi acción');
    await click('Guardar y terminar');
    await waitFor(async () =>
      expect(
        (await db.lessonProgress.where({ moduleId: 'ahorro', lessonId: 'L09' }).first())?.completed,
      ).toBe(true),
    );
    expect(await screen.findByText(/Desbloqueaste L10/)).toBeInTheDocument();
    expect(await lessonDataRepository.load('ahorro', 'l9_ahorro_seguro')).toMatchObject({
      action: 'cost',
    });
  });
});
