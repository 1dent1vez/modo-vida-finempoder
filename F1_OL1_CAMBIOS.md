# F1-OLA1 — Celebración al completar + Autoguardado intra-lección

Rama: `f1-ola1-celebracion-autoguardado` (base: `qa-identivezz`).

## Qué cambió

### Tarea A — Celebración al completar (LessonShell)
- Confetti al completar una lección (`canvas-confetti`, un solo disparo de ~120 partículas con spread 70 y origen y=0.7; ref guard para que dispare UNA vez).
- Contador de XP animado de 0 hasta `completion.score` (default 100) con easing `easeOutCubic` (~800ms, `requestAnimationFrame` + estado local, limpieza en unmount) y un "+X XP" flotando con animación CSS fade/translate.
- Mensaje de Finni variado: lista de 6 mensajes en tono cercano mexicano, se elige UNO aleatorio al completar; la info de desbloqueo (`nextLessonId`) se mantiene como línea secundaria.
- `prefers-reduced-motion` respetado: sin confetti y XP estático directo (sin contador animado).
- NO se tocó la lógica de completion/persistencia del shell.

### Tarea B — Autoguardado intra-lección
- Repositorio nuevo `lessonResume.repository.ts`: `save` / `get` / `clear` del snapshot en la tabla `userLessonData` con key `resume:v1:<lessonId>` (userId `local` sin sesión, como el resto de la persistencia).
- Hook `useLessonResume` (`features/lessons/hooks`): `hasSaved` (evaluado una vez al montar), `savedStep`, `save(state)` (debounce 500ms), `accept()` (devuelve el snapshot y lo borra), `ignore()` y `clear()`. NO toca `lessonProgress`.
- `LessonShell`: al completar, además de `setCompleted`, SIEMPRE llama `clearLessonResume(moduleId, id)` (el autoguardado se limpia al completar).
- Las 45 lecciones integraron el patrón: import del hook, `useLessonResume(moduleId, 'L0X')`, efecto de guardado al cambiar `step` (solo `step > 0`), y banner "Continuar donde te quedaste" (FECard con tokens del tema) con botón "Continuar donde te quedaste" (`accept()` + `setStep`) y "Empezar de nuevo" (`ignore()`). Nunca se restaura automáticamente; el estado se guarda en un `useState` local para no re-mostrar el banner.

## Archivos nuevos / modificados

- Nuevos: `frontend/src/db/lessonResume.repository.ts`, `frontend/src/features/lessons/hooks/useLessonResume.ts`, `frontend/src/features/lessons/components/LessonResumeBanner.tsx`, `frontend/src/module-kit/components/lessonCompletionMessages.ts`, tests (`LessonShell.test.tsx`, `lessonResume.repository.test.ts`, `useLessonResume.test.tsx`).
- Modificados: `frontend/src/module-kit/components/LessonShell.tsx`, las 45 lecciones en `frontend/src/pages/modules/{presupuesto,ahorro,inversion}/lessons/L01..L15.tsx` (solo patrón autosave), `frontend/package.json` (+ `canvas-confetti`, `@types/canvas-confetti`).

## Cómo probarlo manualmente

1. Abrir una lección cualquiera (p. ej. Presupuesto → L01), avanzar 1-2 pasos, salir a mitad de la lección.
2. Re-entrar a la misma lección → debe aparecer el banner "Te quedaste en el paso N de esta lección." con "Continuar donde te quedaste" (te lleva al paso guardado) y "Empezar de nuevo" (descarta el snapshot).
3. Completar la lección → confetti, contador de XP animado "+100 XP" (o el score de la lección), "+X XP" flotando y mensaje aleatorio de Finni + "Desbloqueaste LX".
4. Con `prefers-reduced-motion: reduce` activado (sistema operativo) → sin confetti y "+X XP" estático directo.
5. Nota: al completar, el snapshot de autoguardado se limpia; re-entrar a una lección completada NO muestra el banner.

## URL de pruebas

La URL actual de pruebas es la del deploy QA descrito en `QA_RAMA.md` (`https://qa.finempoder.com.mx` es el alias propuesto/redesplegado por el orquestador tras el gate; el alias fijo apunta al deploy de QA). El preview estable actual: `https://modo-vida-finempoder-n5b6m2529-ghaels-projects.vercel.app` (ver `QA_RAMA.md`).

## Lecciones sin autoguardado

Ninguna: las 45 lecciones (`presupuesto`, `ahorro`, `inversion` — L01..L15) siguen el patrón uniforme y quedaron integradas.
