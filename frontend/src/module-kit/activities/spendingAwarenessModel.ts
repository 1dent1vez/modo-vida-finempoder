export type SpendingAwarenessDraft = {
  version: 1;
  stage: 'observe' | 'classify' | 'review' | 'complete';
  expectation: string | null;
  classifications: Record<string, 'planned' | 'unplanned'>;
};

export const initialSpendingAwareness = (): SpendingAwarenessDraft => ({
  version: 1,
  stage: 'observe',
  expectation: null,
  classifications: {},
});

export function parseSpendingAwareness(
  raw: unknown,
  ids: Set<string>,
): SpendingAwarenessDraft | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as SpendingAwarenessDraft;
  if (
    value.version !== 1 ||
    !['observe', 'classify', 'review', 'complete'].includes(value.stage) ||
    (value.expectation !== null && typeof value.expectation !== 'string') ||
    !value.classifications ||
    typeof value.classifications !== 'object'
  )
    return null;
  if (
    Object.entries(value.classifications).some(
      ([id, answer]) => !ids.has(id) || !['planned', 'unplanned'].includes(answer),
    )
  )
    return null;
  if (value.stage !== 'observe' && !value.expectation) return null;
  if (
    ['review', 'complete'].includes(value.stage) &&
    Object.keys(value.classifications).length !== ids.size
  )
    return null;
  return value;
}
