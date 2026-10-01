# F7 — Onboarding de 3 pantallas (deuda plan §F1.5)

## Objetivo
Convertir el primer uso en: **quién eres → meta diaria → primera lección en <60s**.
Reemplazar las 3 pantallas genéricas actuales (`onboarding/Screen1..3`) por un flujo
con valor real, sin fricción, sin sesgo estudiante y compatible con guest mode.

## Estado actual (verificado)
- `pages/onboarding/Screen1..3` + `OnboardingLayout`: 3 slides genéricos (imagen + título + cuerpo + Siguiente/Saltar).
- **Redirigen a `/login` si no hay sesión** — rompe guest mode (el invitado llega directo a `/app`).
- Tildes faltantes: "como organizar", "AYUDARAN", "con proposito", "el habito", "la inversion".
- `onboarding.ts` (utils): `isOnboarded/setOnboarded/clearOnboarded` por usuario — reutilizar.
- Selector de meta diaria (store `dailyGoal`, Relajada/Regular/Intensa) y diálogo de nombre (F4) viven sueltos fuera del flujo.
- Ruta pública: `/onboarding/1..3`.

## Diseño propuesto (3 pantallas)

### Pantalla 1 — Bienvenida + relación con el dinero (reemplaza "quién eres")
- Título: "Aprende a tomar el control de tu dinero"
- Body (tildes corregidas): "FinEMPODER es gratis para siempre. Aprende a organizar tus ingresos y gastos con herramientas simples, hechas para México."
- Selector de 3 chips: **"Recién empiezo" / "Ya ahorro, quiero mejorar" / "Me siento perdido con mi dinero"** (nivel de confianza, NO ocupación: evita el sesgo estudiante y no crea ramificación de contenido).
- Validación suave: continuar sin elegir = valor por defecto "Recién empiezo" (cero fricción).
- Persistir en store local (Dexie/localStorage, `onboardingPrefs`).

### Pantalla 2 — Meta diaria
- Título: "Tu meta diaria"
- Embed del selector existente (Relajada 50 XP / Regular 100 XP / Intensa 200 XP) leyendo del store `dailyGoal` — **una sola fuente de verdad**.
- Body honesto: "Una racha se mantiene con pasos pequeños. Elige cuánto practicarás al día."
- Guarda y avanza.

### Pantalla 3 — Primera lección (CTA final)
- Título: "Tu primera lección te espera"
- Body: "Empezamos con lo básico: presupuestar sin culpa. 5 minutos, en tu celular."
- Botón **"Comenzar"** → marca onboarded y navega **directo al primer nodo desbloqueado de la ruta recomendada** (Presupuesto L01 por defecto, o la ruta sugerida según el chip elegido en P1 — sin bloquear el resto).
- Permitir "Ahora no, explorar" → `/app` normal.

## Reglas duras
- **Guest compatible**: invitado hace onboarding igual (userId 'local'); NUNCA redirigir a `/login` desde el flujo.
- **Cero emojis**, cero marcas de IA, cero rayas largas, voz MX, tildes correctas.
- **Sin ramificación de contenido**: el chip de P1 solo ajusta copy/recomendación inicial; las lecciones NO se bifurcan.
- **Skip siempre disponible** (patrón actual: Saltar → /app).
- Eventos analytics: `onboarding_started`, `onboarding_step_{1,2,3}`, `onboarding_completed` (ya existe `trackOnboardingCompleted` — verificar wiring).
- Reutilizar `onboarding.ts` tal cual.
- Nada de auth/admin/Home/45 lecciones tocado.
- Tests: guest completo, usuario con sesión, skip, persistencia del chip, meta guardada del flujo, navegación a primera lección.
- Commits separados (onboarding → wiring → docs).
- **Documentar en `F7_ONBOARDING.md`** (antes/después, decisiones) — exigido.

## Fuera de alcance
- Rediseño visual mayor de OnboardingLayout (mantener estética actual de la app).
- Cambios al store de racha/meta más allá de leer/escribir meta.
- Analytics PostHog: solo wiring de eventos existentes.

## Criterios de aceptación (gate Lupa)
1. Invitado completa el flujo sin login y aterriza en la primera lección (o /app si "explorar").
2. Usuario con sesión completa el flujo y NO lo vuelve a ver (isOnboarded).
3. Skip de cada pantalla → /app.
4. Meta diaria guardada en el flujo = la que ve Home (mismo store).
5. Cero sesgo ocupacional en textos nuevos (grep universit/carrera/estudiante/beca).
6. Tildes correctas en todo el flujo nuevo.
7. Cero emojis (barrido completo incl. rango 2300-23FF).
8. Suite completa + build verdes, 2 corridas estables.
## Cierre F7

