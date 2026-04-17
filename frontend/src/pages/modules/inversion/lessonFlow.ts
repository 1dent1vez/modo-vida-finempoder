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

export type InvestmentLessonKind = ModuleLesson['kind'];
export type InvestmentLessonMeta = ModuleLesson;
export type { LessonStatus, ModuleProgress };

export const INVESTMENT_MODULE_CONFIG = {
  moduleId: 'inversion',
  lessonPathPrefix: '/app/inversion/lesson',
  overviewPath: '/app/inversion/overview',
  legacyStoreKey: 'fe_lessons_inversion',
  lessons: [
    { id: 'L01', title: 'Que es invertir?', kind: 'content' },
    { id: 'L02', title: 'Ahorro vs. inversion', kind: 'simulator' },
    { id: 'L03', title: 'Variables clave: rendimiento, riesgo, plazo y liquidez', kind: 'quiz' },
    { id: 'L04', title: 'Solo invierte tus excedentes', kind: 'simulator' },
    { id: 'L05', title: 'Mapa de instrumentos de inversion', kind: 'simulator' },
    { id: 'L06', title: 'Instrumentos de deuda: CETES, BONDES, PRLV', kind: 'content' },
    { id: 'L07', title: 'Instrumentos de renta variable: fondos y acciones', kind: 'content' },
    { id: 'L08', title: 'Perfil del inversionista', kind: 'quiz' },
    { id: 'L09', title: 'Diversificacion inteligente', kind: 'simulator' },
    { id: 'L10', title: 'Fraudes y promesas irreales', kind: 'content' },
    { id: 'L11', title: 'Comisiones e impuestos', kind: 'simulator' },
    { id: 'L12', title: 'Inflacion y rendimiento real', kind: 'simulator' },
    { id: 'L13', title: 'Plan de inversion personal', kind: 'challenge' },
    { id: 'L14', title: 'Retroalimentacion con Finni', kind: 'content' },
    { id: 'L15', title: 'Reto final: tu primera inversion simulada', kind: 'challenge' },
  ],
} as const satisfies ModuleFlowConfig;

export const INVESTMENT_LESSONS = INVESTMENT_MODULE_CONFIG.lessons;

export { toCompletionMap, toCompletedMapFromProgress };

export function getLessonPath(lessonId: string): string {
  return getLessonPathGeneric(INVESTMENT_MODULE_CONFIG, lessonId);
}

export function getLessonIndex(lessonId: string): number {
  return getLessonIndexGeneric(INVESTMENT_MODULE_CONFIG, lessonId);
}

export function getPreviousLessonId(lessonId: string): string | null {
  return getPreviousLessonIdGeneric(INVESTMENT_MODULE_CONFIG, lessonId);
}

export function getNextLessonId(lessonId: string): string | null {
  return getNextLessonIdGeneric(INVESTMENT_MODULE_CONFIG, lessonId);
}

export function getNextLessonPath(lessonId: string): string | null {
  return getNextLessonPathGeneric(INVESTMENT_MODULE_CONFIG, lessonId);
}

export function getPreviousLessonPath(lessonId: string): string | null {
  return getPreviousLessonPathGeneric(INVESTMENT_MODULE_CONFIG, lessonId);
}

export function getRequiredLessonId(lessonId: string, completedMap: Record<string, boolean>): string | null {
  return getRequiredLessonIdGeneric(INVESTMENT_MODULE_CONFIG, lessonId, completedMap);
}

export function canAccessLesson(lessonId: string, completedMap: Record<string, boolean>): boolean {
  return canAccessLessonGeneric(INVESTMENT_MODULE_CONFIG, lessonId, completedMap);
}

export function buildModuleProgress(completedMap: Record<string, boolean>, nowIso = new Date().toISOString()) {
  return buildProgressGeneric(INVESTMENT_MODULE_CONFIG, completedMap, nowIso);
}

export function getCompletedCount(progress: ModuleProgress): number {
  return getCompletedCountGeneric(progress);
}

export function getProgressPercent(progress: ModuleProgress): number {
  return getProgressPercentGeneric(INVESTMENT_MODULE_CONFIG, progress);
}

export function loadModuleProgressSnapshot(): ModuleProgress {
  return loadSnapshotGeneric(INVESTMENT_MODULE_CONFIG);
}

export function saveModuleProgressSnapshot(progress: ModuleProgress): void {
  saveSnapshotGeneric(INVESTMENT_MODULE_CONFIG, progress);
}
