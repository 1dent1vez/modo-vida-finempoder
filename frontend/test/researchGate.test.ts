import { test, expect } from 'vitest';
import { evaluateResearchGate, nextRouteFromStatus } from '../src/utils/researchGate';

test('redirects to pretest when not completed', () => {
  const result = evaluateResearchGate('/app', { preDone: false, postDone: false, allModulesDone: false });
  expect(result).toBe('/research/pretest');
});

test('redirects to posttest when modules done', () => {
  const result = evaluateResearchGate('/app', { preDone: true, postDone: false, allModulesDone: true });
  expect(result).toBe('/research/posttest');
});

test('allows navigation when pre and post conditions met/irrelevant', () => {
  const result = evaluateResearchGate('/app', { preDone: true, postDone: false, allModulesDone: false });
  expect(result).toBeNull();
});

test('nextRouteFromStatus after pre completes goes to app', () => {
  const next = nextRouteFromStatus({ preDone: true, postDone: false, allModulesDone: false });
  expect(next).toBe('/app');
});

test('nextRouteFromStatus after modules done goes to posttest', () => {
  const next = nextRouteFromStatus({ preDone: true, postDone: false, allModulesDone: true });
  expect(next).toBe('/research/posttest');
});
