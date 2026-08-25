# F1_HOME_MOCKUP_V2 — Réplica del mockup de Home (intento 2)

Rama: `f1-home-mockup-v2` (base: `qa-identivezz`, HEAD en `e6b286d`).
Mockup de referencia: `loop-home-v2/mockup_home.png` (1290×7263). Esta rama
NO se pushea, NO se mergea ni se despliega: el orquestador integra y resuelve
el conflicto de merge con OLA3 en `Home.tsx`.

## Qué se replicó (por sección, en el ORDEN estricto del mockup)

1. **Header**: avatar circular azul con la inicial real del usuario (sin nombre: `F`),
   saludo "Hola, <nombre>" / "Hola" (nunca "Estudiante"), fecha capitalizada
   palabra por palabra ("Martes, 25 De Agosto" vía `toLocaleDateString` es-MX).
   Sin campana: el recorte del mockup no la muestra.
2. **Meta diaria**: card blanca; anillo gris `#E5E7EB` con stroke azul y el %
   REAL del día (lecciones completadas hoy × 100 / `xpTarget`); a la derecha
   "Meta Regular · 200 XP" (label + `xpTarget` reales del store) y debajo
   "0/200 XP hoy" con el formato EXACTO del mockup.
3. **Continúa aprendiendo**: card crema `#FEF3C7`; etiqueta en mayúsculas
   "PRESUPUESTACIÓN · 0% COMPLETADO" (módulo en curso + progreso real);
   título REAL de la lección actual (vía `getRequiredLessonId` + `completedMap`,
   igual lógica que `LessonPath`), truncado con ellipsis; botón naranja sólido
   redondeado "Ir ahora" (icono lucide Play) que navega a la lección real.
4. **Tu camino**: título bold; 3 nodos-tarjeta con línea punteada entre ellos;
   icono del módulo en pastilla de color, nombre, "%" en color; estado por
   módulo: nodo actual = círculo AZUL con el número de la lección (1-based),
   bloqueado = candado gris (lucide Lock), completado = check verde. Respeta
   modo admin (sin candados). Navega al overview del módulo.
