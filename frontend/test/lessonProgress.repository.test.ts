// fake-indexeddb/auto MUST be first — patches global indexedDB before Dexie instantiates
import 'fake-indexeddb/auto';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/store/auth', () => ({
  useAuth: { getState: () => ({ user: { id: 'u1' } }) },
}));

vi.mock('@/shared/utils/analytics', () => ({
  trackModuleCompleted: vi.fn(),
}));

// Import after fake-indexeddb patch and mocks are in place
import { db } from '../src/db/finempoderDb';
import { lessonProgressRepository } from '../src/db/lessonProgress.repository';

beforeEach(async () => {
  await db.lessonProgress.clear();
});

describe('setCompletedLocal', () => {
  it('crea registro completed=true', async () => {
    await lessonProgressRepository.setCompletedLocal('ahorro', 'L01');
    const record = await db.lessonProgress
      .where({ userId: 'u1', moduleId: 'ahorro', lessonId: 'L01' })
      .first();
    expect(record?.completed).toBe(true);
    expect(record?.completedAt).toBeTruthy();
  });

  it('no duplica en segunda llamada', async () => {
    await lessonProgressRepository.setCompletedLocal('ahorro', 'L02');
    await lessonProgressRepository.setCompletedLocal('ahorro', 'L02');
    const all = await db.lessonProgress
      .where({ userId: 'u1', moduleId: 'ahorro', lessonId: 'L02' })
      .toArray();
    expect(all).toHaveLength(1);
  });
});

describe('isCompleted', () => {
  it('retorna false sin registro', async () => {
    expect(await lessonProgressRepository.isCompleted('presupuesto', 'L99')).toBe(false);
  });

  it('retorna true después de completar', async () => {
    await lessonProgressRepository.setCompletedLocal('presupuesto', 'L05');
    expect(await lessonProgressRepository.isCompleted('presupuesto', 'L05')).toBe(true);
  });
});

describe('applyServerProgress', () => {
  it('crea registros desde lista del servidor', async () => {
    await lessonProgressRepository.applyServerProgress('u1', 'inversion', ['L01', 'L03']);
    const l01 = await db.lessonProgress
      .where({ userId: 'u1', moduleId: 'inversion', lessonId: 'L01' })
      .first();
    expect(l01?.completed).toBe(true);
  });

  it('no duplica si el registro ya existe localmente', async () => {
    await lessonProgressRepository.setCompletedLocal('inversion', 'L02');
    await lessonProgressRepository.applyServerProgress('u1', 'inversion', ['L02']);
    const all = await db.lessonProgress
      .where({ userId: 'u1', moduleId: 'inversion', lessonId: 'L02' })
      .toArray();
    expect(all).toHaveLength(1);
  });

  it('preserva completedAt original en merge', async () => {
    const original = '2025-01-15T10:00:00.000Z';
    await db.lessonProgress.add({
      userId: 'u1',
      moduleId: 'ahorro',
      lessonId: 'L10',
      completed: true,
      completedAt: original,
    });
    await lessonProgressRepository.applyServerProgress('u1', 'ahorro', ['L10']);
    const record = await db.lessonProgress
      .where({ userId: 'u1', moduleId: 'ahorro', lessonId: 'L10' })
      .first();
    expect(record?.completedAt).toBe(original);
  });
});
