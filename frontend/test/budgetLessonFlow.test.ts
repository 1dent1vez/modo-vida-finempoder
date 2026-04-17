import { test, expect } from 'vitest';
import {
  BUDGET_LESSONS,
  buildModuleProgress,
  canAccessLesson,
  getNextLessonPath,
  getPreviousLessonPath,
  getProgressPercent,
  getRequiredLessonId,
} from '../src/pages/modules/presupuesto/lessonFlow';

test('buildModuleProgress marks first lesson as in_progress initially', () => {
  const state = buildModuleProgress({});
  expect(state.lessons.L01).toBe('in_progress');
  expect(state.lessons.L02).toBe('locked');
  expect(getProgressPercent(state)).toBe(0);
});

test('buildModuleProgress unlocks next lesson after completing previous one', () => {
  const state = buildModuleProgress({ L01: true });
  expect(state.lessons.L01).toBe('completed');
  expect(state.lessons.L02).toBe('in_progress');
  expect(getRequiredLessonId('L02', { L01: true })).toBeNull();
});

test('buildModuleProgress keeps sequential gating requirement', () => {
  const state = buildModuleProgress({ L03: true });
  expect(state.lessons.L01).toBe('in_progress');
  expect(state.lessons.L02).toBe('locked');
  expect(state.lessons.L03).toBe('completed');
  expect(getRequiredLessonId('L03', {})).toBe('L02');
});

test('getNextLessonPath follows module order without skips', () => {
  expect(getNextLessonPath('L06')).toBe('/app/presupuesto/lesson/L07');
  expect(getNextLessonPath(BUDGET_LESSONS.at(-1)!.id)).toBeNull();
});

test('getPreviousLessonPath follows module order', () => {
  expect(getPreviousLessonPath('L01')).toBeNull();
  expect(getPreviousLessonPath('L07')).toBe('/app/presupuesto/lesson/L06');
});

test('canAccessLesson requires previous lesson completion', () => {
  expect(canAccessLesson('L01', {})).toBe(true);
  expect(canAccessLesson('L02', {})).toBe(false);
  expect(canAccessLesson('L02', { L01: true })).toBe(true);
});
