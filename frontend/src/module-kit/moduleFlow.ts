export type ModuleLessonKind = 'content' | 'quiz' | 'simulator' | 'challenge';

export type ModuleLesson = {
  id: string;
  title: string;
  kind: ModuleLessonKind;
};

export type ModuleId = string;

export type LessonStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export type ModuleProgress = {
  moduleId: ModuleId;
  lessons: Record<string, LessonStatus>;
  lastUpdated: string;
  version: number;
};

export type ModuleFlowConfig = {
  moduleId: ModuleId;
  lessons: ModuleLesson[];
  lessonPathPrefix: string;
  overviewPath: string;
  legacyStoreKey?: string;
};

const STORAGE_VERSION = 1;
const LESSON_STATUSES: LessonStatus[] = ['locked', 'available', 'in_progress', 'completed'];

type LegacyLesson = {
  id: string;
  completed?: boolean;
};

const createEmptyProgress = (config: ModuleFlowConfig): ModuleProgress => ({
  moduleId: config.moduleId,
  lessons: Object.fromEntries(config.lessons.map((lesson) => [lesson.id, 'locked'])) as Record<
    string,
    LessonStatus
  >,
  lastUpdated: new Date(0).toISOString(),
  version: STORAGE_VERSION,
});

export function toCompletionMap(rows: Array<{ lessonId: string; completed?: boolean }>): Record<string, boolean> {
  return rows.reduce<Record<string, boolean>>((acc, row) => {
    if (row.completed) {
      acc[row.lessonId] = true;
    }
    return acc;
  }, {});
}

export function toCompletedMapFromProgress(progress: ModuleProgress): Record<string, boolean> {
  return Object.entries(progress.lessons).reduce<Record<string, boolean>>((acc, [lessonId, status]) => {
    if (status === 'completed') {
      acc[lessonId] = true;
    }
    return acc;
  }, {});
}

export function getLessonIndex(config: ModuleFlowConfig, lessonId: string): number {
  return config.lessons.findIndex((lesson) => lesson.id === lessonId);
}

export function getPreviousLessonId(config: ModuleFlowConfig, lessonId: string): string | null {
  const idx = getLessonIndex(config, lessonId);
  if (idx <= 0) return null;
  return config.lessons[idx - 1]?.id ?? null;
}

export function getNextLessonId(config: ModuleFlowConfig, lessonId: string): string | null {
  const idx = getLessonIndex(config, lessonId);
  if (idx < 0 || idx >= config.lessons.length - 1) return null;
  return config.lessons[idx + 1]?.id ?? null;
}

export function getLessonPath(config: ModuleFlowConfig, lessonId: string): string {
  return `${config.lessonPathPrefix}/${lessonId}`;
}

export function getNextLessonPath(config: ModuleFlowConfig, lessonId: string): string | null {
  const nextLessonId = getNextLessonId(config, lessonId);
  return nextLessonId ? getLessonPath(config, nextLessonId) : null;
}

export function getPreviousLessonPath(config: ModuleFlowConfig, lessonId: string): string | null {
  const previousLessonId = getPreviousLessonId(config, lessonId);
  return previousLessonId ? getLessonPath(config, previousLessonId) : null;
}

export function getRequiredLessonId(
  config: ModuleFlowConfig,
  lessonId: string,
  completedMap: Record<string, boolean>
): string | null {
  const prevId = getPreviousLessonId(config, lessonId);
  if (!prevId) return null;
  return completedMap[prevId] ? null : prevId;
}

export function canAccessLesson(
  config: ModuleFlowConfig,
  lessonId: string,
  completedMap: Record<string, boolean>
): boolean {
  return getRequiredLessonId(config, lessonId, completedMap) === null;
}

export function buildModuleProgress(
  config: ModuleFlowConfig,
  completedMap: Record<string, boolean>,
  nowIso = new Date().toISOString()
): ModuleProgress {
  const lessons: Record<string, LessonStatus> = {};

  for (let i = 0; i < config.lessons.length; i += 1) {
    const lesson = config.lessons[i];
    const prevId = i > 0 ? config.lessons[i - 1].id : null;
    const completed = completedMap[lesson.id] === true;

    if (completed) {
      lessons[lesson.id] = 'completed';
      continue;
    }

    if (!prevId || completedMap[prevId] === true) {
      lessons[lesson.id] = 'available';
      continue;
    }

    lessons[lesson.id] = 'locked';
  }

  const firstAvailable = config.lessons.find((lesson) => lessons[lesson.id] === 'available');
  if (firstAvailable) {
    lessons[firstAvailable.id] = 'in_progress';
  }

  return {
    moduleId: config.moduleId,
    lessons,
    lastUpdated: nowIso,
    version: STORAGE_VERSION,
  };
}

export function getCompletedCount(progress: ModuleProgress): number {
  return Object.values(progress.lessons).filter((status) => status === 'completed').length;
}

export function getProgressPercent(config: ModuleFlowConfig, progress: ModuleProgress): number {
  if (config.lessons.length === 0) return 0;
  return Math.round((getCompletedCount(progress) / config.lessons.length) * 100);
}

const getStorageKey = (moduleId: ModuleId) => `fe_module_progress_${moduleId}_v${STORAGE_VERSION}`;

export function loadModuleProgressSnapshot(config: ModuleFlowConfig): ModuleProgress {
  const empty = createEmptyProgress(config);
  if (typeof window === 'undefined') return empty;

  const raw = window.localStorage.getItem(getStorageKey(config.moduleId));
  if (!raw) {
    return migrateLegacySnapshot(config, empty);
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ModuleProgress> | null;
    if (!parsed || parsed.version !== STORAGE_VERSION || parsed.moduleId !== config.moduleId) {
      return migrateLegacySnapshot(config, empty);
    }

    const sanitizedLessons = config.lessons.reduce<Record<string, LessonStatus>>((acc, lesson) => {
      const rawStatus = parsed.lessons?.[lesson.id];
      acc[lesson.id] = LESSON_STATUSES.includes(rawStatus as LessonStatus)
        ? (rawStatus as LessonStatus)
        : empty.lessons[lesson.id];
      return acc;
    }, {});

    return {
      moduleId: config.moduleId,
      version: STORAGE_VERSION,
      lastUpdated: typeof parsed.lastUpdated === 'string' ? parsed.lastUpdated : new Date().toISOString(),
      lessons: sanitizedLessons,
    };
  } catch {
    return empty;
  }
}

export function saveModuleProgressSnapshot(config: ModuleFlowConfig, progress: ModuleProgress): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(getStorageKey(config.moduleId), JSON.stringify(progress));
}

function migrateLegacySnapshot(config: ModuleFlowConfig, empty: ModuleProgress): ModuleProgress {
  if (typeof window === 'undefined') return empty;
  if (!config.legacyStoreKey) return empty;

  const legacyRaw = window.localStorage.getItem(config.legacyStoreKey);
  if (!legacyRaw) return empty;

  try {
    const parsed = JSON.parse(legacyRaw) as { state?: { lessons?: LegacyLesson[] } } | null;
    const completedMap = (parsed?.state?.lessons ?? []).reduce<Record<string, boolean>>((acc, lesson) => {
      if (lesson.completed) {
        acc[lesson.id] = true;
      }
      return acc;
    }, {});
    return buildModuleProgress(config, completedMap);
  } catch {
    return empty;
  }
}
