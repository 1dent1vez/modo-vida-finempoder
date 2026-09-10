export type ExpenseRecord = { category: string; payment: string; correct: boolean };
export type ExpenseRegistrationDraft = {
  version: 1;
  stage: 'method' | 'practice' | 'review' | 'complete';
  method: string | null;
  index: number;
  records: Record<string, ExpenseRecord>;
};
export const initialExpenseRegistration = (): ExpenseRegistrationDraft => ({
  version: 1,
  stage: 'method',
  method: null,
  index: 0,
  records: {},
});
export function parseExpenseRegistration(
  raw: unknown,
  ids: Set<string>,
  methods: Set<string>,
): ExpenseRegistrationDraft | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as ExpenseRegistrationDraft;
  if (
    value.version !== 1 ||
    !['method', 'practice', 'review', 'complete'].includes(value.stage) ||
    (value.method !== null && !methods.has(value.method)) ||
    !Number.isInteger(value.index) ||
    value.index < 0 ||
    value.index >= ids.size ||
    !value.records ||
    typeof value.records !== 'object'
  )
    return null;
  if (
    Object.entries(value.records).some(
      ([id, record]) =>
        !ids.has(id) ||
        !record ||
        typeof record.category !== 'string' ||
        typeof record.payment !== 'string' ||
        typeof record.correct !== 'boolean',
    )
  )
    return null;
  if (value.stage !== 'method' && !value.method) return null;
  if (
    ['review', 'complete'].includes(value.stage) &&
    (Object.keys(value.records).length !== ids.size ||
      Object.values(value.records).some((record) => !record.correct))
  )
    return null;
  return value;
}
