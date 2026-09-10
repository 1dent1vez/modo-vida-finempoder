export type DecisionOption = {
  id: string;
  label: string;
  consequence: string;
  liquidity: string;
  tradeoff: string;
  principle: string;
  score: number;
};
export type DecisionScenario = {
  id: string;
  title: string;
  context: string;
  options: DecisionOption[];
};
export type DecisionDraft = {
  version: 1;
  started: boolean;
  index: number;
  selectedId: string | null;
  revealed: boolean;
  decisions: Record<string, string>;
  completed: boolean;
};
export const initialDecision = (): DecisionDraft => ({
  version: 1,
  started: false,
  index: 0,
  selectedId: null,
  revealed: false,
  decisions: {},
  completed: false,
});
export function parseDecision(raw: unknown, scenarios: DecisionScenario[]): DecisionDraft | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as DecisionDraft;
  const validDecisions =
    value.decisions &&
    typeof value.decisions === 'object' &&
    Object.entries(value.decisions).every(([scenarioId, optionId]) =>
      scenarios
        .find((item) => item.id === scenarioId)
        ?.options.some((option) => option.id === optionId),
    );
  const current = scenarios[value.index];
  const validSelection =
    value.selectedId === null || Boolean(current?.options.some((o) => o.id === value.selectedId));
  if (
    value.version !== 1 ||
    typeof value.started !== 'boolean' ||
    !Number.isInteger(value.index) ||
    value.index < 0 ||
    value.index > scenarios.length ||
    typeof value.revealed !== 'boolean' ||
    typeof value.completed !== 'boolean' ||
    !validDecisions ||
    !validSelection ||
    (value.revealed && value.selectedId === null) ||
    (value.index === scenarios.length && (value.selectedId !== null || value.revealed)) ||
    (value.completed && value.index !== scenarios.length) ||
    (!value.started && (value.index !== 0 || Object.keys(value.decisions).length > 0))
  )
    return null;
  return value;
}
export function decisionScore(state: DecisionDraft, scenarios: DecisionScenario[]) {
  if (!scenarios.length) return 0;
  return Math.round(
    scenarios.reduce(
      (total, scenario) =>
        total +
        (scenario.options.find((item) => item.id === state.decisions[scenario.id])?.score ?? 0),
      0,
    ) / scenarios.length,
  );
}
