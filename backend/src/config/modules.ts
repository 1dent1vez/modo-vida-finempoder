export const MODULES = ['presupuesto', 'ahorro', 'inversion'] as const;

export type ModuleId = (typeof MODULES)[number];

export const TOTAL_PER_MODULE = 15;

export const MODULE_TOTALS: Record<ModuleId, number> = {
  presupuesto: 15,
  ahorro: 15,
  inversion: 15,
};

export function computeProgressPercent(completedCount: number, total: number = TOTAL_PER_MODULE): number {
  return Math.min(100, Math.round((completedCount / total) * 100));
}
