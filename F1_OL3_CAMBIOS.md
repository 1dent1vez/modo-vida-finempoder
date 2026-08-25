# F1-OLA3 — Fixes de gate + Rediseño Home según mockup aprobado

Rama: `f1-ola3-fixes-home-redesign` (base: `qa-identivezz`).

> ⚠️ NOTA DE GATE: esta rama DEBE pasar el gate de Lupa (revisión) antes de
> merge a `qa-identivezz`. No pushear, no desplegar, no mergear por fuera del gate.

## Parte 1 — Fixes

### 1. O-2 (prioritario): guest mode ya no pierde progreso local al recargar
- **Problema**: `main.tsx` hacía `clearAuth() + useProgress.reset() +
  useLessons.reset() + qc.clear()` en CUALQUIER evento de auth sin sesión. Un
  invitado legítimo (sin cuenta) recarga → `onAuthStateChange` con session null
  → se borraban racha/escudos/progreso local.
- **Fix**: helper puro nuevo `frontend/src/lib/sessionReset.ts`
  (`shouldResetOnAuthEvent(event)` → `true` SOLO para `SIGNED_OUT`). El handler
  de `main.tsx` ahora usa el primer parámetro (`event`): reset completo solo en
  `SIGNED_OUT`; en cualquier otro caso sin sesión (`INITIAL_SESSION`,
  `TOKEN_REFRESHED`, etc.) solo `clearAuth()` + `setHydrated()`.
  `setHydrated()` se mantiene en TODOS los casos; `clearAuth()` también cuando
  no hay sesión (el auth store nunca queda con sesión fantasma).
- **Tests**: `frontend/src/lib/sessionReset.test.ts` (SIGNED_OUT → reset;
  INITIAL_SESSION / TOKEN_REFRESHED / otros → no reset).
- **No se tocó** el flujo de Login/AuthScreen.

### 2. M-1 (cosmético): pulso en el nodo ACTUAL del camino
- `frontend/src/module-kit/components/LessonPath.tsx` (`ModuleMiniPath`): el
  pulso estaba fijo en `index === 1` (el nodo central). Ahora pulsa el nodo con
  `state === 'current'` sea cual sea su posición (primera lección, nodo
  intermedio, etc.), usando el MISMO cálculo de estado que `LessonPath`
  (`getPathNodeStates` → `getLessonNodeState` → `getRequiredLessonId` +
  `completedMap`).

### 3. Marca estudiantil residual — generalización
- `frontend/src/data/badges.ts`:
  - `ten_lessons`: 'Estudiante comprometido' → **'Comprometido con tu dinero'**.
    La condición (`totalCompleted >= 10`) NO dependía de ITT ni rol estudiantil,
    es auto-otorgable → solo cambió el título; id/condición/otorgamiento intactos.
  - `researcher`: 'Colaborador ITT' → **'Colaborador de la comunidad'**. La
    condición (`preDone`) depende del pre-test de investigación (que sigue
    existiendo en la app) y es auto-otorgable, no del rol estudiantil → solo
    cambió el título; id/condición/otorgamiento intactos. (NOTA F2: el badge
    `researcher` se eliminó del sistema de logros; el pre-test sigue vivo.)
- `frontend/src/pages/profile/Profile.tsx`: fallback de nombre
  `'Estudiante FinEmpoder'` → **`'FinEMPODER'`**.
- `frontend/src/pages/legal/Terms.tsx`: titular de la marca
  'propiedad del Instituto Tecnológico de Toluca' → **'propiedad de FinEMPODER'**
  (titular neutral, sin inventar razón social). Verificado con grep: no hay otra
  mención de ITT en el archivo.

### 4. e2e obsoletos → flujo guest actual
- `frontend/e2e/smoke.spec.ts` reescrito: se eliminaron los describe 'Login
  page'/'Signup page' (flujo email+password que ya no existe). Nuevos tests:
  raíz → /app con Home en guest + 'Continúa aprendiendo' visible; GuestBanner
  visible en /app sin sesión; /login redirige a /auth; /auth muestra
  'Continuar con Google'; /admin muestra el input PIN. `mockSupabaseAuth` se
  conserva.
- **Ejecución REAL en esta máquina**: SÍ se corrió — `npx playwright test` →
  **5/5 passed**. Nota: los browsers locales instalados no coincidían con la
  revisión que espera `@playwright/test` (chromium_headless_shell-1217); hubo
  que ejecutar `npx playwright install chromium` (descarga ~112 MiB) antes de
  correr.

## Parte 2 — Rediseño de Home (mockup aprobado)

