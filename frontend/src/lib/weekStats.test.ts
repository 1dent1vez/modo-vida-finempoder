// @vitest-environment jsdom
// fake-indexeddb/auto MUST be first — patches global indexedDB before Dexie instantiates
import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/db/finempoderDb';
import { addDaysLocal } from '@/lib/localDate';
import { XP_PER_LESSON } from '@/lib/dailyXp';
import { getWeekStats } from './weekStats';

beforeEach(async () => {
  await db.lessonProgress.clear();
});

afterEach(async () => {
  await db.lessonProgress.clear();
  vi.useRealTimers();
});

describe('getWeekStats — "Esta semana" (ventana móvil de 7 días)', () => {
  it('cuenta lecciones completadas y XP de hoy + 6 días atrás, descarta lo anterior', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 7, 9, 12, 0)); // 9 ago 2026 local
    const today = new Date();
    const threeDaysAgo = addDaysLocal(today, -3);
    const eightDaysAgo = addDaysLocal(today, -8);

    await db.lessonProgress.bulkAdd([
      { userId: 'local', moduleId: 'presupuesto', lessonId: 'L01', completed: true, completedAt: today.toISOString() },
      { userId: 'local', moduleId: 'presupuesto', lessonId: 'L02', completed: true, completedAt: threeDaysAgo.toISOString() },
      { userId: 'local', moduleId: 'ahorro', lessonId: 'L01', completed: true, completedAt: eightDaysAgo.toISOString() },
      { userId: 'local', moduleId: 'ahorro', lessonId: 'L02', completed: false, completedAt: today.toISOString() },
    ]);

    await expect(getWeekStats('local')).resolves.toEqual({
      completed: 2,
      xp: 2 * XP_PER_LESSON,
    });
  });

  it('sin lecciones en la ventana devuelve 0/0', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 7, 9, 12, 0));
    await expect(getWeekStats('local')).resolves.toEqual({ completed: 0, xp: 0 });
  });
});
