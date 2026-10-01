export type BudgetDraft = {
  version: 1;
  stage: 'intro' | 'edit' | 'review' | 'complete';
  income: number;
  necesidades: number;
  deseos: number;
  ahorro: number;
  interacted: boolean;
};
export const initialBudget = (): BudgetDraft => ({
  version: 1,
  stage: 'intro',
  income: 2500,
  necesidades: 50,
  deseos: 30,
  ahorro: 20,
  interacted: false,
});
export const budgetTotal = (s: BudgetDraft) => s.necesidades + s.deseos + s.ahorro;
export function parseBudget(raw: unknown): BudgetDraft | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as BudgetDraft;
  if (
    s.version !== 1 ||
    !['intro', 'edit', 'review', 'complete'].includes(s.stage) ||
    typeof s.interacted !== 'boolean' ||
    !Number.isFinite(s.income) ||
    s.income <= 0 ||
    s.income > 10000000 ||
    ![s.necesidades, s.deseos, s.ahorro].every((v) => Number.isInteger(v) && v >= 0 && v <= 100) ||
    (['review', 'complete'].includes(s.stage) && (!s.interacted || budgetTotal(s) !== 100))
  )
    return null;
  return s;
}