`frontend/src/pages/home/Home.tsx` reconstruido sección por sección con datos
REALES de los stores existentes (cero números falsos):

1. **Header**: avatar circular azul (`--color-brand-primary`) con la inicial del
   nombre (`user.name` → primera letra; sin nombre → 'F'), saludo "Hola, Ana" o
   "Hola" (NUNCA 'Estudiante'), fecha local es-MX larga debajo, campana
   (lucide `Bell`) con punto rojo decorativo/estático, y `XPChip` con XP total
   real de gamificación.
2. **Hero 60/40** (apila en móvil, `sm:grid-cols-5`):
   - **'Continúa aprendiendo'** (card crema, token nuevo): pill del módulo en
     curso (fondo pastel por color de módulo), título de la lección actual
     (derivada con `getLessonNodeState`/`getRequiredLessonId` + `completedMap`,
     misma lógica que `LessonPath`), descripción genérica 'Sigue con tu
     progreso' (los configs de lección no tienen description/duration → no se
     inventa pedagogía ni duración), barra de progreso real del módulo, botón
     naranja full-width 'Continuar' que navega a la lección real, e ilustración
     SVG inline (moneda + gráfica, `aria-hidden`). Si los 3 módulos están
     completos → empty state elegante ('¡Completaste los 3 módulos!').
   - **'Meta de hoy'** (card blanca): `DailyGoalRing` con `xpToday` (derivado de
     `lessonProgress` con `completedAt` de hoy × 100, patrón Ola 2) y
     `xpTarget` real del store `dailyGoal`; texto 'X/200 XP' (valores reales por
     nivel: 100/200/300); divisor; fila de racha: llama + días actuales
     (`StreakBadge` si >= 2, texto con N días si no) + `ShieldBadge` con
     escudos reales del store progress. Conserva la celebración de meta
     cumplida (`FinniMessage` + `markDailyGoalReached`, una vez por día).
3. **'Tu camino'**: encabezado + 'Ver todo >' (navega a `/app/presupuesto`);
   3 tarjetas de módulo conectadas con líneas punteadas verticales. Cada tarjeta
   es clickeable a su overview (`config.overviewPath`): número de orden en
   círculo, icono del módulo en círculo pastel (Wallet/PiggyBank/TrendingUp),
   estado real por módulo — activo → '% avanzado' en azul + borde azul;
   bloqueado → candado + 'Próximo'. El estado usa `getLessonNodeState` +
   `completedMap` por módulo (sin duplicar lógica de moduleFlow); el candado
   entre módulos se calcula con la última lección del módulo anterior (secuencia
   Presupuestación → Ahorro → Inversión).
4. **'Esta semana'**: card con grid 3 columnas — 'Lecciones completadas' (icono
   libro, círculo azul pastel), 'Racha' (`streak.current`, llama, círculo
   naranja pastel), 'XP ganados' (estrella, círculo verde pastel). Números
   reales (0 se ve igual que el mockup).
5. **'Tip del día'**: card crema con bombilla, tip rotativo por día del año
   (array de 14 micro-tips financieros mexicanos en
   `frontend/src/pages/home/dailyTips.ts`, patrón getDayOfYear existente),
   texto motivacional secundario corto e ilustración SVG.
6. **Navegación**: se conserva `AppNavbar` (Inicio/Logros/Yo) — ESA es la tab
   bar inferior del mockup; no se creó otra.

Se conservaron de la Ola 2: `DailyGoalDialog` (primer uso de meta), la
integración con `useGamification` (XP/streak) y `useDailyXp`.

### Piezas nuevas
- `frontend/src/pages/home/dailyTips.ts` — array de tips + `getDailyTip(date)`.
- `frontend/src/lib/weekStats.ts` + `frontend/src/hooks/gamification/useWeekStats.ts`
  — stats de la semana derivadas de `lessonProgress` (Dexie).
- Token crema nuevo en `frontend/src/styles/tokens.css`:
  `--color-brand-cream: #FFF6E3` (+ `--shadow-soft: 0 4px 12px rgba(0,0,0,0.04)`).
  El tema es light-only (no hay bloque `.dark` ni `prefers-color-scheme` en
  tokens), por eso el valor se define único y coherente.

### Tests
- `frontend/src/pages/home/Home.test.tsx` (jsdom + MemoryRouter + mocks de
  stores/supabase/Dexie): render sin error; todas las secciones presentes;
  saludo NUNCA contiene 'Estudiante' (con y sin nombre); con nombre muestra
  'Hola, Ana'; tip rota por día dentro del array; empty states (todo 0)
  renderizan; con progreso real muestra la lección en curso y su % y botón
  Continuar.