### Cómo quedó el flujo
- **Screen1 (Bienvenida y relación con el dinero)**: título "Aprende a tomar el control de tu dinero", body "FinEMPODER es gratis para siempre. Aprende a organizar tus ingresos y gastos con herramientas simples, hechas para México." Selector de 3 chips de confianza ("Recién empiezo" / "Ya ahorro, quiero mejorar" / "Me siento perdido con mi dinero"). Continuar sin elegir persiste el default "Recién empiezo" (cero fricción). Saltar → /app. Ya no redirige a /login: guest usa userId 'local'.
- **Screen2 (Meta diaria)**: título "Tu meta diaria", body "Una racha se mantiene con pasos pequeños. Elige cuánto practicarás al día." Embed del selector del store `dailyGoal` (misma fuente `DAILY_GOAL_ORDER`/`DAILY_GOAL_META`/`DAILY_GOAL_XP`, mismo patrón de UI de Settings/Home, sin números hardcodeados). "Siguiente" guarda con `setLevel` y avanza; Saltar → /app.
- **Screen3 (CTA final)**: título "Tu primera lección te espera", body "Empezamos con lo básico: presupuestar sin culpa. 5 minutos, en tu celular." "Comenzar" → `setOnboarded` + navega a la primera lección sugerida; "Ahora no, explorar" → /app; Saltar → /app. Las tres salidas marcan onboarded; solo "Comenzar" emite `onboarding_completed`.

### Decisiones tomadas
1. **Gate de entrada**: en `RootGate` (App.tsx), el punto real donde se decide entrar a /app desde la raíz (ruta "/" → "/app"). Si `!isOnboarded(userId ?? 'local', email)` → `/onboarding/1`; si ya está onboarded → `/app`. Aplica igual a guest y a usuario con sesión; es la única pieza de wiring de ruta nueva.
2. **Números de la meta**: el diseño de este doc decía "Relajada 50 XP / Regular 100 XP / Intensa 200 XP" (línea 27), pero el store real `DAILY_GOAL_XP` es **100/200/300** y es la fuente de verdad. Screen2 lee del store (nada hardcodeado) y el test fija `DAILY_GOAL_XP.regular === 200`. **Desviación del doc documentada**: los números del doc están desactualizados.
3. **Eventos analytics**: se agregaron 3 constantes al wrapper `lib/analytics.ts` (solo constantes + tipado en `AnalyticsProps`, sin tocar el adaptador PostHog): `ONBOARDING_STARTED` ('onboarding_started'), `ONBOARDING_STEP` ('onboarding_step' con prop `{ step: 1 | 2 | 3 }`) y `ONBOARDING_COMPLETED` ('onboarding_completed'). Se eligió 1 evento con prop en vez de `onboarding_step_1/2/3` por consistencia con el wrapper tipado. `setOnboarded` conserva su track legacy interno (no-op en prod). Skip y "Ahora no, explorar" no emiten eventos extra; solo "Comenzar" emite `onboarding_completed`.
4. **Chip → sugerencia de ruta**: recién empiezo/perdido → `/app/presupuesto/lesson/L01`; ya ahorro → `/app/ahorro/lesson/L01`. Se usa `getLessonPath` del module-kit (vía los `lessonFlow` de presupuesto/ahorro). Solo es sugerencia de inicio: no bloquea ni ramifica contenido.
5. **Persistencia de prefs**: `localStorage` key `fe_onboarding_prefs` con `{ confianza: 'recien-empiezo' | 'ya-ahorro' | 'perdido' }` (mismo patrón de flags `fe_*` del repo). Se guarda al tocar el chip y al continuar; default "Recién empiezo". No se tocó Dexie ni `onboarding.ts` (reutilizado tal cual).

### Reglas duras verificadas
- Guest: userId 'local' sin sesión; **0** `Navigate to="/login"` en `pages/onboarding` (grep final).
- Cero emojis (barrido incl. rango 2300-23FF y rangos amplios), cero sesgo ocupacional (grep universit/carrera/estudiante/beca = 0), tildes correctas en todo el copy nuevo, sin rayas largas en el flujo nuevo.
- Sin ramificación de contenido; nada de auth/admin/Home/lecciones/datos-mx/gamificación fuera de leer/escribir `dailyGoal`.

### Cómo probarlo (qa.finempoder.com.mx)
1. Abrir la app sin sesión: la raíz redirige a `/onboarding/1`.
2. Completar el flujo (chip opcional → meta → "Comenzar"): aterriza en la primera lección de presupuesto.
3. Verificar que la meta elegida aparece en Home (mismo store `dailyGoal`).
4. Con sesión: completar el flujo y reabrir la app → entra directo a /app (isOnboarded).
5. Skip en cada pantalla y "Ahora no, explorar" → /app.
6. Tests: `npx vitest run src/pages/onboarding` y suite completa `npm test` (48 archivos / 365 tests, 2 corridas estables), `npm run build`, `npm run type-check`, `npm run lint`.
