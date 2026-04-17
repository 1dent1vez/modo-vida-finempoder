import { test, expect } from 'vitest';
import {
  INVESTMENT_LESSONS,
  buildModuleProgress,
  canAccessLesson,
  getNextLessonPath,
  getPreviousLessonPath,
  getProgressPercent,
  getRequiredLessonId,
} from '../src/pages/modules/inversion/lessonFlow';

test('module3 buildModuleProgress marks first lesson as in_progress initially', () => {
  const state = buildModuleProgress({});
  expect(state.lessons.L01).toBe('in_progress');
  expect(state.lessons.L02).toBe('locked');
  expect(getProgressPercent(state)).toBe(0);
});

test('module3 buildModuleProgress unlocks next lesson after previous completion', () => {
  const state = buildModuleProgress({ L01: true });
  expect(state.lessons.L01).toBe('completed');
  expect(state.lessons.L02).toBe('in_progress');
  expect(getRequiredLessonId('L02', { L01: true })).toBeNull();
});

test('module3 buildModuleProgress keeps sequential gating requirement', () => {
  const state = buildModuleProgress({ L03: true });
  expect(state.lessons.L01).toBe('in_progress');
  expect(state.lessons.L02).toBe('locked');
  expect(state.lessons.L03).toBe('completed');
  expect(getRequiredLessonId('L03', {})).toBe('L02');
});

test('module3 getNextLessonPath follows module order without skips', () => {
  expect(getNextLessonPath('L06')).toBe('/app/inversion/lesson/L07');
  expect(getNextLessonPath(INVESTMENT_LESSONS.at(-1)!.id)).toBeNull();
});

test('module3 getPreviousLessonPath follows module order', () => {
  expect(getPreviousLessonPath('L01')).toBeNull();
  expect(getPreviousLessonPath('L07')).toBe('/app/inversion/lesson/L06');
});

test('module3 canAccessLesson requires previous lesson completion', () => {
  expect(canAccessLesson('L01', {})).toBe(true);
  expect(canAccessLesson('L02', {})).toBe(false);
  expect(canAccessLesson('L02', { L01: true })).toBe(true);
});
