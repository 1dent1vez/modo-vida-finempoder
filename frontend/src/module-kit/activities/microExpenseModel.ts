export type MicroExpenseDraft = {
  version: 1;
  stage: 'observe' | 'review' | 'complete';
  selected: string[];
};
export const initialMicroExpense = (): MicroExpenseDraft => ({
  version: 1,
  stage: 'observe',
  selected: [],
});
export function parseMicroExpense(raw: unknown, validIds: Set<string>): MicroExpenseDraft | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as MicroExpenseDraft;
  if (
    value.version !== 1 ||
    !['observe', 'review', 'complete'].includes(value.stage) ||
    !Array.isArray(value.selected) ||
    value.selected.some((id) => typeof id !== 'string' || !validIds.has(id)) ||
    new Set(value.selected).size !== value.selected.length ||
    (value.stage !== 'observe' && value.selected.length < 3)
  )
    return null;
  return value;
}
