# 📚 Estructura de Lecciones y Gamificación (Features & Lessons Codemap)

Este codemap detalla el funcionamiento del motor de lecciones (**ModuleKit**), las reglas de negocio para calcular el progreso de los estudiantes y el funcionamiento del sistema de gamificación (XP, niveles y rachas).

---

## 🛠️ El Motor ModuleKit

El motor está alojado en `frontend/src/module-kit/` y está compuesto por:
1. **`moduleFlow.ts`**: Define los tipos base, funciones de transición de estados y persistencia local (`localStorage` como caché rápido de sesión).
2. **`lessonContract.ts`**: Contrato para normalizar el estado de finalización de una lección individual (por ejemplo, si tiene puntaje o si simplemente requiere lectura).
3. **`components/`**: Elementos de UI comunes para renderizar listas y estados de lecciones.

### Tipos de Lecciones
* **`content`**: Lecciones informativas (lecturas, infografías, podcasts interactivos).
* **`quiz`**: Cuestionarios interactivos para validar conocimientos.
* **`simulator`**: Simuladores financieros interactivos (ej. presupuestos mensuales, simulador de cochinito vs banco).
* **`challenge`**: Retos guiados o prácticos (creación de metas SMART, presupuesto real).

### Estados de una Lección
Cada lección pasa por un flujo secuencial calculado dinámicamente mediante selectores puros:
```
[locked] ──(Completa lección anterior)──> [available] ──(Entra a la lección)──> [in_progress] ──(Resuelve reto)──> [completed]
```

---

## 📖 Módulos Educativos

Cada módulo cuenta con un archivo `lessonFlow.ts` que implementa la configuración de flujo (`ModuleFlowConfig`) y define exactamente **15 lecciones** (L01 a L15):

| Módulo | ID Módulo | Prefijo de Rutas | Vista de Visión General |
|---|---|---|---|
| **Presupuesto** | `presupuesto` | `/app/presupuesto/lesson` | `/app/presupuesto` |
| **Ahorro** | `ahorro` | `/app/ahorro/lesson` | `/app/ahorro` |
| **Inversión** | `inversion` | `/app/inversion/lesson` | `/app/inversion/overview` |

---

## 🎮 Sistema de Gamificación (XP, Niveles y Rachas)

La gamificación recompensa a los estudiantes por aprender y se gestiona en conjunto entre el frontend (`store/progress.ts`) y el backend (`controllers/progress.controller.ts`).

### 1. Puntos de Experiencia (XP)
* Completar una lección por primera vez otorga **10 XP**.
* El progreso de completado de un módulo se calcula como:
  $$\text{Progreso del Módulo \%} = \min\left(100, \text{round}\left(\frac{\text{Lecciones Completadas}}{\text{Total de Lecciones (15)}} \times 100\right)\right)$$

### 2. Cálculo de Niveles
Los niveles del usuario se incrementan automáticamente en función de la XP acumulada. La fórmula matemática para calcular el nivel se encuentra en `backend/src/lib/gamificationHelpers.ts`:
* Cada nivel requiere una cantidad creciente de XP.

### 3. Rachas de Actividad (Streaks)
Para mantener a los estudiantes motivados, el sistema cuenta días consecutivos de actividad de estudio:
* **Mismo día:** Si el estudiante completa otra lección en el mismo día UTC/local, la racha actual se mantiene.
* **Día consecutivo (ayer):** Si la última actividad fue ayer, la racha actual se incrementa en `1`.
* **Ruptura de racha:** Si pasa más de un día sin actividad, la racha actual se reinicia a `1`.
* **Mejor racha (`streak_best`):** Si la racha actual supera a la mejor racha histórica, se actualiza el récord.
