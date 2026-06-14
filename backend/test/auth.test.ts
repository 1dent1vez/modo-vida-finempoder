import { test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { resetStore, authUsers } from './mockSupabase.js';
import { register } from '../src/controllers/auth.controller.js';

const res = () => {
  const r: any = { statusCode: 200 };
  r.status = (c: number) => { r.statusCode = c; return r; };
  r.json = (b: any) => { r.body = b; return r; };
  return r;
};

beforeEach(() => resetStore());

test('register crea usuario y retorna token', async () => {
  const req: any = { body: { email: 'a@test.com', password: '12345678' } };
  const r = res();
  await register(req, r);
  assert.strictEqual(r.statusCode, 201);
  assert.ok(r.body.token);
  assert.strictEqual(r.body.user.email, 'a@test.com');
});

test('register falla con email duplicado', async () => {
  authUsers.set('dup@test.com', { id: '1', email: 'dup@test.com', password: 'any' });
  const req: any = { body: { email: 'dup@test.com', password: '12345678' } };
  const r = res();
  await register(req, r);
  assert.strictEqual(r.statusCode, 409);
});
