export type ClassificationCategory = 'fijo' | 'variable';
export type ClassificationItem = {
  id: string;
  title: string;
  context: string;
  category: ClassificationCategory;
  explanation: string;
};
export type ClassificationState = {
  version: 1;
  started: boolean;
  index: number;
  selected: ClassificationCategory | null;
  checked: boolean;
  firstAnswers: ClassificationCategory[];
  completed: boolean;
};
export const initialClassification = (): ClassificationState => ({
  version: 1,
  started: false,
  index: 0,
  selected: null,
  checked: false,
  firstAnswers: [],
  completed: false,
});
export function parseClassification(value: unknown, count: number): ClassificationState | null {
  if (!value || typeof value !== 'object') return null;
  const s = value as ClassificationState;
  const category = (x: unknown) => x === 'fijo' || x === 'variable';
  if (
    s.version !== 1 ||
    typeof s.started !== 'boolean' ||
    !Number.isInteger(s.index) ||
    s.index < 0 ||
    s.index > count ||
    (s.selected !== null && !category(s.selected)) ||
    typeof s.checked !== 'boolean' ||
    typeof s.completed !== 'boolean' ||
    !Array.isArray(s.firstAnswers) ||
    !s.firstAnswers.every(category) ||
    s.firstAnswers.length < s.index ||
    s.firstAnswers.length > Math.min(count, s.index + 1) ||
    (s.checked && (s.selected === null || s.firstAnswers.length !== s.index + 1)) ||
    (s.index === count && (s.checked || s.selected !== null)) ||
    (s.completed && s.index !== count) ||
    (!s.started && (s.index !== 0 || s.firstAnswers.length > 0 || s.selected !== null || s.checked))
  )
    return null;
  return s;
}
