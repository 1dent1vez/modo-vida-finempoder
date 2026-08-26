// @vitest-environment jsdom
// fake-indexeddb/auto MUST be first — patches global indexedDB before Dexie instantiates
import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase', () => ({
  supabase: { rpc: vi.fn() },
}));

import { supabase } from '@/lib/supabase';
import { db } from '@/db/finempoderDb';
import { addDaysLocal } from '@/lib/localDate';
import { XP_PER_LESSON } from '@/lib/dailyXp';
import { useProgress } from '@/store/progress';
import { weekStartISO } from './leagueCode';
import {
  computeLeagueMetric,
  getWeekLessons,
  syncWeeklyProgress,
} from './leagueSync';

const rpcMock = vi.mocked(supabase.rpc);

const leagues = [
  { id: 'l1', name: 'Lecciones', invite_code: 'ABC234', owner_id: 'u1', metric: 'lessons', created_at: 'x' },
  { id: 'l2', name: 'XP', invite_code: 'ABC235', owner_id: 'u1', metric: 'xp', created_at: 'x' },
  { id: 'l3', name: 'Racha', invite_code: 'ABC236', owner_id: 'u1', metric: 'streak', created_at: 'x' },
] as const;

beforeEach(async () => {
  vi.clearAllMocks();
  await db.lessonProgress.clear();
  await db.userLessonData.clear();
  useProgress.getState().reset();
});

afterEach(async () => {
  vi.useRealTimers();
  await db.lessonProgress.clear();
  await db.userLessonData.clear();
});

describe('getWeekLessons — semana LUNES-DOMINGO local', () => {
  it('cuenta solo las lecciones de la semana del lunes (no ventana rodante)', async () => {
    const weekStart = weekStartISO(new Date());
    const monday = new Date(`${weekStart}T12:00:00`); // mediodía local del lunes
    const sunday = addDaysLocal(monday, 6);

    await db.lessonProgress.bulkAdd([
      { userId: 'u1', moduleId: 'presupuesto', lessonId: 'L01', completed: true, completedAt: monday.toISOString() },
      { userId: 'u1', moduleId: 'ahorro', lessonId: 'L02', completed: true, completedAt: sunday.toISOString() },
      // Fuera de la semana: domingo pasado (8 días antes del lunes)
      { userId: 'u1', moduleId: 'presupuesto', lessonId: 'L03', completed: true, completedAt: addDaysLocal(monday, -8).toISOString() },
      // Domingo futuro de la semana siguiente (fuera del rango)
      { userId: 'u1', moduleId: 'presupuesto', lessonId: 'L04', completed: true, completedAt: addDaysLocal(sunday, 1).toISOString() },
      // No completada: no cuenta
      { userId: 'u1', moduleId: 'ahorro', lessonId: 'L05', completed: false, completedAt: monday.toISOString() },
    ]);

    await expect(getWeekLessons('u1', weekStart)).resolves.toBe(2);
  });

  it('semana sin lecciones devuelve 0', async () => {
    await expect(getWeekLessons('u1', weekStartISO(new Date()))).resolves.toBe(0);
  });
});

describe('computeLeagueMetric — métrica por tipo de liga', () => {
  it('lessons → lecciones; xp → lecciones × XP_PER_LESSON; streak → streak.current', async () => {
    const weekStart = weekStartISO(new Date());
    const monday = new Date(`${weekStart}T12:00:00`);
    await db.lessonProgress.bulkAdd([
      { userId: 'u1', moduleId: 'presupuesto', lessonId: 'L01', completed: true, completedAt: monday.toISOString() },
      { userId: 'u1', moduleId: 'ahorro', lessonId: 'L02', completed: true, completedAt: monday.toISOString() },
    ]);
    useProgress.setState({
      streak: { current: 5, best: 9, shields: 0, metaDaysStreak: 0 },
    });

    await expect(computeLeagueMetric(leagues[0], 'u1', weekStart)).resolves.toBe(2);
    await expect(computeLeagueMetric(leagues[1], 'u1', weekStart)).resolves.toBe(2 * XP_PER_LESSON);
    await expect(computeLeagueMetric(leagues[2], 'u1', weekStart)).resolves.toBe(5);
  });
});

describe('syncWeeklyProgress — un ciclo, mismo weekStart, sin spamear', () => {
  it('llama upsert_league_entry por cada liga con la métrica de ESA liga', async () => {
    const weekStart = weekStartISO(new Date());
    const monday = new Date(`${weekStart}T12:00:00`);
    await db.lessonProgress.bulkAdd([
      { userId: 'u1', moduleId: 'presupuesto', lessonId: 'L01', completed: true, completedAt: monday.toISOString() },
    ]);
    useProgress.setState({ streak: { current: 3, best: 3, shields: 0, metaDaysStreak: 0 } });
    rpcMock.mockResolvedValue({ error: null } as never);

    await syncWeeklyProgress('u1', [...leagues]);

    expect(rpcMock).toHaveBeenCalledTimes(3);
    expect(rpcMock).toHaveBeenCalledWith('upsert_league_entry', {
      p_league_id: 'l1',
      p_week_start: weekStart,
      p_metric_value: 1,
    });
    expect(rpcMock).toHaveBeenCalledWith('upsert_league_entry', {
      p_league_id: 'l2',
      p_week_start: weekStart,
      p_metric_value: XP_PER_LESSON,
    });
    expect(rpcMock).toHaveBeenCalledWith('upsert_league_entry', {
      p_league_id: 'l3',
      p_week_start: weekStart,
      p_metric_value: 3,
    });
  });

  it('no sincroniza en guest (userId local) ni con lista vacía', async () => {
    await syncWeeklyProgress('local', [...leagues]);
    await syncWeeklyProgress('u1', []);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('un fallo de red no rompe el ciclo (continúa con las demás ligas)', async () => {
    rpcMock
      .mockResolvedValueOnce({ error: new Error('red caída') } as never)
      .mockResolvedValueOnce({ error: null } as never);
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(syncWeeklyProgress('u1', leagues.slice(0, 2))).resolves.toBeUndefined();

    expect(rpcMock).toHaveBeenCalledTimes(2);
    spy.mockRestore();
  });

  it('si la rpc rechaza (throw), también se loguea sin propagar', async () => {
    rpcMock.mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce({ error: null } as never);
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(syncWeeklyProgress('u1', leagues.slice(0, 2))).resolves.toBeUndefined();
    expect(rpcMock).toHaveBeenCalledTimes(2);
    spy.mockRestore();
  });
});
