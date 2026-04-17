import { test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { resetStore, authUsers } from './mockSupabase.js';
import { register, login } from '../src/controllers/auth.controller.js';

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

test('login exitoso con credenciales correctas', async () => {
  authUsers.set('b@test.com', { id: 'uid1', email: 'b@test.com', password: 'password1' });
  const req: any = { body: { email: 'b@test.com', password: 'password1' } };
  const r = res();
  await login(req, r);
  assert.strictEqual(r.statusCode, 200);
  assert.ok(r.body.token);
});

test('login falla con contraseña incorrecta', async () => {
  authUsers.set('c@test.com', { id: 'uid2', email: 'c@test.com', password: 'correct1' });
  const req: any = { body: { email: 'c@test.com', password: 'wrongwrong' } };
  const r = res();
  await login(req, r);
  assert.strictEqual(r.statusCode, 401);
});