- `frontend/src/lib/weekStats.test.ts`: ventana 7 días (hoy + 6 anteriores),
  descarta lo anterior a la ventana e incompletas.

## Cómo probarlo manualmente (qa.finempoder.com.mx)

1. Abrir la raíz sin sesión → entra a la Home nueva como invitado: saludo
   'Hola' (nunca 'Estudiante'), fecha del día, campana.
2. Recargar la página varias veces en guest → la racha/escudos/progreso local
   NO se borran (O-2).
3. 'Continuar' en la card crema navega a la lección real del módulo en curso;
   la barra y el % son reales.
4. 'Meta de hoy' muestra XP real del día vs. meta elegida (100/200/300); la
   fila de racha muestra días y escudos reales.
5. 'Tu camino': el módulo activo tiene borde azul + '% avanzado'; los
   bloqueados muestran candado + 'Próximo'; cada tarjeta abre su overview.
6. 'Esta semana' muestra lecciones completadas, racha y XP de los últimos 7
   días (ventana móvil; dato real de `lessonProgress`).
7. 'Tip del día' cambia día con día; la tab bar inferior (Inicio/Logros/Yo) es
   la navegación del mockup.
8. e2e: `cd frontend && npx playwright install chromium` (solo la primera vez
   en esta máquina; los browsers locales no coincidían con la revisión del
   proyecto) y luego `npx playwright test` → 5/5 verdes.

## Decisiones destacadas
- **Crema como token**: sí se creó `--color-brand-cream` (valor único, tema
  light-only). Documentado arriba.
- **Titular de Terms**: 'propiedad de FinEMPODER' (titular neutral; no se
  inventó razón social).
- **Insignias**: ambas condiciones eran auto-otorgables y no dependían de ITT
  ni rol estudiantil → solo se renombraron (ids/condiciones/otorgamiento
  intactos).
- **Dato semana vs hoy**: se eligió ventana móvil de 7 días (hoy + 6
  anteriores) sobre `lessonProgress.completedAt` — el único dato real con
  fecha por lección. Documentado en `weekStats.ts`.
- **Tab bar**: se reutilizó el `AppNavbar` existente; no se creó otra
  navegación inferior.
- **% de módulo y lección en curso**: derivados de `loadModuleProgressSnapshot`
  + `getProgressPercent`/`getLessonNodeState` (la misma fuente que
  `ModuleOverview`), no de valores inventados.

---

# PARTE 3 — Cero emojis en la UI

Adenda prioritaria sobre la misma rama (`f1-ola3-fixes-home-redesign`): la
interfaz de `frontend/src` queda **100% libre de emojis**. Excepciones:
ninguna (ni decorativos ni suaves). La personalidad de Finni y el tono cercano
se conservan en las palabras, no en glifos.

## Inventario (regex oficial de Chip)

`[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}\x{2B00}-\x{2BFF}\x{FE0F}]`

- **Antes**: ~283 hits en ~49 archivos (la verificación local con `rg` marcó
  288 líneas; la diferencia es el conteo por línea de `rg -c` vs. el de Chip).
- **Después**: **0 hits** en `frontend/src` (verificado con el mismo regex).
- `frontend/e2e/` y `frontend/test/`: 0 emojis (nada que actualizar).

## Reglas aplicadas

1. **Emoji = icono funcional** → icono `lucide-react` (dependencia existente,
   no se agregó ninguna): `Shield`, `Flame`, `Lightbulb`, `Trophy`, `Target`,
   `Star`, `Lock`, `Wrench`, `Check`, `PiggyBank`, `Sparkles`, `BarChart3`,
   `TrendingUp`, `TrendingDown`, `Coins`, `Banknote`, `Landmark`, `Scale`,
   `Zap`, `AlertTriangle`, `CircleCheck`, `CircleX`, `Search`, `Flag`, `Siren`,
   `Info`, `PartyPopper`, `Wallet`, `Bug`, `Leaf`, `Repeat`, `CalendarDays`,
   `PenLine`, `Heart`, `Hourglass`, `Droplet`, `Notebook`, `Smartphone`,
   `GraduationCap`, `Link`, `Rocket`, `BookOpen`, `Circle`, `SquareCheck`,
   `Square`, `CheckCircle`, etc. Cada mapeo se hizo con sentido (no literal):
   p.ej. `🏦` → `Landmark`, `🛡️` → `Shield`, `🚨` → `Siren`, `🌱` → `Leaf`.
2. **Mensajes y textos** (feedback de clasificación, títulos, labels, tips):
   se quitó el emoji del string y se conservó el texto pedagógico intacto
   (`'✅ ¡Correcto! …'` → `'¡Correcto! …'`, `'El mes de Roberto 📊'` →
   `'El mes de Roberto'`).
