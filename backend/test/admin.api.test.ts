import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';

process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'local-test-placeholder';
process.env.NEWSLETTER_ENABLED = 'true';
process.env.NEWSLETTER_ADMIN_IDS = '';
const { supabase } = await import('../src/lib/supabase.js');
const { app } = await import('../src/app.js');
const adminId = '00000000-0000-4000-8000-000000000011';
const studentId = '00000000-0000-4000-8000-000000000012';
const authUsers = [
  { id: adminId, email: 'admin@example.com', created_at: '2026-09-01T00:00:00Z', last_sign_in_at: null, email_confirmed_at: '2026-09-01T00:00:00Z' },
  { id: studentId, email: 'student@example.com', created_at: '2026-09-02T00:00:00Z', last_sign_in_at: null, email_confirmed_at: null },
];
const rows: Record<string, Record<string, unknown>[]> = {
  profiles: [{ id: adminId, name: 'Admin', role: 'admin' }, { id: studentId, name: 'Student', role: 'student' }],
  lesson_progress: [{ id: 'progress-1', completed: true }],
  newsletter_memberships: [{ user_id: studentId }],
  newsletter_editions: [{ id: 'edition-1', title: 'Edición uno', status: 'draft', created_at: '2026-09-03T00:00:00Z', scheduled_at: null, delivery_status: null, delivery_error: null }],
};
(supabase.auth as any).getUser = async (token: string) => ({ data: { user: ['admin', 'student'].includes(token) ? { id: token === 'admin' ? adminId : studentId, email: `${token}@example.com` } : null }, error: null });
(supabase.auth.admin as any).listUsers = async ({ page, perPage }: { page: number; perPage: number }) => ({ data: { users: authUsers.slice((page - 1) * perPage, page * perPage), total: authUsers.length }, error: null });
(supabase as any).from = (table: string) => {
  let filters: ((row: Record<string, unknown>) => boolean)[] = [];
  let fields = '*'; let single = false; let count = false; let limit = Infinity;
  const query: any = {
    select(value = '*', options?: { count?: string; head?: boolean }) { fields = value; count = options?.count === 'exact'; return query; },
    eq(key: string, value: unknown) { filters.push(row => row[key] === value); return query; },
    in(key: string, values: unknown[]) { filters.push(row => values.includes(row[key])); return query; },
    order() { return query; }, limit(value: number) { limit = value; return query; },
    single() { single = true; return query; }, maybeSingle() { single = true; return query; },
    then(resolve: (value: unknown) => unknown) {
      const matched = (rows[table] ?? []).filter(row => filters.every(filter => filter(row)));
      const data = matched.slice(0, limit).map(row => fields === '*' ? { ...row } : Object.fromEntries(fields.split(',').map(key => [key, row[key]])));
      return Promise.resolve({ data: count ? null : single ? data[0] ?? null : data, count: count ? matched.length : null, error: null }).then(resolve);
    },
  };
  return query;
};

let server: Server; let baseUrl: string;
before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
  baseUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}/api`;
});
after(async () => { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); });
const get = (path: string, token = '') => fetch(`${baseUrl}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });

test('administration requires a valid admin role on every endpoint', async () => {
  for (const path of ['/admin/me', '/admin/overview', '/admin/users']) {
    assert.equal((await get(path)).status, 401);
    assert.equal((await get(path, 'student')).status, 403);
  }
});
test('admin overview returns operational counts without credentials', async () => {
  const response = await get('/admin/overview', 'admin');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('cache-control')!, /no-store/);
  const body = await response.json() as any;
  assert.equal(body.metrics.accounts, 2);
  assert.equal(body.metrics.completedLessons, 1);
  assert.equal(body.metrics.newsletterMembers, 1);
  assert.equal(body.metrics.draft, 1);
  assert.equal(body.editions[0].title, 'Edición uno');
  assert.equal(JSON.stringify(body).includes('local-test-placeholder'), false);
});
test('admin can list accounts, while sensitive auth fields remain private', async () => {
  const response = await get('/admin/users', 'admin');
  assert.equal(response.status, 200);
  const body = await response.json() as any;
  assert.equal(body.users.length, 2);
  assert.equal(body.users[0].role, 'admin');
  assert.equal(body.users[1].emailConfirmed, false);
  assert.deepEqual(Object.keys(body.users[0]).sort(), ['createdAt', 'email', 'emailConfirmed', 'id', 'lastSignInAt', 'name', 'role'].sort());
});
test('Supabase admin role also grants editorial access', async () => {
  const response = await get('/newsletter/me', 'admin');
  assert.equal(response.status, 200);
  assert.equal((await response.json() as any).isEditor, true);
  assert.equal((await get('/newsletter/admin/editions', 'admin')).status, 200);
  assert.equal((await get('/newsletter/admin/editions', 'student')).status, 403);
});
