// fake-indexeddb/auto MUST be first — patches global indexedDB before Dexie instantiates
import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from './finempoderDb';
import { lessonResumeRepository } from './lessonResume.repository';

beforeEach(async () => {
  await db.userLessonData.clear();
});

describe('lessonResumeRepository', () => {
  it('save crea un snapshot y get lo devuelve', async () => {
    await lessonResumeRepository.save('presupuesto', 'L03', { step: 2, payload: { note: 'x' } });
    expect(await lessonResumeRepository.get('presupuesto', 'L03')).toEqual({
      step: 2,
      payload: { note: 'x' },
    });
  });

  it('get devuelve null sin snapshot', async () => {
    expect(await lessonResumeRepository.get('ahorro', 'L09')).toBeNull();
  });

  it('upsert sobrescribe el snapshot existente sin duplicar', async () => {
    await lessonResumeRepository.save('presupuesto', 'L03', { step: 1 });
    await lessonResumeRepository.save('presupuesto', 'L03', { step: 5 });
    const all = await db.userLessonData
      .where({ userId: 'local', moduleId: 'presupuesto', key: 'resume:v1:L03' })
      .toArray();
    expect(all).toHaveLength(1);
    expect(await lessonResumeRepository.get('presupuesto', 'L03')).toEqual({ step: 5 });
  });

  it('clear borra el snapshot sin afectar otra lección', async () => {
    await lessonResumeRepository.save('presupuesto', 'L03', { step: 2 });
    await lessonResumeRepository.save('presupuesto', 'L04', { step: 4 });
    await lessonResumeRepository.clear('presupuesto', 'L03');
    expect(await lessonResumeRepository.get('presupuesto', 'L03')).toBeNull();
    expect(await lessonResumeRepository.get('presupuesto', 'L04')).toEqual({ step: 4 });
  });
});
