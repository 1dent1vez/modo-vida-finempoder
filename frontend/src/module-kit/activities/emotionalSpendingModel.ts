export type SpendingLens = 'planned' | 'emotional' | 'impulsive';
export type EmotionalDraft = {
  version: 1;
  stage: 'scenarios' | 'strategy' | 'review' | 'complete';
  index: number;
  pending: SpendingLens | null;
  answers: Record<string, SpendingLens>;
  triggers: string[];
  strategy: string | null;
};
export const initialEmotional = (): EmotionalDraft => ({
  version: 1,
  stage: 'scenarios',
  index: 0,
  pending: null,
  answers: {},
  triggers: [],
  strategy: null,
});
export function parseEmotional(
  raw: unknown,
  scenarioIds: Set<string>,
  triggerIds: Set<string>,
  strategies: Set<string>,
): EmotionalDraft | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as EmotionalDraft;
  if (
    value.version !== 1 ||
    !['scenarios', 'strategy', 'review', 'complete'].includes(value.stage) ||
    !Number.isInteger(value.index) ||
    value.index < 0 ||
    value.index >= scenarioIds.size ||
    (value.pending !== null && !['planned', 'emotional', 'impulsive'].includes(value.pending)) ||
    !value.answers ||
    Object.entries(value.answers).some(
      ([id, answer]) =>
        !scenarioIds.has(id) || !['planned', 'emotional', 'impulsive'].includes(answer),
    ) ||
    !Array.isArray(value.triggers) ||
    value.triggers.some((id) => !triggerIds.has(id)) ||
    (value.strategy !== null && !strategies.has(value.strategy)) ||
    (value.stage !== 'scenarios' && Object.keys(value.answers).length !== scenarioIds.size) ||
    (['review', 'complete'].includes(value.stage) && !value.strategy)
  )
    return null;
  return value;
}
