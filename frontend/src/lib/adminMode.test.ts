// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { isAdminMode, setAdminMode } from './adminMode';
import { getRequiredLessonId, type ModuleFlowConfig } from '../module-kit/moduleFlow';

const config: ModuleFlowConfig = {
  moduleId: 'prueba',
  lessons: [
    { id: 'L01', title: 'Lección 1', kind: 'content' },
    { id: 'L02', title: 'Lección 2', kind: 'quiz' },
    { id: 'L03', title: 'Lección 3', kind: 'content' },
  ],
  lessonPathPrefix: '/app/prueba/lesson',
  overviewPath: '/app/prueba',
};

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  setAdminMode(false);
});

describe('adminMode', () => {
  it('isAdminMode() es false por defecto', () => {
    expect(isAdminMode()).toBe(false);
  });

  it('setAdminMode(true) activa el modo y persiste la llave', () => {
    setAdminMode(true);
    expect(localStorage.getItem('fe_admin_mode')).toBe('1');
    expect(isAdminMode()).toBe(true);
  });

  it('setAdminMode(false) remueve la llave', () => {
    setAdminMode(true);
    setAdminMode(false);
    expect(localStorage.getItem('fe_admin_mode')).toBeNull();
    expect(isAdminMode()).toBe(false);
  });

  it('getRequiredLessonId desbloquea todas las lecciones con admin activo', () => {
    const completedMap: Record<string, boolean> = {};

    expect(getRequiredLessonId(config, 'L02', completedMap)).toBe('L01');

    setAdminMode(true);
    expect(getRequiredLessonId(config, 'L02', completedMap)).toBeNull();
    expect(getRequiredLessonId(config, 'L03', completedMap)).toBeNull();
  });
});
