import {
  buildModuleProgress as buildProgressGeneric,
  canAccessLesson as canAccessLessonGeneric,
  getCompletedCount as getCompletedCountGeneric,
  getLessonIndex as getLessonIndexGeneric,
  getLessonPath as getLessonPathGeneric,
  getNextLessonId as getNextLessonIdGeneric,
  getNextLessonPath as getNextLessonPathGeneric,
  getPreviousLessonId as getPreviousLessonIdGeneric,
  getPreviousLessonPath as getPreviousLessonPathGeneric,
  getProgressPercent as getProgressPercentGeneric,
  getRequiredLessonId as getRequiredLessonIdGeneric,
  loadModuleProgressSnapshot as loadSnapshotGeneric,
  saveModuleProgressSnapshot as saveSnapshotGeneric,
  toCompletedMapFromProgress,
  toCompletionMap,
  type LessonStatus,
  type ModuleFlowConfig,
  type ModuleLesson,
  type ModuleProgress,
} from '../../../module-kit/moduleFlow';

export type SavingsLessonKind = ModuleLesson['kind'];
export type SavingsLessonMeta = ModuleLesson;
export type { LessonStatus, ModuleProgress };

export const SAVINGS_MODULE_CONFIG = {
  moduleId: 'ahorro',
  lessonPathPrefix: '/app/ahorro/lesson',
  overviewPath: '/app/ahorro',
  legacyStoreKey: 'fe_lessons_ahorro',
  lessons: [
    { id: 'L01', title: 'Ahorro primero: el habito que cambia todo', kind: 'content' },
    { id: 'L02', title: 'Cochinito vs banco: ahorro informal y formal', kind: 'simulator' },
    { id: 'L03', title: 'Tu dinero en el banco trabaja por ti', kind: 'content' },
    { id: 'L04', title: 'Aliados y saboteadores del ahorro', kind: 'simulator' },
    { id: 'L05', title: 'Ponle nombre a tu ahorro: define tu meta', kind: 'simulator' },
    { id: 'L06', title: 'Tu plan de ahorro: 1, 3 o 6 meses', kind: 'simulator' },
    { id: 'L07', title: 'Cuando tu ingreso es impredecible', kind: 'simulator' },
    { id: 'L08', title: 'Tu red de seguridad: fondo de emergencias', kind: 'simulator' },
    { id: 'L09', title: 'Ahorro y seguros: la dupla de la tranquilidad', kind: 'content' },
    { id: 'L10', title: 'El IPAB: el guardian de tu dinero', kind: 'content' },
    { id: 'L11', title: 'Micro-reto: ahorra 3 dias seguidos', kind: 'challenge' },
    { id: 'L12', title: 'El dinero que se multiplica: interes compuesto', kind: 'simulator' },
    { id: 'L13', title: 'Finni dice: como vas con tu ahorro', kind: 'content' },
    { id: 'L14', title: 'Evalua tu habito de ahorro', kind: 'quiz' },
    { id: 'L15', title: 'Reto final: cierra tu modulo de ahorro', kind: 'challenge' },
  ],
} as const satisfies ModuleFlowConfig;

export const SAVINGS_LESSONS = SAVINGS_MODULE_CONFIG.lessons;

export { toCompletionMap, toCompletedMapFromProgress };

export function getLessonPath(lessonId: string): string {
  return getLessonPathGeneric(SAVINGS_MODULE_CONFIG, lessonId);
}

export function getLessonIndex(lessonId: string): number {
  return getLessonIndexGeneric(SAVINGS_MODULE_CONFIG, lessonId);
}

export function getPreviousLessonId(lessonId: string): string | null {
  return getPreviousLessonIdGeneric(SAVINGS_MODULE_CONFIG, lessonId);
}

export function getNextLessonId(lessonId: string): string | null {
  return getNextLessonIdGeneric(SAVINGS_MODULE_CONFIG, lessonId);
}

export function getNextLessonPath(lessonId: string): string | null {
  return getNextLessonPathGeneric(SAVINGS_MODULE_CONFIG, lessonId);
}

export function getPreviousLessonPath(lessonId: string): string | null {
  return getPreviousLessonPathGeneric(SAVINGS_MODULE_CONFIG, lessonId);
}

export function getRequiredLessonId(lessonId: string, completedMap: Record<string, boolean>): string | null {
  return getRequiredLessonIdGeneric(SAVINGS_MODULE_CONFIG, lessonId, completedMap);
}

export function canAccessLesson(lessonId: string, completedMap: Record<string, boolean>): boolean {
  return canAccessLessonGeneric(SAVINGS_MODULE_CONFIG, lessonId, completedMap);
}

export function buildModuleProgress(completedMap: Record<string, boolean>, nowIso = new Date().toISOString()) {
  return buildProgressGeneric(SAVINGS_MODULE_CONFIG, completedMap, nowIso);
}

export function getCompletedCount(progress: ModuleProgress): number {
  return getCompletedCountGeneric(progress);
}

export function getProgressPercent(progress: ModuleProgress): number {
  return getProgressPercentGeneric(SAVINGS_MODULE_CONFIG, progress);
}

export function loadModuleProgressSnapshot(): ModuleProgress {
  return loadSnapshotGeneric(SAVINGS_MODULE_CONFIG);
}

export function saveModuleProgressSnapshot(progress: ModuleProgress): void {
  saveSnapshotGeneric(SAVINGS_MODULE_CONFIG, progress);
}
