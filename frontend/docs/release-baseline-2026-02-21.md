# Release Baseline (2026-02-21)

## Freeze commit
- `6459529` - `chore(release): freeze baseline verde pre-hardening`

## Verified commands
- `npm run lint`
- `npm test`
- `npx tsc -p tsconfig.app.json --noEmit`
- `npm run verify:module1`
- `npm run verify:module2`
- `npm run verify:module3`

All commands passed at freeze time.

## Module architecture status
- Modules `presupuesto`, `ahorro`, `inversion` use ModuleKit.
- `LessonShell` centralizes completion persistence.
- `Overview` derives lock/unlock from canonical flow config.
- Dexie is source of truth; snapshot is local cache.
