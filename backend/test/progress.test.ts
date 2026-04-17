import { test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { resetStore, store } from './mockSupabase.js';
import { recordLessonCompletion, getModuleProgress } from '../src/controllers/progress.controller.js';

const res = () => {
  const r: any = { statusCode: 200 };
  r.status = (c: number) => { r.statusCode = c; return r; };
  r.json = (b: any) => { r.body = b; return r; };
  return r;
};

beforeEach(() => resetStore());

test('recordLessonCompletion guarda progreso y otorga XP', async () => {
  const req: any = { user: { sub: 'u1' }, body: { moduleId: 'presupuesto', lessonId: 'L01' } };
  const r = res();
  await recordLessonCompletion(req, r);
  assert.strictEqual(r.statusCode, 201);
  assert.strictEqual(r.body.gamification.xp, 10);
  assert.strictEqual(r.body.moduleId, 'presupuesto');

  const saved = store.lesson_progress.find((p) => p.user_id === 'u1' && p.lesson_id === 'L01');
  assert.ok(saved);
  assert.strictEqual(saved.completed, true);
});

test('recordLessonCompletion es idempotente (retorna 200 en segunda llamada)', async () => {
  const req: any = { user: { sub: 'u1' }, body: { moduleId: 'presupuesto', lessonId: 'L01' } };
  await recordLessonCompletion(req, res());
  const r2 = res();
  await recordLessonCompletion(req, r2);
  assert.strictEqual(r2.statusCode, 200);
  // XP no se duplica
  const gam = store.gamification.find((g) => g.user_id === 'u1');
  assert.strictEqual(gam?.xp, 10);
});

test('getModuleProgress lista lecciones completadas', async () => {
  store.lesson_progress.push({
    id: '1', user_id: 'u2', module_id: 'ahorro', lesson_id: 'L01',
    completed: true, completed_at: new Date().toISOString(), created_at: '', updated_at: '',
  });
  const req: any = { user: { sub: 'u2' }, params: { moduleId: 'ahorro' } };
  const r = res();
  await getModuleProgress(req, r);
  assert.strictEqual(r.statusCode, 200);
  assert.ok(r.body.lessonsCompleted.includes('L01'));
  assert.strictEqual(r.body.progressPercent, 7); // 1/15 ≈ 6.67 → 7%
});
