// @vitest-environment jsdom
// fake-indexeddb/auto MUST be first — patches global indexedDB before Dexie instantiates
import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/db/finempoderDb';
import { addDaysLocal } from '@/lib/localDate';
import { getTodayXp, XP_PER_LESSON } from './dailyXp';

beforeEach(async () => {
  await db.lessonProgress.clear();
});

afterEach(async () => {
  await db.lessonProgress.clear();
  vi.useRealTimers();
});

describe('getTodayXp — XP del día DERIVADO de lessonProgress (day key LOCAL)', () => {
  it('suma 100 XP por cada lección completada hoy y descarta las de ayer e incompletas', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 7, 9, 12, 0)); // 9 ago 2026, hora local
    const today = new Date();
    const yesterday = addDaysLocal(today, -1);

    await db.lessonProgress.bulkAdd([
      { userId: 'local', moduleId: 'presupuesto', lessonId: 'L01', completed: true, completedAt: today.toISOString() },
      { userId: 'local', moduleId: 'presupuesto', lessonId: 'L02', completed: true, completedAt: today.toISOString() },
      { userId: 'local', moduleId: 'ahorro', lessonId: 'L01', completed: true, completedAt: yesterday.toISOString() },
      { userId: 'local', moduleId: 'ahorro', lessonId: 'L02', completed: false, completedAt: today.toISOString() },
    ]);

    await expect(getTodayXp('local')).resolves.toBe(2 * XP_PER_LESSON);
  });

  it('frontera de día local: 00:05 del 1 de enero cuenta como hoy en cualquier zona horaria', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 0, 1, 0, 5)); // 1 ene 2026 00:05 local
    const justAfterMidnight = new Date(2026, 0, 1, 0, 5);

    await db.lessonProgress.add({
      userId: 'local',
      moduleId: 'presupuesto',
      lessonId: 'L01',
      completed: true,
      completedAt: justAfterMidnight.toISOString(),
    });

    await expect(getTodayXp('local')).resolves.toBe(XP_PER_LESSON);
  });

  it('sin lecciones hoy devuelve 0', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 7, 9, 12, 0));
    await expect(getTodayXp('local')).resolves.toBe(0);
  });
});
