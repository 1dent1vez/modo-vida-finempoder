export type CrisisStage = 'stories' | 'check' | 'plan' | 'review' | 'complete';
export type CrisisDraft = {
  version: 1;
  stage: CrisisStage;
  storyIndex: number;
  checkIndex: number;
  pendingAnswer: number | null;
  answers: Record<string, number>;
  plan: string | null;
};
export const initialCrisisDraft = (): CrisisDraft => ({
  version: 1,
  stage: 'stories',
  storyIndex: 0,
  checkIndex: 0,
  pendingAnswer: null,
  answers: {},
  plan: null,
});
export function parseCrisisDraft(
  raw: unknown,
  storyCount: number,
  questionIds: Set<string>,
  planIds: Set<string>,
): CrisisDraft | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as CrisisDraft;
  const validAnswers =
    value.answers &&
    Object.entries(value.answers).every(
      ([id, answer]) => questionIds.has(id) && Number.isInteger(answer) && answer >= 0,
    );
  if (
    value.version !== 1 ||
    !['stories', 'check', 'plan', 'review', 'complete'].includes(value.stage) ||
    !Number.isInteger(value.storyIndex) ||
    value.storyIndex < 0 ||
    value.storyIndex >= storyCount ||
    !Number.isInteger(value.checkIndex) ||
    value.checkIndex < 0 ||
    value.checkIndex >= questionIds.size ||
    (value.pendingAnswer !== null &&
      (!Number.isInteger(value.pendingAnswer) || value.pendingAnswer < 0)) ||
    !validAnswers ||
    (value.plan !== null && !planIds.has(value.plan)) ||
    (['plan', 'review', 'complete'].includes(value.stage) &&
      Object.keys(value.answers).length !== questionIds.size) ||
    (['review', 'complete'].includes(value.stage) && !value.plan)
  )
    return null;
  return value;
}
