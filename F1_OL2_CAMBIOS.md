# F1-OLA2 — Mapa de camino + Meta diaria + Streak freeze + Quick wins

Rama: `f1-ola2-camino-meta-freeze` (base: `qa-identivezz`).

> ⚠️ NOTA DE GATE: esta rama DEBE pasar el gate de Lupa (revisión) antes de
> merge a `qa-identivezz`. No pushear, no desplegar, no mergear por fuera del gate.

## Qué cambió por tarea

### Tarea A — Mapa de camino (sendero estilo HelloChinese)
- Componente nuevo `LessonPath` (`frontend/src/module-kit/components/LessonPath.tsx`):
  sendero vertical serpenteante con línea conectora central, nodos que alternan
  lado izquierdo/derecho (en pantallas angostas la columna central simple).
- Estados de nodo: completado (check verde), actual (número + pulso sutil,
  `@keyframes finni-node-pulse` en `index.css` con `prefers-reduced-motion`),
  bloqueado (candado gris). La lógica de bloqueo NO se duplica: vive en
  `lessonPathState.ts` → `getLessonNodeState` que usa `getRequiredLessonId`
  (única fuente de bloqueo; en modo admin no hay bloqueos y navega igual).
- Tap: completado/actual → navega a la lección; bloqueado → banner inline
  "Completa la anterior para desbloquear" (salvo modo admin, que navega).
- Targets táctiles de 48px (>= 44px); cada nodo muestra número + título corto.
- Finni al inicio del camino: `FinniMessage` variant `coach` con mensaje
  motivacional breve (3 variantes, una al azar por montaje).
- Integración: `ModuleOverview` ahora muestra el sendero como vista principal y
  conserva la `ModuleLessonList` debajo (badges PROBAR de admin siguen visibles
  y no se rompe ningún acceso existente). En `Home` se agregó la sección
  **"Tu camino"** con 3 senderos compactos (`ModuleMiniPath`, un nodo por
  módulo: anterior completada / actual / siguiente) que navegan directo a la
  lección; usa `getRequiredLessonId` por módulo, sin duplicar lógica.

### Tarea B — Meta diaria personalizable
- Store nuevo `frontend/src/store/dailyGoal.ts` (zustand persist, key
  `fe_daily_goal`): `{ level: 'relaxed' | 'regular' | 'intense' | null, xpTarget }`
  con valores relaxed=100 / regular=200 / intense=300 (1/2/3 lecciones de ~100 XP).
- Onboarding al primer uso (guest o logueado): diálogo "Tu meta diaria" en Home
  cuando `level === null`. NO bloquea la app: "Ahora no" lo oculta por la sesión
  (no persiste; el diálogo reaparece en el siguiente arranque) y el runtime usa
  Regular (`resolveDailyXpTarget(null) → 200 XP`). "Empezar" persiste la elección.
- XP del día DERIVADO de `lessonProgress` (Dexie): `getTodayXp` suma las
  lecciones completadas hoy (day key LOCAL) × 100 XP. `lessonProgress` NO guarda
  score, así que se usa el default 100 (igual que el XP de `LessonShell`);
  documentado en "Decisiones técnicas".
- UI: anillo SVG de progreso (`DailyGoalRing`) + "X/Y XP hoy" en Home. Al
  alcanzar la meta → `FinniMessage` "¡Meta del día cumplida!" (una vez por día,
  flag `celebratedDay` en el store; idempotente).
- Settings: selector editable de 3 opciones que persiste y refleja el valor actual.
- Al completar una lección NO se hace nada extra: el XP del día se deriva y el
  mensaje aparece al renderizar Home.

### Tarea C — Streak freeze (escudos)
- `store/progress.ts` extendido (no reescrito): `Streak` ahora incluye
  `shields` (máx. 2), `metaDaysStreak` y `lastGoalDay`; migración vía `merge`
  de zustand persist (shields/metaDaysStreak default 0 si vienen ausentes).
- Day key LOCAL en toda la lógica de racha (ver Decisiones técnicas).
- `recordActivity` con la nueva regla de escudos y `markDailyGoalReached` para
  el conteo de metas; ambas con lógica pura exportada
  (`computeNextStreak` / `computeGoalStreak`) para tests sin reloj.
- UI: `ShieldBadge` (🛡 + contador) junto a `StreakBadge` en Home y en el header
  de los overviews de módulo; en Settings, línea de 1 texto explicando la mecánica.
- No se tocó modo admin ni guest; `recordActivity` se llama igual desde
  `LessonShell` (un solo call-site, sin cambios ahí).

### Quick wins
- `index.html`: title → "FinEMPODER — Finanzas para todos"; meta description →
  "Educación financiera práctica y gratuita para México"; se agregaron
  `og:title` y `og:description` coherentes. No se tocó el resto del head.
- LM-03 (resuelto): los keyframes inline del "+X XP" flotante de `LessonShell`
  se movieron a `index.css` (`.finni-xp-float` + `@keyframes finni-xp-float`);
  de paso se agregó el `@keyframes fadeIn` que la celebración ya referenciaba
  (`animate-[fadeIn_200ms_ease-in]`) y no existía en el tema.
- LM-04 (documentado, NO cerrado): sincronización multiventana. Al tener la app
  abierta en dos pestañas, la escritura a Dexie/localStorage no se propaga en
  vivo entre pestañas (no hay BroadcastChannel ni evento `storage` para el
  progreso), así que una pestaña puede mostrar datos obsoletos hasta recargar.
  No se cierra porque requiere un mecanismo de sincronización entre pestañas
  (BroadcastChannel + merge) que es un cambio de arquitectura fuera del alcance
  de esta ola; los datos no se pierden (ambas pestañas escriben en el mismo
  IndexedDB y el refresh de `focus` ya recalcula al volver a la pestaña).

