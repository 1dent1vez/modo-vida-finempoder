import { getRequiredLessonId, type ModuleFlowConfig } from './moduleFlow';

/** Estado visual de un nodo del sendero de lecciones. */
export type LessonNodeState = 'completed' | 'current' | 'locked';

/**
 * Deriva el estado de un nodo sin duplicar la lógica de bloqueo:
 * usa getRequiredLessonId (única fuente de bloqueo, respeta isAdminMode).
 */
export function getLessonNodeState(
  config: ModuleFlowConfig,
  lessonId: string,
  completedMap: Record<string, boolean>
): LessonNodeState {
  if (completedMap[lessonId] === true) return 'completed';
  const required = getRequiredLessonId(config, lessonId, completedMap);
  if (required !== null) return 'locked';
  return 'current';
}

/** Estados de todos los nodos del config. */
export function getPathNodeStates(
  config: ModuleFlowConfig,
  completedMap: Record<string, boolean>
): Record<string, LessonNodeState> {
  return config.lessons.reduce<Record<string, LessonNodeState>>((acc, lesson) => {
    acc[lesson.id] = getLessonNodeState(config, lesson.id, completedMap);
    return acc;
  }, {});
}

/** Primera lección no completada y accesible (la "actual" del camino). */
export function getNextActiveLessonId(
  config: ModuleFlowConfig,
  completedMap: Record<string, boolean>
): string | null {
  const first = config.lessons.find(
    (lesson) => getLessonNodeState(config, lesson.id, completedMap) === 'current'
  );
  return first?.id ?? null;
}
