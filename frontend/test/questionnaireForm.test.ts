import { test, expect } from 'vitest';
import { canSubmitQuestionnaire } from '../src/pages/research/questionnaireUtils';

test('canSubmitQuestionnaire blocks submit while submitting', () => {
  expect(canSubmitQuestionnaire(true, true)).toBe(false);
});

test('canSubmitQuestionnaire allows submit when ready and not submitting', () => {
  expect(canSubmitQuestionnaire(true, false)).toBe(true);
  expect(canSubmitQuestionnaire(true, undefined)).toBe(true);
});

test('canSubmitQuestionnaire blocks submit when incomplete', () => {
  expect(canSubmitQuestionnaire(false, false)).toBe(false);
});
