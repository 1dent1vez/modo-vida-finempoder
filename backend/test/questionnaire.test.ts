import { test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { resetStore, store } from './mockSupabase.js';
import { submitQuestionnaire, getMyQuestionnaire } from '../src/controllers/questionnaire.controller.js';

const res = () => {
  const r: any = { statusCode: 200 };
  r.status = (c: number) => { r.statusCode = c; return r; };
  r.json = (b: any) => { r.body = b; return r; };
  return r;
};

beforeEach(() => resetStore());

test('submitQuestionnaire calcula finempoderIndex correctamente', async () => {
  const req: any = {
    user: { sub: 'u1' },
    params: { type: 'pre' },
    body: { answers: [{ questionId: 'q1', questionText: 't', value: 5 }] },
  };
  const r = res();
  await submitQuestionnaire(req, r);
  assert.strictEqual(r.statusCode, 201);
  assert.strictEqual(r.body.finempoderIndex, 100); // 5/5 * 100
});

test('submitQuestionnaire hace upsert (no duplica)', async () => {
  const req: any = {
    user: { sub: 'u1' },
    params: { type: 'pre' },
    body: { answers: [{ questionId: 'q1', value: 3 }] },
  };
  await submitQuestionnaire(req, res());
  await submitQuestionnaire(req, res());
  const records = store.questionnaire_results.filter((r) => r.user_id === 'u1' && r.type === 'pre');
  assert.strictEqual(records.length, 1);
});

test('getMyQuestionnaire retorna el cuestionario guardado', async () => {
  store.questionnaire_results.push({
    id: '1', user_id: 'u2', type: 'post', answers: [], score: 10, finempoderindex: 60,
    created_at: '', updated_at: '',
  });
  const req: any = { user: { sub: 'u2' }, params: { type: 'post' } };
  const r = res();
  await getMyQuestionnaire(req, r);
  assert.strictEqual(r.statusCode, 200);
  assert.strictEqual(r.body.type, 'post');
});

test('getMyQuestionnaire retorna 404 si no existe', async () => {
  const req: any = { user: { sub: 'u3' }, params: { type: 'pre' } };
  const r = res();
  await getMyQuestionnaire(req, r);
  assert.strictEqual(r.statusCode, 404);
});
