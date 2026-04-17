import { test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { resetStore, store } from './mockSupabase.js';
import { getMyGamification } from '../src/controllers/gamification.controller.js';

const res = () => {
  const r: any = { statusCode: 200 };
  r.status = (c: number) => { r.statusCode = c; return r; };
  r.json = (b: any) => { r.body = b; return r; };
  return r;
};

beforeEach(() => resetStore());

test('getMyGamification retorna defaults cuando no hay registro', async () => {
  const req: any = { user: { sub: 'u1', email: 'test@test.com' } };
  const r = res();
  await getMyGamification(req, r);
  assert.strictEqual(r.statusCode, 200);
  assert.strictEqual(r.body.xp, 0);
  assert.strictEqual(r.body.level, 1);
  assert.ok(r.body.streak !== undefined);
});

test('getMyGamification retorna datos del store', async () => {
  store.gamification.push({
    id: '1', user_id: 'u2', xp: 50, level: 1,
    streak_current: 3, streak_best: 5, last_active_iso: '2026-04-01',
    module_progress: { presupuesto: 40 }, created_at: '', updated_at: '',
  });
  const req: any = { user: { sub: 'u2' } };
  const r = res();
  await getMyGamification(req, r);
  assert.strictEqual(r.statusCode, 200);
  assert.strictEqual(r.body.xp, 50);
  assert.strictEqual(r.body.streak.current, 3);
  assert.strictEqual(r.body.streak.best, 5);
});

test('getMyGamification rechaza sin usuario', async () => {
  const req: any = {};
  const r = res();
  await getMyGamification(req, r);
  assert.strictEqual(r.statusCode, 401);
});
