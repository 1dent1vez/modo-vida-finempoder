# ModuleKit

Reusable flow kit for lesson-based modules.

## Core contracts

1. `Dexie` is the source of truth for completion records.
2. UI state is derived from completion records via pure selectors.
3. Snapshot in `localStorage` is cache/audit only.
4. Lessons must not call repository methods directly.
5. Completion side-effects are centralized in `LessonShell`.

## Building a new module

1. Create module config:
- `moduleId`
- `lessonPathPrefix`
- `overviewPath`
- ordered `lessons`
- optional `legacyStoreKey`

2. Reuse `moduleFlow.ts` APIs:
- `buildModuleProgress`
- `getRequiredLessonId`
- `getNextLessonPath`
- `getPreviousLessonPath`
- `loadModuleProgressSnapshot`
- `saveModuleProgressSnapshot`

3. In lesson pages:
- provide either `completeWhen` boolean or `completion={{ ready, score? }}`
- optionally provide `score`
- do not write progress repository in lesson components

## Lesson completion contract

Use `module-kit/lessonContract.ts`:

- `LessonCompletion`: `{ ready: boolean; score?: number }`
- `resolveLessonCompletion(...)`: normalizes legacy `completeWhen/score` and the explicit `completion` object.

This keeps lessons declarative while preserving backward compatibility during migrations.

4. In overview page:
- render with `ModuleLessonList`
- show `locked` reason from `getRequiredLessonId`
