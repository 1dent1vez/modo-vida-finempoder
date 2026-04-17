export type LessonCompletion = {
  ready: boolean;
  score?: number;
};

export type LessonCompletionInput = {
  completeWhen?: boolean;
  score?: number;
  completion?: LessonCompletion;
};

export function resolveLessonCompletion(input: LessonCompletionInput): LessonCompletion {
  if (input.completion) {
    return {
      ready: input.completion.ready,
      score: input.completion.score ?? input.score,
    };
  }

  return {
    ready: input.completeWhen === true,
    score: input.score,
  };
}
