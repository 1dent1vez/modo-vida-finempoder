import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';

process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'local-test-placeholder';
process.env.NEWSLETTER_ENABLED = 'true';
process.env.NEWSLETTER_ADMIN_IDS = '00000000-0000-4000-8000-000000000001';
const { supabase } = await import('../src/lib/supabase.js');
const { app } = await import('../src/app.js');
const editor = process.env.NEWSLETTER_ADMIN_IDS;
const reader = '00000000-0000-4000-8000-000000000002';
const editionId = '00000000-0000-4000-8000-000000000003';
const rows: Record<string, Record<string, unknown>[]> = {
  newsletter_editions: [{ id: editionId, title: 'Edición pagada', summary: 'Resumen visible', body: 'CONTENIDO_PRIVADO', status: 'published', is_sample: false }],
  newsletter_memberships: [{ user_id: reader, status: 'active', paid_until: new Date(Date.now() + 3600000).toISOString(), pilot_until: null, cancel_at_period_end: false }],
};
// In-memory adapter exercises the real Express authentication and route policies.
(supabase.auth as any).getUser = async (token: string) => ({ data: { user: ['reader','editor'].includes(token) ? { id: token === 'editor' ? editor : reader, email: 'test@example.com' } : null }, error: null });
(supabase as any).from = (table: string) => {
  let filters: ((row: Record<string, unknown>) => boolean)[] = [];
  let fields = '*'; let single = false;
  const query: any = {
    select(value = '*') { fields = value; return query; },
    eq(key: string, value: unknown) { filters.push(row => row[key] === value); return query; },
    order() { return query; }, limit() { return query; },
    maybeSingle() { single = true; return query; },
    then(resolve: (value: unknown) => unknown) {
      const data = (rows[table] ?? []).filter(row => filters.every(filter => filter(row))).map(row => fields === '*' ? { ...row } : Object.fromEntries(fields.split(',').map(key => [key, row[key]])));
      return Promise.resolve({ data: single ? data[0] ?? null : data, error: null }).then(resolve);
    },
  };
  return query;
};
let server: Server; let baseUrl: string;
before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
  baseUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}/api/newsletter`;
});
after(async () => { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); });
const get = (path: string, token = '') => fetch(`${baseUrl}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });

test('public catalog excludes paid body and disables HTTP caching', async () => {
  const response = await get('/catalog'); const text = await response.text();
  assert.equal(response.status, 200); assert.equal(text.includes('CONTENIDO_PRIVADO'), false);
  assert.match(response.headers.get('cache-control')!, /no-store/);
});
test('guest direct requests cannot read paid bodies or admin data', async () => {
  assert.equal((await get(`/editions/${editionId}`)).status, 401);
  assert.equal((await get('/admin/editions')).status, 401);
  assert.equal((await get(`/sample/${editionId}`)).status, 404);
});
test('signed-in non-editor cannot read administration', async () => {
  assert.equal((await get('/admin/editions', 'reader')).status, 403);
  assert.equal((await get('/admin/editions', 'editor')).status, 200);
  assert.equal((await get('/admin/ai-draft', 'reader')).status, 403);
});
test('reader access is determined server-side and expires immediately', async () => {
  const response = await get(`/editions/${editionId}`, 'reader');
  assert.equal(response.status, 200); assert.match(await response.text(), /CONTENIDO_PRIVADO/);
  rows.newsletter_memberships![0]!.paid_until = '2020-01-01T00:00:00Z';
  assert.equal((await get(`/editions/${editionId}`, 'reader')).status, 403);
});
test('drafts remain private even for paying readers', async () => {
  rows.newsletter_editions![0]!.status = 'draft'; rows.newsletter_editions![0]!.is_sample = true;
  assert.equal((await get(`/sample/${editionId}`)).status, 404);
  assert.equal((await get(`/editions/${editionId}`, 'reader')).status, 404);
});
test('forged provider events and unconfigured jobs cannot mutate access', async () => {
  assert.equal((await fetch(`${baseUrl}/webhook/stripe`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 400);
  assert.equal((await fetch(`${baseUrl}/jobs/publish`, { method: 'POST' })).status, 403);
});
test('checkout does not start with payments disabled', async () => {
  const response = await fetch(`${baseUrl}/checkout`, { method: 'POST', headers: { Authorization: 'Bearer reader', 'Content-Type': 'application/json' }, body: JSON.stringify({ adult: true, acceptsTerms: true, emailEnabled: true }) });
  assert.ok(response.status >= 500);
});

const { paidThrough } = await import('../src/newsletter/billing.js');
test('entitlement uses the paid invoice line, not a potentially unpaid subscription period', () => {
  const sub: any = { current_period_end: 2000000000, latest_invoice: { paid: true, amount_paid: 4900,
    lines: { data: [{ price: { id: 'price_newsletter' }, proration: false, period: { end: 1800000000 } }] } } };
  assert.equal(paidThrough(sub, 'price_newsletter'), new Date(1800000000 * 1000).toISOString());
  sub.latest_invoice.paid = false;
  assert.equal(paidThrough(sub, 'price_newsletter'), null);
  sub.latest_invoice.paid = true;
  assert.equal(paidThrough(sub, 'another_product'), null);
});
