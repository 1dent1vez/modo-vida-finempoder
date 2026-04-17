export type QuestionnaireAnswer = {
  questionId: string;
  questionText?: string | undefined;
  value: number;
};

export function computeFinempoderIndex(answers: QuestionnaireAnswer[]): number {
  if (!answers || answers.length === 0) return 0;
  const nums = answers.map((a) => Number(a.value)).filter((n) => Number.isFinite(n));
  if (nums.length === 0) return 0;
  const avg = nums.reduce((acc, n) => acc + n, 0) / nums.length;
  return Math.round((avg / 5) * 100);
}

export function computeScore(answers: QuestionnaireAnswer[]): number {
  if (!answers || answers.length === 0) return 0;
  const nums = answers.map((a) => Number(a.value)).filter((n) => Number.isFinite(n));
  if (nums.length === 0) return 0;
  return Math.round(nums.reduce((acc, n) => acc + n, 0));
}
