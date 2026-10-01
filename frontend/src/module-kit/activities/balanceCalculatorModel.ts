export type BalanceDraft = {
  version: 1;
  stage: 'calculate' | 'review' | 'complete';
  income: number;
  expenses: number;
  interacted: boolean;
};
export const initialBalance = (): BalanceDraft => ({
  version: 1,
  stage: 'calculate',
  income: 3000,
  expenses: 2280,
  interacted: false,
});
export const balanceOf = (draft: BalanceDraft) => draft.income - draft.expenses;
export function parseBalance(raw: unknown): BalanceDraft | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as BalanceDraft;
  if (
    value.version !== 1 ||
    !['calculate', 'review', 'complete'].includes(value.stage) ||
    !Number.isFinite(value.income) ||
    !Number.isFinite(value.expenses) ||
    value.income < 0 ||
    value.expenses < 0 ||
    value.income > 10000000 ||
    value.expenses > 10000000 ||
    typeof value.interacted !== 'boolean' ||
    (value.stage !== 'calculate' && !value.interacted)
  )
    return null;
  return value;
}
