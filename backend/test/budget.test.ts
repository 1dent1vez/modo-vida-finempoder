import { test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { resetStore, store } from './mockSupabase.js';
import {
  listBudget,
  createBudget,
  getBudget,
  updateBudget,
  deleteBudget,
  summaryBudget,
} from '../src/controllers/budget.controller.js';

const res = () => {
  const r: any = { statusCode: 200 };
  r.status = (c: number) => { r.statusCode = c; return r; };
  r.json = (b: any) => { r.body = b; return r; };
  r.end = () => r;
  return r;
};

const USER = 'user-budget-1';

function seedBudgets(n: number, overrides: Partial<Record<string, any>> = {}) {
  for (let i = 1; i <= n; i++) {
    store.budgets.push({
      id: `b${i}`,
      user_id: USER,
      category: 'Alimentación',
      type: i % 2 === 0 ? 'expense' : 'income',
      amount: i * 100,
      date: `2024-01-${String(i).padStart(2, '0')}`,
      periodicity: 'one_time',
      created_at: '',
      updated_at: '',
      ...overrides,
    });
  }
}

beforeEach(() => resetStore());

// ── listBudget ─────────────────────────────────────────────────────────────

test('listBudget devuelve primera página con totales', async () => {
  seedBudgets(25);
  const req: any = { user: { sub: USER }, query: {} };
  const r = res();
  await listBudget(req, r);
  assert.strictEqual(r.statusCode, 200);
  assert.strictEqual(r.body.page, 1);
  assert.strictEqual(r.body.limit, 20);
  assert.strictEqual(r.body.total, 25);
  assert.strictEqual(r.body.data.length, 20);
});

test('listBudget segunda página devuelve registros restantes', async () => {
  seedBudgets(25);
  const req: any = { user: { sub: USER }, query: { page: '2', limit: '20' } };
  const r = res();
  await listBudget(req, r);
  assert.strictEqual(r.body.page, 2);
  assert.strictEqual(r.body.data.length, 5);
  assert.strictEqual(r.body.total, 25);
});

test('listBudget respeta limit personalizado (máx 50)', async () => {
  seedBudgets(10);
  const req: any = { user: { sub: USER }, query: { limit: '5' } };
  const r = res();
  await listBudget(req, r);
  assert.strictEqual(r.body.data.length, 5);
  assert.strictEqual(r.body.limit, 5);
});

test('listBudget rechaza limit > 50', async () => {
  const req: any = { user: { sub: USER }, query: { limit: '51' } };
  const r = res();
  await listBudget(req, r);
  assert.strictEqual(r.statusCode, 400);
});

test('listBudget rechaza page < 1', async () => {
  const req: any = { user: { sub: USER }, query: { page: '0' } };
  const r = res();
  await listBudget(req, r);
  assert.strictEqual(r.statusCode, 400);
});

test('listBudget filtra por tipo', async () => {
  seedBudgets(10);
  const req: any = { user: { sub: USER }, query: { type: 'income' } };
  const r = res();
  await listBudget(req, r);
  assert.ok(r.body.data.every((d: any) => d.type === 'income'));
});

test('listBudget no mezcla registros de otro usuario', async () => {
  seedBudgets(5);
  store.budgets.push({
    id: 'other-1', user_id: 'other-user', category: 'Ocio',
    type: 'expense', amount: 999, date: '2024-01-01',
    periodicity: 'one_time', created_at: '', updated_at: '',
  });
  const req: any = { user: { sub: USER }, query: {} };
  const r = res();
  await listBudget(req, r);
  assert.strictEqual(r.body.total, 5);
  assert.ok(r.body.data.every((d: any) => d.user_id === USER));
});

test('listBudget página vacía devuelve data vacía', async () => {
  seedBudgets(3);
  const req: any = { user: { sub: USER }, query: { page: '2', limit: '20' } };
  const r = res();
  await listBudget(req, r);
  assert.strictEqual(r.body.data.length, 0);
  assert.strictEqual(r.body.total, 3);
});

// ── createBudget ───────────────────────────────────────────────────────────

test('createBudget crea un registro y devuelve 201', async () => {
  const req: any = {
    user: { sub: USER },
    body: { category: 'Transporte', type: 'expense', amount: 50, date: '2024-03-01' },
  };
  const r = res();
  await createBudget(req, r);
  assert.strictEqual(r.statusCode, 201);
  assert.strictEqual(r.body.category, 'Transporte');
  assert.strictEqual(store.budgets.length, 1);
});

test('createBudget rechaza categoría inválida', async () => {
  const req: any = {
    user: { sub: USER },
    body: { category: 'Invalida', type: 'expense', amount: 50, date: '2024-03-01' },
  };
  const r = res();
  await createBudget(req, r);
  assert.strictEqual(r.statusCode, 400);
});

// ── getBudget ──────────────────────────────────────────────────────────────

test('getBudget retorna el registro correcto', async () => {
  seedBudgets(1);
  const req: any = { user: { sub: USER }, params: { id: 'b1' } };
  const r = res();
  await getBudget(req, r);
  assert.strictEqual(r.statusCode, 200);
  assert.strictEqual(r.body.id, 'b1');
});

test('getBudget retorna 404 si no existe', async () => {
  const req: any = { user: { sub: USER }, params: { id: 'nope' } };
  const r = res();
  await getBudget(req, r);
  assert.strictEqual(r.statusCode, 404);
});

// ── updateBudget ───────────────────────────────────────────────────────────

test('updateBudget modifica el registro', async () => {
  seedBudgets(1);
  const req: any = { user: { sub: USER }, params: { id: 'b1' }, body: { amount: 999 } };
  const r = res();
  await updateBudget(req, r);
  assert.strictEqual(r.statusCode, 200);
  assert.strictEqual(r.body.amount, 999);
});

// ── deleteBudget ───────────────────────────────────────────────────────────

test('deleteBudget elimina el registro y devuelve 204', async () => {
  seedBudgets(2);
  const req: any = { user: { sub: USER }, params: { id: 'b1' } };
  const r = res();
  await deleteBudget(req, r);
  assert.strictEqual(r.statusCode, 204);
  assert.strictEqual(store.budgets.length, 1);
});

test('deleteBudget retorna 404 si no existe', async () => {
  const req: any = { user: { sub: USER }, params: { id: 'nope' } };
  const r = res();
  await deleteBudget(req, r);
  assert.strictEqual(r.statusCode, 404);
});

// ── summaryBudget ──────────────────────────────────────────────────────────

test('summaryBudget calcula ingresos, gastos y balance', async () => {
  store.budgets.push(
    { id: 's1', user_id: USER, type: 'income', category: 'Otros', amount: 1000, date: '2024-02-01', created_at: '', updated_at: '' },
    { id: 's2', user_id: USER, type: 'expense', category: 'Alimentación', amount: 300, date: '2024-02-05', created_at: '', updated_at: '' },
    { id: 's3', user_id: USER, type: 'expense', category: 'Transporte', amount: 150, date: '2024-02-10', created_at: '', updated_at: '' },
  );
  const req: any = { user: { sub: USER }, query: {} };
  const r = res();
  await summaryBudget(req, r);
  assert.strictEqual(r.body.income, 1000);
  assert.strictEqual(r.body.expense, 450);
  assert.strictEqual(r.body.balance, 550);
  assert.strictEqual(r.body.byCategory.expense['Alimentación'], 300);
});
