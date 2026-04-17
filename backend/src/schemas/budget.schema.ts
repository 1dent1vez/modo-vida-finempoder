import { z } from 'zod';

export const BUDGET_CATEGORIES = [
  'Alimentación', 'Transporte', 'Vivienda', 'Educación',
  'Salud', 'Servicios', 'Ocio', 'Ahorro', 'Deuda', 'Otros',
] as const;

export const BUDGET_TYPES = ['income', 'expense'] as const;

export const BUDGET_PERIODICITY = [
  'one_time', 'weekly', 'biweekly', 'monthly', 'yearly',
] as const;

export const BudgetCreateSchema = z.object({
  category: z.enum(BUDGET_CATEGORIES),
  type: z.enum(BUDGET_TYPES),
  amount: z.number().nonnegative(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  notes: z.string().max(500).optional(),
  periodicity: z.enum(BUDGET_PERIODICITY).default('one_time'),
  tags: z.array(z.string().min(1)).max(10).optional(),
  attachments: z.array(z.string().url()).max(5).optional(),
});

export const BudgetUpdateSchema = BudgetCreateSchema.partial();

export type BudgetCreateDTO = z.infer<typeof BudgetCreateSchema>;
export type BudgetUpdateDTO = z.infer<typeof BudgetUpdateSchema>;
