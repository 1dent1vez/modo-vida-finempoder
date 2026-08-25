# F2 — Gamificación: Insignias con tiers + Celebración de logros + Finni con personalidad

Rama: `f2-gamificacion` (base: `qa-identivezz` @ `890ab0b`).

> ⚠️ NOTA DE GATE: sin push, sin merge, sin deploy fuera del gate de Lupa.
> QA en preview: https://qa.finempoder.com.mx

## Esquema nuevo: series con tiers (reemplaza los 10 badges binarios)

La evaluación es **SIEMPRE derivada del progreso real en el momento** (nunca
se persiste "desbloqueado"). Lo único persistido es qué tier **viste**
(`fe_badges_state`, ver Decisiones). Título de UI por serie y tier:
`'{tituloBase} · {Bronce|Plata|Oro}'`.

| Serie (id) | Tier | Condición (sobre BadgeStats) | Ícono (lucide) |
| --- | --- | --- | --- |
| `presupuesto` (Presupuestación) | 1 Bronce | `presupuestoProgress >= 30` | `BarChart3` |
| `presupuesto` | 2 Plata | `presupuestoProgress >= 60` | `BarChart3` |
| `presupuesto` | 3 Oro | `presupuestoProgress >= 100` | `BarChart3` |
| `ahorro` (Ahorro) | 1 Bronce | `ahorroProgress >= 30` | `Landmark` |
| `ahorro` | 2 Plata | `ahorroProgress >= 60` | `Landmark` |
| `ahorro` | 3 Oro | `ahorroProgress >= 100` | `Landmark` |
| `inversion` (Inversión) | 1 Bronce | `inversionProgress >= 30` | `TrendingUp` |
| `inversion` | 2 Plata | `inversionProgress >= 60` | `TrendingUp` |
| `inversion` | 3 Oro | `inversionProgress >= 100` | `TrendingUp` |
| `racha` (Racha) | 1 Bronce | `streakBest >= 3` | `Flame` |
| `racha` | 2 Plata | `streakBest >= 7` | `Flame` |
| `racha` | 3 Oro | `streakBest >= 14` | `Flame` |
| `lecciones` (Lecciones completadas) | 1 Bronce | `totalCompleted >= 1` | `BookOpen` |
| `lecciones` | 2 Plata | `totalCompleted >= 10` | `BookOpen` |
| `lecciones` | 3 Oro | `totalCompleted >= 25` | `BookOpen` |
| `finempoder_pro` (FinEmpoder Pro, corona) | 3 Oro (único tier) | 3 módulos al 100% | `Trophy` |

- `totalCompleted` conserva el cálculo histórico: cada módulo al 100% = 15
  lecciones → `(presupuesto% + ahorro% + inversion%) / 100 × 15`.
- **Day 1 garantizado**: la primera lección completada dispara `lecciones`
  Bronce (cubierto por test de evaluación).
- **Corona**: serie de un solo tier lograble (Oro) por diseño; no hay
  Bronce/Plata para FinEmpoder Pro. La UI muestra solo la muesca final.
- **Migración derivada** (sin key previa): un usuario con las badges viejas
  conserva su equivalencia automáticamente: `first_step`→lecciones Bronce,
  `budget_explorer` (50%)→presupuesto Bronce (y Plata automático si subió a
  60%+), `budget_master`→presupuesto Oro, `savings_champion`→ahorro Oro,
  `investor`→inversión Oro, `streak_3`→racha Bronce, `streak_7`→racha Plata,
  `ten_lessons`→lecciones Plata, `finempoder_pro`→corona Oro. Cubierto por
  tests de migración.

## Celebración de logros

- `AchievementModal` global (montado en `App.tsx`, sobre cualquier ruta):
  overlay translúcido no bloqueante, icono de la serie en pastilla, título
  `Serie · Tier`, descripción, frase de Finni del banco de la serie y botón
  `¡Seguir!` (marca visto y avanza la cola). Sin confetti en el modal.
- `useBadgeCelebration`: observa `useProgress` (modules + streak +
  `totalCompleted`), calcula `maxTier` por serie, compara contra
  `fe_badges_state` y encola celebraciones UNA a la vez.
- **Secuencia lección → logro**: si el unlock coincide con completar una
  lección, el modal espera **2.5 s** (post confetti/XP). `LessonShell` emite
  `fe:lesson-completed` (evento mínimo, documentado). Sin evento reciente →
  el modal aparece de inmediato.
- `BadgeCard` (Logros): muestra el tier máximo logrado + muescas de la serie
  (logrado / actual = primer tier no logrado / bloqueado) con tokens del tema.

## Finni con personalidad — frases nuevas

Sin emojis, sin rayas largas, sin "no es X, es Y", sin academicismos, voz
cercana mexicana. Bancos en `frontend/src/lib/finniFrases.ts`:

- **presupuesto (modal)**: "Tu dinero ya te hace caso, se nota el trabajo." ·
  "Cada peso ya tiene lugar en tu plan, eso es poderoso." · "Presupuestar es
  decidir tú primero dónde va tu dinero." · "Ya le pones orden a tu dinero, y
  se siente."
