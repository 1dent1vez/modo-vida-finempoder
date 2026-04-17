/**
 * Mock del cliente Supabase para tests unitarios.
 * Monkey-patcha supabase.from() y supabase.auth con stores en memoria.
 * Importar ANTES que cualquier controller.
 */
import { supabase } from '../src/lib/supabase.js';

type Row = Record<string, any>;

export const store: Record<string, Row[]> = {
  profiles: [],
  lesson_progress: [],
  gamification: [],
  questionnaire_results: [],
  budgets: [],
};

export function resetStore() {
  for (const key of Object.keys(store)) store[key] = [];
  authUsers.clear();
}

export const authUsers = new Map<string, { id: string; email: string; password: string }>();

const now = () => new Date().toISOString();
const uid = () => Math.random().toString(36).slice(2);

class Builder {
  private _table: string;
  private _op: 'select' | 'insert' | 'update' | 'upsert' | 'delete' = 'select';
  private _filters: Array<(r: Row) => boolean> = [];
  private _payload: any = null;
  private _upsertConflict = '';
  private _countExact = false;
  private _headOnly = false;
  private _hasPostSelect = false; // .select() after insert/update/upsert

  constructor(table: string) {
    this._table = table;
  }

  select(fields = '*', opts?: { count?: string; head?: boolean }) {
    if (this._op !== 'select') this._hasPostSelect = true;
    if (opts?.count === 'exact') this._countExact = true;
    if (opts?.head) this._headOnly = true;
    return this;
  }

  insert(payload: any) { this._op = 'insert'; this._payload = payload; return this; }
  update(payload: any) { this._op = 'update'; this._payload = payload; return this; }
  upsert(payload: any, opts?: { onConflict?: string }) {
    this._op = 'upsert'; this._payload = payload;
    this._upsertConflict = opts?.onConflict ?? '';
    return this;
  }
  delete(opts?: { count?: string }) {
    this._op = 'delete';
    if (opts?.count === 'exact') this._countExact = true;
    return this;
  }

  eq(field: string, value: any) { this._filters.push((r) => r[field] === value); return this; }
  gte(field: string, value: any) { this._filters.push((r) => r[field] >= value); return this; }
  lte(field: string, value: any) { this._filters.push((r) => r[field] <= value); return this; }
  private _rangeFrom: number | null = null;
  private _rangeTo: number | null = null;

  order() { return this; }
  range(from: number, to: number) { this._rangeFrom = from; this._rangeTo = to; return this; }

  single(): Promise<{ data: any; error: any }> {
    return this._resolve().then(({ data, error }) => ({
      data: Array.isArray(data) ? (data[0] ?? null) : data,
      error: Array.isArray(data) && data.length === 0 ? { message: 'not found' } : error,
    }));
  }

  then<T>(resolve: (v: { data: any; error: any; count?: number }) => T, reject?: (e: any) => T): Promise<T> {
    return this._resolve().then(resolve, reject);
  }

  private async _resolve(): Promise<{ data: any; error: any; count?: number }> {
    const rows = store[this._table] ?? [];
    const match = (r: Row) => this._filters.every((f) => f(r));

    if (this._op === 'select') {
      const filtered = rows.filter(match);
      const total = filtered.length;
      if (this._headOnly) return { data: null, error: null, count: total };
      const paged = this._rangeFrom !== null && this._rangeTo !== null
        ? filtered.slice(this._rangeFrom, this._rangeTo + 1)
        : filtered;
      return { data: paged, error: null, count: this._countExact ? total : undefined };
    }

    if (this._op === 'insert') {
      const arr = Array.isArray(this._payload) ? this._payload : [this._payload];
      const inserted = arr.map((d) => ({ id: uid(), ...d, created_at: now(), updated_at: now() }));
      store[this._table].push(...inserted);
      const result = inserted.length === 1 ? inserted[0] : inserted;
      return { data: this._hasPostSelect ? result : null, error: null };
    }

    if (this._op === 'update') {
      const updated: Row[] = [];
      store[this._table] = rows.map((r) => {
        if (match(r)) { const u = { ...r, ...this._payload, updated_at: now() }; updated.push(u); return u; }
        return r;
      });
      const result = updated.length === 1 ? updated[0] : updated;
      return { data: this._hasPostSelect ? result : null, error: null };
    }

    if (this._op === 'upsert') {
      const d = this._payload as Row;
      const fields = this._upsertConflict.split(',').map((f) => f.trim());
      const existing = rows.find((r) => fields.every((f) => r[f] === d[f]));
      let result: Row;
      if (existing) {
        result = { ...existing, ...d, updated_at: now() };
        store[this._table] = rows.map((r) => (r === existing ? result : r));
      } else {
        result = { id: uid(), ...d, created_at: now(), updated_at: now() };
        store[this._table].push(result);
      }
      return { data: result, error: null };
    }

    if (this._op === 'delete') {
      const before = rows.length;
      store[this._table] = rows.filter((r) => !match(r));
      const count = before - store[this._table].length;
      return { data: null, error: count === 0 ? { message: 'not found' } : null, count };
    }

    return { data: null, error: null };
  }
}

// Patch supabase
(supabase as any).from = (table: string) => new Builder(table);

(supabase as any).auth = {
  signUp: async ({ email, password }: any) => {
    if (authUsers.has(email)) {
      return { data: { user: null, session: null }, error: { message: 'User already registered' } };
    }
    const id = uid();
    authUsers.set(email, { id, email, password });
    return { data: { user: { id, email }, session: { access_token: `mock-${id}` } }, error: null };
  },
  signInWithPassword: async ({ email, password }: any) => {
    const u = authUsers.get(email);
    if (!u || u.password !== password) {
      return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } };
    }
    return { data: { user: { id: u.id, email }, session: { access_token: `mock-${u.id}` } }, error: null };
  },
  getUser: async (token: string) => {
    if (token?.startsWith('mock-')) {
      return { data: { user: { id: token.replace('mock-', ''), email: 'test@example.com' } }, error: null };
    }
    return { data: { user: null }, error: { message: 'invalid token' } };
  },
};
