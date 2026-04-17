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

export type BudgetLessonKind = ModuleLesson['kind'];
export type BudgetLessonMeta = ModuleLesson;
export type { LessonStatus, ModuleProgress };

export const BUDGET_MODULE_CONFIG = {
  moduleId: 'presupuesto',
  lessonPathPrefix: '/app/presupuesto/lesson',
  overviewPath: '/app/presupuesto',
  legacyStoreKey: 'fe_lessons_presupuesto',
  lessons: [
    { id: 'L01', title: 'Por que hacer un presupuesto?', kind: 'content' },
    { id: 'L02', title: 'Ingresos: fijos y variables', kind: 'quiz' },
    { id: 'L03', title: 'Gastos fijos, variables y hormiga', kind: 'simulator' },
    { id: 'L04', title: 'Como registrar ingresos y gastos', kind: 'simulator' },
    { id: 'L05', title: 'Clasifica tus gastos (Drag & Drop)', kind: 'simulator' },
    { id: 'L06', title: 'Calculo de balance mensual (mini-calculadora)', kind: 'simulator' },
    { id: 'L07', title: 'Ajuste del presupuesto (simulacion de decisiones)', kind: 'simulator' },
    { id: 'L08', title: 'Fugas financieras y crisis (podcast interactivo)', kind: 'content' },
    { id: 'L09', title: 'La regla 50-30-20 (infografia dinamica)', kind: 'content' },
    { id: 'L10', title: 'Plan de metas financieras SMART (reto guiado)', kind: 'challenge' },
    { id: 'L11', title: 'Presupuesto familiar y app digital (tutorial)', kind: 'content' },
    { id: 'L12', title: 'Presupuesto en tiempos de crisis (simulacion)', kind: 'simulator' },
    { id: 'L13', title: 'Retroalimentacion con Finni (micro-feedback)', kind: 'content' },
    { id: 'L14', title: 'Evaluacion: Controlas tus finanzas? (quiz)', kind: 'quiz' },
    { id: 'L15', title: 'Reto final: Crea tu presupuesto real', kind: 'challenge' },
  ],
} as const satisfies ModuleFlowConfig;

export const BUDGET_LESSONS = BUDGET_MODULE_CONFIG.lessons;

export { toCompletionMap, toCompletedMapFromProgress };

export function getLessonPath(lessonId: string): string {
  return getLessonPathGeneric(BUDGET_MODULE_CONFIG, lessonId);
}

export function getLessonIndex(lessonId: string): number {
  return getLessonIndexGeneric(BUDGET_MODULE_CONFIG, lessonId);
}

export function getPreviousLessonId(lessonId: string): string | null {
  return getPreviousLessonIdGeneric(BUDGET_MODULE_CONFIG, lessonId);
}

export function getNextLessonId(lessonId: string): string | null {
  return getNextLessonIdGeneric(BUDGET_MODULE_CONFIG, lessonId);
}

export function getNextLessonPath(lessonId: string): string | null {
  return getNextLessonPathGeneric(BUDGET_MODULE_CONFIG, lessonId);
}

export function getPreviousLessonPath(lessonId: string): string | null {
  return getPreviousLessonPathGeneric(BUDGET_MODULE_CONFIG, lessonId);
}

export function getRequiredLessonId(lessonId: string, completedMap: Record<string, boolean>): string | null {
  return getRequiredLessonIdGeneric(BUDGET_MODULE_CONFIG, lessonId, completedMap);
}

export function canAccessLesson(lessonId: string, completedMap: Record<string, boolean>): boolean {
  return canAccessLessonGeneric(BUDGET_MODULE_CONFIG, lessonId, completedMap);
}

export function buildModuleProgress(completedMap: Record<string, boolean>, nowIso = new Date().toISOString()) {
  return buildProgressGeneric(BUDGET_MODULE_CONFIG, completedMap, nowIso);
}

export function getCompletedCount(progress: ModuleProgress): number {
  return getCompletedCountGeneric(progress);
}

export function getProgressPercent(progress: ModuleProgress): number {
  return getProgressPercentGeneric(BUDGET_MODULE_CONFIG, progress);
}

export function loadModuleProgressSnapshot(): ModuleProgress {
  return loadSnapshotGeneric(BUDGET_MODULE_CONFIG);
}

export function saveModuleProgressSnapshot(progress: ModuleProgress): void {
  saveSnapshotGeneric(BUDGET_MODULE_CONFIG, progress);
}
