# Module 2 (Ahorro) - Manual E2E Checklist

## Scope
- Module: `ahorro`
- Base date: `2026-02-21`
- Devices: mobile viewport (`390x844`) and desktop (`1440x900`)

## P0 Critical
1. Full sequence unlock (`L01` to `L15`)
- Steps:
1. Login, open `/app/ahorro`.
2. Complete `L01`.
3. Return to overview.
4. Repeat until `L15`.
- Expected:
1. Each completion unlocks exactly the next lesson.
2. Status changes: `in_progress -> completed`, next moves to `in_progress`.
3. No skipped unlocks.

2. Deep-link to locked lesson
- Steps:
1. With only `L01` completed, open `/app/ahorro/lesson/L05`.
- Expected:
1. Locked screen appears.
2. Message explains required lesson.
3. CTA navigates to required lesson.

3. Refresh / reopen / offline
- Steps:
1. Complete up to `L03`.
2. Refresh browser.
3. Close and reopen app.
4. Turn network off, complete one lesson, reopen overview.
- Expected:
1. Progress persists after refresh/reopen.
2. Offline completion remains visible in overview.
3. On reconnect, app remains consistent.

4. Double tap on completion trigger
- Steps:
1. In a lesson near completion, tap the final action twice quickly.
2. Return to overview.
- Expected:
1. Lesson completes once.
2. No duplicated unlocks.
3. No broken UI state.

## P1 Secondary
1. Back navigation from completed lesson
- Expected: `Anterior` uses canonical previous lesson.

2. Home CTA `Continuar`
- Expected: points to first non-completed lesson.

3. Locked labels in overview
- Expected: each locked lesson shows required predecessor.

## Runbook
1. Run static checks:
```bash
npm run verify:module2
```
2. Run unit tests:
```bash
npm test
```
3. Run typecheck:
```bash
npx tsc -p tsconfig.app.json --noEmit
```
