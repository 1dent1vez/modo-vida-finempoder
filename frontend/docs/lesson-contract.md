# Lesson Contract (ModuleKit)

## Objective
All lessons must remain UI-only. Progress persistence and unlock side-effects belong to `LessonShell`.

## Allowed completion API
Use one of these props when rendering `LessonShell`:

1. Legacy (compatible):
```tsx
<LessonShell id="L01" title="..." completeWhen={isReady} score={score} />
```

2. Preferred explicit contract:
```tsx
<LessonShell
  id="L01"
  title="..."
  completion={{ ready: isReady, score }}
/>
```

`LessonShell` normalizes both via `resolveLessonCompletion`.

## Forbidden patterns
- `nextPath` / `overviewPath` props in lessons.
- `lessonProgressRepository` imports in lesson files.
- Manual deep-link guard bypass from lesson content.

## New lesson template
```tsx
import { useMemo, useState } from 'react';
import LessonShell from '../LessonShell';

export default function LXX() {
  const [value, setValue] = useState(0);
  const ready = useMemo(() => value >= 3, [value]);

  return (
    <LessonShell
      id="LXX"
      title="Titulo"
      completion={{ ready }}
    >
      {/* lesson UI only */}
    </LessonShell>
  );
}
```
