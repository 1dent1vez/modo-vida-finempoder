import { test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { resetStore, store } from './mockSupabase.js';
import { submitQuestionnaire } from '../src/controllers/questionnaire.controller.js';

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
