import { test, expect } from 'vitest';
import {
  buildModuleProgress,
  canAccessLesson,
  getNextLessonPath,
  getPreviousLessonPath,
  getRequiredLessonId,
  type ModuleFlowConfig,
} from '../src/module-kit/moduleFlow';

const config: ModuleFlowConfig = {
  moduleId: 'demo',
  lessonPathPrefix: '/app/demo/lesson',
  overviewPath: '/app/demo',
  lessons: [
    { id: 'L01', title: 'Uno', kind: 'content' },
    { id: 'L02', title: 'Dos', kind: 'quiz' },
    { id: 'L03', title: 'Tres', kind: 'simulator' },
  ],
};

test('generic module flow computes statuses in sequence', () => {
  const state = buildModuleProgress(config, { L01: true });
  expect(state.lessons.L01).toBe('completed');
  expect(state.lessons.L02).toBe('in_progress');
  expect(state.lessons.L03).toBe('locked');
});

test('generic module flow computes required lesson and access', () => {
  expect(getRequiredLessonId(config, 'L02', {})).toBe('L01');
  expect(canAccessLesson(config, 'L02', {})).toBe(false);
  expect(canAccessLesson(config, 'L02', { L01: true })).toBe(true);
});

test('generic module flow computes canonical next/previous paths', () => {
  expect(getNextLessonPath(config, 'L01')).toBe('/app/demo/lesson/L02');
  expect(getPreviousLessonPath(config, 'L03')).toBe('/app/demo/lesson/L02');
});