5. **Tus módulos**: 3 tarjetas apiladas — Presupuestación (PiggyBank, pastilla
   amarilla, "Organiza ingresos y gastos", barra naranja, "0% completado",
   botón "Ir" naranja), Ahorro (Coins, pastilla verde menta, "Crea hábitos de
   ahorro", barra verde), Inversión (TrendingUp, pastilla azul claro, "Haz
   crecer tu dinero", barra azul). Cada card navega a `/app/presupuesto`,
   `/app/ahorro`, `/app/inversion`.
6. **Estadísticas**: 3 cajitas blancas en grid — Lecciones (libro azul, número
   real de lecciones en ventana 7 días), Racha (llama naranja, `${streak}d`),
   XP (trofeo verde, XP real del mismo periodo). Patrón `weekStats` de Ola 3
   (existe en esta base) sobre `lessonProgress` (Dexie).
7. **Tip del día**: card blanca con borde sutil; bombilla amarilla a la
   izquierda; título bold "Tip del día"; texto = `getDailyTip()` del array real
   (sin emojis).
8. **Bottom nav**: se reutiliza `AppNavbar` existente (Inicio/Logros/Yo); la
   tab activa ya se estiliza en azul con icono outline; no se creó otra barra.

## Decisiones

- **Base de rama**: `f1-home-mockup-v2` parte del HEAD de `qa-identivezz`
  (`e6b286d`), sin commits propios previos.
- **Orden estricto**: header → meta diaria → continúa aprendiendo → tu camino →
  tus módulos → estadísticas → tip del día → bottom nav (fija, fuera del Home).
- **3 nodos en "Tu camino"**: el scroll del mockup deja ver 2 nodos completos,
  pero la spec F1 define 3 módulos (Presupuestación → Ahorro → Inversión);
  se renderizan los 3 (el tercero aparece al hacer scroll).
- **Fecha capitalizada**: "de" se muestra "De" capitalizando cada palabra del
  resultado de `toLocaleDateString`, como en el mockup.
- **Sin campana**: el recorte del mockup no incluye campana ni chip de XP; el
  header quedó solo con avatar + saludo + fecha.
- **Bottom nav**: no se crea nada nuevo; se verifica que la activa sea azul.
- **Meta diaria**: se reutiliza `DailyGoalRing` existente; se ajustó su track a
  `#E5E7EB` (hex del mockup, `var(--color-border)`).
- **`--color-brand-cream`**: el token existía con `#FFF6E3` (OLA3); se actualizó
  a `#FEF3C7` (hex del mockup) y se usa en la card "Continúa aprendiendo".
- **`DailyGoalDialog`**: se conserva (no es una sección del mockup; sin él se
  perdería el onboarding de "Tu meta diaria"). Renderiza nada si ya hay nivel.
- **Stats**: se usa la ventana de 7 días de Ola 3 (existe en esta base);
  documentado en `F1_OL3_CAMBIOS.md`.
- **Navegación a inversión**: la spec pide `/app/inversion`; esa ruta existe y
  redirige al overview real (`/app/inversion/overview`).

## DESVIACIONES HONESTAS

> **Nota gate F1-Home-V2 (Lupa)**: el análisis de píxeles del mockup (9.4M px) corrige esta sección: el mockup NO contiene `#2563EB` (0 px) ni `#F5F7FA` (30 px). Su azul ES el token `#1B4FD8` y su fondo ES `#F8FAFC` — las "desviaciones" de color abajo NO existen; la réplica es exacta en paleta.

- **Azul claro (info)**: pastillas/iconos de Inversión y Lecciones usan los
  tokens `--color-brand-info-bg: #EEF2FF` / `--color-brand-info: #4B73F0`
  (mockup aproximado `#DBEAFE` / `#2563EB`).
- **Racha "Xd"**: se renderiza `${streak.current}d` (ej. "0d"), según la spec;
  el mockup muestra el número de días.
- **Truncamiento de títulos**: se usa ellipsis CSS; el corte exacto de
  caracteres del mockup ("Por que hacer un presu…") no es reproducible 1:1 con
  el título real del store.
- **Título de lección**: el config real es "Por que hacer un presupuesto?" sin
  acentos; se muestra tal cual (dato del store, no inventado).
- **Meta ring al cumplir**: el anillo pasa a verde cuando se alcanza la meta
  (estado que el mockup no muestra).
- **Tip del día**: el texto sale del array real (`DAILY_TIPS`, 14 tips); el
  mockup muestra uno de ejemplo que puede no coincidir con el del día.
- **`LessonShell.test.tsx`**: se silencia el `console.info` del flujo de
  completar lección para estabilizar un race de teardown de vitest
  ("onUserConsoleLog pending") que el test file de Home (más pesado) hacía
  aparecer de forma intermitente. No cambia aserciones ni producción.
- **El tema es light-only**: dark mode usa los tokens existentes; el mockup no
  define variante oscura y el dark resultante es razonable (mismos tokens).

## Cómo probar

- Deploy de QA fijo: `https://qa.finempoder.com.mx` (flujo normal: esta rama
  se mergea a `qa-identivezz` y se redespliega; ver `QA_RAMA.md`).
- Local:
  ```bash
  cd frontend
  npm test        # 136 tests verdes
  npm run build   # rc 0
  npm run dev     # abrir /app (invitado, sin login)
  ```
- Checklist manual en 390px: header (inicial + fecha capitalizada) → meta
  diaria ("Meta Regular · 200 XP", "0/200 XP hoy") → continúa aprendiendo
  (crema, "Ir ahora" navega a la lección) → tu camino (nodo azul numerado,
  candados grises) → tus módulos (3 tarjetas con sus subtítulos y botones) →
  estadísticas (Lecciones/Racha/XP) → tip del día → bottom nav fija.
- Modo admin: `https://qa.finempoder.com.mx/admin` → sin candados en "Tu camino".
- Sin nombre de usuario: el saludo dice "Hola" (nunca "Estudiante").

## Nota de merge con OLA3

`Home.tsx` fue reemplazado por completo (las secciones de OLA3 —hero 60/40,
"Esta semana", campana, chip de XP— desaparecen). Al mergear a `qa-identivezz`
el orquestador debe tomar el `Home.tsx` de esta rama y verificar dependencias
compartidas intactas: `DailyGoalDialog`, `dailyTips`, `DailyGoalRing` (track
ajustado), tokens (`--color-brand-cream`). El conflicto de merge en `Home.tsx`
lo resuelve el orquestador.
