export type SmartGoalDraft = {
  version: 1;
  stage: 'build' | 'review' | 'complete';
  goal: string;
  amount: number;
  months: number;
  reason: string;
  feasibility: 'fits' | 'adjust' | 'unsure' | null;
  example: boolean;
};
export const initialSmartGoal = (): SmartGoalDraft => ({
  version: 1,
  stage: 'build',
  goal: '',
  amount: 0,
  months: 6,
  reason: '',
  feasibility: null,
  example: false,
});
export const monthlyContribution = (draft: SmartGoalDraft) =>
  draft.amount > 0 ? Math.ceil(draft.amount / draft.months) : 0;
export const validSmartGoal = (draft: SmartGoalDraft) =>
  draft.goal.trim().length >= 3 &&
  draft.amount > 0 &&
  draft.amount <= 10000000 &&
  Number.isInteger(draft.months) &&
  draft.months >= 1 &&
  draft.months <= 36 &&
  draft.reason.trim().length >= 5 &&
  draft.feasibility !== null;
export function parseSmartGoal(raw: unknown): SmartGoalDraft | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as SmartGoalDraft;
  if (
    value.version !== 1 ||
    !['build', 'review', 'complete'].includes(value.stage) ||
    typeof value.goal !== 'string' ||
    !Number.isFinite(value.amount) ||
    typeof value.reason !== 'string' ||
    ![null, 'fits', 'adjust', 'unsure'].includes(value.feasibility) ||
    typeof value.example !== 'boolean' ||
    (!validSmartGoal(value) && value.stage !== 'build')
  )
    return null;
  return value;
}
