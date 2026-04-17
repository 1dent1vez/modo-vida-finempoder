import type { Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { BudgetCreateSchema, BudgetUpdateSchema } from '../schemas/budget.schema.js';

const queryFilterSchema = z.object({
  from: z.string().date().optional(),
  to: z.string().date().optional(),
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function listBudget(req: Request, res: Response) {
  const userId = req.user!.sub;
  const parsed = queryFilterSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Parámetros de filtro inválidos', details: parsed.error.flatten().fieldErrors });
  }
  const { from, to, type, category, page, limit } = parsed.data;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('budgets')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (type) query = query.eq('type', type);
  if (category) query = query.eq('category', category);
  if (from) query = query.gte('date', from);
  if (to) query = query.lte('date', to);

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ error: 'Error al listar presupuesto' });

  return res.json({ data, total: count, page, limit });
}

export async function createBudget(req: Request, res: Response) {
  const userId = req.user!.sub;
  const parsed = BudgetCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const { data, error } = await supabase
    .from('budgets')
    .insert({ ...parsed.data, user_id: userId })
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Error al crear registro' });
  return res.status(201).json(data);
}

export async function getBudget(req: Request, res: Response) {
  const userId = req.user!.sub;
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', userId)
    .single();

  if (error || !data) return res.status(404).json({ error: 'not_found' });
  return res.json(data);
}

export async function updateBudget(req: Request, res: Response) {
  const userId = req.user!.sub;
  const parsed = BudgetUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const { data, error } = await supabase
    .from('budgets')
    .update(parsed.data)
    .eq('id', req.params.id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error || !data) return res.status(404).json({ error: 'not_found' });
  return res.json(data);
}

export async function deleteBudget(req: Request, res: Response) {
  const userId = req.user!.sub;
  const { error, count } = await supabase
    .from('budgets')
    .delete({ count: 'exact' })
    .eq('id', req.params.id)
    .eq('user_id', userId);

  if (error || !count) return res.status(404).json({ error: 'not_found' });
  return res.status(204).end();
}

export async function summaryBudget(req: Request, res: Response) {
  const userId = req.user!.sub;
  const parsed = z.object({
    from: z.string().date().optional(),
    to: z.string().date().optional(),
  }).safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({ error: 'Parámetros de fecha inválidos' });
  }
  const { from, to } = parsed.data;

  let query = supabase.from('budgets').select('type,category,amount').eq('user_id', userId);
  if (from) query = query.gte('date', from);
  if (to) query = query.lte('date', to);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: 'Error al calcular resumen' });

  const rows = data ?? [];
  const income = rows.filter((r) => r.type === 'income').reduce((s, r) => s + r.amount, 0);
  const expense = rows.filter((r) => r.type === 'expense').reduce((s, r) => s + r.amount, 0);

  const byCategory: Record<string, Record<string, number>> = {};
  for (const r of rows) {
    byCategory[r.type] ??= {};
    byCategory[r.type]![r.category] = (byCategory[r.type]![r.category] ?? 0) + r.amount;
  }

  return res.json({ income, expense, balance: income - expense, byCategory });
}
