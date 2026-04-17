import { test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { resetStore, store } from './mockSupabase.js';
import { getMyResearchStatus, listStudentsSummary } from '../src/controllers/research.controller.js';
import { requireRole } from '../src/middlewares/requireRole.js';

const res = () => {
  const r: any = { statusCode: 200 };
  r.status = (c: number) => { r.statusCode = c; return r; };
  r.json = (b: any) => { r.body = b; return r; };
  return r;
};

beforeEach(() => resetStore());

test('getMyResearchStatus refleja test pre y progreso de módulo', async () => {
  store.questionnaire_results.push({
    id: '1', user_id: 'u1', type: 'pre', finempoderindex: 80,
    answers: [], score: 80, created_at: '', updated_at: '',
  });
  for (let i = 1; i <= 15; i++) {
    store.lesson_progress.push({
      id: String(i), user_id: 'u1', module_id: 'presupuesto',
      lesson_id: `L${String(i).padStart(2, '0')}`, completed: true,
      completed_at: '', created_at: '', updated_at: '',
    });
  }
  const req: any = { user: { sub: 'u1' } };
  const r = res();
  await getMyResearchStatus(req, r);
  assert.strictEqual(r.statusCode, 200);
  assert.strictEqual(r.body.preDone, true);
  assert.strictEqual(r.body.moduleProgress.presupuesto, 100);
});

// requireRole middleware — pruebas directas del middleware
test('requireRole rechaza a usuarios sin el rol correcto con 403', async () => {
  store.profiles.push({ id: 'student1', role: 'student', created_at: '', updated_at: '' });
  const req: any = { user: { sub: 'student1' } };
  const r = res();
  let nextCalled = false;
  await requireRole('admin')(req, r, () => { nextCalled = true; });
  assert.strictEqual(r.statusCode, 403);
  assert.strictEqual(nextCalled, false);
});

test('requireRole permite paso a usuarios con el rol correcto', async () => {
  store.profiles.push({ id: 'admin1', role: 'admin', created_at: '', updated_at: '' });
  const req: any = { user: { sub: 'admin1' } };
  const r = res();
  let nextCalled = false;
  await requireRole('admin')(req, r, () => { nextCalled = true; });
  assert.strictEqual(nextCalled, true);
});

// listStudentsSummary controller — presupone que el middleware ya autorizó
test('listStudentsSummary devuelve resumen de todos los alumnos', async () => {
  store.lesson_progress.push({
    id: '1', user_id: 'u2', module_id: 'ahorro', lesson_id: 'L01',
    completed: true, completed_at: '', created_at: '', updated_at: '',
  });
  const req: any = {};
  const r = res();
  await listStudentsSummary(req, r);
  assert.strictEqual(r.statusCode, 200);
  assert.ok(r.body.summaries.length >= 1);
});
