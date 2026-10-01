// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from './finempoderDb';
import { lessonDataRepository } from './lessonData.repository';
import { lessonProgressRepository } from './lessonProgress.repository';
import { useAuth } from '../store/auth';

describe('integridad de persistencia local', () => {
  beforeEach(async () => {
    useAuth.getState().clearAuth();
    await Promise.all(db.tables.map((table) => table.clear()));
  });

  it('conserva una sola fila lógica ante guardados concurrentes', async () => {
    await Promise.all(
      Array.from({ length: 8 }, (_, value) =>
        lessonDataRepository.save('ahorro', 'draft:test', { value }),
      ),
    );

    const rows = await db.userLessonData
      .where('[userId+moduleId+key]')
      .equals(['local', 'ahorro', 'draft:test'])
      .toArray();

    expect(rows).toHaveLength(1);
  });

  it('guarda un lote completo en una sola transacción', async () => {
    await lessonDataRepository.saveBatch('presupuesto', [
      { key: 'draft:test', data: { stage: 'complete' } },
      { key: 'result:test', data: { score: 1 } },
    ]);

    await expect(lessonDataRepository.load('presupuesto', 'draft:test')).resolves.toEqual({
      stage: 'complete',
    });
    await expect(lessonDataRepository.load('presupuesto', 'result:test')).resolves.toEqual({
      score: 1,
    });
  });

  it('registra una sola finalización aunque se solicite en paralelo', async () => {
    await Promise.all(
      Array.from({ length: 8 }, () =>
        lessonProgressRepository.setCompletedLocal('inversion', 'L01'),
      ),
    );

    const rows = await db.lessonProgress
      .where('[userId+moduleId+lessonId]')
      .equals(['local', 'inversion', 'L01'])
      .toArray();

    expect(rows).toHaveLength(1);
    expect(rows[0]?.completed).toBe(true);
  });
});