- **ahorro (modal)**: "Ese colchón crece, y contigo la tranquilidad." ·
  "Ahorrar es un acto de amor hacia tu yo del futuro." · "Cada peso guardado
  es un sí a tus planes." · "Tu guardadito ya es un hábito, eso no tiene
  precio."
- **inversion (modal)**: "Tu yo del futuro está aplaudiendo desde hoy." ·
  "Invertir es poner tu dinero a trabajar, bien hecho." · "Hoy entiendes cómo
  crece tu dinero, mañana lo ves." · "Decidir con calma dónde inviertes, eso
  es madurez financiera."
- **racha (modal)**: "La constancia ya es tu apellido." · "Un día a la vez, y
  la racha habla por ti." · "Volver a FinEmpoder ya es parte de tu día." ·
  "Tu disciplina se nota, sigue así."
- **lecciones (modal)**: "Cada lección te acerca más a dueño de tu dinero." ·
  "Lo que aprendes hoy rinde intereses toda la vida." · "Seguir aprendiendo
  es la mejor inversión." · "Una lección más y tu confianza crece igual que
  tus finanzas."
- **finempoder_pro (modal)**: "Los tres módulos completos. Eres otro nivel."
  · "Terminaste el camino completo, y eso pocas personas lo logran." ·
  "Dueño de tu dinero, de principio a fin."
- **Meta diaria** (Home al alcanzar la meta, una vez por día): "¡Meta del día
  cumplida! Mañana también vas a poder." · "Llegaste a tu meta de hoy. Mañana
  seguimos con la misma energía." · "Día cumplido, tu constancia manda."
- **Recuperación de racha** (snackbar al perder la racha): "La racha se
  reinició, pero lo aprendido no se borra. Hoy es buen día para empezar
  otra." · "Una pausa no borra tu avance. Vuelve hoy con la misma energía." ·
  "Descansar también vale, la constancia se rearma cuando tú quieras."
- **Saludo de la primera lección del día** (sin actividad previa hoy, una vez
  por día): "Buen día. Tu yo de mañana te espera con un día más de
  constancia." · "Hoy también vas a aprender algo nuevo, aprovecha el día." ·
  "Un día más, un paso más cerca de dueño de tu dinero."

Se conservan intactos los 6 mensajes de celebración de lecciones
(`lessonCompletionMessages.ts`).

## ¿Qué pasó con preDone/postDone?

- `preDone` / `postDone` se retiraron de `BadgeStats` y de `Achievements.tsx`
  (el badge `researcher` desapareció del sistema de logros).
- **El pre-test sigue vivo**: rutas `/research/pretest`, `/research/posttest`,
  `useResearchStatus`, `ResearchGate` y la API de cuestionarios no se tocaron.
- Verificado con grep: nada en el sistema de badges depende de
  `preDone`/`postDone`/`researcher` (los únicos usos restantes son del
  flujo de investigación).

## Decisiones técnicas

- **`fe_badges_state`** (localStorage, guest y sesión por igual):
  `Record<serieId, tier>` con el tier máximo VISTO. Sin key → `{}`
  (migración derivada: la celebración aparece una vez por serie recién
  alcanzada; aceptado).
- **Delay 2.5 s**: `LESSON_COMPLETION_DELAY_MS` en `lib/badgeCelebration.ts`;
  se calcula desde el `completedAt` del evento `fe:lesson-completed`.
- **Migración derivada**: el sistema nuevo es 100% derivado del progreso
  real, así que ningún usuario pierde logros al actualizar.
- **Sin confetti en el modal** (la lección ya lo tiene) y sin animaciones
  extra; se respeta `prefers-reduced-motion` en el LessonShell existente.
- Eventos de ventana: `fe:lesson-completed` (LessonShell) y `fe:streak-lost`
  (store de progreso) con emisiones mínimas y guard para entornos sin window.

## Cómo probar (qa.finempoder.com.mx)

1. **Logros con tiers**: completar lecciones y revisar `/app/achievements` —
   muescas, título `Serie · Tier` y descripción/hint por tier.
2. **Celebración**: al desbloquear un tier nuevo (p. ej. primera lección →
   Lecciones Bronce) aparece el modal global; `¡Seguir!` lo marca visto y no
   reaparece (recargar para confirmar). Al completar una lección, el modal
   espera ~2.5 s tras el confetti.
3. **Finni meta diaria**: alcanzar la meta de XP del día → mensaje de Finni
   en Home (una vez por día).
4. **Finni racha**: dejar pasar 2+ días sin actividad y volver → snackbar con
   frase de ánimo al reiniciarse la racha.
5. **Saludo del día**: abrir una lección sin actividad hoy → saludo de Finni
   al inicio del contenido (una vez por día).
6. **Pre-test**: `/research/pretest` sigue funcionando igual (ya no otorga
   badge).

## Verificación

- `npm test` (suite completa), `npm run build` y typecheck en `frontend/`.
- Tests nuevos: `data/badges.test.ts` (evaluación + migración),
  `lib/badgeCelebration.test.ts` (storage + cola),
  `hooks/gamification/useBadgeCelebration.test.tsx` (cola con fake timers).