## Archivos nuevos / modificados

- Nuevos (frontend):
  - `src/module-kit/components/LessonPath.tsx` (LessonPath + ModuleMiniPath)
  - `src/module-kit/lessonPathState.ts` (getLessonNodeState / getPathNodeStates / getNextActiveLessonId)
  - `src/lib/localDate.ts` (localDayKey / addDaysLocal / daysAgoLocalKey)
  - `src/store/dailyGoal.ts` (+ test)
  - `src/lib/dailyXp.ts` (+ test con fake-indexeddb)
  - `src/hooks/gamification/useDailyXp.ts`
  - `src/shared/components/gamification/DailyGoalRing.tsx`
  - `src/shared/components/gamification/ShieldBadge.tsx`
  - `src/pages/home/DailyGoalDialog.tsx`
  - Tests: `src/module-kit/components/LessonPath.test.tsx`, `src/pages/settings/Settings.test.tsx`
- Modificados (frontend):
  - `src/module-kit/components/ModuleOverview.tsx` (sendero + ShieldBadge)
  - `src/pages/home/Home.tsx` (sección "Tu camino", meta diaria, escudos)
  - `src/pages/settings/Settings.tsx` (selector de meta + explicación de escudos)
  - `src/store/progress.ts` (+ `src/store/progress.test.ts` reescrito para escudos/day key local)
  - `src/index.css` (keyframes del tema)
  - `src/module-kit/components/LessonShell.tsx` (LM-03)
  - `index.html` (SEO/OG)

## Cómo probarlo manualmente (desde https://qa.finempoder.com.mx)

1. **Camino**: entrar a un módulo (p. ej. Presupuesto) → sendero de nodos con
   línea conectora, mensaje de Finni arriba; nodo actual con pulso; completar una
   lección → el nodo se pinta verde y el siguiente se resalta; tocar un nodo
   bloqueado → banner "Completa la anterior para desbloquear" (sin navegar);
   con modo admin activo → cualquier nodo navega (sin bloqueos). En Home,
   sección "Tu camino" con 3 mini-senderos.
2. **Meta diaria (primer uso)**: abrir `/app` → diálogo "Tu meta diaria" con 3
   opciones; "Ahora no" lo oculta (vuelve a salir en el siguiente arranque);
   elegir una y "Empezar" → desaparece y queda persistida. Completar 1-2-3
   lecciones según la meta → el anillo avanza y aparece "¡Meta del día cumplida!".
   En Settings → "Meta diaria" se puede cambiar en vivo.
3. **Escudo en racha**: alcanzar la meta 3 días seguidos → +1 🛡 (máx. 2, ver
   badge junto a la racha en Home/overview). Faltar un día con escudo → la racha
   no se rompe y el escudo se consume. Faltar 2+ días → la racha se rompe igual.
4. **Título de pestaña**: la pestaña debe decir "FinEMPODER — Finanzas para todos".

## Decisiones técnicas

- **Day key LOCAL (obligatoria de Chip)**: `localDayKey(d)` con
  `getFullYear/getMonth/getDate` + padStart, y hoy/ayer/anteayer con `setDate`
  local (`src/lib/localDate.ts`). Se eliminaron `toISOString().slice(0,10)`
  y `todayISO/yesterdayISO` de `store/progress.ts`. Con UTC (UTC-6) el día del
  usuario se corría en las primeras 6 horas y el freeze fallaría en México.
  El campo persistido conserva el nombre `lastActiveISO` por compatibilidad con
  el backend (`last_active_iso`), pero ahora guarda day key LOCAL.
- **XP de la meta**: 100 XP por lección (valor default de LessonShell).
  `lessonProgress` (Dexie) no persiste score, solo `completed/completedAt`;
  `getTodayXp` multiplica completadas de hoy × 100. Sin estado duplicado.
- **Regla exacta de escudos**:
  - `computeNextStreak`: mismo día mantiene; ayer +1; anteayer con escudo → +1
    y consume 1 escudo (la racha NO se rompe); anteayer sin escudo → se rompe
    (current = 1); gap de 2+ días o primera vez → se rompe, el escudo NO se
    consume ni se pierde. `metaDaysStreak` se reinicia a 0 cuando el día entre
    la última actividad y hoy no fue de meta (actividad no consecutiva, o ayer
    con actividad pero sin meta).
  - `computeGoalStreak` (se llama desde Home al detectar meta cumplida, y es
    idempotente por día vía `lastGoalDay`): si ayer fue de meta → +1; si no →
    reinicia a 1; cada 3 días consecutivos con meta → +1 escudo; nunca supera 2.
  - Los escudos nunca se pierden por romper la racha (solo se consumen al usarse).
- **Meta sin elegir**: `level === null` → runtime usa Regular (200 XP) sin
  persistir; el diálogo reaparece en cada arranque hasta elegir. "Ahora no" no
  persiste ninguna elección (spec del dueño).
- **Modo admin**: los nodos bloqueados no existen (getRequiredLessonId devuelve
  null); el sendero navega igual, igual que el resto de los gates existentes.

## Pendientes

- LM-03: resuelto (ver Quick wins).
- LM-04: documentado, NO cerrado (ver Quick wins).