3. **Finni**: `lessonCompletionMessages.ts` y `FinniMessage` ya no tenían
   emojis; los títulos de Finni con emoji en lecciones se limpiaron
   (`'Finni explica 💡'` → `'Finni explica'`). El tono mexicano sigue en las
   palabras.
4. **Home**: `'Hola 👋'` → `'Hola'`, `'¡Completaste los 3 módulos! 🎉'` →
   `'¡Completaste los 3 módulos!'`; `dailyTips.ts` ya estaba limpio. El test
   `Home.test.tsx` se actualizó a `'Hola'`.
5. **Banners/Admin**: `AdminBanner` usa `Wrench` + texto; `OfflineBanner` y
   `AdminPage` usan `Check` + texto; `Settings` y `ShieldBadge` limpios
   (este último con `Shield` de lucide).
6. **Riesgo visual con estrellas**: las barras `'⭐'.repeat(n)`/`'☆'.repeat(m)`
   se sustituyeron por `n/5` (texto limpio, L05) o por estrellas `Star` de
   lucide (L13).
7. **Indicadores de listas/checklist**: `☑/☐` → `SquareCheck/Square`;
   `⚠️/○` de selección → `CircleCheck/Circle`; semáforo `✅/⚠️/❌` →
   `CircleCheck/AlertTriangle/CircleX`.
8. **Iconos grandes decorativos** (sole content de `<p>`/`<span>`): se
   sustituyeron por lucide (`🏆` → `Trophy`, `🎉` → `PartyPopper`, `💵` →
   `Banknote`, `📊` → `BarChart3`, `🔍` → `Search`, `🏁` → `Flag`,
   `👜 → 💸` → `Wallet → TrendingDown`, etc.).

## Mapeo de insignias (data/badges.ts) — viejo → nuevo

El campo `icon` pasó de `string` (emoji) a `LucideIcon` (componente de lucide)
y `BadgeCard` renderiza `<badge.icon />` (mismo tamaño visual, `h-9 w-9`):

| id | Antes (emoji) | Ahora (lucide) |
| --- | --- | --- |
| `first_step` | 🎯 | `Target` |
| `budget_explorer` | 📊 | `BarChart3` |
| `budget_master` | 💰 | `Coins` |
| `savings_champion` | 🏦 | `Landmark` |
| `investor` | 📈 | `TrendingUp` |
| `streak_3` | 🔥 | `Flame` |
| `streak_7` | ⚡ | `Zap` |
| `ten_lessons` | 📚 | `BookOpen` |
| `researcher` | 🔬 | `Microscope` |
| `finempoder_pro` | 🏆 | `Trophy` |

Ids, títulos, descripciones, hints y condiciones quedaron intactos: solo
cambió el disfraz visual. (NOTA F2: con el esquema de series/tiers, el badge
`researcher` se retiró; ver `F2_GAMIFICACION.md`.)

## Archivos tocados (resumen)

- Core UI: `Home.tsx`, `Home.test.tsx`, `data/badges.ts`, `BadgeCard.tsx`,
  `AdminBanner.tsx`, `AdminPage.tsx`, `OfflineBanner.tsx`, `Settings.tsx`,
  `ShieldBadge.tsx`, `ahorro/Index.tsx`.
- Lessons: 43 archivos en `ahorro/`, `inversion/` y `presupuesto/` con
  feedback, arrays de datos (`emoji` → `icon` con lucide o campo eliminado),
  títulos de Finni e iconos decorativos.

## Verificación (corrida real en esta máquina)

- `rg` con el regex de Chip sobre `frontend/src` → **0 hits**.
- `npm test` → **135/135 passed**.
- `npm run build` → **rc=0**.
- `npm run test:e2e` → **5/5 passed**.
- `npm run lint` y `tsc -p tsconfig.app.json --noEmit` → verdes.

## Decisiones destacadas

- **Texto limpio vs. icono**: donde el render no tenía slot de icono se quitó
  el emoji del string (sin perder pedagogía); donde el emoji era el ícono del
  elemento se usó lucide.
- **Arrays de datos**: `emoji: 'X'` se renombró a `icon: <Lucide>` cuando se
  renderizaba como icono; si solo acompañaba texto, se eliminó el campo y su
  token en el render.
- **Líneas CRLF preservadas**: los archivos de lessons con terminación CRLF se
  editaron preservando su terminación para no ensuciar el diff.
- **Sin cambios pedagógicos**: ningún texto, condición, badge o dato cambió de
  significado; solo el disfraz visual.
